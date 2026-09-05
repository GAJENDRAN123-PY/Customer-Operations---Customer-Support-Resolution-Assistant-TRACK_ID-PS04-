import React from 'react';
import { 
  Bot, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Wifi, 
  PhoneCall, 
  RefreshCw,
  Clock,
  ArrowRightLeft
} from 'lucide-react';

interface HeaderProps {
  queueCount: number;
  routineCount: number;
  clarifyCount: number;
  handoverCount: number;
  onRefreshAll: () => void;
  isEvaluating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  queueCount,
  routineCount,
  clarifyCount,
  handoverCount,
  onRefreshAll,
  isEvaluating
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 px-4 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Track ID */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                Nexa Broadband & Mobile
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Resolution Assistant
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>Customer Operations</span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-slate-300">TRACK_ID=PS04</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Gemini 3.8-Flash Live
              </span>
            </p>
          </div>
        </div>

        {/* Operational Telemetry / Queue Distribution */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-950/70 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Queue:</span>
            <span className="font-bold text-white">{queueCount}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-950/30 px-2.5 py-1.5 rounded-lg border border-emerald-800/40 text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Routine:</span>
            <span className="font-bold text-emerald-200">{routineCount}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-amber-950/30 px-2.5 py-1.5 rounded-lg border border-amber-800/40 text-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Needs Info:</span>
            <span className="font-bold text-amber-200">{clarifyCount}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-rose-950/30 px-2.5 py-1.5 rounded-lg border border-rose-800/40 text-rose-300">
            <ArrowRightLeft className="w-3.5 h-3.5 text-rose-400" />
            <span>Handover:</span>
            <span className="font-bold text-rose-200">{handoverCount}</span>
          </div>

          <button
            onClick={onRefreshAll}
            disabled={isEvaluating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors disabled:opacity-50"
            title="Re-run assistant evaluation on active ticket"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden md:inline font-medium">Re-evaluate</span>
          </button>
        </div>
      </div>
    </header>
  );
};
