import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { TicketQueue } from './components/TicketQueue';
import { Customer360Panel } from './components/Customer360Panel';
import { ConversationPanel } from './components/ConversationPanel';
import { KnowledgeBasePanel } from './components/KnowledgeBasePanel';
import { HandoverModal } from './components/HandoverModal';
import { NewTicketModal } from './components/NewTicketModal';
import { INITIAL_TICKETS, SUPPORT_ARTICLES, MOCK_CUSTOMERS } from './data/mockData';
import { SupportTicketCase, TriageResult, SupportArticle } from './types';
import { Layers, User, BookOpen, MessageSquare } from 'lucide-react';

export default function App() {
  const [tickets, setTickets] = useState<SupportTicketCase[]>(INITIAL_TICKETS);
  const [activeTicketId, setActiveTicketId] = useState<string>(INITIAL_TICKETS[0].id);
  const [articles] = useState<SupportArticle[]>(SUPPORT_ARTICLES);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState<boolean>(false);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState<boolean>(false);

  // Mobile layout panel tab
  const [mobileActiveView, setMobileActiveView] = useState<'conversation' | 'customer' | 'articles' | 'queue'>('conversation');

  const activeTicket = tickets.find(t => t.id === activeTicketId) || tickets[0];

  // Evaluate ticket via backend API
  const evaluateTicket = useCallback(async (ticket: SupportTicketCase) => {
    setIsEvaluating(true);
    try {
      const response = await fetch('/api/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: ticket.messages,
          customer: ticket.customer,
          articles: SUPPORT_ARTICLES
        })
      });

      if (!response.ok) {
        throw new Error(`Evaluation failed with status ${response.status}`);
      }

      const triage: TriageResult = await response.json();

      setTickets(prev =>
        prev.map(t => {
          if (t.id === ticket.id) {
            return {
              ...t,
              currentTriage: triage,
              status: triage.mode === 'handover' ? 'Escalated' : t.status
            };
          }
          return t;
        })
      );

      // If routine resolution cited an article, select it for grounding inspection
      if (triage.matchingArticle?.id) {
        setSelectedArticleId(triage.matchingArticle.id);
      }
    } catch (err) {
      console.error('Error evaluating ticket:', err);
    } finally {
      setIsEvaluating(false);
    }
  }, []);

  // Initial evaluation on mount for the tickets so all 3 pathways are ready
  useEffect(() => {
    const initializeQueue = async () => {
      for (const t of tickets) {
        if (!t.currentTriage) {
          await evaluateTicket(t);
        }
      }
    };
    initializeQueue();
  }, []);

  // When active ticket changes, if no triage yet, evaluate
  useEffect(() => {
    if (activeTicket && !activeTicket.currentTriage) {
      evaluateTicket(activeTicket);
    } else if (activeTicket?.currentTriage?.matchingArticle?.id) {
      setSelectedArticleId(activeTicket.currentTriage.matchingArticle.id);
    }
  }, [activeTicketId]);

  // Handle message sending (agent reply or simulated customer response)
  const handleSendMessage = (text: string, sender: 'agent' | 'customer', citedArticleId?: string) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citedArticleId
    };

    const updatedTicket: SupportTicketCase = {
      ...activeTicket,
      messages: [...activeTicket.messages, newMessage],
      status: sender === 'agent' ? 'In Progress' : activeTicket.status
    };

    setTickets(prev => prev.map(t => (t.id === activeTicket.id ? updatedTicket : t)));

    // Trigger AI assistant re-evaluation on new message
    setTimeout(() => {
      evaluateTicket(updatedTicket);
    }, 200);
  };

  // Complete handover to specialist
  const handleConfirmTransfer = (queue: string, notes: string) => {
    const handoverSystemMsg = {
      id: `sys-${Date.now()}`,
      sender: 'system' as const,
      text: `Transferred to ${queue} with Zero-Context-Loss Handover Brief. ${notes ? `Note: "${notes}"` : ''}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setTickets(prev =>
      prev.map(t => {
        if (t.id === activeTicket.id) {
          return {
            ...t,
            status: 'Escalated',
            assignedSpecialist: queue,
            messages: [...t.messages, handoverSystemMsg]
          };
        }
        return t;
      })
    );

    setIsHandoverModalOpen(false);
  };

  // Queue counts
  const routineCount = tickets.filter(t => t.currentTriage?.mode === 'routine').length;
  const clarifyCount = tickets.filter(t => t.currentTriage?.mode === 'clarify').length;
  const handoverCount = tickets.filter(t => t.currentTriage?.mode === 'handover').length;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Top Header */}
      <Header
        queueCount={tickets.length}
        routineCount={routineCount}
        clarifyCount={clarifyCount}
        handoverCount={handoverCount}
        onRefreshAll={() => evaluateTicket(activeTicket)}
        isEvaluating={isEvaluating}
      />

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center justify-around bg-slate-900 border-b border-slate-800 p-2 text-xs">
        <button
          onClick={() => setMobileActiveView('queue')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold ${
            mobileActiveView === 'queue' ? 'bg-cyan-600 text-white' : 'text-slate-400'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Queue ({tickets.length})</span>
        </button>
        <button
          onClick={() => setMobileActiveView('customer')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold ${
            mobileActiveView === 'customer' ? 'bg-cyan-600 text-white' : 'text-slate-400'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Account</span>
        </button>
        <button
          onClick={() => setMobileActiveView('conversation')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold ${
            mobileActiveView === 'conversation' ? 'bg-cyan-600 text-white' : 'text-slate-400'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Assistant</span>
        </button>
        <button
          onClick={() => setMobileActiveView('articles')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold ${
            mobileActiveView === 'articles' ? 'bg-cyan-600 text-white' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Articles</span>
        </button>
      </div>

      {/* Main 3-Column Desk Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Section: Ticket Queue Switcher & Customer 360 Account */}
        <div className={`w-full lg:w-[32%] xl:w-[28%] flex flex-col h-full border-r border-slate-800 shrink-0 ${
          mobileActiveView === 'queue' || mobileActiveView === 'customer' ? 'flex' : 'hidden lg:flex'
        }`}>
          {/* Upper: Queue */}
          <div className="h-44 shrink-0 border-b border-slate-800">
            <TicketQueue
              tickets={tickets}
              activeTicketId={activeTicket.id}
              onSelectTicket={(id) => {
                setActiveTicketId(id);
                setMobileActiveView('conversation');
              }}
              onOpenNewTicketModal={() => setIsNewTicketModalOpen(true)}
            />
          </div>

          {/* Lower: Customer 360 Record & Telemetry */}
          <div className="flex-1 overflow-hidden">
            <Customer360Panel customer={activeTicket.customer} />
          </div>
        </div>

        {/* Center Section: Case Conversation & Resolution Assistant Workspace */}
        <div className={`flex-1 flex flex-col h-full overflow-hidden ${
          mobileActiveView === 'conversation' ? 'flex' : 'hidden lg:flex'
        }`}>
          <ConversationPanel
            ticket={activeTicket}
            onSendMessage={handleSendMessage}
            onInitiateHandover={() => setIsHandoverModalOpen(true)}
            onViewArticle={(artId) => {
              setSelectedArticleId(artId);
              setMobileActiveView('articles');
            }}
            isEvaluating={isEvaluating}
            onReevaluate={() => evaluateTicket(activeTicket)}
          />
        </div>

        {/* Right Section: Support Articles Grounding & Handover Dossier */}
        <div className={`w-full lg:w-[30%] xl:w-[32%] flex flex-col h-full border-l border-slate-800 shrink-0 ${
          mobileActiveView === 'articles' ? 'flex' : 'hidden lg:flex'
        }`}>
          <KnowledgeBasePanel
            articles={articles}
            selectedArticleId={selectedArticleId}
            onSelectArticle={setSelectedArticleId}
            citedArticleId={activeTicket.currentTriage?.matchingArticle?.id}
            activeHandoverDossier={activeTicket.currentTriage?.handoverDossier}
            customerName={activeTicket.customer.fullName}
          />
        </div>
      </div>

      {/* Handover Dossier Modal */}
      {activeTicket.currentTriage?.handoverDossier && (
        <HandoverModal
          isOpen={isHandoverModalOpen}
          onClose={() => setIsHandoverModalOpen(false)}
          handoverDossier={activeTicket.currentTriage.handoverDossier}
          customerName={activeTicket.customer.fullName}
          accountNumber={activeTicket.customer.accountNumber}
          onConfirmTransfer={handleConfirmTransfer}
        />
      )}

      {/* New Ticket / Test Scenario Modal */}
      <NewTicketModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        onCreateTicket={(newTicket) => {
          setTickets(prev => [newTicket, ...prev]);
          setActiveTicketId(newTicket.id);
          evaluateTicket(newTicket);
          setMobileActiveView('conversation');
        }}
      />
    </div>
  );
}
