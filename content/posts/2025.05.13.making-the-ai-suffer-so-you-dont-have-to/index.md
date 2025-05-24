---
title: "Test-Driven Prompting: Making the AI Write Code While You Make Coffee"
date: 2025-05-13
slug: making-the-ai-suffer-so-you-dont-have-to
og-image: images/system.png
---

### tldr;

Cómo construir un sistema en el que la *IA* genera código a partir de especificaciones de pruebas unitarias, lo compila, lo ejecuta y si falla lo vuelve a intentar hasta que funciona, sin intervención humana.

## Introducción

¿Qué pasa si delegas el trabajo aburrido a una IA?

Ese fue el punto de partida de este experimento: construir un sistema que no solo genere código automáticamente a partir de especificaciones, sino que lo compile, lo pruebe, y lo repita hasta que acierte — sin intervención humana.

La idea era convertir el rol del desarrollador en escribir pruebas, darle al botón de ejecutar, y desaparecer. Si el modelo se equivoca, que se corrija solo. Si se cae, que se levante. Si se rinde… pues que no se rinda.

En este artículo te cuento cómo monté este sistema de automatización con feedback en bucle y qué aprendí en el proceso.

## Idea

Como desarrollador, mis interacciones con la *IA* se pueden reducir a un bucle:

*(1)* A partir de un prompt inicial, pido al modelo que genere código.<br>
*(2)* Lo pruebo en un entorno de desarrollo<br>
*(3)* Si falla, envio el error al modelo para darle feedback y vuelva a regenerar el código.

Repito el ciclo hasta que el código generado funcione.

Me di cuenta de que podía eliminarme de la ecuación, concretamente, de los pasos *(2)* y *(3)*:


<video id="v1" autoplay muted loop playsinline style="width:45%;" aria-hidden="true">
  <source src="videos/loop.mov" type="video/mp4">
</video>

Mi ~~fantasía~~ idea era lograr un flujo en el que mi trabajo se convirtiese en escribir *specs*, darle al botón de ejecución, irme a tomar un café y a vivir la vida para volver 3 horas después y encontrarme con el trabajo hecho.

Se me ocurrió una idea sencilla[^1]: un bucle automatizado basado en un enfoque dirigido por pruebas unitarias.[^tdd]

[^tdd]: *Test Driven Development*

Si usamos como *prompt* una prueba de un sistema sin implementación, podemos pedirle al modelo que la deduzca a partir de las aserciones de la prueba.

Por ejemplo, esto es suficientemente explícito para que el modelo entienda lo que queremos:

```swift
func test_adder() {
  let sut = Adder(1,3)
  XCTAssertEqual(sut.result, 4)
}
```

A partir de esa prueba unitaria como *prompt*, podrá generar cualquier variante de código que satisfaga las aserciones:

```swift
struct Adder {
  let result: Int
  init(_ a: Int, _ b: Int) {
    result = a + b
  }
}
```

Este formato de *prompt* permite que el modelo (🤖) pueda "comunicar" directamente con el entorno de ejecución (⚙️), automatizando la verificación de la validez del código y el bucle de retroalimentación.

Si el código generado es inválido o no pasa la prueba, el ciclo se repite. Si el código es válido, salimos del ciclo.

<video id="v1" autoplay muted loop playsinline  style="width: 100%; height: auto;" aria-hidden="true">
  <source src="videos/flow.mp4" type="video/mp4">
</video>

### Prompt

Este es el *prompt* que utilicé en mis pruebas. Seguramente mejorable, pero funcionó para el experimento:

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

## Automatización

El enfoque *naive* que usé para ejecutar el código generado contra las pruebas consistió en usar el método `assert` de *Swift* como *framework* de testing[^xctest]:

```swift
func test_adder() {
  let sut = Adder(1,3)
  assert(sut.result == 4)
}
```
[^xctest]: Hasta donde sé, lanzar *XCTest* de forma *standalone* es bastante complicado, y mi intención era tener una prueba de concepto funcional sin mayor complicación.

*Assert* lanza un *trap* en tiempo de ejecución cuando la condición es falsa, generando salida por *stderr*, lo que lo hace útil como señal de error para este sistema.


Para ejecutar las pruebas unitarias simplemente las invocamos de forma manual en las propias especificaciones:

```swift
func test_adder() {
  let sut = Adder(1,3)
  assert(sut.result == 4)
}

test_adder()
```

Concatenamos el código generado y las pruebas unitarias en una única cadena de texto que almacenamos en un archivo temporal[^8] y se lo pasamos al compilador, en este caso, Swift[^process].


```swift
let concatenated = generatedCode + "\n" + unitTestsSpecs
let tmpFileURL = tmFileURLWithTimestamp("generated.swift")
swiftRunner.runCode(at: tmpFileURL)
```

[^process]: Invocado con la *api* *Process*. [Implementación](https://github.com/crisfeim/cli-tddbuddy/blob/main/Sources/Core/Infrastructure/SwiftRunner.swift).

Si el proceso devuelve un código de salida distinto de cero, significa que la ejecución del código falló. En ese caso, repetimos el ciclo hasta que el código sea cero:

```swift
var output = swiftRunner.runCode(at: tmpFileURL)
while output.processResult.exitCode != 0 {
    let regeneratedCodeFileURL = ...
    output = swiftRunner.runCode(at: regeneratedCodeFileURL)
}
```

## Demo en línea

> ℹ  Escribe a la izquierda las especificaciones y dale al botón *play*.

Puedes usar `assertEqual` como mini-framework de testing o escribe tus propios métodos en la propia *textarea*.

Puedes usar *GPT3.5* cortesía de *llm7*, *Gemini* (requiere clave) o *Llama3.2* [^llama]

[^llama]: Tendrás que [descargar el *index.html* de la demo](demo) y servirlo desde un servidor local.

{{< fragment "demo/index.html" >}}


## Diseño

Estos son los principales componentes del sistema:

1. 🤖 *Client*: Genera código a partir de unas specs.
2. 🪢 *Concatenator*: Concatena el *output* del modelo con el test inicial.
3. ⚙️ *Runner*: Ejecuta la concatenación y devuelve un *output*.
4. 🔁 *Iterator*: Itera *N* veces o hasta que se cumpla una condición.
5. 💾 *Persister*: Guarda el resultado de cada iteración en un archivo.
6. 💬 *Context*: Guarda el contexto de la ejecución previa para enviarla como feedback en la siguiente.


### Pseudo-código

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

Iterator encapsula la lógica de iteración y devueve el último resultado:

```swift
iterate<T>(
  nTimes: Int,
  action: () async -> T,
  until: (T) -> Void
) async -> T
```

Y permite romperla a través de un *closure*:

```swift
while currentIteration < nTimes {
  let result = await action()
  if until(result) { ... return and break ...}
}
```

El mismo closure puede ser utilizado para guardar el contexto:

```swift
let context = ContextBuilder(window: 5)
let messages = makeMessages(context, sysPrompt, specs)
iterator.iterate(
        nTimes,
        action: { generateCode(messages) },
        onIteration: { context.insert($0)}
)
```

Por simplicidad, en el *playground* del artículo, el contexto contiene sólo el resultado de la iteración anterior

### Contratos

Para hacer el proyecto flexible y *testeable*,  los actores son modelados con contratos en lugar de implementaciones concretas:

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

Gracias a este enfoque, podemos añadir nuevos modelos, runners alternativos o incluso sistemas de almacenamiento sin tocar la lógica principal del programa. Esto también simplifica las pruebas, porque cada componente puede ser mockeado por separado.


## Data

La primera versión del proyecto fue muy sencilla: Unos pocos ficheros de *Swift* compilados con *CodeRunner*.
Con ella hice pruebas de intensidad moderada (tanto de especificaciones como de modelos).

Desafortunadamente, no tengo acceso a esos datos.

A falta de datos, solo puedo decir que el modelo que peor se portó fue *Gemini*.

Los que mejor desempeño tuvieron fueron *Claude* y *ChatGPT*.

*Llama 3.2* dió resultados variables, aunque la velocidad de iteración por ser una ejecución local compensaba muchas veces las carencias.

Aún con la pérdida del proyecto original, conservo algunos resultados de codestral:

{{< runnable "./results/codestral/FileImporter.swift.html">}}
{{< runnable "./results/codestral/LineAppender.swift.html">}}
{{< runnable "./results/codestral/PasswordGenerator.swift.html">}}


## Problemas

No he tenido la oportunidad de probar  este enfoque tan exhaustivamente como me gustaría, pero pude recopilar algunos ejemplos de problemáticas que me encontré en el camino.

### Cuando Codestral te da una palmadita y te dice: “te dejo el resto como ejercicio, campeón”

Partiendo de estas *specs*:

```swift
func test_fetch_reposWithMinimumStarsFromRealApi() async throws {
  let sut = GithubClient()
  // This MUST PERFORM A REAL CALL TO THE GITHUB API
  let repos = try await sut.fetchRepositories(minStars: 100)
  assert(!repos.isEmpty)
  assert(repos.allSatisfy { $0.stars >= 100 })
}
```

*Codestral* fue capaz de generar un cliente **funcional**, a pesar de algunas dificultades iniciales:

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

Pero en un inicio el modelo insistía en generarme código de este tipo:

```swift
class GithubClient {
  func fetchRepositories(minStars: Int) async throws -> [Repository] {
  /* YOUR IMPLEMENTATION HERE */
  return []
  }
}
```

~~Gracias, Codestral. Con eso y un croquis, casi tengo un sistema distribuido.~~

### Cuando el modelo no resuelve el problema... porque ya sabe la respuesta

Aunque poco frecuente, otro caso que me encontré ocasionalmente, fue el de pruebas satisfechas *"en duro"*. Ej:

```swift
func test_adder() {
  let sut = Adder(1,3)
  assert(sut.result == 4)
}
```

El modelo generaba esto:

```swift
struct Adder {
  let result = 4
  init (_ a: Int, _ b: Int) {}
}
```

Estos casos se solucionan fácilmente añadiendo más aserciones a la prueba:

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

### Cuando *Gemini* quiere ser tu profe, pero tú solo quieres compilar

En el *system prompt* que definimos, el siguiente apartado es importante para que el código pueda compilar correctamente:

> Provide ONLY runnable Swift code. No explanations, comments, or formatting (no code blocks, markdown, symbols, or text).

Aún con este *prompt*, algunos modelos (*Gemini*...), tenían dificultades respetando las instrucciones y se empeñaban en encapsular el código en bloques de código de markdown, acompañándolo además de comentarios explicativos.

Aunque se agradece el entusiasmo por la pedagogía, hubiera preferido no tener que escribir una función de preprocesamiento para limpiar los artefactos de las respuestas.

## Limitaciones

Esta idea asume especificaciones completamente ajustadas al sistema de de antemano, algo poco realista.

También asume que las especificaciones no tienen ningún error. Cosa que es también poco realista.

Al desarrollar, y en especial en el enfoque *test driven*, es común que las especificaciones emerjan de forma orgánica durante el desarrollo: El proceso en sí es un *marco* para el pensamiento.

Muchas veces escribimos tests que refactorizamos o eliminamos a medida que vamos aprendiendo sobre el sistema.

Creo que la idea puede ser especialmente útil para tareas automatizables o problemas repetitivos, pero no para problemas complejos en dónde el proceso de desarrollo acompaña la definición o refinamiento de las especificaciones.

Por ejemplo, en vez de utilizar la idea para implementaciones de Infrastructure, podría aprovecharse para generar implementaciones de coordinadores a partir de situaciones recurrentes repetitivas en *TDD*, como verificar que un sistema y sus dependencias interactúan correctamente mediante mocks:

```swift
// Failure cases
func test_coordinator_deliversErrorOnClientError() async {}
func test_coordinator_deliversErrorOnRunnerError() async {}
func test_coordinator_deliversErrorOnPersisterError() async {}
...
// Success cases
```

## Conclusiones

Aunque este experimento tiene limitaciones claras —como la dependencia de especificaciones precisas y la falta de pruebas exhaustivas—, me parece un enfoque prometedor.

Automatizar el ciclo de prueba y corrección puede liberar tiempo para tareas más relevantes del desarrollo, siempre que el problema esté bien acotado. En ese sentido, este tipo de sistema podría resultar especialmente útil para tareas repetitivas o muy estructuradas.

El reto real no está en la capacidad técnica del modelo, sino en cómo integrar estas herramientas en el flujo de trabajo diario sin añadir más fricción. Diría que no es un problema de potencia, porque aún con las limitaciones de los modelos actuales, el enfoque puede ser útil, sino de experiencia de usuario.

## Ideas futuras

Quedan muchas cosas por explorar. Esta primera versión fue una prueba de concepto centrada en el flujo más simple posible, pero hay espacio para hacer el sistema más robusto, flexible y útil en contextos reales.

Algunas direcciones que me interesaría explorar:
- Integrar un framework de pruebas real.
- Generar automáticamente tests para estructuras comunes con mocking.
- Utilizar snapshots como fuente de especificación y validar la salida del modelo con aserciones snapshot.
- Ejecutar peticiones paralelas con varios modelos y romper la iteración en cuanto uno pase la prueba.
- Ajustar dinámicamente el prompt en función de fallos consecutivos, usando otro modelo como refinador.
- Añadir un sistema de notificaciones al finalizar las pruebas.

## Enlaces

1. [LLM7](llm7.io)
2. [Código fuente del playground](https://github.com/crisfeim/crisfe.im/tree/main/content/posts/2025.05.13.making-the-ai-suffer-so-you-dont-have-to/codegen-demo)

[^1]: Aunque no original: [cf.github](https://github.com/crisfeim/cli-tddbuddy/search?q=tdd&type=code).
[^2]: *XCTest* / *Swift Testing*
[^8]: El compilador no acepta un *string* como entrada.
