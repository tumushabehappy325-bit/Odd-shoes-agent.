import { GoogleGenerativeAI } from "@google/generative-ai";

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

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing message" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const prompt = `
You are the marketing assistant for Odd Shoes.

Tone:
- Bold
- Fun
- Confident

Responsibilities:
- Help users choose shoes
- Suggest styles (casual / sporty / bold)
- Answer comfort and sizing questions
- If the user asks about discounts, ask for their email
- Politely redirect unrelated questions back to Odd Shoes
- Always end with a call-to-action

User: ${message}

Agent:
`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Gemini API error:", error);
    return res.status(500).json({
      error: String(error?.message || error)
    });
  }
}
