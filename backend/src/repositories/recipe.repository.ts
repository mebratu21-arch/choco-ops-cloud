import { db } from '../config/database.js';
import { Recipe, RecipeIngredient } from '../types/domain.types.js';

export class RecipeRepository {
  static async findAll(): Promise<Recipe[]> {
    return db('recipes')
      .whereNull('deleted_at')
      .orderBy('name');
  }

  static async findById(id: string): Promise<Recipe | undefined> {
    return db('recipes')
      .where({ id })
      .whereNull('deleted_at')
      .first();
  }

  static async findWithIngredients(id: string): Promise<{ recipe: Recipe; ingredients: RecipeIngredient[] } | null> {
    const recipe = await this.findById(id);
    if (!recipe) return null;

    const ingredients = await db('recipe_ingredients')
      .leftJoin('ingredients', 'recipe_ingredients.ingredient_id', 'ingredients.id')
      .select('recipe_ingredients.*', 'ingredients.name as ingredient_name')
      .where('recipe_ingredients.recipe_id', id);

    return { recipe, ingredients };
  }

  static async create(data: Partial<Recipe>): Promise<Recipe> {
    const [recipe] = await db('recipes')
      .insert(data)
      .returning('*');
    return recipe;
  }

  static async update(id: string, data: Partial<Recipe>): Promise<Recipe> {
    const [recipe] = await db('recipes')
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return recipe;
  }

  static async delete(id: string): Promise<void> {
    await db('recipes')
      .where({ id })
      .update({ deleted_at: new Date(), is_active: false });
  }

  static async addIngredient(recipeId: string, ingredientData: Partial<RecipeIngredient>): Promise<RecipeIngredient> {
    const [ri] = await db('recipe_ingredients')
      .insert({ ...ingredientData, recipe_id: recipeId })
      .returning('*');
    return ri;
  }

  static async removeIngredient(recipeId: string, ingredientId: string): Promise<void> {
    await db('recipe_ingredients')
      .where({ recipe_id: recipeId, ingredient_id: ingredientId })
      .del();
  }
}
