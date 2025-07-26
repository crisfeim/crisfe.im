export class Iterator {
  async iterate<T>(nTimes: number, action: () => Promise<T>, until: (value: T) => boolean): Promise<T> {
    let currentIteration = 0;
    let result: T
    while (currentIteration < nTimes) {
      result = await action();
      if (until(result)) { return result }
      currentIteration++;
    }
    return result!
  }
}
