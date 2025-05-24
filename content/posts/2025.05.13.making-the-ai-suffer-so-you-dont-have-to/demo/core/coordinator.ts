import { Iterator } from "./iterator.ts";

export type Message = {
  role: "user" | "system" | "assistant";
  content: string
}

export interface Client {
   send(messages: Message[]): Promise<string>;
}

export type RunResult = {
  stdErr?: string;
  isValid: boolean;
}
export interface Runner {
  run(code: string): RunResult
}

export class Coordinator {
  constructor(private client: Client, private runner: Runner, private iterator: Iterator) {
    this.client = client
    this.runner = runner
    this.iterator = iterator
  }

  async generate(systemPrompt: string, specs: string, maxIterations: number): Promise<Coordinator.Result> {
    let previousStderr: string | undefined
    return await this.iterator.iterate(
      maxIterations,
      async () => await this.generateCodeFromSpecsWithPreviousFeedback(systemPrompt, specs, previousStderr),
      (result) => { previousStderr = result.stdErr;  return result.isValid })
  }

  async generateCodeFromSpecsWithPreviousFeedback(systemPrompt: string, specs: string, previousStderr?: string): Promise<Coordinator.Result> {
    const systemPromptMessage: Message = { role: "system", content: systemPrompt }
    const userMessage: Message = { role: "user", content: specs }
    let messages = [systemPromptMessage, userMessage]
    if (previousStderr) {
      messages.push({ role: "assistant", content: previousStderr })
    }
    const generated = await this.client.send(messages)
    const processed = generated
       .replace(/^```(?:\w+)?\s*/m, '')
       .replace(/```$/, '')
    const concatenated = `${generated}\n${specs}`
    const runResult = this.runner.run(concatenated)
    return { generatedCode: generated, stdErr: runResult.stdErr, isValid: runResult.isValid }
  }

  // @TODO: remove this method
  async generateCodeFromSpecs(systemPrompt: string, specs: string): Promise<Coordinator.Result> {
    const systemPromptMessage: Message = { role: "system", content: systemPrompt }
    const userMessage: Message = { role: "user", content: specs }
    const generated = await this.client.send([systemPromptMessage, userMessage])
    const concatenated = `${specs}\n${generated}`
    const runResult = this.runner.run(concatenated)
    return { generatedCode: generated, isValid: runResult.isValid }
  }
}

export namespace Coordinator {
  export type Result = {
    generatedCode: string;
    stdErr?: string;
    isValid: boolean;
  };
}
