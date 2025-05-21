import { Client, Message } from "./coordinator.ts";
export class GeminiClient implements Client {
  constructor(private apiKey: string) {}

  async send(messages: Message[]): Promise<string> {
    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;

    const mapped = messages.map(({ role, content }) => ({
      role: role === "system" ? "model" : role,
      parts: [{ text: content }],
    }));

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: mapped,
        generationConfig: {
          stopSequences: [],
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`GeminiClient: API error: ${err.error.message}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }
}
