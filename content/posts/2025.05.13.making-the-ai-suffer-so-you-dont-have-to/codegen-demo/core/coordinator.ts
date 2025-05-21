
export interface Client {
   generateCode(specs: string): Promise<string>;
}

export type RunResult = boolean
export interface Runner {
  run(code: string): RunResult
}

export class Coordinator {
  constructor(private client: Client, private runner: Runner) {
    this.client = client
    this.runner = runner
  }

  async generateCodeFromSpecs(specs: string): Promise<Coordinator.Result> {
    const generated = await this.client.generateCode(specs)
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
