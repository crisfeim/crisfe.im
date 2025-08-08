import SwiftUI
import Foundation

struct Recipe: Decodable {
    let title: String
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
