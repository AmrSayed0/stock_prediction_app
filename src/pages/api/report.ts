import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

interface StockReportRequestBody {
  data: string;
}

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAICompletionResponse {
  choices: {
    message: {
      content: string | null;
    };
  }[];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body: StockReportRequestBody = JSON.parse(req.body);

    if (!body?.data || typeof body.data !== "string") {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const { data } = body;
    const tickers = data
      .split("\n")
      .map((line) => line.split(",")[0])
      .join(", ");

    const messages: OpenAIMessage[] = [
      {
        role: "system",
        content: "You are a professional stock report generator.",
      },
      {
        role: "user",
        content: `
${data}

---

### Instructions:
Generate a detailed stock report based on the provided data.
Include the following sections:

1. **Overview** – Brief summary of the stock's performance.
2. **Technical Analysis** – Key indicators and chart patterns.
3. **Fundamental Analysis** – Company financial, earnings, market position.
4. **Market Sentiment** – Analyst ratings and investor perception.
5. **Conclusion** – Final assessment and outlook.

- Use bullet points for clarity.
- Format using **Markdown**.
- Target audience: Investors and analysts.
- Highlight key trends or anomalies.
- Ensure the report is self-contained with no external context required.

---

Stock Report for: **${tickers}**

Begin the report below:
        `.trim(),
      },
    ];

    const completion: OpenAICompletionResponse =
      await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        max_tokens: 1500,
        temperature: 0.7,
        presence_penalty: 0.5,
        frequency_penalty: 0.5,
      });

    const reportContent = completion.choices[0]?.message?.content ?? "";

    return res.status(200).json({ report: reportContent });
  } catch (error) {
    console.error("OpenAI error:", error);
    return res.status(500).json({
      error: "An unexpected error occurred while generating the report.",
    });
  }
}
