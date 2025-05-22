import { assertExists, assertNotEquals } from "https://deno.land/std/assert/mod.ts";
import { makeReactiveViewModel } from "../viewModel.ts";
import { EvalRunner } from "../evalrunner.ts"

const maxIterations = 1
import { OllamaClient } from "../ollamaclient.ts"
Deno.test("Ollama client integration test", async () => {
  const client = new OllamaClient()
  const runner = new EvalRunner()
  const sut = makeReactiveViewModel(client, runner, maxIterations)
  await sut.run()

  assertExists(sut.generatedCode())
  assertExists(sut.status())
  assertNotEquals(sut.currentIteration, 0)
})

import { GeminiClient } from "../geminiclient.ts"
import { gemini_api_key } from "../secret_api_keys.ts"

Deno.test("Geminii client integration test", async () => {
  const client = new GeminiClient(gemini_api_key)
  const runner = new EvalRunner()
  const sut = makeReactiveViewModel(client, runner, maxIterations)
  await sut.run()

  assertExists(sut.generatedCode())
  assertExists(sut.status())
  assertNotEquals(sut.currentIteration, 0)
})
