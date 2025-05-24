---
title: "Test-Driven Prompting: Making Coffee While AI Writes Your Code"
date: 2025-05-13
slug: test-driven-prompting-making-coffee-while-ai-writes-your-code
og-image: images/system.png
---

### tldr;

On building a system where an LLM writes code based on unit test specs, compiles it, runs it, and — if it fails — tries again until it gets it right. All without human feedback loops. This article explains the architecture, prompt setup, challenges, and some results I gathered while letting the machine suffer through trial and error.

## Introduction

What happens if you delegate the boring work to an AI?

That was the starting point of this experiment: building a system that not only automatically generates code from specifications, but compiles it, tests it, and repeats until it gets it right — without human intervention.

The idea was to turn the developer's role into writing tests, hitting the execute button, and disappearing. If the model makes mistakes, let it correct itself. If it crashes, let it get back up. If it gives up... well, let it not give up.

In this article, I'll tell you how I set up this automation system with feedback loops and what I learned in the process.

## Idea

As a developer, my interactions with *AI* can be reduced to a loop:

*(1)* From an initial prompt, I ask the model to generate code.<br>
*(2)* I test it in a development environment<br>
*(3)* If it fails, I send the error to the model to give it feedback and have it regenerate the code.

I repeat the cycle until the generated code works.

I realized I could eliminate myself from the equation, specifically, from steps *(2)* and *(3)*:

<video id="v1" autoplay muted loop playsinline style="width:45%;" aria-hidden="true">
  <source src="videos/loop.mov" type="video/mp4">
</video>

My ~~fantasy~~ idea was to achieve a flow where my work would become writing *specs*, hitting the execute button, going for coffee and living life, only to return 3 hours later to find the work done.

I came up with a simple idea[^1]: an automated loop based on a unit test-driven approach.[^tdd]

[^tdd]: *Test Driven Development*

If we use a test of a system without implementation as a *prompt*, we can ask the model to deduce it from the test assertions.

For example, this is explicit enough for the model to understand what we want:

```swift
func test_adder() {
  let sut = Adder(1,3)
  XCTAssertEqual(sut.result, 4)
}
```

From that unit test as a *prompt*, it will be able to generate any code variant that satisfies the assertions:

```swift
struct Adder {
  let result: Int
  init(_ a: Int, _ b: Int) {
    result = a + b
  }
}
```

This *prompt* format allows the model (🤖) to "communicate" directly with the execution environment (⚙️), automating code validity verification and the feedback loop.

If the generated code is invalid or doesn't pass the test, the cycle repeats. If the code is valid, we exit the loop.

<video id="v1" autoplay muted loop playsinline  style="width: 100%; height: auto;" aria-hidden="true">
  <source src="videos/flow.mp4" type="video/mp4">
</video>

### Prompt

This is the *prompt* I used in my tests. Probably improvable, but it worked for the experiment:

> Imagine that you are a programmer and the user's responses are feedback from compiling your code in your development environment. Your responses are the code you write, and the user's responses represent the feedback, including any errors.
>
> Implement the SUT's code in Swift based on the provided specs (unit tests).
>
>Follow these strict guidelines:
>
> 1. Provide ONLY runnable Swift code. No explanations, comments, or formatting (no code blocks, markdown, symbols, or text).
> 2. DO NOT include unit tests or any test-related code.
> 3. ALWAYS IMPORT ONLY Foundation. No other imports are allowed.
> 4. DO NOT use access control keywords (`public`, `private`, `internal`) or control flow keywords in your constructs.
>
> If your code fails to compile, the user will provide the error output for you to make adjustments.

## Automation

The *naive* approach I used to execute the generated code against the tests consisted of using Swift's `assert` method as a testing *framework*[^xctest]:

```swift
func test_adder() {
  let sut = Adder(1,3)
  assert(sut.result == 4)
}
```
[^xctest]: As far as I know, launching *XCTest* in a *standalone* way is quite complicated, and my intention was to have a functional proof of concept without major complications.

*Assert* throws a *trap* at runtime when the condition is false, generating output to *stderr*, making it useful as an error signal for this system.

To execute the unit tests, we simply invoke them manually in the specifications themselves:

```swift
func test_adder() {
  let sut = Adder(1,3)
  assert(sut.result == 4)
}

test_adder()
```

We concatenate the generated code and unit tests into a single text string that we store in a temporary file[^8] and pass it to the compiler, in this case, Swift[^process].

```swift
let concatenated = generatedCode + "\n" + unitTestsSpecs
let tmpFileURL = tmFileURLWithTimestamp("generated.swift")
swiftRunner.runCode(at: tmpFileURL)
```

[^process]: Invoked with the *Process* api. [Implementation](https://github.com/crisfeim/cli-tddbuddy/blob/main/Sources/Core/Infrastructure/SwiftRunner.swift).

If the process returns an exit code other than zero, it means the code execution failed. In that case, we repeat the cycle until the code is zero:

```swift
var output = swiftRunner.runCode(at: tmpFileURL)
while output.processResult.exitCode != 0 {
    let regeneratedCodeFileURL = ...
    output = swiftRunner.runCode(at: regeneratedCodeFileURL)
}
```

## Online Demo

> ℹ  Write the specifications on the left and hit the *play* button.

You can use `assertEqual` as a mini-testing framework or write your own methods in the *textarea* itself.

You can use *GPT3.5* courtesy of *llm7*, *Gemini* (requires key) or *Llama3.2* [^llama]

[^llama]: You'll need to [download the demo's *index.html*](demo) and serve it from a local server.

{{< fragment "demo/index.html" >}}

## Design

These are the main system components:

1. 🤖 *Client*: Generates code from specs.
2. 🪢 *Concatenator*: Concatenates the model's *output* with the initial test.
3. ⚙️ *Runner*: Executes the concatenation and returns an *output*.
4. 🔁 *Iterator*: Iterates *N* times or until a condition is met.
5. 💾 *Persister*: Saves the result of each iteration to a file.
6. 💬 *Context*: Saves the context of the previous execution to send as feedback in the next one.

### Pseudo-code

```shell
Subsystem.genCode(specs, feedback?) → (GeneratedCode, Stdout/Stderr)
  → LLM.send(specs + feedback) → GeneratedCode
  → Concatenator.concatenate(GeneratedCode, Specs) → Concatenated
  → SwiftRunner.run(Concatenated) → Stdout/Stderr
  → Exit

Coordinator.genCode(inputURL, outputURL, maxIterations)
  → Context.save(IterationResult)
  → Iterator.iterate(maxIterations, Subsystem.genCode)
  → Persister.save(outputURL, IterationResult)
```

Iterator encapsulates the iteration logic and returns the last result:

```swift
iterate<T>(
  nTimes: Int,
  action: () async -> T,
  until: (T) -> Void
) async -> T
```

And allows breaking it through a *closure*:

```swift
while currentIteration < nTimes {
  let result = await action()
  if until(result) { ... return and break ...}
}
```

The same closure can be used to save context:

```swift
let context = ContextBuilder(window: 5)
let messages = makeMessages(context, sysPrompt, specs)
iterator.iterate(
        nTimes,
        action: { generateCode(messages) },
        onIteration: { context.insert($0)}
)
```

For simplicity, in the article's *playground*, the context contains only the result of the previous iteration

### Contracts

To make the project flexible and *testable*, the actors are modeled with contracts instead of concrete implementations:

```swift
protocol Client {
    func send(messages: [Message]) async throws -> String
}

protocol Runner {
    func run(code: String) -> String
}

protocol Perister {
    func persist(code: String, to outputURL: String) throws
}

protocol Reader {
    func read(_ inputURL: String) throws -> String
}
```

Thanks to this approach, we can add new models, alternative runners, or even storage systems without touching the main program logic. This also simplifies testing, because each component can be mocked separately.

## Data

The first version of the project was very simple: A few *Swift* files compiled with *CodeRunner*.
With it, I did moderate intensity tests (both specifications and models).

Unfortunately, I don't have access to that data.

For lack of data, I can only say that the worst performing model was *Gemini*.

The best performers were *Claude* and *ChatGPT*.

*Llama 3.2* gave variable results, although the iteration speed from being a local execution often compensated for the shortcomings.

Even with the loss of the original project, I retain some results from codestral:

{{< runnable "./results/codestral/FileImporter.swift.html">}}
{{< runnable "./results/codestral/LineAppender.swift.html">}}
{{< runnable "./results/codestral/PasswordGenerator.swift.html">}}

## Problems

I haven't had the opportunity to test this approach as exhaustively as I'd like, but I was able to collect some examples of issues I encountered along the way.

### When Codestral gives you a pat on the back and says: "I'll leave the rest as an exercise, champ"

Starting from these *specs*:

```swift
func test_fetch_reposWithMinimumStarsFromRealApi() async throws {
  let sut = GithubClient()
  // This MUST PERFORM A REAL CALL TO THE GITHUB API
  let repos = try await sut.fetchRepositories(minStars: 100)
  assert(!repos.isEmpty)
  assert(repos.allSatisfy { $0.stars >= 100 })
}
```

*Codestral* was able to generate a **functional** client, despite some initial difficulties:

```swift
struct Repository: Decodable {
  let name: String
  let stargazers_count: Int
  var stars: Int { stargazers_count }
}

class GithubClient {
  func fetchRepositories(minStars: Int) async throws -> [Repository] {
    let url = URL(string: "https://api.github.com/search/repositories?q=stars:>\(minStars)&sort=stars")!
    let (data, _) = try await URLSession.shared.data(from: url)
    let results = try JSONDecoder().decode(SearchResults<Repository>.self, from: data)
    return results.items
  }
}

struct SearchResults<T: Decodable>: Decodable {
  let items: [T]
}
```

But initially the model insisted on generating code like this:

```swift
class GithubClient {
  func fetchRepositories(minStars: Int) async throws -> [Repository] {
  /* YOUR IMPLEMENTATION HERE */
  return []
  }
}
```

~~Thanks, Codestral. With that and a sketch, I almost have a distributed system.~~

### When the model doesn't solve the problem... because it already knows the answer

Although infrequent, another case I occasionally encountered was tests satisfied *"hard-coded"*. E.g.:

```swift
func test_adder() {
  let sut = Adder(1,3)
  assert(sut.result == 4)
}
```

The model generated this:

```swift
struct Adder {
  let result = 4
  init (_ a: Int, _ b: Int) {}
}
```

These cases are easily solved by adding more assertions to the test:

```swift
func test_adder() {
  var sut = Adder(1,3)
  assert(sut.result == 4)

  sut = Adder(3, 4)
  assert(sut.result == 7)

  sut = Adder(5, 4)
  assert(sut.result == 9)
}
```

### When *Gemini* wants to be your teacher, but you just want to compile

In the *system prompt* we defined, the following section is important for the code to compile correctly:

> Provide ONLY runnable Swift code. No explanations, comments, or formatting (no code blocks, markdown, symbols, or text).

Even with this *prompt*, some models (*Gemini*...), had difficulty respecting the instructions and insisted on encapsulating the code in markdown code blocks, also accompanying it with explanatory comments.

While the enthusiasm for pedagogy is appreciated, I would have preferred not having to write a preprocessing function to clean the artifacts from the responses.

## Limitations

This idea assumes specifications completely adjusted to the system beforehand, something unrealistic.

It also assumes that the specifications have no errors. Which is also unrealistic.

When developing, and especially in the *test driven* approach, it's common for specifications to emerge organically during development: The process itself is a *framework* for thinking.

Many times we write tests that we refactor or eliminate as we learn about the system.

I think the idea can be especially useful for automatable tasks or repetitive problems, but not for complex problems where the development process accompanies the definition or refinement of specifications.

For example, instead of using the idea for Infrastructure implementations, it could be leveraged to generate coordinator implementations from repetitive recurring situations in *TDD*, like verifying that a system and its dependencies interact correctly through mocks:

```swift
// Failure cases
func test_coordinator_deliversErrorOnClientError() async {}
func test_coordinator_deliversErrorOnRunnerError() async {}
func test_coordinator_deliversErrorOnPersisterError() async {}
...
// Success cases
```

## Conclusions

Although this experiment has clear limitations —like the dependency on precise specifications and lack of exhaustive testing— I find it a promising approach.

Automating the test and correction cycle can free up time for more relevant development tasks, as long as the problem is well-scoped. In that sense, this type of system could be especially useful for repetitive or highly structured tasks.

The real challenge isn't in the model's technical capacity, but in how to integrate these tools into daily workflow without adding more friction. I'd say it's not a power problem, because even with current model limitations, the approach can be useful, but a user experience problem.

## Future Ideas

There are many things left to explore. This first version was a proof of concept focused on the simplest possible flow, but there's room to make the system more robust, flexible, and useful in real contexts.

Some directions I'd be interested in exploring:
- Integrate a real testing framework.
- Automatically generate tests for common structures with mocking.
- Use snapshots as a specification source and validate model output with snapshot assertions.
- Execute parallel requests with multiple models and break iteration as soon as one passes the test.
- Dynamically adjust the prompt based on consecutive failures, using another model as a refiner.
- Add a notification system when tests finish.

## Links

1. [LLM7](llm7.io)
2. [Playground source code](https://github.com/crisfeim/crisfe.im/tree/main/content/posts/2025.05.13.making-the-ai-suffer-so-you-dont-have-to/codegen-demo)

[^1]: Although not original: [cf.github](https://github.com/crisfeim/cli-tddbuddy/search?q=tdd&type=code).
[^2]: *XCTest* / *Swift Testing*
[^8]: The compiler doesn't accept a *string* as input.
