---
title: Reducing Boilerplate in UIKit State Binding
date: 2025-06-11
slug: reducing-boilerplate-in-uikit-state-binding
---

## tl;dr

Tired of writing `isHidden = true` three times every time you define a view?
This article walks through a small refactor to reduce repetitive UIKit state-binding boilerplate — making your code clearer, safer, and easier to maintain.

## Introduction

Modeling the state of asynchronous screens using an enum with associated values is a useful and common pattern. It allows you to collapse multiple sources of truth into a single state object, eliminating optionals and reducing complexity.

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
            case .error(let error): ErrorView(message: error.localizedDescription)
        }
    }
}
```


In *UIKit* codebases, it's common to see this pattern used as follows:

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
                    someView .isHidden = true
                    errorView.isHidden = true
                case .success(let data):
                    indicator.isHidden = true
                    someView .isHidden = false
                    errorView.isHidden = true
                    someView.update(with: data)
                case .error:
                    indicator.isHidden = true
                    someView .isHidden = true
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

This is also boilerplate, as for each screen that follows the pattern, we'll need to pattern match the state.

Thankfully, Swift, being the expressive language that it is, allows for some customization that can remove this boilerplate completely.

## Readable view visibility

You can name a bool (by nature) in two opposite ways, for example, in regards of visibility, you could have a bool that reads:

```swift
var isHidden: Bool {}
````

But depending on your preferences you may want to check visibility using the opposite wording:

```swift
var isVisible: Bool {}
````

Depending on the context, using one nomenclature over the other could be easier to read/reason about.

In the case of *UIViews*, I find the second nomenclature to better fit the most common use case which is controlling view visibility through state binding.

So let's start extending `UIView` so we can introduce a computed property to express visibility more clearly:

```swift
extension UIView {
    var isVisible: Bool {
        get { !isHidden }
        set { isHidden = !newValue }
    }
}
```

This will simplify binding by equating this property to the current state.


### State helpers

Now that we have clearer boolean semantics, we'll need to add some helpers to `state`:

```swift
extension State {
    var isLoading: Bool { self == .loading }
    var isSuccess: Bool { data != nil }

    var isError: Bool {
        switch self {
            case .error: return true
            default: return false
        }
    }

    var data: T? {
        switch self {
            case .success(let data): return data
            default: return nil
        }
    }
}
```

###  Implementation

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

Then, in the *controller / viewModel / whatever*, you switch over and build your state:

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

This too is boilerplate, and can be avoided by having a custom initializer:

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

Then in your controller:

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

These small changes not only reduce repetition and bugs, they also make your ViewControllers more declarative, less verbose, and easier to maintain. In a time where UIKit is still very much alive in many codebases, a bit of help like this goes a long way.

## References

- https://www.swiftbysundell.com/articles/modelling-state-in-swift/
- https://www.swiftbysundell.com/tips/using-associated-enum-values-to-avoid-state-specific-optionals/
- https://svelte.dev/blog/write-less-code
