import SwiftUI
import SwiftData

@Model
class Recipe {
    let title: String
    init(title: String) {
        self.title = title
    }
}

struct RecipesList: View {
    @Query var recipes = [Recipe]

    var body: some View {
        List(recipes) {
            Text($0.title)
        }
    }
}
