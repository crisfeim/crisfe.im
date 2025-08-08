import SwiftUI
import CoreData

@objc(Recipe)
class Recipe: NSManagedObject {
    @NSManaged var title: String
}

struct RecipesList: View {
    @FetchRequest(
        sortDescriptors: []
    ) var recipes: FetchedResults<Recipe>

    var body: some View {
        List(recipes) {
            Text($0.title)
        }
    }
}
