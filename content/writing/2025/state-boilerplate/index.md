---
title: Reducing Boilerplate in UIKit State Binding
date: 2025-06-11
---

## tl;dr

Tired of writing `isHidden = true` three times every time you bind view state?
This article walks through a small refactor to reduce repetitive UIKit state-binding boilerplate — making your code clearer and easier to maintain.

## Introduction

Modeling the state of asynchronous screens using an enum with associated values is a useful and common pattern.

It collapses multiple sources of truth into a single state object, eliminating optionals and reducing complexity:

```swift
class SomeScreen {
    var data: SomeData?
    var isLoading: Bool = false
    var errorMessage: String?
}
```

*vs*

```swift
enum State<T> {
    case loading
    case success(T)
    case error(String)
}

class SomeScreen {
    var state = State<SomeData> = .loading
}
```

This is particularly useful in `SwiftUI` where view is a function of state and no bindings are needed:

```swift
struct SomeScreen: View {
    @State var state = State<SomeData> = .loading

    var body: some View {
        switch state {
            case .loading: ProgressView()
            case .success(let data): SuccessView(data: data)
            case .error(let error): ErrorView(message: error)
        }
    }
}
```


In *UIKit* codebases, it's common to see the pattern used as follows:

```swift
final class SomeViewController: UIViewController {
    lazy var indicator  = LoadingView()
    lazy var someView   = SomeView()
    lazy var errorView  = ErrorView()

    var state = State.loading {
        didSet {
            switch state {
                case .loading:
                    indicator.isHidden = false
                    someView.isHidden = true
                    errorView.isHidden = true
                case .success(let data):
                    indicator.isHidden = true
                    someView.isHidden = false
                    errorView.isHidden = true
                    someView.update(with: data)
                case .error:
                    indicator.isHidden = true
                    someView.isHidden = true
                    errorView.isHidden = false
            }
        }
    }
}
```

However, this is not only verbose but error prone as we may get *bindings* mixed up:

```swift
...
switch state {
    case .loading:
        indicator.isHidden = false
        someView.isHidden = false ❌
        ...
}
```

And because each screen following this pattern repeats the same snippet, it quickly becomes boilerplate.

Thankfully, Swift, being the expressive language that it is, allows for some customization that can greatly reduce this boilerplate.

## Readable view visibility

By nature, you can name any bool in two opposite ways.

When it comes to visibility you could have a bool that reads:

```swift
var isHidden: Bool { ... }
```

But depending on your preferences you might prefer expressing visibility using the opposite wording:

```swift
var isVisible: Bool { ... }
```

When expressing logic in code, **affirmative conditions are usually easier to parse than their negated counterparts**:

Although `isHidden` isn’t grammatically a negative, it behaves like one semantically. Assigning `someView.isHidden = false` forces your brain into a small mental rephrasing:

> The view is not hidden… which means it is visible.

An unnecessary flip compared to:

> The view is visible.

`isVisible = true` maps directly to *"this view should be shown"*, whereas `isHidden = false` adds a small mental detour.

So in the context of view visibility, `isVisible` better reflects intent and simplifies state binding.

For example, instead of scattering multiple conditionals across states:

```swift
case .loading:
    indicator.isHidden = false
case .success:
    indicator.isHidden = true
case .error:
    indicator.isHidden = true
```

We can reduce the noise with a single line:

```swift
indicator.isVisible = state.isLoading
```

You can introduce this semantic clarity by extending *UIView* with a computed property that inverts `isHidden`:

```swift
extension UIView {
    var isVisible: Bool {
        get { !isHidden }
        set { isHidden = !newValue }
    }
}
```

### State helpers

Now that we have a clearer boolean, we'll need to add some helpers to the `State` model so we can bind the `isVisible` property easily:

```swift
extension State {
    var isLoading: Bool { self == .loading }

    var data: T? {
        switch self {
            case .success(let data): return data
            default: return nil
        }
    }

    var isSuccess: Bool { data != nil }

    var isError: Bool {
        switch self {
            case .error: return true
            default: return false
        }
    }
}
```

###  Usage

```swift
final class SomeViewController {
    lazy var indicator  = LoadingView()
    lazy var someView   = SomeView()
    lazy var errorView  = ErrorView()

    var state = State<Model>.loading {
        didSet { bindUI() }
    }

    func bindUI() {
        indicator.isVisible = state.isLoading
        someView.isVisible = state.isSuccess
        errorView.isVisible = state.isError
        state.data.map(someView.update)
    }
}
```

### Bonus

When dealing with completion-based async code, it's common to use Swift’s `Result` type to model success or failure outcomes.

Then the *controller / viewModel / whatever*, maps the result into a state value:

```swift
class SomeViewController {
    ...
    func load() {
        loader.load { result in
            switch result {
                case .success(let data) : self.state = .success(data)
                case .failure(let error): self.state = .error(error)
            }
        }
    }
}
```

And again, since this block tends to repeat across screens, it’s boilerplate.

It can be refactored out into a custom initializer:

```swift
extension State {
    init(result: Result<T, Error>) {
        switch result {
            case .success(let data): self = .success(data)
            case .failure(let error): self = .error(error.localizedDescription)
        }
    }
}
```

Then in the controller (*weak self* omitted for brevity):

```swift
class SomeViewController {
    ...
    func load() {
        loader.load { self.state = .init(result: $0) }
    }
}
```

## Conclusion

> All code is buggy. It stands to reason, therefore, that the more code you have to write the buggier your apps will be. — Rich Harris

These small changes not only reduce repetition and bugs, they also make your ViewControllers more declarative and less error prone.

In a time where UIKit is still very much alive in many codebases, small improvements like this can make day-to-day development a bit cleaner and more maintainable.

## Further reading

- https://www.swiftbysundell.com/articles/modelling-state-in-swift/
- https://www.swiftbysundell.com/tips/using-associated-enum-values-to-avoid-state-specific-optionals/
- https://svelte.dev/blog/write-less-code
- https://blog.jstassen.com/2023/11/naming-booleans-readable-code-with-affirmative-boolean
