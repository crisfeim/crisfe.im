import { Client, Message } from "./coordinator.ts";
export class OllamaClient implements Client {
  private readonly model = "llama3.2";
  private readonly url = "http://localhost:11434/api/chat";

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
      throw new Error(`OllamaClient: HTTP error ${response.status}`);
    }

    const data = await response.json();

    if (!data?.message?.content) {
      throw new Error("OllamaClient: Invalid response shape");
    }

    return data.message.content;
  }
}
