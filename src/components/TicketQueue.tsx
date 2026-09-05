import React from 'react';
import { SupportTicketCase, TriageMode } from '../types';
import { 
  Wifi, 
  CreditCard, 
  Smartphone, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRightLeft,
  PlusCircle,
  Clock
} from 'lucide-react';

interface TicketQueueProps {
  tickets: SupportTicketCase[];
  activeTicketId: string;
  onSelectTicket: (ticketId: string) => void;
  onOpenNewTicketModal: () => void;
}

export const TicketQueue: React.FC<TicketQueueProps> = ({
  tickets,
  activeTicketId,
  onSelectTicket,
  onOpenNewTicketModal
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Broadband':
        return <Wifi className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Billing':
        return <CreditCard className="w-3.5 h-3.5 text-amber-400" />;
      case 'Mobile':
        return <Smartphone className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getTriageBadge = (mode?: TriageMode) => {
    if (!mode) {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
          <Clock className="w-2.5 h-2.5" /> Pending
        </span>
      );
    }
    switch (mode) {
      case 'routine':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> Routine Draft
          </span>
        );
      case 'clarify':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/25">
            <HelpCircle className="w-2.5 h-2.5 text-amber-400" /> Needs Info
          </span>
        );
      case 'handover':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/25">
            <ArrowRightLeft className="w-2.5 h-2.5 text-rose-400" /> Human Handover
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col h-full">
      {/* Queue Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
        <div>
          <h2 className="text-xs font-bold text-slate-200 tracking-wider uppercase flex items-center gap-1.5">
            Active Support Cases
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 text-[11px] font-mono">
              {tickets.length}
            </span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Triage queue filtered by priority</p>
        </div>

        <button
          onClick={onOpenNewTicketModal}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-colors"
          title="Create a custom customer request or test scenario"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Case</span>
        </button>
      </div>

      {/* Ticket List */}
      <div className="divide-y divide-slate-800/80 overflow-y-auto max-h-[220px] lg:max-h-none flex-1">
        {tickets.map((t) => {
          const isActive = t.id === activeTicketId;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTicket(t.id)}
              className={`w-full text-left p-3 transition-colors flex flex-col gap-1.5 relative ${
                isActive
                  ? 'bg-slate-800/90 border-l-4 border-cyan-400'
                  : 'hover:bg-slate-800/40 border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-400">
                  {getCategoryIcon(t.category)}
                  <span className={isActive ? 'text-cyan-300 font-semibold' : ''}>{t.ticketNumber}</span>
                </div>
                {getTriageBadge(t.currentTriage?.mode)}
              </div>

              <div className="text-xs font-semibold text-slate-100 line-clamp-1">
                {t.subject}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                <span className="font-medium text-slate-300">{t.customer.fullName}</span>
                <span className="text-[10px] text-slate-500 font-mono">{t.customer.vipTier}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
