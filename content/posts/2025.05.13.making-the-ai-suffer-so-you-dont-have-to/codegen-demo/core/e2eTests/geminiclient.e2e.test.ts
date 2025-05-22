import { Message } from "../coordinator.ts";
import { assertStringIncludes } from "https://deno.land/std/assert/mod.ts";
import { GeminiClient } from "../geminiclient.ts";
import { gemini_api_key } from "../secret_api_keys.ts";

Deno.test("GeminiClient: send", async () => {
  const client = new GeminiClient(gemini_api_key);
  const messages: Message[] = [
    { role: "system", content: "You always respond with a single word: hi" },
    { role: "user", content: "Hello" },
  ];

  const response = await client.send(messages);

  assertStringIncludes(response.toLocaleLowerCase(), "hi");
});
