import React, { useState } from 'react';
import { CustomerAccount } from '../types';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Activity, 
  Wifi, 
  CreditCard, 
  History, 
  AlertCircle, 
  CheckCircle2, 
  Radio, 
  Zap, 
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Server
} from 'lucide-react';

interface Customer360PanelProps {
  customer: CustomerAccount;
}

export const Customer360Panel: React.FC<Customer360PanelProps> = ({ customer }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'telemetry' | 'billing' | 'tickets'>('overview');

  const getSignalBadge = (status: string) => {
    switch (status) {
      case 'Normal':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Normal
          </span>
        );
      case 'Marginal':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Marginal (-28 dBm)
          </span>
        );
      case 'Critical Loss':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Critical Optical Loss
          </span>
        );
      default:
        return <span className="text-slate-400 text-xs">Unknown</span>;
    }
  };

  return (
    <div className="bg-slate-900/95 border-r border-slate-800 flex flex-col h-full overflow-hidden">
      {/* Account Header */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-xs font-bold text-white shadow">
                {customer.fullName.split(' ').map(n => n[0]).join('')}
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-100 leading-tight flex items-center gap-1.5">
                  {customer.fullName}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    customer.vipTier === 'Business Pro' 
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : customer.vipTier === 'Priority Plus'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {customer.vipTier}
                  </span>
                </h2>
                <span className="text-[11px] font-mono text-slate-400">
                  {customer.accountNumber} • {customer.customerTenureMonths} mo tenure
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Contact & Address */}
        <div className="mt-3 space-y-1 text-xs text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{customer.address}</span>
          </div>
          <div className="flex items-center justify-between pt-1 text-slate-400">
            <span className="flex items-center gap-1 text-[11px] font-mono">
              <Phone className="w-3 h-3 text-slate-500" />
              {customer.phone}
            </span>
            <span className="flex items-center gap-1 text-[11px] truncate max-w-[140px]">
              <Mail className="w-3 h-3 text-slate-500" />
              {customer.email}
            </span>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-1 mt-3 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-1 px-1.5 rounded text-center font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-cyan-400 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Plan
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`flex-1 py-1 px-1.5 rounded text-center font-medium transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'telemetry'
                ? 'bg-slate-800 text-cyan-400 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Hardware</span>
            {customer.equipment.opticalSignalStatus !== 'Normal' && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`flex-1 py-1 px-1.5 rounded text-center font-medium transition-colors ${
              activeTab === 'billing'
                ? 'bg-slate-800 text-cyan-400 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Billing
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex-1 py-1 px-1.5 rounded text-center font-medium transition-colors ${
              activeTab === 'tickets'
                ? 'bg-slate-800 text-cyan-400 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tickets ({customer.recentTickets.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
        {/* OVERVIEW / PLAN TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-3">
            {/* Plan Info Card */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Subscribed Plan
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {customer.plan.status}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-100">{customer.plan.name}</div>
              
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Broadband Speed:</span>
                  <span className="font-semibold text-cyan-400">{customer.plan.broadbandSpeed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mobile Data:</span>
                  <span className="font-medium text-slate-200">{customer.plan.mobileAllowance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly Commitment:</span>
                  <span className="font-bold text-slate-100">${customer.plan.monthlyPrice.toFixed(2)} / mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Contract End:</span>
                  <span className="font-mono text-slate-300">{customer.billing.contractEndDate}</span>
                </div>
              </div>
            </div>

            {/* Network Exchange Radar */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Server className="w-3 h-3 text-cyan-400" />
                  Area OLT Exchange
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  customer.networkArea.areaOutageReported
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {customer.networkArea.areaOutageReported ? 'Node Alert' : 'Operational'}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-300">{customer.networkArea.oltExchange}</div>
              {customer.networkArea.outageDetails && (
                <div className="text-[11px] text-amber-300/90 bg-amber-950/30 p-2 rounded border border-amber-800/40">
                  {customer.networkArea.outageDetails}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TELEMETRY TAB */}
        {activeTab === 'telemetry' && (
          <div className="space-y-3">
            {/* Optical Signal Card */}
            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  Optical Signal (Rx Power)
                </span>
                {getSignalBadge(customer.equipment.opticalSignalStatus)}
              </div>

              <div className="flex items-baseline justify-between bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-400 text-xs">Laser Power:</span>
                <span className={`font-mono text-sm font-bold ${
                  customer.equipment.opticalSignalStatus === 'Normal'
                    ? 'text-emerald-400'
                    : customer.equipment.opticalSignalStatus === 'Marginal'
                    ? 'text-amber-400'
                    : 'text-rose-400 font-extrabold'
                }`}>
                  {customer.equipment.opticalRxPower}
                </span>
              </div>

              {/* Hardware LED Status Table */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  ONT Physical LEDs
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <div className="text-slate-400 text-[10px]">PON LED</div>
                    <div className={`font-semibold flex items-center gap-1.5 mt-0.5 ${
                      customer.equipment.ontPonLight === 'Solid Green'
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        customer.equipment.ontPonLight === 'Solid Green'
                          ? 'bg-emerald-400'
                          : 'bg-amber-400 animate-pulse'
                      }`} />
                      {customer.equipment.ontPonLight}
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <div className="text-slate-400 text-[10px]">LOS (Signal Loss)</div>
                    <div className={`font-semibold flex items-center gap-1.5 mt-0.5 ${
                      customer.equipment.ontLosLight === 'Off'
                        ? 'text-slate-300'
                        : 'text-rose-400 font-bold'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        customer.equipment.ontLosLight === 'Off'
                          ? 'bg-slate-600'
                          : 'bg-rose-500 animate-ping'
                      }`} />
                      {customer.equipment.ontLosLight}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Router Hardware & Wi-Fi Details */}
            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                  Router Telemetry
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  customer.equipment.routerStatus === 'Online'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : customer.equipment.routerStatus === 'Degraded'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {customer.equipment.routerStatus}
                </span>
              </div>

              <div className="text-xs font-semibold text-slate-100">
                {customer.equipment.routerModel}
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                S/N: {customer.equipment.routerSerial}
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1 text-slate-300 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Wi-Fi Congestion:</span>
                  <span className={`font-semibold ${
                    customer.equipment.wifiCongestion.includes('High')
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}>
                    {customer.equipment.wifiCongestion}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Connected Devices:</span>
                  <span className="font-medium text-slate-200">{customer.equipment.connectedDevices} active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">System Uptime:</span>
                  <span className="font-mono text-slate-300">{customer.equipment.uptime}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BILLING TAB */}
        {activeTab === 'billing' && (
          <div className="space-y-3">
            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Current Account Balance
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  customer.billing.billingStatus === 'Disputed Charge'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {customer.billing.billingStatus}
                </span>
              </div>
              <div className="text-xl font-bold text-slate-100">
                ${customer.billing.currentBalance.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-400">
                Payment Method: <span className="text-slate-300">{customer.billing.paymentMethod}</span>
              </div>
            </div>

            {/* Recent Itemized Charges */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Recent Billing Items
              </span>
              <div className="space-y-1.5">
                {customer.billing.recentCharges.map((c, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded border text-xs flex items-center justify-between ${
                      c.isOutOfBundle
                        ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                        : 'bg-slate-950/40 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium flex items-center gap-1.5">
                        {c.description}
                        {c.isOutOfBundle && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/30 text-amber-300 font-bold uppercase">
                            Out of Bundle
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">{c.date}</div>
                    </div>
                    <div className="font-mono font-bold text-slate-100">
                      ${c.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RECENT TICKETS TAB */}
        {activeTab === 'tickets' && (
          <div className="space-y-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Interaction History</span>
              <span className="text-slate-500">{customer.recentTickets.length} past records</span>
            </span>

            {customer.recentTickets.length === 0 ? (
              <div className="text-xs text-slate-500 p-4 text-center border border-dashed border-slate-800 rounded-lg">
                No previous support tickets recorded for this account.
              </div>
            ) : (
              <div className="space-y-2">
                {customer.recentTickets.map((ticket) => (
                  <div key={ticket.id} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-semibold text-cyan-400">{ticket.id}</span>
                      <span className="text-slate-500">{ticket.date}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-200">
                      {ticket.summary}
                    </div>
                    <div className="text-[11px] text-slate-400 bg-slate-900/80 p-1.5 rounded border border-slate-800/80">
                      <span className="text-slate-500 font-medium">Outcome: </span>
                      {ticket.resolutionNote}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
