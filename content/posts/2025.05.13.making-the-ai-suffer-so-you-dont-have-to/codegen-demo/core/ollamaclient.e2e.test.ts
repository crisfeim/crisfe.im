import { Message } from "./coordinator.ts";
import { assertStringIncludes } from "https://deno.land/std/assert/mod.ts";
import { OllamaClient } from "./ollamaclient.ts";

Deno.test("OllamaClient: send", async () => {
  const client = new OllamaClient();
  const messages: Message[] = [
    { role: "system", content: "You always respond with a single word: hi" },
    { role: "user", content: "Hello" },
  ];

  const response = await client.send(messages);

  assertStringIncludes(response.toLowerCase(), "hi");
});
