---
title: When abstractions are worth it
date: 2025-08-09
---

*Abstractions aren’t free — but sometimes they’re the difference between a painless change and a rewrite. This article examines three real-world scenarios where they prove their value, and reflects on how to approach them through intentional architectural decisions.*

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
    title="🎵 British oldies"
    items="Let It Be|Bohemian Rhapsody|Cum on feel the Noize"
>}}

{{< gotmpl src="app/main"
    title="🔪 My Recipes"
    items="🍗 Mama's chicken|🍣 Sushi Rolls|🍜 Ramen"
>}}

{{< gotmpl src="app/main"
    title="👤 Contacts"
    items="Tim Cook"
>}}

{{< gotmpl src="app/main"
    title="💰 History"
    items="Starbucks – $5.75 — Today|Spotify – $9.9 — Yesterday"
>}}

</div>
</div>

The data could come from a remote *API* or a local database. The quickest, dirtiest way to implement this would be to fetch data directly in the view:

<div class="carousel-breakout">
<div class="carousel-content">
{{< highlight-file "snippets/swiftdata.swift" >}}
{{< highlight-file "snippets/coredata.swift" >}}
{{< highlight-file "snippets/urlsession.swift" >}}
</div>
</div>

This approach ties the view with the specific data source implementation. This may seem acceptable — after all, it works. But there are cases where this tight coupling becomes a liability. Let’s look at three common scenarios where using abstraction makes a difference.

## When third-party infrastructure could be deprecated

`URLSession` is the default framework provided by *Apple* to make remote requests, and it has been here for quite some time.

Let's imagine you have multiple screens in your app where you're using this approach. For example, in a recipe app, you might have something like this:

<div class="carousel-breakout">
<div class="carousel-content">
{{< highlight-file "snippets/menulist.swift" >}}
{{< highlight-file "snippets/recipelist.swift" >}}
</div>
</div>

What if Apple shipped a new framework replacing `URLSession`? You’d need to update potentially *N* screens. That might sound unlikely, but it has happened before: `URLSession` replaced `NSURLConnection` in iOS 9.

```swift
protocol HTTPClient {
  func get(url: URL) async throws -> Data
}

func makeApp(httpClient: HTTPClient) -> RecipesTabbar {
  let r = RecipesList(client: httpClient)
  let s = ShoppingList(client: httpClient)
  let m = MenuList(client: httpClient)

  return RecipesTabbar(
    recipes: r,
    shoppingList: s,
    menus: m
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

You may think this is a somewhat convoluted example — and you’d be right. However, it’s a historical case that justifies the point.

A more common scenario is migrating from `Alamofire` to `URLSession`. In recent years, `URLSession` has become powerful enough to cover the vast majority of use cases without relying on a third-party framework. If you had decoupled your `Alamofire` logic behind an abstraction, the migration would be just as simple:

```diff
let app = makeApp(
- httpClient: AlamofireHTTPClient()
+ httpClient: URLSessionHTTPClient()
)
```

## When you want a secondary data source as fallback

As before, the straightforward way of implementing a fallback[^fallback] solution is placing all the logic in the view:

[^fallback]: A common pattern that enhances users' offline experience.

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

Decoupling through abstractions allows that level of flexibility:

<div class="carousel-breakout">
<div class="carousel-content">
{{< highlight-file "snippets/recipelist-decoupled.swift" >}}
{{< highlight-file "snippets/tabbar.swift" >}}
</div>
</div>

## When infrastructure isn't implemented yet

You're tasked with the creation of a `RecipeList`. You know the data will come from a remote *API* designed by your backend team. You need to start the development before the data *API* is ready.

Abstractions allow parallel teamwork. You can build a working screen and wire it to real infrastructure later:

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

That said, coupling can sometimes be practical and even okay. For instance, if you're building a simple prototype or a feature that's unlikely to change, starting with direct URLSession calls might be the right choice. The key is making a conscious decision: *"I'm coupling this now because X, Y, Z, and I know how to refactor it later if needed."*

Being aware of tradeoffs and potential liabilities, and knowing how to transition from a simple architecture to a more modular one as your project evolves is far more valuable than obsessing over decoupling.
