---
title: When abstractions are worth it
date: 2025-08-01
---

Here is your typical mobile app screen — it loads data from somewhere and displays it in a list. When a user taps an item, the app navigates to some sort of detail screen:

{{< gotmpl src="app/main"
    title="Some screen"
    items="Item 1|Item 2|Item 3"
>}}

This is a ubiquitous pattern, no matter the type of app:
<div class="carousel-breakout">
<div class="carousel-content">
{{< gotmpl src="app/main"
    title="🍔 Recipes"
    items="🍗 KFC Chicken|🍣 Sushi Rolls|🍜 Ramen"
>}}

{{< gotmpl src="app/main"
    title="👤 Contacts"
    items="John Doe"
>}}

{{< gotmpl src="app/main"
    title="💰 Transactions"
    items="Starbucks – $5.75|Spotify – $9.99"
>}}

{{< gotmpl src="app/main"
    title="🎵 Songs"
    items="Let It Be|Cum On Feel the Noize"
>}}
</div>
</div>

The data could come from a remote *API* or a local database. The quickest, dirtiest way to implement this would be to fetch data directly in the view:

@todo

This approach ties the view with the specific data source implementation. This may seem acceptable — after all, it works. But there are cases where this tight coupling becomes a liability. Let’s look at three common scenarios where using abstraction makes a difference.

### When third-party infrastructure could be deprecated

`URLSession` is the default framework provided by *Apple* to make remote requests, and it has been here for quite some time.

Let's imagine you have multiple screens in your app where you're using this approach. For example, in a recipe app, you might have something like this:

```swift
struct MenuList: View {
    @State var recipes = [Recipe]()

    var body: some View {
        List(recipes) {
            Text($0.title)
        }
        .task {
            let (data, _) = try! await URLSession.shared.data(from: URL(string: "https://api.service.com/menus")!)
            recipes = try! JSONDecoder().decode([Menu].self, from: data)
        }
    }
}
struct RecipesList: View {
    @State var recipes = [Recipe]()

    var body: some View {
        List(recipes) {
            Text($0.title)
        }
        .task {
            let (data, _) = try! await URLSession.shared.data(from: URL(string: "https://api.service.com/recipes")!)
            recipes = try! JSONDecoder().decode([Recipe].self, from: data)
        }
    }
}
```

What if Apple ships a new framework that replaces URLSession? Well, now you have to update potentially *N* screens.

You may think this is not likely to happen and you'll be right. Though it has happened before: URLSession replaced NSURLConnection in iOS 9. Using an abstraction would protect your system if that ever happens again:

```swift
protocol HTTPClient {
  func get(url: URL) async throws -> Data
}

func makeApp(httpClient: HTTPClient) -> RecipeApp {
  let recipes = RecipesList(httpClient: httpClient)
  let shoppingList = ShoppingList(httpClient: httpClient)
  let menus = MenuView(httpClient: httpClient)

  return RecipesTabbar(
    recipes: recipes,
    shoppingList: shoppingList,
    menus: menus
  )
}
```

Through abstractions and composition, updating the whole app would be as easy as changing a single line:

```diff
let app = makeApp(
- httpClient: URLConnectionHTTPClient()
+ httpClient: URLSessionHTTPClient()
)
```

## When you want a secondary data source as fallback

A straightforward way of implementing a fallback[^fallback] solution is placing all the logic in the view (as before):

[^fallback]: This is a common pattern that enhances user experience by providing data to the user even when offline.

```swift
struct RecipeListView: View {
    @State var recipes = [Recipe]()
    var body: some View {
        ...
            .task {
                do {
                    recipes = try await loadFromURLSession()
                } catch {
                    recipes = try await loadFromCoreDataCache()
                }
            }
    }

    func loadFromURLSession() async throws -> [Recipe] {
      let (data, _) = try URLSession.shared.data(from: ...)
      return try JSONDecoder(..., data)
    }

    func loadFromCoreDataCache() async throws -> [Recipe] {
      let cdEntities = try RecipeCacheCoreDataManager.fetch()
      return cdEntities.mapToDomainObjects()
    }
}
```

But again, the view would be coupled with frameworks (`URLSession` and `CoreData`) and wouldn't be reusable.

Maybe reusability isn't important for this view right now, but what if later on you decide to add a *favorites* feature that only fetches data from a local data source?

{{< gotmpl src="app/tabbar" >}}

Abstractions allow that level of flexibility:

<!--< highlight-file "snippets/tabbar.swift" >-->


### When infrastructure isn't implemented yet

You're tasked with the creation of a `RecipeList`. You know the data will come from a remote *API* designed by your backend team. You need to start the development before the data *API* is ready.

Abstractions allow parallel teamwork — you can build a working screen and wire it to real infrastructure later:

```swift
#Preview {
  let loader = MockRecipeLoader()
  RecipeList(loader)
}
```

You can then integrate the screen when remote is ready:

```swift
class RemoteRecipesLoader: RecipesLoader {
  let apiURL: String
  ...
  func execute() async throws -> [Recipe] {
    let (data, _) = try await URLSession...
    return try JSONDecoder(..., data)
  }
}

struct RecipesApp: App {
  let loader = RemoteRecipesLoader()
  var body: some Scene {
    WindowGroup {
      TabView {
        RecipeList(loader)
      }
    }
  }
}
```

## Conclusions

> "Abstractions aren’t free — but they’re often worth the cost once change becomes inevitable."

Abstractions allow decoupling and improve flexibility, making infrastructure switching easier without breaking the system. They might take a bit more effort at first, but the long-term benefits often outweigh the cost.

> "Don't be religious, be intentional"

That said, coupling can sometimes be practical and even okay. Being aware of tradeoffs and potential liabilities, and knowing how to transition from a *simple* architecture to a more modular one as your project evolves is far more valuable than obsessing over decoupling. Decoupling shouldn't be a blindly followed dogma, but a conscious decision.
