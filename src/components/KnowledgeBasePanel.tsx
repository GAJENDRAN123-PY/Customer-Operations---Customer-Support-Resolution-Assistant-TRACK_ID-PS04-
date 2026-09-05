import React, { useState } from 'react';
import { SupportArticle, HandoverSummary } from '../types';
import { 
  BookOpen, 
  Search, 
  Tag, 
  CheckSquare, 
  AlertOctagon, 
  FileText, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  ArrowRightLeft,
  Copy,
  Check
} from 'lucide-react';

interface KnowledgeBasePanelProps {
  articles: SupportArticle[];
  selectedArticleId: string | null;
  onSelectArticle: (id: string) => void;
  citedArticleId?: string;
  activeHandoverDossier?: HandoverSummary;
  customerName?: string;
}

export const KnowledgeBasePanel: React.FC<KnowledgeBasePanelProps> = ({
  articles,
  selectedArticleId,
  onSelectArticle,
  citedArticleId,
  activeHandoverDossier,
  customerName
}) => {
  const [activeTab, setActiveTab] = useState<'articles' | 'handover'>('articles');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [copied, setCopied] = useState(false);

  // Filter articles
  const filteredArticles = articles.filter((art) => {
    const matchesCategory = categoryFilter === 'All' || art.category === categoryFilter;
    const matchesSearch = 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const currentArticle = articles.find(a => a.id === (selectedArticleId || citedArticleId)) || articles[0];

  const handleCopyHandover = () => {
    if (!activeHandoverDossier) return;
    const text = `
=== ZERO-CONTEXT-LOSS HUMAN HANDOVER BRIEF ===
Target Queue: ${activeHandoverDossier.targetQueue}
Priority: ${activeHandoverDossier.priority}
Customer: ${customerName || 'Customer'}

ISSUE SUMMARY:
${activeHandoverDossier.issueSummary}

ESTABLISHED FACTS:
${activeHandoverDossier.establishedFacts.map(f => `• ${f}`).join('\n')}

ALREADY TRIED / ATTEMPTED:
${activeHandoverDossier.attemptedSteps.map(s => `• ${s}`).join('\n')}

REASON FOR ESCALATION & NEXT RECOMMENDED ACTION:
${activeHandoverDossier.recommendedNextAction}
==============================================
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-hidden">
      {/* Tab Switcher */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs w-full">
          <button
            onClick={() => setActiveTab('articles')}
            className={`flex-1 py-1 px-2 rounded font-semibold text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'articles'
                ? 'bg-slate-800 text-cyan-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Support Articles ({articles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('handover')}
            className={`flex-1 py-1 px-2 rounded font-semibold text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'handover'
                ? 'bg-slate-800 text-rose-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Handover Dossier</span>
            {activeHandoverDossier && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* ARTICLES TAB */}
      {activeTab === 'articles' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search & Filter Bar */}
          <div className="p-3 border-b border-slate-800 bg-slate-900/80 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search KB articles, keywords, ONT, speed..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-1 text-[11px] overflow-x-auto pb-1">
              {['All', 'Broadband', 'Billing', 'Mobile', 'Policy'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2 py-0.5 rounded font-medium whitespace-nowrap transition-colors ${
                    categoryFilter === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Article List & Detail Split View */}
          <div className="flex-1 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-800 overflow-hidden">
            {/* Left/Top: Article Index */}
            <div className="w-full lg:w-48 overflow-y-auto max-h-[160px] lg:max-h-none shrink-0 divide-y divide-slate-800/80 bg-slate-950/40">
              {filteredArticles.map((art) => {
                const isSelected = art.id === currentArticle.id;
                const isCited = art.id === citedArticleId;

                return (
                  <button
                    key={art.id}
                    onClick={() => onSelectArticle(art.id)}
                    className={`w-full text-left p-2.5 transition-colors flex flex-col gap-1 relative ${
                      isSelected
                        ? 'bg-slate-800/80 border-l-2 border-cyan-400'
                        : 'hover:bg-slate-900/60 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-[10px] font-bold text-cyan-400">
                        {art.id}
                      </span>
                      {isCited && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          Active Grounding
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                      {art.title.split(':')[1] || art.title}
                    </span>
                    <span className="text-[10px] text-slate-500">{art.category}</span>
                  </button>
                );
              })}
            </div>

            {/* Right/Bottom: Article Reader View */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-slate-300 bg-slate-900/60">
              <div className="border-b border-slate-800 pb-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                    {currentArticle.id}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Category: {currentArticle.category}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 mt-2 leading-snug">
                  {currentArticle.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 italic">
                  {currentArticle.summary}
                </p>
              </div>

              {/* Article Markdown/Content */}
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 leading-relaxed font-sans whitespace-pre-wrap text-slate-200 space-y-2">
                {currentArticle.content}
              </div>

              {/* Resolution Checklist */}
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  Resolution Checklist
                </div>
                <ul className="space-y-1 text-slate-300">
                  {currentArticle.resolutionChecklist.map((chk, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{chk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Escalation Rules */}
              <div className="bg-rose-950/20 p-3 rounded-lg border border-rose-800/40 space-y-1">
                <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                  Escalation Thresholds
                </div>
                <p className="text-slate-300">
                  {currentArticle.escalationRules}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HANDOVER DOSSIER TAB */}
      {activeTab === 'handover' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {activeHandoverDossier ? (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-rose-400" />
                    Zero-Context-Loss Handover Brief
                  </h3>
                  <p className="text-slate-400 text-[11px]">
                    Preserved briefing for human specialist desk
                  </p>
                </div>
                <button
                  onClick={handleCopyHandover}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Brief'}</span>
                </button>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-rose-500/40 space-y-2.5">
                <div className="flex justify-between items-center text-slate-300 border-b border-slate-800 pb-2">
                  <span className="font-semibold text-slate-400">Target Queue:</span>
                  <span className="font-bold text-rose-300">{activeHandoverDossier.targetQueue}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300 border-b border-slate-800 pb-2">
                  <span className="font-semibold text-slate-400">Escalation Priority:</span>
                  <span className="font-bold text-rose-400">{activeHandoverDossier.priority}</span>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-slate-200">📌 Core Issue Summary</div>
                  <p className="bg-slate-900 p-2.5 rounded border border-slate-800 leading-relaxed text-slate-300">
                    {activeHandoverDossier.issueSummary}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-slate-200">🔍 Confirmed Telemetry & Account Facts</div>
                  <ul className="bg-slate-900 p-2.5 rounded border border-slate-800 space-y-1 text-slate-300">
                    {activeHandoverDossier.establishedFacts.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-amber-300">🛠️ Attempted Steps (Customer Must NOT Repeat)</div>
                  <ul className="bg-slate-900 p-2.5 rounded border border-slate-800 space-y-1 text-slate-300">
                    {activeHandoverDossier.attemptedSteps.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1 bg-rose-950/30 p-2.5 rounded border border-rose-900/40">
                  <div className="font-bold text-rose-300">⚠️ Next Recommended Action</div>
                  <p className="text-slate-300 leading-relaxed">
                    {activeHandoverDossier.recommendedNextAction}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 px-4 space-y-2 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <ArrowRightLeft className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-xs font-semibold text-slate-300">
                No Active Handover Dossier
              </div>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                When a complex case or repeat hardware failure is detected, the assistant automatically synthesizes an audit brief so context is never lost during agent handover.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
