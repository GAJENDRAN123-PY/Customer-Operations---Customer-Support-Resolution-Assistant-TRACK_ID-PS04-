import { CustomerAccount, SupportArticle, SupportTicketCase } from '../types';

export const SUPPORT_ARTICLES: SupportArticle[] = [
  {
    id: 'KB-BB-101',
    title: 'Broadband: Flashing or Red PON / LOS Light on Optical Terminal (ONT)',
    category: 'Broadband',
    keywords: ['pon light', 'los light', 'flashing green', 'red light', 'no fiber signal', 'optical terminal', 'nokia ont'],
    summary: 'Standard diagnostics and customer guidance when the fiber ONT indicates optical power failure or sync loss.',
    content: `
### Symptom Overview
The Nokia or Huawei Optical Network Terminal (ONT) installed on the customer's wall shows:
- **LOS (Loss of Signal) Light is Solid/Flashing Red**: Zero laser light detected from the optical line terminal.
- **PON (Passive Optical Network) Light is Flashing Green or Off**: The ONT is searching for synchronization or unregistered.

### Standard Customer Verification Steps
1. Inspect the white/green SC-APC fiber patch cable connecting the wall box to the ONT bottom port. Verify it is firmly clicked into place (audible click).
2. Ensure the optical fiber cable has no sharp kinks or tight 90-degree bends (minimum bend radius: 30mm).
3. Do not disconnect the green fiber connector directly or stare into the laser aperture.
4. Perform a 60-second power cycle on the ONT black power adapter.

### Policy & Resolution Rules
- If optical RX power in customer telemetry is between **-8 dBm and -27 dBm**, the physical line is healthy; re-seat the Ethernet patch cable to the router WAN port.
- If optical RX power is below **-30 dBm** or shows **"Critical Loss"**, an optical line break exists in the street cabinet or drop cable.
- **Escalation trigger**: If LOS remains red after confirming physical cable is intact, DO NOT attempt router resets. Handover immediately to Field Engineering Dispatch for optical time-domain reflectometer (OTDR) trace.
    `.trim(),
    resolutionChecklist: [
      'Check optical Rx power telemetry in account record',
      'Confirm physical SC-APC fiber patch cord is seated firmly',
      'Check local OLT exchange for scheduled fiber maintenance',
      '60-second ONT power reboot'
    ],
    escalationRules: 'If optical Rx < -28 dBm or LOS remains solid red after power cycle, escalate immediately to Tier-2 Field Dispatch.'
  },
  {
    id: 'KB-BB-102',
    title: 'Broadband: Wi-Fi Speed Discrepancy vs Guaranteed Sync Speed',
    category: 'Broadband',
    keywords: ['slow speed', 'wifi slow', 'speed guarantee', '500mbps', 'gigabit', 'bedroom wifi', '2.4ghz', '5ghz'],
    summary: 'Procedures for troubleshooting perceived speed drops between the router sync speed and wireless end devices.',
    content: `
### Context & Speed Guarantees
- Our provider contracts guarantee wired line sync speed to the master router (e.g., 500 Mbps download minimum 450 Mbps on Full Fibre 500).
- Wi-Fi speeds inside the premises depend on frequency band (2.4 GHz vs 5 GHz / 6 GHz), wall construction, and device antenna capabilities.

### Diagnostic Criteria
1. Check customer's router model and telemetry:
   - Apex Hub 5 supports Wi-Fi 6 (802.11ax) dual-band intelligent steering.
   - Look at Wi-Fi congestion metric in customer equipment profile.
2. Verify if the customer tested over **Wired Cat6 Ethernet** or **Wireless**:
   - Single-stream 2.4GHz connections cap naturally at 50-80 Mbps regardless of gigabit plan.
   - High local 2.4GHz interference (e.g., neighbor channels, microwave ovens, baby monitors) causes severe packet latency.

### Resolution Steps to Propose
1. Advise customer to separate or verify the 5GHz network SSID or enable Smart Wi-Fi Channel Optimization via the mobile app.
2. Conduct an official speed test directly via Ethernet cable plugged into Port 1 of the Apex Hub with Wi-Fi disabled on test device.
3. If property size > 120 sq meters and signal drops in remote rooms (e.g. upstairs bedroom), customer is eligible for a complimentary Apex Mesh Wi-Fi Extender under their Priority Plus / Gigabit plan.
    `.trim(),
    resolutionChecklist: [
      'Verify line sync speed at router WAN interface matches plan',
      'Explain difference between 2.4GHz (range) and 5GHz (speed)',
      'Trigger remote Channel Re-scan on customer Apex Hub 5',
      'Offer free Apex Mesh Extender if customer is on Priority/Gigabit tier'
    ],
    escalationRules: 'If wired Ethernet speed test measures below the Minimum Guaranteed Download Speed (450 Mbps for 500Mbps plan), escalate to Line Optimization Team.'
  },
  {
    id: 'KB-BIL-201',
    title: 'Billing: Unexpected Roaming & Out-of-Bundle Charge Inquiry',
    category: 'Billing',
    keywords: ['roaming charge', 'unexpected bill', 'out of bundle', 'holiday charge', 'bill credit', 'international data'],
    summary: 'Guidelines for handling bill spikes caused by border roaming, international data passes, or accidental usage.',
    content: `
### Policy on Out-of-Bundle Roaming Charges
- Customers travelling abroad or residing near border zones may connect to adjacent foreign cell towers (e.g. maritime or non-inclusive roaming zones).
- Under our Fair Roaming Policy, first-time inadvertent roaming charges under **$50.00** are eligible for an immediate frontline **Courtesy Credit Waiver**.
- Higher amounts (>$50.00) require Tier-2 Billing Team authorization.

### Routine Resolution Protocol
1. Check customer account billing breakdown:
   - Identify specific dates, destination country, and roaming data MB logged.
2. Check customer tenure and dispute history:
   - If customer has had no prior roaming waivers in the last 12 months, the agent can issue an immediate one-off courtesy credit of the disputed roaming portion.
3. Setup permanent safety caps:
   - Guide the customer to toggle the "International Roaming Data Spend Cap" in the Mobile Portal ($0, $15, or $50 hard stop).
    `.trim(),
    resolutionChecklist: [
      'Verify itemized roaming charges in current billing cycle',
      'Confirm no prior roaming courtesy credits in past 12 months',
      'Draft approval for credit waiver up to $50.00',
      'Set customer Roaming Spend Cap to prevent recurring overages'
    ],
    escalationRules: 'Disputes exceeding $50.00 or disputed contract fee adjustments require Senior Billing Escalations.'
  },
  {
    id: 'KB-BIL-202',
    title: 'Billing: Direct Debit Failure & Payment Promise Arrangement',
    category: 'Billing',
    keywords: ['payment failure', 'direct debit', 'payment promise', 'overdue balance', 'line restriction'],
    summary: 'Resolution pathway for customers experiencing temporary cashflow issues or banking payment bounces.',
    content: `
### Protocol for Overdue Accounts
- Customers with a single missed payment are granted a **14-day grace period** before any speed throttling or outgoing call bar is applied.
- The assistant can establish a formal "Promise to Pay" date without penalty fees if the customer account has been active for >3 months.
- Immediate payment can be taken via card or scheduled for the customer's next regular payday.
    `.trim(),
    resolutionChecklist: [
      'Check current balance and days past due',
      'Confirm line is not yet restricted',
      'Propose payment promise date within 14 calendar days',
      'Provide self-service one-time card payment link'
    ],
    escalationRules: 'Accounts >30 days past due or subject to debt collection agencies must be routed to Collections & Credit Management.'
  },
  {
    id: 'KB-MOB-301',
    title: 'Mobile: eSIM Transfer, QR Code Expiration & Device Swap',
    category: 'Mobile',
    keywords: ['esim', 'qr code', 'device swap', 'iphone 16', 'activate esim', 'sim not working'],
    summary: 'Steps to re-issue digital eSIM profiles when changing smartphones or encountering invalid QR codes.',
    content: `
### Technical Context
- An eSIM QR code activation profile is valid for **24 hours** from generation for security reasons.
- Once downloaded to a device, the QR code cannot be scanned again on a second device.

### Routine Resolution Steps
1. Verify customer identity (Account PIN or One-Time Passcode sent to registered email).
2. Check SIM status in mobile management platform:
   - If previous profile shows "In Use" on old IMEI, generate a **Fresh eSIM Replacement Profile**.
3. Send the new secure activation QR code directly to the customer's verified email address and Mobile App portal.
4. Ensure device is connected to stable Wi-Fi during the profile download.
    `.trim(),
    resolutionChecklist: [
      'Verify account holder registered email',
      'Cancel expired eSIM voucher code in provisioning system',
      'Push fresh eSIM profile QR code to customer registered email',
      'Advise keeping device connected to Wi-Fi for 5 minutes during activation'
    ],
    escalationRules: 'If ICCID provisioning reports "HLR/HSS Network Synchronization Error", escalate to Mobile Core Network Support.'
  },
  {
    id: 'KB-RET-401',
    title: 'Complex Policy: Repeat Hardware Failures, Water Ingress & Termination Demands',
    category: 'Policy',
    keywords: ['cancel contract', 'repeat fault', 'third router', 'compensation', 'rains', 'work from home', 'legal complaint'],
    summary: 'Mandatory escalation protocol for chronic faults, external plant moisture ingress, and customer loss-of-service claims.',
    content: `
### MANDATORY HUMAN HANDOVER CRITERIA
Under Customer Operations Directive CO-77, automated bots and frontline scripts **MUST NOT** attempt routine self-help closure if ANY of the following occur:
1. The customer has experienced **>= 2 repeat faults within the last 30 days**.
2. The customer reports environmental correlation with outages (e.g. faults occurring specifically when it rains, indicating water ingress in the underground conduit, joint box, or aerial drop wire).
3. The customer explicitly demands fee-free contract cancellation, compensation for remote work loss, or quotes regulatory compliance standards.
4. The issue has already undergone multiple router swaps without fixing the root cause.

### Required Handover Action
- The assistant **MUST NOT** issue further generic troubleshooting questions (e.g. "Have you restarted your router?").
- Generate a comprehensive **Zero-Context-Loss Handover Dossier**:
  - Issue summary & chronic pattern
  - Hardware & telemetry facts established
  - Previous technician actions/tickets logged
  - Urgent recommendation for external plant investigation & priority care specialist
- Transfer immediately to **Tier-2 Priority Technical Escalations & Retention**.
    `.trim(),
    resolutionChecklist: [
      'Stop routine automated deflection immediately',
      'Synthesize multi-ticket history and symptoms',
      'Flag external plant physical fault (drop wire / joint box moisture)',
      'Handover to Senior Priority Escalations with full contextual brief'
    ],
    escalationRules: 'Automatic and immediate escalation required. No bot resolution permitted.'
  }
];

export const MOCK_CUSTOMERS: Record<string, CustomerAccount> = {
  'cust_sarah_chen': {
    id: 'cust_sarah_chen',
    accountNumber: 'APX-982410',
    fullName: 'Sarah Chen',
    email: 'sarah.chen@techmail.example',
    phone: '+1 (555) 349-8120',
    address: '42 Orchard Grove, Oakridge, OR 97401',
    customerTenureMonths: 18,
    vipTier: 'Priority Plus',
    plan: {
      name: 'Full Fibre Gigabit 500',
      broadbandSpeed: '500 Mbps Download / 75 Mbps Upload',
      mobileAllowance: '5G Unlimited SIM (x1)',
      monthlyPrice: 62.00,
      status: 'Active'
    },
    billing: {
      currentBalance: 0.00,
      currency: 'USD',
      billingStatus: 'Up to Date',
      lastPaymentDate: '2026-08-28',
      lastPaymentAmount: 62.00,
      paymentMethod: 'Auto Direct Debit (Chase ending *4912)',
      directDebitActive: true,
      contractEndDate: '2027-02-15',
      recentCharges: [
        { description: 'Full Fibre 500 Monthly Package', amount: 62.00, date: '2026-08-28' }
      ]
    },
    equipment: {
      routerModel: 'Apex Hub 5 (Wi-Fi 6 AX3000)',
      routerSerial: 'AH5-77319-NA',
      routerStatus: 'Online',
      routerWanIp: '185.192.44.110',
      ontModel: 'Nokia G-240G-A GPON',
      opticalRxPower: '-19.4 dBm (Healthy)',
      opticalSignalStatus: 'Normal',
      ontPonLight: 'Solid Green',
      ontLosLight: 'Off',
      wifiBandwidth: 'Dual-band Active',
      wifiCongestion: 'High (2.4GHz)',
      connectedDevices: 12,
      firmwareVersion: 'v4.19.8-build2026',
      uptime: '28 days, 4 hours'
    },
    networkArea: {
      oltExchange: 'Oakridge Central OLT-02',
      areaOutageReported: false
    },
    recentTickets: [
      {
        id: 'TCK-2026-4401',
        date: '2026-06-12',
        category: 'Broadband',
        summary: 'Inquiry regarding Gigabit upgrade availability',
        status: 'Resolved',
        resolutionNote: 'Customer upgraded from 150Mbps to 500Mbps tier smoothly.'
      }
    ]
  },

  'cust_david_miller': {
    id: 'cust_david_miller',
    accountNumber: 'APX-651902',
    fullName: 'David Miller',
    email: 'd.miller77@worknet.example',
    phone: '+1 (555) 782-9014',
    address: '118 Pineview Crescent, Austin, TX 78704',
    customerTenureMonths: 8,
    vipTier: 'Standard',
    plan: {
      name: 'Full Fibre Ultra 300',
      broadbandSpeed: '300 Mbps Download / 50 Mbps Upload',
      mobileAllowance: 'N/A (Broadband Only)',
      monthlyPrice: 48.00,
      status: 'Active'
    },
    billing: {
      currentBalance: 48.00,
      currency: 'USD',
      billingStatus: 'Up to Date',
      lastPaymentDate: '2026-08-15',
      lastPaymentAmount: 48.00,
      paymentMethod: 'Credit Card (Visa ending *8812)',
      directDebitActive: true,
      contractEndDate: '2027-01-05',
      recentCharges: [
        { description: 'Full Fibre Ultra 300', amount: 48.00, date: '2026-08-15' }
      ]
    },
    equipment: {
      routerModel: 'Apex Hub 4 (Wi-Fi 5 AC1900)',
      routerSerial: 'AH4-33109-TX',
      routerStatus: 'Offline',
      routerWanIp: 'Unassigned (DHCP Timeout)',
      ontModel: 'Nokia G-010G-A GPON ONT',
      opticalRxPower: '-31.8 dBm (Degraded)',
      opticalSignalStatus: 'Critical Loss',
      ontPonLight: 'Flashing Green',
      ontLosLight: 'Flashing Red',
      wifiBandwidth: 'Offline',
      wifiCongestion: 'Low',
      connectedDevices: 0,
      firmwareVersion: 'v3.2.1',
      uptime: '0 hours (Disconnected 24m ago)'
    },
    networkArea: {
      oltExchange: 'Austin South OLT-09',
      areaOutageReported: false
    },
    recentTickets: []
  },

  'cust_emma_watson': {
    id: 'cust_emma_watson',
    accountNumber: 'APX-410982',
    fullName: 'Emma Watson',
    email: 'emma.watson.design@cloud.example',
    phone: '+1 (555) 912-3401',
    address: '74 Elmwood Terrace, Seattle, WA 98102',
    customerTenureMonths: 24,
    vipTier: 'Priority Plus',
    plan: {
      name: 'Broadband Pro 900 + Unlimited 5G Mobile',
      broadbandSpeed: '900 Mbps Download / 110 Mbps Upload',
      mobileAllowance: 'Unlimited 5G Data & Roaming Tier',
      monthlyPrice: 55.00,
      status: 'Active'
    },
    billing: {
      currentBalance: 75.00,
      currency: 'USD',
      billingStatus: 'Disputed Charge',
      lastPaymentDate: '2026-08-01',
      lastPaymentAmount: 55.00,
      paymentMethod: 'Direct Debit (Wells Fargo ending *3041)',
      directDebitActive: true,
      contractEndDate: '2026-11-30',
      recentCharges: [
        { description: 'Standard Plan Monthly Charge', amount: 55.00, date: '2026-09-01' },
        { description: 'Maritime / Cross-Border Roaming Zone Data (200MB)', amount: 20.00, date: '2026-09-01', isOutOfBundle: true }
      ]
    },
    equipment: {
      routerModel: 'Apex Hub 5 Pro',
      routerSerial: 'AH5P-88219-WA',
      routerStatus: 'Online',
      routerWanIp: '212.58.244.70',
      ontModel: 'Huawei EchoLife HG8010H',
      opticalRxPower: '-18.2 dBm',
      opticalSignalStatus: 'Normal',
      ontPonLight: 'Solid Green',
      ontLosLight: 'Off',
      wifiBandwidth: 'Tri-Band Active',
      wifiCongestion: 'Low',
      connectedDevices: 18,
      firmwareVersion: 'v4.20.1',
      uptime: '42 days'
    },
    networkArea: {
      oltExchange: 'Seattle Belltown OLT-01',
      areaOutageReported: false
    },
    recentTickets: [
      {
        id: 'TCK-2025-9921',
        date: '2025-11-14',
        category: 'Billing',
        summary: 'Query about annual contract renewal incentive',
        status: 'Resolved',
        resolutionNote: 'Applied $10 loyalty promotion discount for 12 months.'
      }
    ]
  },

  'cust_marcus_vance': {
    id: 'cust_marcus_vance',
    accountNumber: 'APX-204918',
    fullName: 'Marcus Vance',
    email: 'mvance@vancestudio.example',
    phone: '+1 (555) 601-4492',
    address: '14 Coastal Ridge Rd, Mendocino, CA 95460',
    customerTenureMonths: 14,
    vipTier: 'Business Pro',
    plan: {
      name: 'Business Pro Fibre 1000 + 4G Backup',
      broadbandSpeed: '1000 Mbps Symmetrical',
      mobileAllowance: '4G Auto-Failover SIM Dongle',
      monthlyPrice: 110.00,
      status: 'Active'
    },
    billing: {
      currentBalance: 0.00,
      currency: 'USD',
      billingStatus: 'Up to Date',
      lastPaymentDate: '2026-08-20',
      lastPaymentAmount: 110.00,
      paymentMethod: 'Corporate Amex ending *1009',
      directDebitActive: true,
      contractEndDate: '2027-06-15',
      recentCharges: [
        { description: 'Business Pro Fibre 1000 Service', amount: 110.00, date: '2026-08-20' }
      ]
    },
    equipment: {
      routerModel: 'Apex Enterprise Hub 6 (3rd replacement unit)',
      routerSerial: 'AH6E-90412-CA',
      routerStatus: 'Degraded',
      routerWanIp: '94.200.11.8',
      ontModel: 'Adtran GPON SFP ONT',
      opticalRxPower: '-28.9 dBm (Fluctuating -24 to -33 dBm)',
      opticalSignalStatus: 'Marginal',
      ontPonLight: 'Flashing Green',
      ontLosLight: 'Off',
      wifiBandwidth: 'Degraded Packet Loss 32%',
      wifiCongestion: 'Low',
      connectedDevices: 6,
      firmwareVersion: 'v5.0.2',
      uptime: '1 hour 12 min (Dropouts: 19 recorded today)'
    },
    networkArea: {
      oltExchange: 'Mendocino Coastal OLT-01',
      areaOutageReported: false,
      outageDetails: 'Adverse weather warning: Heavy rainfall reported along coastal aerial drop lines.'
    },
    recentTickets: [
      {
        id: 'TCK-2026-8101',
        date: '2026-08-10',
        category: 'Hardware',
        summary: 'Broadband loss during rainstorm - replaced router unit #1',
        status: 'Closed',
        resolutionNote: 'Dispatched replacement Apex Hub. Line tested briefly OK.'
      },
      {
        id: 'TCK-2026-8742',
        date: '2026-08-22',
        category: 'Hardware',
        summary: 'Dropouts resumed - replaced router unit #2 with Hub 6',
        status: 'Closed',
        resolutionNote: 'Customer stated still unstable. Replaced power supply & router.'
      }
    ]
  },

  'cust_priya_patel': {
    id: 'cust_priya_patel',
    accountNumber: 'APX-739184',
    fullName: 'Priya Patel',
    email: 'priya.p@innovate.example',
    phone: '+1 (555) 431-8890',
    address: '89 Market Street, Apt 14B, Denver, CO 80202',
    customerTenureMonths: 11,
    vipTier: 'Standard',
    plan: {
      name: 'Apex Mobile All-In 5G',
      broadbandSpeed: 'N/A (Mobile Only)',
      mobileAllowance: '100GB 5G High-Speed Data, Unlimited Calls & Texts',
      monthlyPrice: 35.00,
      status: 'Active'
    },
    billing: {
      currentBalance: 0.00,
      currency: 'USD',
      billingStatus: 'Up to Date',
      lastPaymentDate: '2026-08-25',
      lastPaymentAmount: 35.00,
      paymentMethod: 'Apple Pay / Visa ending *6621',
      directDebitActive: true,
      contractEndDate: '2026-10-31',
      recentCharges: [
        { description: 'Mobile All-In 5G Monthly', amount: 35.00, date: '2026-08-25' }
      ]
    },
    equipment: {
      routerModel: 'N/A (Mobile Customer)',
      routerSerial: 'N/A',
      routerStatus: 'Online',
      ontModel: 'N/A',
      opticalRxPower: 'N/A',
      opticalSignalStatus: 'Normal',
      ontPonLight: 'Off',
      ontLosLight: 'Off',
      wifiBandwidth: 'N/A',
      wifiCongestion: 'Low',
      connectedDevices: 1,
      firmwareVersion: 'iOS 18.2 Carrier Bundle 58.0',
      uptime: 'Active on 5G Denver Downtown'
    },
    networkArea: {
      oltExchange: 'Denver Downtown Cell Tower D-104',
      areaOutageReported: false
    },
    recentTickets: []
  }
};

export const INITIAL_TICKETS: SupportTicketCase[] = [
  {
    id: 'ticket-01',
    ticketNumber: '#TCK-7821',
    customer: MOCK_CUSTOMERS['cust_sarah_chen'],
    subject: 'Wi-Fi speeds slow in bedroom despite 500Mbps plan',
    initialChannel: 'Web Chat',
    category: 'Broadband',
    status: 'In Progress',
    messages: [
      {
        id: 'msg-01-1',
        sender: 'customer',
        text: "Hi, I pay for the Full Fibre 500Mbps package, but when I'm working from my upstairs bedroom on my laptop, I only get around 35 to 40 Mbps and video calls stutter. The router is downstairs in the hallway. Is there an issue with my line?",
        timestamp: '10:14 AM'
      }
    ]
  },
  {
    id: 'ticket-02',
    ticketNumber: '#TCK-7822',
    customer: MOCK_CUSTOMERS['cust_david_miller'],
    subject: 'Internet suddenly dropped and small box on wall has flashing light',
    initialChannel: 'Inbound Portal',
    category: 'Broadband',
    status: 'New',
    messages: [
      {
        id: 'msg-02-1',
        sender: 'customer',
        text: "Hello, my internet completely cut out about 20 minutes ago. The main router has an orange light, and on the small white box screwed to the wall where the cable enters the house, there's a flashing light. What should I do?",
        timestamp: '10:28 AM'
      }
    ]
  },
  {
    id: 'ticket-03',
    ticketNumber: '#TCK-7823',
    customer: MOCK_CUSTOMERS['cust_emma_watson'],
    subject: 'Why is my latest bill $75 instead of usual $55? Disputing roaming fee',
    initialChannel: 'Mobile App',
    category: 'Billing',
    status: 'New',
    messages: [
      {
        id: 'msg-03-1',
        sender: 'customer',
        text: "Hi there! I just received my billing statement for this month and it came out to $75 instead of my normal $55 fixed plan rate. Looking closely, it says $20 for Maritime / Cross-Border roaming. I took a local coastal ferry trip last weekend and didn't even leave the country! Can this be refunded?",
        timestamp: '10:45 AM'
      }
    ]
  },
  {
    id: 'ticket-04',
    ticketNumber: '#TCK-7824',
    customer: MOCK_CUSTOMERS['cust_marcus_vance'],
    subject: '3rd router swap failed - cuts off every time it rains - demands contract cancellation & compensation',
    initialChannel: 'Web Chat',
    category: 'Broadband',
    status: 'In Progress',
    messages: [
      {
        id: 'msg-04-1',
        sender: 'customer',
        text: "This is completely unacceptable. You sent me a 3rd replacement router last week and your agents promised that would fix it. It started raining heavily this morning and my connection has dropped 19 times already. I run a design studio from home and lost two client deliverables today. I will NOT restart another router. I want this contract cancelled immediately with zero termination penalty and compensation for lost business, or I'm taking this to the communications ombudsman.",
        timestamp: '11:02 AM'
      }
    ]
  },
  {
    id: 'ticket-05',
    ticketNumber: '#TCK-7825',
    customer: MOCK_CUSTOMERS['cust_priya_patel'],
    subject: 'Swapped to new iPhone 16 - eSIM QR code scan shows expired/invalid',
    initialChannel: 'Mobile App',
    category: 'Mobile',
    status: 'New',
    messages: [
      {
        id: 'msg-05-1',
        sender: 'customer',
        text: "Hey, I upgraded to my new phone yesterday and tried scanning the eSIM activation QR code from my welcome email, but iOS keeps saying 'eSIM profile can no longer be added, contact carrier'. My old phone has already been wiped. How do I get my service back?",
        timestamp: '11:15 AM'
      }
    ]
  }
];
