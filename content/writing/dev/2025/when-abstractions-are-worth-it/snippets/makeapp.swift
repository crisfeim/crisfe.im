protocol HTTPClient {
  func get(url: URL) async throws -> Data
}

func makeApp(httpClient: HTTPClient) -> RecipesTabbar {
  let r = RecipesList(client: httpClient)
  let m = MenuList(client: httpClient)
  let i = IngredientList(client: httpClient)
  let s = ShoppingList(client: httpClient)

  return RecipesTabbar(
    recipes: r,
    menus: m,
    ingredients: i,
    shoppingList: s,
  )
}
