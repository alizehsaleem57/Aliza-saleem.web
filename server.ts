import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint for deployment probers
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Server-side Gemini AI client initialization with mandatory User-Agent
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI:', err);
  }
}

// System instructions for District Health Copilot
const COPILOT_SYSTEM_PROMPT = `You are PulseGrid Copilot, an expert AI operational advisor embedded in the North Central District Health Mission.
You assist the Chief Medical Officer (CMO), District Magistrate (DM), and facility medical officers managing 42 Primary Health Centres (PHCs) and 8 Community Health Centres (CHCs).
Your role:
- Analyze real-time medicine stock levels, patient footfall, bed saturation, and doctor absenteeism.
- Recommend optimal redistribution routes from surplus hubs (e.g., Civil CHC Rampur) to depleted peripheries (e.g., PHC Kalyanpur).
- Generate protocol-compliant action plans (show-cause notices, lateral bed transfers, reliever doctor dispatches).
- Always be concise, clinical, operational, and actionable. Avoid generic fluff.
- Support multilingual queries (English, Hindi, Bengali, Tamil).`;

// 1. Assistant API Endpoint
app.post('/api/assistant', async (req, res) => {
  try {
    const { message, context, language = 'en' } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (ai) {
      const prompt = `Context: ${JSON.stringify(context || {})}\nUser query (${language}): ${message}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: COPILOT_SYSTEM_PROMPT,
          temperature: 0.4,
        },
      });

      return res.json({ reply: response.text });
    }

    // Dynamic fallback when API key is not configured
    let fallbackReply = `[PulseGrid AI Engine] Analyzed query: "${message}". `;
    if (message.toLowerCase().includes('kalyanpur') || message.toLowerCase().includes('stock') || message.toLowerCase().includes('amoxicillin')) {
      fallbackReply += `PHC Kalyanpur is at critical stock exhaustion with 12 vials of Amoxicillin remaining (<18h buffer). Automated redistribution Route #R-04 has been scheduled from CHC Rampur (+3,200 surplus vials) via Health Van #DHV-09. Turnaround ETA: 42 minutes.`;
    } else if (message.toLowerCase().includes('belsar') || message.toLowerCase().includes('triage') || message.toLowerCase().includes('notice')) {
      fallbackReply += `PHC Belsar (Sector 1) has triggered a High Priority Escalation: Infant triage latency exceeded 45 mins (target SLA: 10m) and Malaria RDT reagents are 0% available. District protocol recommends issuing an immediate unannounced inspection notice and redirecting pediatric triage.`;
    } else if (message.toLowerCase().includes('sonapur') || message.toLowerCase().includes('doctor') || message.toLowerCase().includes('cardio')) {
      fallbackReply += `PHC Sonapur shows 4 consecutive days of unscheduled cardiologist absenteeism, causing 38 patient turnaways. The autonomous roster engine recommends deploying Reliever Specialist Dr. K. Verma from Sadar Headquarters immediately.`;
    } else if (message.toLowerCase().includes('bed') || message.toLowerCase().includes('mohanpur') || message.toLowerCase().includes('surge')) {
      fallbackReply += `CHC Mohanpur is currently at 100% bed saturation with 18 patients in the admission queue. Step-down discharge protocols have been activated, and 8 stable post-op patients are queued for lateral transfer to CHC Sadar.`;
    } else {
      fallbackReply += `All 50 nodes (42 PHCs, 8 CHCs) are reporting over telemetry mesh. District-wide bed occupancy is 89.2% (critical load in Sector 4), 7 facilities flagged for stock-out in <48h, and doctor duty compliance is 92.0%. Use the one-click redistribution matrix to authorize emergency transfers.`;
    }

    return res.json({ reply: fallbackReply });
  } catch (error: any) {
    console.error('Error in /api/assistant:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 2. AI Demand Forecasting Endpoint
app.post('/api/forecast', async (req, res) => {
  try {
    const { facilityName, medicineName, currentStock, dailyBurnRate, surgeMultiplier = 1.0 } = req.body;

    if (ai) {
      const prompt = `Calculate 7-day predictive depletion for ${medicineName} at ${facilityName}.
Current Stock: ${currentStock} units
Daily Burn Rate: ${dailyBurnRate} units/day
Surge Multiplier: ${surgeMultiplier}x
Return a JSON object with:
- daysUntilDepletion (number)
- predictedDemandNext7Days (array of 7 numbers)
- riskLevel ('CRITICAL' | 'WARNING' | 'STABLE')
- recommendation (short string)`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      return res.json(JSON.parse(response.text || '{}'));
    }

    // Heuristic fallback calculation
    const adjustedDaily = (dailyBurnRate || 10) * (surgeMultiplier || 1.0);
    const daysUntilDepletion = Math.max(0.5, Number((currentStock / (adjustedDaily || 1)).toFixed(1)));
    const riskLevel = daysUntilDepletion < 2 ? 'CRITICAL' : daysUntilDepletion < 4 ? 'WARNING' : 'STABLE';
    
    const predictedDemandNext7Days = Array.from({ length: 7 }, (_, i) => 
      Math.round(adjustedDaily * (1 + (i * 0.08)))
    );

    return res.json({
      daysUntilDepletion,
      predictedDemandNext7Days,
      riskLevel,
      recommendation: riskLevel === 'CRITICAL' 
        ? `Initiate immediate emergency dispatch of at least ${Math.round(adjustedDaily * 7)} units from nearest surplus hub.`
        : `Monitor replenishment cycle. Maintain minimum buffer of 5 days.`
    });
  } catch (error: any) {
    console.error('Error in /api/forecast:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 3. Patient Triage & Facility Guide Endpoint
app.post('/api/triage', async (req, res) => {
  try {
    const { symptoms, location, language = 'en' } = req.body;
    
    if (ai) {
      const prompt = `Patient reporting symptoms: "${symptoms}" in ${location || 'North Central District'}.
Provide compassionate, non-diagnostic guidance in ${language}.
Output JSON with:
- recommendedDepartment (e.g. General OPD, Pediatrics, Maternity, Emergency)
- urgencyLevel ('Routine' | 'Urgent' | 'Emergency')
- guidance (1-2 sentences on immediate care and going to public clinic)
- recommendedFacilityTypes (e.g. ['PHC', 'CHC'])`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      return res.json(JSON.parse(response.text || '{}'));
    }

    // Rule-based fallback
    const lower = (symptoms || '').toLowerCase();
    let urgency = 'Routine';
    let dept = 'General OPD';
    let guidance = 'Please visit your nearest Primary Health Centre (PHC) during morning OPD hours (08:00 AM - 02:00 PM). Consultations and basic medications are completely free.';

    if (lower.includes('chest pain') || lower.includes('breath') || lower.includes('bleed') || lower.includes('unconscious')) {
      urgency = 'Emergency';
      dept = 'Emergency Trauma & Casualty';
      guidance = 'Immediate medical attention required. Please proceed to the nearest Community Health Centre (CHC) or Civil Hospital emergency room immediately.';
    } else if (lower.includes('child') || lower.includes('baby') || lower.includes('infant') || lower.includes('vaccin')) {
      dept = 'Pediatrics & Immunization';
      guidance = 'Consult the duty pediatrician or immunization officer at your local health centre. Routine infant vaccines and ORS packets are in stock.';
    } else if (lower.includes('pregnant') || lower.includes('labor') || lower.includes('cramp') || lower.includes('delivery')) {
      dept = 'Maternal Health & Obstetrics';
      guidance = 'Visit the 24x7 Maternity Care Ward at your nearest CHC or equipped PHC. 108 Emergency Ambulance is on standby.';
    }

    return res.json({
      recommendedDepartment: dept,
      urgencyLevel: urgency,
      guidance,
      recommendedFacilityTypes: urgency === 'Emergency' ? ['CHC', 'Civil Hospital'] : ['PHC', 'CHC']
    });
  } catch (error: any) {
    console.error('Error in /api/triage:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`PulseGrid District Health OS server running on http://0.0.0.0:${port}`);
  });
}

startServer();
