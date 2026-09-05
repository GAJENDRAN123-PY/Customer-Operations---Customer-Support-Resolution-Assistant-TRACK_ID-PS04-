import React, { useState, useEffect } from 'react';
import { TriageResult, SupportArticle } from '../types';
import { 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRightLeft, 
  BookOpen, 
  Send, 
  Copy, 
  Check, 
  Edit3, 
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  FileText,
  UserCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface ResolutionAssistantCardProps {
  triage: TriageResult;
  onApproveAndSend: (text: string, citedArticleId?: string) => void;
  onSendClarification: (text: string) => void;
  onInitiateHandover: () => void;
  onViewArticle: (articleId: string) => void;
  isEvaluating: boolean;
  onReevaluate: () => void;
  onSimulateCustomerReply?: (replyText: string) => void;
}

export const ResolutionAssistantCard: React.FC<ResolutionAssistantCardProps> = ({
  triage,
  onApproveAndSend,
  onSendClarification,
  onInitiateHandover,
  onViewArticle,
  isEvaluating,
  onReevaluate,
  onSimulateCustomerReply
}) => {
  const [editableDraft, setEditableDraft] = useState(triage.draftResponse || '');
  const [editableClarification, setEditableClarification] = useState(
    triage.clarificationPrompt?.questionToCustomer || ''
  );
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setEditableDraft(triage.draftResponse || '');
    setEditableClarification(triage.clarificationPrompt?.questionToCustomer || '');
    setIsEditing(false);
  }, [triage]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-xl overflow-hidden">
      {/* Assistant Header */}
      <div className={`p-3.5 border-b flex items-center justify-between transition-colors ${
        triage.mode === 'routine'
          ? 'bg-emerald-950/40 border-emerald-800/50'
          : triage.mode === 'clarify'
          ? 'bg-amber-950/40 border-amber-800/50'
          : 'bg-rose-950/40 border-rose-800/50'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg ${
            triage.mode === 'routine'
              ? 'bg-emerald-500/20 text-emerald-300'
              : triage.mode === 'clarify'
              ? 'bg-amber-500/20 text-amber-300'
              : 'bg-rose-500/20 text-rose-300'
          }`}>
            {triage.mode === 'routine' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {triage.mode === 'clarify' && <HelpCircle className="w-5 h-5 text-amber-400" />}
            {triage.mode === 'handover' && <ArrowRightLeft className="w-5 h-5 text-rose-400" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Resolution Assistant Triage:
              </span>
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                triage.mode === 'routine'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : triage.mode === 'clarify'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {triage.mode === 'routine' && 'Pathway 1: Routine Resolution Draft (Cited)'}
                {triage.mode === 'clarify' && 'Pathway 2: Targeted Clarification Required'}
                {triage.mode === 'handover' && 'Pathway 3: Zero-Context-Loss Human Handover'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Confidence: <strong className="text-slate-200">{triage.confidenceScore}%</strong> • Grounded in Account Records, Telemetry & KB Articles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {triage.matchingArticle && (
            <button
              onClick={() => onViewArticle(triage.matchingArticle!.id)}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium border border-slate-700 transition-colors"
              title="View matching support article"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{triage.matchingArticle.id}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>
          )}

          <button
            onClick={onReevaluate}
            disabled={isEvaluating}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Re-run assistant evaluation"
          >
            <RotateCcw className={`w-4 h-4 ${isEvaluating ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Assistant Reasoning Note */}
      <div className="px-4 py-2 bg-slate-950/70 border-b border-slate-800 text-xs text-slate-300 flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-200">AI Assessment: </strong>
          <span className="text-slate-300">{triage.reasoning}</span>
        </div>
      </div>

      {/* PATHWAY 1: ROUTINE RESOLUTION DRAFT */}
      {triage.mode === 'routine' && (
        <div className="p-4 space-y-3.5">
          {/* Grounding Citation Banner */}
          {triage.matchingArticle && (
            <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded-lg text-xs text-emerald-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-semibold text-emerald-300">Grounded Citation: </span>
                  <span className="font-medium text-emerald-100">{triage.matchingArticle.title}</span>
                  <span className="text-emerald-400/80 ml-1.5">({triage.matchingArticle.citedSection})</span>
                </div>
              </div>
              <button
                onClick={() => onViewArticle(triage.matchingArticle!.id)}
                className="text-xs text-emerald-400 hover:text-emerald-200 underline font-semibold shrink-0 ml-2"
              >
                Inspect Article
              </button>
            </div>
          )}

          {/* Editable Draft Response */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Grounded Draft Resolution (Ready for Agent Approval)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  {isEditing ? 'Done Editing' : 'Edit Draft'}
                </button>
                <button
                  onClick={() => handleCopy(editableDraft)}
                  className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {isEditing ? (
              <textarea
                value={editableDraft}
                onChange={(e) => setEditableDraft(e.target.value)}
                rows={7}
                className="w-full bg-slate-950 border border-cyan-500/50 rounded-lg p-3 text-xs text-slate-200 font-sans leading-relaxed focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
              />
            ) : (
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
                {editableDraft}
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Reviewing agent approves message before customer delivery</span>
            </div>

            <button
              onClick={() => onApproveAndSend(editableDraft, triage.matchingArticle?.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all hover:translate-y-[-1px]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Approve & Send to Customer</span>
            </button>
          </div>
        </div>
      )}

      {/* PATHWAY 2: TARGETED CLARIFICATION REQUIRED */}
      {triage.mode === 'clarify' && (
        <div className="p-4 space-y-3.5">
          {/* Missing Fields Indicator */}
          {triage.clarificationPrompt?.missingFields && triage.clarificationPrompt.missingFields.length > 0 && (
            <div className="bg-amber-950/30 border border-amber-800/40 p-3 rounded-lg space-y-2">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Missing Information Required Before Diagnostic Can Proceed:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {triage.clarificationPrompt.missingFields.map((field, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-200 border border-amber-500/30"
                  >
                    • {field}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Clarification Inquiry Prompt */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-amber-400" />
                Targeted Clarification Message for Customer
              </span>
              <button
                onClick={() => handleCopy(editableClarification)}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <textarea
              value={editableClarification}
              onChange={(e) => setEditableClarification(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-amber-500/40 rounded-lg p-3 text-xs text-slate-200 font-sans leading-relaxed focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Quick Simulation Options for testing */}
          {onSimulateCustomerReply && (
            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-400">
                Simulate Customer Follow-up Response:
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onSimulateCustomerReply("The LOS light is glowing bright RED, and the fiber cable is plugged in firmly.")}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs border border-rose-500/30 transition-colors"
                >
                  "LOS light is bright RED"
                </button>
                <button
                  onClick={() => onSimulateCustomerReply("The PON light is flashing green, and LOS is completely off.")}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs border border-emerald-500/30 transition-colors"
                >
                  "PON is flashing green, LOS is off"
                </button>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              Guidance: {triage.clarificationPrompt?.guidanceForAgent || 'Awaiting customer diagnostic reply'}
            </span>

            <button
              onClick={() => onSendClarification(editableClarification)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-900/30 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Clarification Request</span>
            </button>
          </div>
        </div>
      )}

      {/* PATHWAY 3: ZERO-CONTEXT-LOSS HUMAN HANDOVER */}
      {triage.mode === 'handover' && triage.handoverDossier && (
        <div className="p-4 space-y-4">
          {/* Handover Dossier Container */}
          <div className="bg-slate-950 border border-rose-500/40 rounded-xl p-4 space-y-3.5 shadow-inner">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-900/40 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  Zero-Context-Loss Handover Dossier
                </span>
                <div className="text-xs text-slate-300 mt-0.5">
                  Target Queue: <strong className="text-white">{triage.handoverDossier.targetQueue}</strong>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0 self-start">
                Priority: {triage.handoverDossier.priority}
              </span>
            </div>

            {/* Concise Issue Summary */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                📌 Concise Issue Summary
              </span>
              <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                {triage.handoverDossier.issueSummary}
              </p>
            </div>

            {/* Established Facts */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                🔍 Established Facts (Verified via Telemetry & Account Records)
              </span>
              <ul className="space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-300">
                {triage.handoverDossier.establishedFacts.map((fact, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Attempted Steps / Already Tried */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                🛠️ Already Tried / Completed (Customer Must NOT Be Asked To Repeat)
              </span>
              <ul className="space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-300">
                {triage.handoverDossier.attemptedSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Next Action */}
            <div className="bg-rose-950/30 border border-rose-800/40 p-3 rounded-lg text-xs space-y-1">
              <div className="font-bold text-rose-300 flex items-center gap-1.5">
                ⚠️ Reason for Escalation & Next Recommended Action
              </div>
              <p className="text-slate-300 leading-relaxed">
                {triage.handoverDossier.recommendedNextAction}
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              Escalating transmits this complete briefing card to the specialist agent desk.
            </span>

            <button
              onClick={onInitiateHandover}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-900/40 transition-all hover:translate-y-[-1px]"
            >
              <UserCheck className="w-4 h-4" />
              <span>Complete Handover to Specialist</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
