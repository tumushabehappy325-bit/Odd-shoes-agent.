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

    const { message } = req.body;

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const prompt = `
You are the marketing assistant for Odd Shoes.

Tone:
Bold, fun, confident.

Responsibilities:
• Help users choose shoes
• Suggest styles (casual / sporty / bold)
• Answer comfort and sizing questions
• If the user asks about discounts, ask for their email
• Always end with a call-to-action

User: ${message}

Agent:
`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    return res.status(200).json({ reply });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message
    });
  }
}
