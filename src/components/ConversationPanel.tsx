import React, { useState } from 'react';
import { SupportTicketCase, ConversationMessage, TriageResult } from '../types';
import { ResolutionAssistantCard } from './ResolutionAssistantCard';
import { 
  User, 
  Bot, 
  Send, 
  MessageSquare, 
  CornerDownRight, 
  CheckCircle,
  FileCheck,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';

interface ConversationPanelProps {
  ticket: SupportTicketCase;
  onSendMessage: (text: string, sender: 'agent' | 'customer', citedArticleId?: string) => void;
  onInitiateHandover: () => void;
  onViewArticle: (articleId: string) => void;
  isEvaluating: boolean;
  onReevaluate: () => void;
}

export const ConversationPanel: React.FC<ConversationPanelProps> = ({
  ticket,
  onSendMessage,
  onInitiateHandover,
  onViewArticle,
  isEvaluating,
  onReevaluate
}) => {
  const [inputText, setInputText] = useState('');
  const [inputMode, setInputMode] = useState<'agent' | 'customer'>('agent');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), inputMode);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Ticket Subject Bar */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400">
              {ticket.ticketNumber}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Channel: {ticket.initialChannel}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Category: {ticket.category}
            </span>
          </div>
          <h2 className="text-sm font-bold text-slate-100 truncate mt-1">
            {ticket.subject}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
            ticket.status === 'Resolved'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : ticket.status === 'Escalated'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
          }`}>
            {ticket.status}
          </span>
        </div>
      </div>

      {/* Main Conversation & Assistant Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Messages */}
        <div className="space-y-3">
          {ticket.messages.map((msg) => {
            const isCustomer = msg.sender === 'customer';
            const isSystem = msg.sender === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <span className="text-[11px] font-mono bg-slate-800/80 text-slate-400 px-3 py-1 rounded-full border border-slate-700/60 flex items-center gap-1.5">
                    <ArrowRightLeft className="w-3 h-3 text-cyan-400" />
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[88%] ${isCustomer ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isCustomer
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                    : 'bg-cyan-600 text-white shadow'
                }`}>
                  {isCustomer ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center gap-2 text-[10px] ${isCustomer ? 'text-slate-400' : 'text-slate-400 justify-end'}`}>
                    <span className="font-semibold text-slate-300">
                      {isCustomer ? ticket.customer.fullName : 'Support Desk Agent'}
                    </span>
                    <span>{msg.timestamp}</span>
                    {msg.citedArticleId && (
                      <button
                        onClick={() => onViewArticle(msg.citedArticleId!)}
                        className="text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-800/40 font-mono hover:underline"
                      >
                        Cited {msg.citedArticleId}
                      </button>
                    )}
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      isCustomer
                        ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-xs'
                        : 'bg-cyan-950/70 border border-cyan-800/60 text-cyan-100 rounded-tr-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Resolution Assistant Workspace */}
        {ticket.currentTriage && (
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Resolution Assistant Workspace</span>
            </div>

            <ResolutionAssistantCard
              triage={ticket.currentTriage}
              onApproveAndSend={(text, citedArticleId) => {
                onSendMessage(text, 'agent', citedArticleId);
              }}
              onSendClarification={(text) => {
                onSendMessage(text, 'agent');
              }}
              onInitiateHandover={onInitiateHandover}
              onViewArticle={onViewArticle}
              isEvaluating={isEvaluating}
              onReevaluate={onReevaluate}
              onSimulateCustomerReply={(replyText) => {
                onSendMessage(replyText, 'customer');
              }}
            />
          </div>
        )}
      </div>

      {/* Manual Dispatch / Simulation Composer */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90">
        <form onSubmit={handleSend} className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => setInputMode('agent')}
                className={`px-2.5 py-0.5 rounded font-semibold transition-colors ${
                  inputMode === 'agent'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Send as Agent
              </button>
              <button
                type="button"
                onClick={() => setInputMode('customer')}
                className={`px-2.5 py-0.5 rounded font-semibold transition-colors ${
                  inputMode === 'customer'
                    ? 'bg-slate-700 text-cyan-300 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Simulate Customer Reply
              </button>
            </div>

            <span className="text-[11px] text-slate-500">
              Enter to send • AI assistant updates on new turns
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                inputMode === 'agent'
                  ? 'Type manual agent response or notes to customer...'
                  : `Simulate follow-up message from ${ticket.customer.fullName}...`
              }
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 text-xs font-semibold"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
