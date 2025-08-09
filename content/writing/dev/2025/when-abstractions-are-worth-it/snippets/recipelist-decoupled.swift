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
