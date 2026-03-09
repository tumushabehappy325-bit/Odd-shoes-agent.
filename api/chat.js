import { GoogleGenerativeAI } from "@google/generative-ai";

const SITE_KNOWLEDGE = `
Odd Shoes is a tech partner for Christian founders.
It says: "A higher calling. A better startup."

Core positioning:
- Builds MVPs, crafts brands, and accelerates growth for founders who want to honour God with their business.
- Building tech products for Christian founders who believe business can be a vehicle for Kingdom impact.

Headline metrics:
- 100+ MVPs shipped
- 15+ products live
- 5-14 days to launch
- 50% to His Kingdom

Services:
1. Genesis Build
   - 5-day MVP for pre-revenue founders
   - Single feature
   - Production-ready
   - Launched Friday

2. Kingdom Builder
   - Complete system with brand
   - Multi-feature app
   - 6 months fractional CTO support

3. AI & Automation
   - OpenClaw deployment
   - Custom AI agents
   - Workflow automation for your business

Broader service areas:
- MVP Development
- Brand & Identity
- Growth Strategy
- UI/UX Design
- Web & Mobile Apps
- Kingdom Consulting

Capabilities:
- React
- React Native
- Node.js
- Python

How it works:
- Discovery Call
- Strategy Sprint
- Build & Ship
- Launch & Grow

Calls to action:
- Launch Your MVP
- See Our Work
- Launch Project Planner
- Book a Call

Contact:
- buildit@oddshoes.dev
- Kampala, Uganda

Behavior rules:
- Do not answer as if Odd Shoes sells shoes.
- Do not invent pricing, timelines beyond what is listed, or policies not stated here.
- If a question is outside the site knowledge, say you are not fully sure from the current site info and guide the user to book a call or use the project planner.
`;

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    const { message, history } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing message" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest"
    });

    const formattedHistory = Array.isArray(history)
      ? history
          .slice(-8)
          .map((item) => `${item.role === "assistant" ? "Assistant" : "User"}: ${item.content}`)
          .join("\n")
      : "";

    const prompt = `
You are the official website assistant for Odd Shoes.

Use the SITE_KNOWLEDGE below as your primary source of truth.
Your job is to help founders understand what Odd Shoes does and guide them to the best next step.

SITE_KNOWLEDGE:
${SITE_KNOWLEDGE}

Rules:
- Stay aligned to the Odd Shoes website information.
- Odd Shoes is a startup-building and tech services company, not a footwear store.
- Answer clearly and concisely.
- Sound warm, confident, helpful, and founder-focused.
- If the user asks what Odd Shoes can do for them, map their need to a service.
- If the question is unrelated to Odd Shoes, politely redirect to how Odd Shoes helps founders.
- If the answer is not explicitly supported by the site knowledge, say:
  "I’m not fully sure from the current site info, but I can guide you based on what Odd Shoes offers."
- Do not invent exact prices, guarantees, or unsupported promises.
- End with a relevant CTA such as:
  - book a call
  - launch the project planner
  - email buildit@oddshoes.dev

Conversation so far:
${formattedHistory}

User: ${message}
Assistant:
`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("CHAT ERROR:", error);
    return res.status(500).json({
      error: String(error?.message || error)
    });
  }
}
