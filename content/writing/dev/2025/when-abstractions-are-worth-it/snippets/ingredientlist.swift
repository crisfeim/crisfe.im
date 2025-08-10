struct IngredientList: View {
    @State var ingredients = [Ingredient]()

    var body: some View {
        List(ingredients) {
            Text($0.title)
        }
        .task {
            let (data, _) = try! await URLSession.shared.data(from: URL(string: "https://api.service.com/ingredients")!)
            recipes = try! JSONDecoder().decode([Ingredient].self, from: data)
        }
    }
}
