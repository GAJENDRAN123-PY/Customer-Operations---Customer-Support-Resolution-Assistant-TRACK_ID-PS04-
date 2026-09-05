import React, { useState } from 'react';
import { CustomerAccount, SupportTicketCase } from '../types';
import { MOCK_CUSTOMERS } from '../data/mockData';
import { 
  PlusCircle, 
  X, 
  Wifi, 
  CreditCard, 
  Smartphone, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTicket: (ticket: SupportTicketCase) => void;
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({
  isOpen,
  onClose,
  onCreateTicket
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust_sarah_chen');
  const [category, setCategory] = useState<'Broadband' | 'Billing' | 'Mobile' | 'General'>('Broadband');
  const [subject, setSubject] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [channel, setChannel] = useState<'Web Chat' | 'Mobile App' | 'Inbound Portal'>('Web Chat');

  if (!isOpen) return null;

  // Preset templates for rapid testing of the 3 pathways
  const presets = [
    {
      label: 'Routine Wi-Fi Speed',
      category: 'Broadband' as const,
      custId: 'cust_sarah_chen',
      subject: 'Low speed on upstairs Wi-Fi with 500Mbps plan',
      message: "Hi, I'm only getting 38 Mbps on Wi-Fi in my bedroom upstairs on the 500Mbps plan. Can you help improve my connection?"
    },
    {
      label: 'Missing Info: ONT Light',
      category: 'Broadband' as const,
      custId: 'cust_david_miller',
      subject: 'Internet dropped and wall unit has light flashing',
      message: "My internet just went out completely. The small white wall box has a blinking light on it. What should I check?"
    },
    {
      label: 'Routine Billing: Roaming',
      category: 'Billing' as const,
      custId: 'cust_emma_watson',
      subject: 'Unexpected $20 roaming fee on my monthly invoice',
      message: "Hi, I noticed a $20 roaming charge on my bill for a local boat trip. I didn't leave the country. Can I get a credit for this?"
    },
    {
      label: 'Complex: Rain Fault & Cancel',
      category: 'Broadband' as const,
      custId: 'cust_marcus_vance',
      subject: '3rd router swap failed - drops every time it rains',
      message: "This is my 3rd replacement router and it still disconnects continuously whenever it rains. I lost client work today and want to terminate my contract without fees immediately."
    },
    {
      label: 'Routine Mobile: eSIM Swap',
      category: 'Mobile' as const,
      custId: 'cust_priya_patel',
      subject: 'eSIM QR code expired on new iPhone',
      message: "Hi, I just upgraded to my new phone and the eSIM QR code in my email says it expired. Can you send me a fresh one?"
    }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setSelectedCustomerId(preset.custId);
    setCategory(preset.category);
    setSubject(preset.subject);
    setInitialMessage(preset.message);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !initialMessage.trim()) return;

    const customer = MOCK_CUSTOMERS[selectedCustomerId] || Object.values(MOCK_CUSTOMERS)[0];
    const ticketNum = `#TCK-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket: SupportTicketCase = {
      id: `ticket-${Date.now()}`,
      ticketNumber: ticketNum,
      customer: customer,
      subject: subject.trim(),
      initialChannel: channel,
      category: category,
      status: 'New',
      messages: [
        {
          id: `msg-${Date.now()}-1`,
          sender: 'customer',
          text: initialMessage.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    onCreateTicket(newTicket);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Create New Support Case</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Quick Presets for testing */}
          <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Quick Scenario Presets (Test 3 Pathways):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => applyPreset(p)}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-cyan-300 text-[11px] font-medium border border-slate-700 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Select Customer Account */}
          <div className="space-y-1">
            <label className="font-bold text-slate-300">Customer Account:</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
            >
              {Object.values(MOCK_CUSTOMERS).map((cust) => (
                <option key={cust.id} value={cust.id}>
                  {cust.fullName} ({cust.accountNumber}) - {cust.plan.name} [{cust.vipTier}]
                </option>
              ))}
            </select>
          </div>

          {/* Category & Channel */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
              >
                <option value="Broadband">Broadband Connection</option>
                <option value="Billing">Billing & Payments</option>
                <option value="Mobile">Mobile & eSIM</option>
                <option value="General">General Inquiries</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Channel:</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
              >
                <option value="Web Chat">Web Chat</option>
                <option value="Mobile App">Mobile App</option>
                <option value="Inbound Portal">Inbound Portal</option>
              </select>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1">
            <label className="font-bold text-slate-300">Case Subject:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Wi-Fi speed dropping in master bedroom..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
              required
            />
          </div>

          {/* Customer Request Message */}
          <div className="space-y-1">
            <label className="font-bold text-slate-300">Customer Initial Message:</label>
            <textarea
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              rows={4}
              placeholder="Type what the customer is asking or complaining about..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 font-sans"
              required
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-900/30 transition-all"
            >
              Triage Case with Assistant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
