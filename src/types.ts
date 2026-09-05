export type TriageMode = 'routine' | 'clarify' | 'handover';

export interface CustomerBilling {
  currentBalance: number;
  currency: string;
  billingStatus: 'Up to Date' | 'Payment Due' | 'Disputed Charge' | 'Suspended';
  lastPaymentDate: string;
  lastPaymentAmount: number;
  paymentMethod: string;
  directDebitActive: boolean;
  contractEndDate: string;
  recentCharges: Array<{
    description: string;
    amount: number;
    date: string;
    isOutOfBundle?: boolean;
  }>;
}

export interface EquipmentTelemetry {
  routerModel: string;
  routerSerial: string;
  routerStatus: 'Online' | 'Degraded' | 'Offline' | 'Restarting';
  routerWanIp?: string;
  ontModel: string;
  opticalRxPower: string;
  opticalSignalStatus: 'Normal' | 'Marginal' | 'Critical Loss' | 'Unknown';
  ontPonLight: 'Solid Green' | 'Flashing Green' | 'Off' | 'Flashing Red';
  ontLosLight: 'Off' | 'Flashing Red' | 'Solid Red';
  wifiBandwidth: string;
  wifiCongestion: 'Low' | 'Moderate' | 'High (2.4GHz)';
  connectedDevices: number;
  firmwareVersion: string;
  uptime: string;
}

export interface PastTicket {
  id: string;
  date: string;
  category: 'Broadband' | 'Billing' | 'Mobile' | 'Hardware';
  summary: string;
  status: 'Resolved' | 'Closed' | 'Escalated' | 'Open';
  resolutionNote: string;
}

export interface CustomerAccount {
  id: string;
  accountNumber: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  customerTenureMonths: number;
  vipTier: 'Standard' | 'Priority Plus' | 'Business Pro';
  plan: {
    name: string;
    broadbandSpeed: string;
    mobileAllowance: string;
    monthlyPrice: number;
    status: 'Active' | 'Pending Renewal' | 'Restricted';
  };
  billing: CustomerBilling;
  equipment: EquipmentTelemetry;
  networkArea: {
    oltExchange: string;
    areaOutageReported: boolean;
    outageDetails?: string;
  };
  recentTickets: PastTicket[];
}

export interface SupportArticle {
  id: string;
  title: string;
  category: 'Broadband' | 'Billing' | 'Mobile' | 'Policy';
  keywords: string[];
  summary: string;
  applicablePlans?: string;
  content: string;
  resolutionChecklist: string[];
  escalationRules: string;
}

export interface HandoverSummary {
  issueSummary: string;
  establishedFacts: string[];
  attemptedSteps: string[];
  escalationReason: string;
  recommendedNextAction: string;
  targetQueue: string;
  priority: 'Normal' | 'High' | 'Urgent / Critical';
}

export interface TriageResult {
  mode: TriageMode;
  confidenceScore: number; // 0 - 100
  reasoning: string;
  matchingArticle?: {
    id: string;
    title: string;
    citedSection: string;
    directQuote?: string;
  };
  draftResponse?: string;
  clarificationPrompt?: {
    questionToCustomer: string;
    missingFields: string[];
    guidanceForAgent: string;
  };
  handoverDossier?: HandoverSummary;
  evaluatedAt: string;
  source: 'gemini-3.8-flash' | 'expert-rules-fallback';
}

export interface ConversationMessage {
  id: string;
  sender: 'customer' | 'agent' | 'system';
  text: string;
  timestamp: string;
  citedArticleId?: string;
}

export interface SupportTicketCase {
  id: string;
  ticketNumber: string;
  customer: CustomerAccount;
  subject: string;
  initialChannel: 'Web Chat' | 'Mobile App' | 'Inbound Portal';
  category: 'Broadband' | 'Billing' | 'Mobile' | 'General';
  status: 'New' | 'In Progress' | 'Awaiting Customer' | 'Escalated' | 'Resolved';
  messages: ConversationMessage[];
  currentTriage?: TriageResult;
  agentNotes?: string[];
  assignedSpecialist?: string;
}
