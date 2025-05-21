import { Iterator } from "./iterator.ts";

export type Message = {
  role: "user" | "system";
  content: string
}

export interface Client {
   send(messages: Message[]): Promise<string>;
}

export type RunResult = boolean
export interface Runner {
  run(code: string): RunResult
}

export class Coordinator {
  constructor(private client: Client, private runner: Runner, private iterator: Iterator) {
    this.client = client
    this.runner = runner
    this.iterator = iterator
  }

  async generate(specs: string, maxIterations: number): Promise<Coordinator.Result> {
    return await this.iterator.iterate(
      maxIterations,
      async () => await this.generateCodeFromSpecs("", specs),
      (result) => result.isValid)
  }

  async generateCodeFromSpecs(systemPrompt: string, specs: string): Promise<Coordinator.Result> {
    const systemPromptMessage: Message = { role: "system", content: systemPrompt }
    const userMessage: Message = { role: "user", content: specs }
    const generated = await this.client.send([systemPromptMessage, userMessage])
    const concatenated = `${specs}\n${generated}`
    const isValid = this.runner.run(concatenated)
    return { generatedCode: generated, isValid }
  }
}

export namespace Coordinator {
  export type Result = {
    generatedCode: string;
    isValid: boolean;
  };
}
