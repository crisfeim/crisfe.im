import { EvalRunner } from "../evalrunner.ts";
import { assert } from "https://deno.land/std/assert/mod.ts";


Deno.test("EvalRunner runs valid code", () => {
  const runner = new EvalRunner();
  const result = runner.run("console.log('hello')");
  assert(result.isValid === true);
});

Deno.test("EvalRunner fails on invalid code", () => {
  const runner = new EvalRunner();
  const result = runner.run("const = no;");
  assert(result.isValid === false);
  assert(typeof result.stdErr === "string");
});
