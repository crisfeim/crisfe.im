import {assertEquals} from "https://deno.land/std/assert/mod.ts";

class Iterator {
  iterate<T>(nTimes: number, action: () => Promise<T>, until: (value: T) => boolean): Promise<T> {
    let currentIteration = 0;
    var result = action()
    currentIteration++;
    while (currentIteration < nTimes) {
      const result = action();
      currentIteration++;
    }
    return result
  }
}

Deno.test("iterates N times if condition is never fullfilled", async () => {
  const iterator = new Iterator()
  const maxIterations = 5
  let currentIteration = 0
  const action = async () => {
      currentIteration++;
      return "hello world";
    };
  const neverFullfilledCondition = (anyResult: string) => false
  const result = iterator.iterate(maxIterations, action, neverFullfilledCondition)
  assertEquals(currentIteration, maxIterations)
});
