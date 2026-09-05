import React, { useState } from 'react';
import { HandoverSummary } from '../types';
import { 
  ShieldCheck, 
  ArrowRightLeft, 
  CheckCircle, 
  UserCheck, 
  X, 
  Copy, 
  Check,
  Building,
  Radio
} from 'lucide-react';

interface HandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  handoverDossier: HandoverSummary;
  customerName: string;
  accountNumber: string;
  onConfirmTransfer: (queue: string, notes: string) => void;
}

export const HandoverModal: React.FC<HandoverModalProps> = ({
  isOpen,
  onClose,
  handoverDossier,
  customerName,
  accountNumber,
  onConfirmTransfer
}) => {
  const [selectedQueue, setSelectedQueue] = useState(handoverDossier.targetQueue);
  const [transferNotes, setTransferNotes] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const text = `
Zero-Context-Loss Handover Brief
Customer: ${customerName} (${accountNumber})
Target Queue: ${selectedQueue}
Priority: ${handoverDossier.priority}

ISSUE SUMMARY:
${handoverDossier.issueSummary}

ESTABLISHED FACTS:
${handoverDossier.establishedFacts.join('\n')}

ATTEMPTED STEPS:
${handoverDossier.attemptedSteps.join('\n')}

RECOMMENDED NEXT ACTION:
${handoverDossier.recommendedNextAction}
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 bg-rose-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
              <ArrowRightLeft className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Zero-Context-Loss Human Handover
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {handoverDossier.priority}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Transferring case for {customerName} ({accountNumber})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Target Queue Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Destination Specialist Queue:</label>
            <select
              value={selectedQueue}
              onChange={(e) => setSelectedQueue(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
            >
              <option value="Tier-2 Priority Technical Escalations & Retention">
                Tier-2 Priority Technical Escalations & Retention
              </option>
              <option value="Senior Field Optical Engineering & Splicing">
                Senior Field Optical Engineering & Splicing (Physical Line Fault)
              </option>
              <option value="Senior Billing Disputes & Executive Relations">
                Senior Billing Disputes & Executive Relations
              </option>
              <option value="Mobile Core Network Tier-3 Support">
                Mobile Core Network Tier-3 Support
              </option>
            </select>
          </div>

          {/* Dossier Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Briefing Transmitted to Incoming Specialist
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Brief'}
              </button>
            </div>

            <div className="space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
              <span className="font-semibold text-slate-200">📌 Issue Summary:</span>
              <p className="text-slate-300">{handoverDossier.issueSummary}</p>
            </div>

            <div className="space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
              <span className="font-semibold text-slate-200">🔍 Verified Facts:</span>
              <ul className="space-y-0.5 text-slate-300">
                {handoverDossier.establishedFacts.map((f, i) => (
                  <li key={i}>• {f}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
              <span className="font-semibold text-amber-300">🛠️ Steps Already Completed:</span>
              <ul className="space-y-0.5 text-slate-300">
                {handoverDossier.attemptedSteps.map((s, i) => (
                  <li key={i}>✓ {s}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-1 bg-rose-950/20 p-2.5 rounded-lg border border-rose-900/30">
              <span className="font-semibold text-rose-300">⚠️ Next Recommended Action:</span>
              <p className="text-slate-300">{handoverDossier.recommendedNextAction}</p>
            </div>
          </div>

          {/* Additional Handover Notes */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Add Handover Notes (Optional):</label>
            <input
              type="text"
              value={transferNotes}
              onChange={(e) => setTransferNotes(e.target.value)}
              placeholder="e.g., Customer is on active line right now, warned about 4-day rainfall delay..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={() => onConfirmTransfer(selectedQueue, transferNotes)}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-900/30 transition-all hover:translate-y-[-1px]"
          >
            <UserCheck className="w-4 h-4" />
            <span>Complete Transfer Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
