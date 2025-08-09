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
