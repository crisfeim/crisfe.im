import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { EvalRunner } from "../evalrunner.ts"
import { ollamaViewModel, geminiViewModel, llm7ViewModel } from "../_entrypoint.ts";


const maxIterations = 15

Deno.test("Ollama client integration test", async () => {
  const sut = ollamaViewModel(maxIterations)
  await sut.run()
  assertEquals(sut.status, 'success')
})

import { gemini_api_key } from "../secret_api_keys.ts"
Deno.test("Geminii client integration test", async () => {
  const sut = geminiViewModel(gemini_api_key, maxIterations)
  await sut.run()
  assertEquals(sut.status, 'success')
})

Deno.test("LLM7 client integration test", async () => {
  const sut = llm7ViewModel(maxIterations)
  await sut.run()
  assertEquals(sut.status, 'success')
})
