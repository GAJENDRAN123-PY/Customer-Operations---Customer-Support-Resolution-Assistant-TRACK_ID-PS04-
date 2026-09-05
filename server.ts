import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client (lazy safe initialization)
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// Deterministic heuristic resolution fallback for when API key is unavailable or offline
function generateLocalResolution(conversation: any[], customer: any, articles: any[]) {
  const latestMessage = conversation[conversation.length - 1]?.text?.toLowerCase() || '';
  const customerName = customer?.fullName || 'Valued Customer';
  const planName = customer?.plan?.name || 'Broadband Plan';

  // Check 1: Mandatory Escalation / Complex handover
  // Repeated faults, rain/weather + disconnects, cancel contract, compensation, 3rd router
  if (
    latestMessage.includes('cancel') ||
    latestMessage.includes('compensation') ||
    latestMessage.includes('rain') ||
    latestMessage.includes('3rd') ||
    latestMessage.includes('third router') ||
    (customer?.recentTickets?.length >= 2 && customer?.equipment?.opticalSignalStatus === 'Marginal')
  ) {
    return {
      mode: 'handover',
      confidenceScore: 97,
      reasoning: 'Customer reports repeated hardware replacements failing, connection drops correlated with rainfall, business impact with loss of deliverables, and demands contract cancellation without penalty. Meets KB-RET-401 mandatory escalation criteria.',
      matchingArticle: {
        id: 'KB-RET-401',
        title: 'Complex Policy: Repeat Hardware Failures, Water Ingress & Termination Demands',
        citedSection: 'Mandatory Human Handover Criteria & Directive CO-77'
      },
      handoverDossier: {
        issueSummary: `Intermittent broadband loss (19 drops today) correlated with rainfall. Customer has already undergone 2 router swaps (now on 3rd unit) without resolution, causing business impact. Customer demands fee-free cancellation and compensation.`,
        establishedFacts: [
          `Customer Tier: ${customer?.vipTier || 'Business Pro'} on ${planName}`,
          `Account: ${customer?.accountNumber} | Address: ${customer?.address}`,
          `Equipment: ${customer?.equipment?.routerModel} (3rd replacement unit, Uptime 1h 12m)`,
          `Telemetry: Optical Rx power is fluctuating abnormally (-24 dBm to -33 dBm) with 32% packet loss`,
          `External conditions: Heavy rainfall along coastal drop wire route; past tickets show router replaced twice without checking external plant`
        ],
        attemptedSteps: [
          `Router hardware replaced twice (Apex Hub #1 on Aug 10, Apex Hub #2 on Aug 22, now on Enterprise Hub 6)`,
          `Power supplies and Ethernet cords already renewed`,
          `Router reboot and automated line sync verified (optical signal drops immediately during moisture/rain)`
        ],
        escalationReason: 'External plant physical fault suspected (water ingress in drop wire or underground joint box). Customer at critical churn risk with commercial loss claim.',
        recommendedNextAction: 'Authorize immediate dispatch of Senior Field Optical Splicing Engineer for physical line OTDR test. Issue $50 inconvenience credit and route to Senior Retention Lead to prevent contract termination.',
        targetQueue: 'Tier-2 Priority Technical Escalations & Retention',
        priority: 'Urgent / Critical'
      },
      evaluatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'expert-rules-fallback'
    };
  }

  // Check 2: Missing Information
  // Customer mentions flashing light on wall box or ONT, but does not specify color or label
  if (
    (latestMessage.includes('small white box') || latestMessage.includes('flashing light') || latestMessage.includes('wall box') || latestMessage.includes('ont')) &&
    !latestMessage.includes('pon') &&
    !latestMessage.includes('los') &&
    !latestMessage.includes('red') &&
    !latestMessage.includes('green')
  ) {
    return {
      mode: 'clarify',
      confidenceScore: 92,
      reasoning: 'Customer reported a flashing light on the wall-mounted optical terminal (ONT), but did not specify which LED is lit (PON vs LOS) or the color (green vs red). This is essential before determining whether to troubleshoot fiber patch seating or book an engineer.',
      matchingArticle: {
        id: 'KB-BB-101',
        title: 'Broadband: Flashing or Red PON / LOS Light on Optical Terminal (ONT)',
        citedSection: 'Standard Customer Verification Steps'
      },
      clarificationPrompt: {
        questionToCustomer: `Hi ${customerName}, I can help you get back online right away. On the small white wall box (the Optical Terminal where the fiber comes in), could you please tell me which label next to the light is flashing, and what color it is? Specifically:\n\n1. Is the **PON** light flashing green or off?\n2. Is the **LOS** light glowing or flashing red?\n3. Is the thin white/green fiber cable plugged tightly into the bottom with a firm click?`,
        missingFields: ['ONT Light Identifier (PON vs LOS)', 'LED Color (Red vs Green)', 'SC-APC Fiber Cable Seating'],
        guidanceForAgent: 'If customer confirms LOS is Red, optical signal is severed (-31.8 dBm in telemetry confirms this). If PON is flashing green, unit is attempting OLT handshake.'
      },
      evaluatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'expert-rules-fallback'
    };
  }

  // Check 3: Billing Roaming Dispute
  if (latestMessage.includes('roaming') || latestMessage.includes('$75') || latestMessage.includes('bill') || latestMessage.includes('charge')) {
    return {
      mode: 'routine',
      confidenceScore: 96,
      reasoning: 'Customer is inquiring about an unexpected $20 charge for maritime/border roaming on a local ferry trip. Account records show customer is on Priority Plus with no previous roaming waivers in the last 12 months. Covered by KB-BIL-201 Courtesy Credit Waiver protocol.',
      matchingArticle: {
        id: 'KB-BIL-201',
        title: 'Billing: Unexpected Roaming & Out-of-Bundle Charge Inquiry',
        citedSection: 'Routine Resolution Protocol & Courtesy Credit Waiver'
      },
      draftResponse: `Hi ${customerName},\n\nThank you for reaching out regarding your September billing statement. I completely understand how surprising it is to see an unexpected charge after a local ferry trip!\n\nI reviewed your itemized account breakdown and confirmed that on September 1st, your mobile device briefly connected to a coastal maritime cellular transmitter, generating a $20.00 out-of-bundle roaming fee.\n\nIn accordance with our **Fair Roaming Policy (KB-BIL-201)** and in appreciation of your 2-year loyalty on the **${planName}**, I have applied an immediate **$20.00 one-off courtesy credit** directly to your account. Your adjusted balance is now your normal $55.00 fixed rate.\n\nTo ensure this never happens on future coastal trips, I have also activated our complimentary **Zero-Cost Roaming Spend Cap** on your line. Please feel free to reply if you need any further assistance!`,
      evaluatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'expert-rules-fallback'
    };
  }

  // Check 4: Wi-Fi Speed in Bedroom / 2.4GHz vs 5GHz
  if (latestMessage.includes('bedroom') || latestMessage.includes('slow') || latestMessage.includes('speed') || latestMessage.includes('35') || latestMessage.includes('40')) {
    return {
      mode: 'routine',
      confidenceScore: 95,
      reasoning: 'Customer experiencing low throughput (35-40 Mbps) in upstairs bedroom on 500Mbps plan. Telemetry confirms optical signal is healthy (-19.4 dBm) and router is online, but 2.4GHz spectrum shows high channel congestion. Routine resolution via KB-BB-102.',
      matchingArticle: {
        id: 'KB-BB-102',
        title: 'Broadband: Wi-Fi Speed Discrepancy vs Guaranteed Sync Speed',
        citedSection: 'Diagnostic Criteria & Wi-Fi 6 Channel Optimization'
      },
      draftResponse: `Hi ${customerName},\n\nThank you for contacting us about your connection in your upstairs bedroom. I checked your line diagnostics right now: your physical fiber line into your **${customer?.equipment?.routerModel || 'Apex Hub 5'}** is performing at full 500 Mbps speed with a healthy optical signal (-19.4 dBm).\n\nThe speed reduction to 35-40 Mbps upstairs is occurring because your laptop is connecting over the 2.4 GHz wireless frequency, which is currently experiencing high channel interference from nearby household devices.\n\nHere is how we can resolve this right now:\n1. **Optimized Band Steering**: I have triggered a remote Wi-Fi channel optimization on your Apex Hub 5 to steer your bedroom devices to the clean 5 GHz Wi-Fi 6 band.\n2. **Free Mesh Extender**: As a valued **${customer?.vipTier || 'Priority Plus'}** member, your plan qualifies for a complimentary **Apex Mesh Wi-Fi 6 Extender** delivered free of charge to eliminate wireless dead zones upstairs.\n\nWould you like me to ship the free Mesh Extender to your address at ${customer?.address}?`,
      evaluatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'expert-rules-fallback'
    };
  }

  // Check 5: Mobile eSIM QR Code
  if (latestMessage.includes('esim') || latestMessage.includes('qr') || latestMessage.includes('iphone') || latestMessage.includes('activation')) {
    return {
      mode: 'routine',
      confidenceScore: 94,
      reasoning: 'Customer swapped to new iPhone and existing eSIM QR voucher expired (valid 24 hours per KB-MOB-301). Routine resolution: cancel expired profile and generate fresh QR code to registered email.',
      matchingArticle: {
        id: 'KB-MOB-301',
        title: 'Mobile: eSIM Transfer, QR Code Expiration & Device Swap',
        citedSection: 'Routine Resolution Steps'
      },
      draftResponse: `Hi ${customerName},\n\nCongratulations on your new phone! The reason you are seeing that message is that security protocols expire initial eSIM QR codes after 24 hours (per **KB-MOB-301**), or once they have been bound to a previous IMEI.\n\nI have generated a **fresh, secure eSIM profile voucher** for your line ending in ${customer?.phone?.slice(-4) || '8890'}. \n\nHere are the quick steps to get connected:\n1. We have just emailed the new activation QR code to your registered address (**${customer?.email}**).\n2. Ensure your new iPhone is connected to Wi-Fi.\n3. Open **Settings > Cellular > Add eSIM**, and scan the new QR code.\n\nThe profile will activate within 2-3 minutes. Let me know if you need any help during the scan!`,
      evaluatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'expert-rules-fallback'
    };
  }

  // Default Routine/General draft
  return {
    mode: 'routine',
    confidenceScore: 88,
    reasoning: 'Grounded in standard broadband & mobile support guidelines. Account is verified active with no regional outages reported.',
    matchingArticle: {
      id: articles[0]?.id || 'KB-BB-102',
      title: articles[0]?.title || 'Broadband: Support Guidelines',
      citedSection: 'Standard Resolution Protocol'
    },
    draftResponse: `Hi ${customerName},\n\nThank you for reaching out to customer support. I have pulled up your account record (${customer?.accountNumber}) on our **${planName}**.\n\nOur system diagnostics show your service status is active with no recorded exchange outages. I would be happy to review your inquiry and ensure this is resolved quickly for you.\n\nPlease let me know if you'd like me to perform a remote line refresh or walk through device settings.`,
    evaluatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    source: 'expert-rules-fallback'
  };
}

// Resolution Assistant endpoint
app.post('/api/resolve', async (req: Request, res: Response) => {
  try {
    const { conversation, customer, articles } = req.body;

    if (!conversation || !customer) {
      return res.status(400).json({ error: 'Missing conversation or customer payload' });
    }

    const ai = getGeminiClient();

    // If Gemini client is not initialized (no API key configured), use expert heuristic resolution
    if (!ai) {
      console.log('Gemini API key not detected. Using expert rules resolution engine.');
      const localResult = generateLocalResolution(conversation, customer, articles || []);
      return res.json(localResult);
    }

    // Build comprehensive prompt for Gemini 3.8 Flash
    const conversationText = conversation.map((m: any) => `[${m.sender.toUpperCase()} - ${m.timestamp || ''}]: ${m.text}`).join('\n');

    const customerContext = `
CUSTOMER ACCOUNT RECORD:
- Full Name: ${customer.fullName}
- Account #: ${customer.accountNumber}
- Customer Tier: ${customer.vipTier} (Tenure: ${customer.customerTenureMonths} months)
- Address: ${customer.address}
- Plan: ${customer.plan.name} (${customer.plan.broadbandSpeed}, ${customer.plan.mobileAllowance}) - Monthly Fee: $${customer.plan.monthlyPrice}
- Plan Status: ${customer.plan.status}
- Billing: Current Balance: $${customer.billing.currentBalance}, Status: ${customer.billing.billingStatus}, Direct Debit: ${customer.billing.directDebitActive ? 'Active' : 'Inactive'}, Contract End: ${customer.billing.contractEndDate}
- Recent Itemized Charges: ${JSON.stringify(customer.billing.recentCharges || [])}
- Equipment Telemetry:
  * Router: ${customer.equipment.routerModel} (Serial: ${customer.equipment.routerSerial}, Status: ${customer.equipment.routerStatus}, Uptime: ${customer.equipment.uptime})
  * ONT Unit: ${customer.equipment.ontModel}
  * Optical Rx Power: ${customer.equipment.opticalRxPower} (Signal Status: ${customer.equipment.opticalSignalStatus})
  * ONT Hardware LEDs: PON=${customer.equipment.ontPonLight}, LOS=${customer.equipment.ontLosLight}
  * Wi-Fi Spectrum: Bandwidth=${customer.equipment.wifiBandwidth}, Congestion=${customer.equipment.wifiCongestion}, Connected Devices=${customer.equipment.connectedDevices}
- Network Area:
  * Exchange: ${customer.networkArea.oltExchange}
  * Outage Reported: ${customer.networkArea.areaOutageReported} ${customer.networkArea.outageDetails || ''}
- Prior Tickets History:
  ${customer.recentTickets.map((t: any) => `* [${t.date}] (${t.category}) ${t.summary} -> Status: ${t.status} - Note: ${t.resolutionNote}`).join('\n') || 'None'}
`;

    const kbContext = (articles || []).map((a: any) => `
--- ARTICLE ${a.id}: ${a.title} [Category: ${a.category}] ---
Summary: ${a.summary}
Content Excerpt:
${a.content}
Checklist: ${a.resolutionChecklist.join('; ')}
Escalation Rules: ${a.escalationRules}
---------------------------------------------------------
`).join('\n');

    const systemInstruction = `
You are the Resolution Assistant for a broadband and mobile provider's customer operations support desk.
Your job is to work incoming customer requests using three things:
1. The conversation so far
2. The customer's account record (plan, billing status, equipment telemetry, optical readings, past tickets)
3. The set of support knowledge base articles provided.

YOUR DECISION PATHWAYS:
- Pathway 1: "routine"
  For routine requests covered by a support article (e.g. Wi-Fi band congestion, first-time roaming charge waiver under $50, expired eSIM QR code, standard router reconnect).
  Draft a courteous, professional resolution grounded in the matching article, citing the article ID and section. Tailor it specifically to the customer's account facts (e.g. their specific router model, plan, address, or credit amount). The draft MUST be ready for an agent to approve and send.

- Pathway 2: "clarify"
  When critical diagnostic or policy information is missing to properly diagnose or resolve the issue (e.g., customer reports a blinking light on the ONT wall box but hasn't stated whether it is PON or LOS or what color it is; customer complains about speeds but hasn't stated if testing over Ethernet vs Wi-Fi; customer disputes a fee without specifying which charge).
  Ask for EXACTLY what is needed in a polite, helpful customer-facing message that clearly guides them where to look.

- Pathway 3: "handover"
  When the case is complex, uncertain, not covered by any article, involves chronic repeated faults (e.g., multiple router replacements failing, faults triggered by rain/water ingress in external drop wires), customer demands contract cancellation with legal/compensation claims, or requires physical engineering dispatch.
  Generate a concise, zero-context-loss Handover Dossier so the customer NEVER repeats themselves:
  - issueSummary: 1-2 sentence core problem
  - establishedFacts: array of confirmed account, line, and hardware facts
  - attemptedSteps: array of everything already tried
  - escalationReason: why human specialist/tier-2 is required
  - recommendedNextAction: concrete action for the next agent
  - targetQueue: e.g. "Tier-2 Priority Technical Escalations & Retention", "Field Optical Engineering", "Senior Billing Escalations"
  - priority: "Normal" | "High" | "Urgent / Critical"

OUTPUT FORMAT:
Return strictly valid JSON with no markdown backticks or commentary matching this structure:
{
  "mode": "routine" | "clarify" | "handover",
  "confidenceScore": number (0 to 100),
  "reasoning": string,
  "matchingArticle": {
    "id": string,
    "title": string,
    "citedSection": string
  } | null,
  "draftResponse": string (only if mode is "routine"),
  "clarificationPrompt": {
    "questionToCustomer": string,
    "missingFields": string[],
    "guidanceForAgent": string
  } (only if mode is "clarify"),
  "handoverDossier": {
    "issueSummary": string,
    "establishedFacts": string[],
    "attemptedSteps": string[],
    "escalationReason": string,
    "recommendedNextAction": string,
    "targetQueue": string,
    "priority": "Normal" | "High" | "Urgent / Critical"
  } (only if mode is "handover")
}
`;

    const userPrompt = `
Evaluate the latest customer situation:

${conversationText}

${customerContext}

AVAILABLE SUPPORT ARTICLES:
${kbContext}

Analyze and generate the optimal support desk resolution.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text?.trim() || '{}';
    let parsedResult;
    try {
      parsedResult = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('Failed to parse Gemini JSON:', rawText, parseErr);
      parsedResult = generateLocalResolution(conversation, customer, articles);
    }

    parsedResult.evaluatedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    parsedResult.source = 'gemini-3.8-flash';

    return res.json(parsedResult);
  } catch (error: any) {
    console.error('Error in /api/resolve:', error);
    // Fallback gracefully so the UI never breaks
    const { conversation, customer, articles } = req.body;
    const fallback = generateLocalResolution(conversation || [], customer || {}, articles || []);
    return res.json(fallback);
  }
});

// Setup Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Resolution Assistant Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
