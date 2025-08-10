struct MenuList: View {
    @State var menus = [Menu]()

    var body: some View {
        List(menus) {
            Text($0.title)
        }
        .task {
            let (data, _) = try! await URLSession.shared.data(from: URL(string: "https://api.service.com/menus")!)
            recipes = try! JSONDecoder().decode([Menu].self, from: data)
        }
    }
}
