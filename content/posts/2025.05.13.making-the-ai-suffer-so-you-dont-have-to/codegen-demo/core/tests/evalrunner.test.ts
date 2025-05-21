import { EvalRunner } from "../evalrunner.ts";
import { assert, assertEquals } from "https://deno.land/std/assert/mod.ts";

Deno.test("EvalRunner fails on invalid syntax code", () => {
  const runner = new EvalRunner();
  const result = runner.run("const = no;");
  assert(result.isValid === false);
  assert(typeof result.stdErr === "string");
});

Deno.test("EvalRunner assertEqual throws on different values", () => {
  const runner = new EvalRunner();
  const code = `
    class Adder {
      constructor(a, b) {
        this.result = a + b;
      }
    }

    function testAdder() {
      const sut = new Adder(1, 2);
      assertEqual(sut.result, 4);
    }

    testAdder();
  `
  const result = runner.run(code);
  assertEquals(result.stdErr, "Error: Assertion failed: expected 4, but got 3")
  assert(result.isValid === false);
});

Deno.test("EvalRunner assertEqual doesn't throw on equal values", () => {
  const runner = new EvalRunner();
  const code = `
    class Adder {
      constructor(a, b) {
        this.result = a + b;
      }
    }

    function testAdder() {
      const sut = new Adder(1, 2);
      assertEqual(sut.result, 3);
    }

    testAdder();
  `
  const result = runner.run(code);
  assert(result.isValid === true);
  assert(result.stdErr === undefined)
});
