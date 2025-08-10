struct ShoppingList: View {
    @State var items = [ListItem]()

    var body: some View {
        List(items) {
            Text($0.title)
        }
        .task {
            let (data, _) = try! await URLSession.shared.data(from: URL(string: "https://api.service.com/shopping")!)
            recipes = try! JSONDecoder().decode([ListItem].self, from: data)
        }
    }
}
