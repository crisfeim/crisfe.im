import { assertExists, assertNotEquals } from "https://deno.land/std/assert/mod.ts";
import { EvalRunner } from "../evalrunner.ts"
import { ollamaViewModel, geminiViewModel } from "../_entrypoint.ts";

const maxIterations = 1
Deno.test("Ollama client integration test", async () => {
  const sut = ollamaViewModel(maxIterations)
  await sut.run()

  assertExists(sut.generatedCode())
  assertExists(sut.status())
  assertNotEquals(sut.currentIteration, 0)
})

import { gemini_api_key } from "../secret_api_keys.ts"
Deno.test("Geminii client integration test", async () => {
  const sut = geminiViewModel(gemini_api_key, maxIterations)
  await sut.run()

  assertExists(sut.generatedCode())
  assertExists(sut.status())
  assertNotEquals(sut.currentIteration, 0)
})
