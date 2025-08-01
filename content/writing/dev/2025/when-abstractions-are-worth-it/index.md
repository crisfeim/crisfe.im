---
title: When abstractions are worth it
date: 2025-08-01
draft: true
---

{{< fragment "templates/app.html" >}}

Here is your typical app screen — it loads data from somewhere and displays it in a list. When a user taps an item, the app navigates to some sort of detail screen:

<div
    class="component-slot"
    data-title="Some screen"
    data-items="Some item 1,Some item 2,Some item 3"
></div>


This is a ubiquitous pattern, no matter the app:

<div class="columns">
    <div
        class="component-slot"
        data-title="🍔 Recipes"
        data-items="🍗 KFC Chicken,🍣 Sushi Rolls,🍜 Ramen"
    ></div>
    <div
        class="component-slot"
        data-title="👤 Contacts"
        data-items="John Doe"
    ></div>
    <div
        class="component-slot"
        data-title="💰 Transactions"
        data-items="Starbucks – $5.75,Spotify – $9.99"></div>
</div>

The data could come from a remote *API* or a local database. The quickest, dirtiest way to implement this would be to fetch data directly in the view:

<div class="tabs">
  <input type="radio" name="tabset" id="tab1" checked>
  <input type="radio" name="tabset" id="tab2">
  <input type="radio" name="tabset" id="tab3">
  <div class="tab-labels">
    <label for="tab1">URLSession</label>
    <label for="tab2">SwiftData</label>
    <label for="tab3">CoreData</label>
  </div>
  <div class="contents">
    <!-- <div class="tab-content" id="content1">< highlight-file "snippets/urlsession.swift" ></div> -->
    <!-- <div class="tab-content" id="content2">< highlight-file "snippets/swiftdata.swift" ></div> -->
    <!-- <div class="tab-content" id="content3">< highlight-file "snippets/coredata.swift" ></div> -->
  </div>
</div>

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

{{< fragment "components/tabbar.html" >}}


But again, the view would be coupled with frameworks (`URLSession` and `CoreData`) and wouldn't be reusable.

Maybe reusability isn't important for this view right now, but what if later on you decide to add a *favorites* feature that only fetches data from a local data source?

{{< fragment "components/tabbar.html" >}}

Abstractions allow that level of flexibility:

<!-- < highlight-file "snippets/tabbar.swift" > -->


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
