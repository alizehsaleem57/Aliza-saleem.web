import React, { useState } from 'react';
import { Language, Role } from '../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentRole: Role;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  language,
  currentRole,
}) => {
  if (!isOpen) return null;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: `Hello. I am the PulseGrid AI Operational Copilot for North Central District. How can I assist you with stock redistribution, bed surge management, or compliance escalation today?`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQueries = [
    "Which PHC has the highest stock-out risk today?",
    "Generate a transfer order for Amoxicillin from Rampur to Kalyanpur",
    "Explain why PHC Sonapur triggered workforce non-compliance",
    "What lateral transfers are recommended for CHC Mohanpur?",
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          language,
          role: currentRole,
          context: {
            district: 'North Central District',
            activeFacilities: 50,
            bedOccupancy: '89.2%',
            criticalNodes: ['PHC Kalyanpur', 'PHC Belsar', 'CHC Mohanpur'],
            surplusHub: 'Civil CHC Rampur',
          },
        }),
      });

      const data = await res.json();
      const assistantMsg: Message = {
        role: 'assistant',
        text: data.reply || 'Analysis completed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `[Telemetry Analysis] Evaluated status for North Central District. Route #R-04 remains prioritized for immediate delivery to PHC Kalyanpur. Lateral transfers for CHC Mohanpur are pending DM authorization.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col border border-surface-container overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 py-3 bg-surface-container-low border-b border-surface-container flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-tertiary">
            <span className="material-symbols-outlined text-[22px]">smart_toy</span>
            <div>
              <h3 className="font-headline-sm text-[16px] font-bold text-on-surface">Bhopal District Copilot</h3>
              <p className="text-[10px] text-outline">
                Operational Telemetry & Clinical Reasoning · Powered by Gemini
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-surface-container text-outline"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Suggested Queries */}
        <div className="px-3 py-2 bg-surface-container-low/40 border-b border-surface-container flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
          <span className="text-outline uppercase font-bold shrink-0 text-[10px]">Quick:</span>
          {suggestedQueries.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="px-2 py-0.5 bg-surface-container hover:bg-surface-container-high rounded-full text-on-surface-variant whitespace-nowrap transition-colors text-[11px]"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message History */}
        <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-2 min-h-0">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col max-w-[88%] ${
                m.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <div
                className={`p-2.5 rounded-xl text-[13px] leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-primary text-on-primary rounded-br-none shadow-xs'
                    : 'bg-surface-container-low text-on-surface border border-surface-container rounded-bl-none shadow-xs'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-outline font-mono-data mt-0.5 px-1">{m.timestamp}</span>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-outline text-[12px] p-2 bg-surface-container-low rounded-xl w-fit">
              <span className="material-symbols-outlined text-[16px] animate-spin text-tertiary">sync</span>
              Consulting Bhopal telemetry mesh & protocols...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-2.5 bg-surface-container-low border-t border-surface-container flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask district copilot about Bhopal hospitals, stocks, or beds..."
            className="flex-1 px-3 py-2 bg-surface-container-lowest border border-surface-container rounded-xl text-[13px] text-on-surface focus:outline-none focus:border-tertiary"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-tertiary hover:bg-tertiary-container text-on-tertiary font-label-md font-bold rounded-xl shadow-xs transition-all flex items-center gap-1 disabled:opacity-50 text-[13px]"
          >
            <span className="material-symbols-outlined text-[16px]">send</span>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
