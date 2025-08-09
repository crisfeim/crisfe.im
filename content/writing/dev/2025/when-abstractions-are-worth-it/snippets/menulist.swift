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
