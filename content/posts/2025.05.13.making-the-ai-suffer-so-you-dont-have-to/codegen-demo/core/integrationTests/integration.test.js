import { assertExists, assertNotEquals } from "https://deno.land/std/assert/mod.ts";
import { makeReactiveViewModel } from "../viewModel.ts";
import { OllamaClient } from "../ollamaclient.ts"
import { EvalRunner } from "../evalRunner.ts"

Deno.test("Ollama client integration test", async () => {
  const client = new OllamaClient()
  const runner = new EvalRunner()
  const sut = makeReactiveViewModel(client, runner)
  await sut.run()

  assertExists(sut.generatedCode())
  assertExists(sut.status())
  assertNotEquals(sut.currentIteration, 0)
})
