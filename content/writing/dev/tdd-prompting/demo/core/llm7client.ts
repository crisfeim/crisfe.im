import { Client, Message } from "./coordinator.ts";

export class LLM7Client implements Client {
  private readonly model = "gpt-3.5-turbo";
  private readonly url = "https://api.llm7.io/v1/chat/completions";

  async send(messages: Message[]): Promise<string> {
    const body = {
      model: this.model,
      messages: messages,
      stream: false,
    };

    const response = await fetch(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`LLM7Client: HTTP error ${response.status}`);
    }

    const data = await response.json();

    if (!data?.choices?.[0]?.message?.content) {
      throw new Error("LLM7Client: Invalid response shape");
    }

    return data.choices[0].message.content;
  }
}
