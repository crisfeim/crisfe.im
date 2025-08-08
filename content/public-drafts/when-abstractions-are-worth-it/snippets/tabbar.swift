struct Tabbar: View {

    let favs   = RecipeList(CoreDataFavoritesLoader())
    let latest = RecipeList(RemoteWithCoreDataFallback())

    var body: some View {
        TabView {
            NavigationView {
               favs.navigationTitle("🍔 Favorite recipes")
            }

            .tabItem {
                Image(systemName: "heart")
                Text("Favorites")
            }

            NavigationView {
                latest.navigationTitle("🍔 Latest recipes")
            }
            .tabItem {
                Image(systemName: "clock")
                Text("Latest")
            }
        }
    }
}

protocol RecipesLoader {
    func execute() async throws -> [Recipe]
}

struct RecipeList: View {
    @State var recipes = [Recipe]()
    let loader: RecipesLoader
    var body: some View {
        List(recipes) { Text($0.title) }
            .task {
               recipes = try await loader.execute()
            }
    }
}
