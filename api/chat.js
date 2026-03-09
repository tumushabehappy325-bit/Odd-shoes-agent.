import { GoogleGenerativeAI } from "@google/generative-ai";

const SITE_KNOWLEDGE = `
Odd Shoes is a tech partner for Christian founders.

Key facts:
- Builds MVPs, brands, and growth systems.
- Ships MVPs in 5–14 days.
- 100+ MVPs shipped.
- 15+ products live.

Core services:
• Genesis Build – 5-day MVP sprint
• Kingdom Builder – full startup system
• AI & Automation – custom AI agents
• Brand & Identity
• Growth Strategy
• Web & Mobile Apps

Process:
1. Discovery Call
2. Strategy Sprint
3. Build & Ship
4. Launch & Grow

Location: Kampala, Uganda
Contact: buildit@oddshoes.dev
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

    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: "Message missing" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest"
    });

    const prompt = `
You are the official assistant for Odd Shoes.

Use the knowledge below as your main source.

${SITE_KNOWLEDGE}

Rules:
- Answer based on the Odd Shoes services.
- Help founders launch MVPs or AI systems.
- If a question is unrelated, redirect to how Odd Shoes helps founders.
- Do not invent information.
- End with a suggestion like booking a call or launching the project planner.

User question:
${message}

Assistant:
`;

    const result = await model.generateContent(prompt);

    const reply = result.response.text();

    return res.status(200).json({ reply });

  } catch (error) {

    console.error("CHAT ERROR:", error);

    return res.status(500).json({
      error: error.message || "Server error"
    });

  }
}
