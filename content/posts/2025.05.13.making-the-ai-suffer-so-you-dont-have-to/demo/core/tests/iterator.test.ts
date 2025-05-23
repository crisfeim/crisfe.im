import {assertEquals} from "https://deno.land/std/assert/mod.ts";
import { Iterator } from "../iterator.ts";

Deno.test("iterates N times if condition is never fullfilled", async () => {
  const sut = new Iterator()
  const maxIterations = 5
  let currentIteration = 0
  const action = async () => {
      currentIteration++;
      return "hello world";
    };
  const neverFullfilledCondition = (anyResult: string) => false
  const result = await sut.iterate(maxIterations, action, neverFullfilledCondition)
  assertEquals(currentIteration, maxIterations)
});

Deno.test("Iterates until condition is fullfilled", async () => {
  const sut = new Iterator()
  const maxIterations = 5
  let currentIteration = 0
  const action = async () => {
    currentIteration++;
    return "hello world";
  };
  const breakCondition = (anyResult: string) => currentIteration == 3
  const result = await sut.iterate(maxIterations, action, breakCondition)
  assertEquals(currentIteration, 3)
});
