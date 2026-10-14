import { calculate, type Settings } from './calculator';
import { getGuidance } from './guidance';
export function recipeText(settings: Settings): string {
  const recipe = calculate(settings);
  const guidance = getGuidance(settings);
  return ['PIZZA DOUGH RECIPE', `${settings.count} × ${settings.size}″ pizzas · ${settings.thickness} · ${settings.glutenFree ? 'Gluten-free' : 'Regular dough'}`, `Dough ball estimate: ${recipe.ball} g each`, `Hydration: ${recipe.hydration}%`, guidance.fermentation, '', ...recipe.ingredients.map(i => `${i.name}: ${i.amount} g (${i.percent})`), '', 'INSTRUCTIONS', ...guidance.instructions.map((step, index) => `${index + 1}. ${step}`), '', 'Ball estimate follows the original calculator; ingredient totals may differ.', 'Based on doughguy.co/pages/dough'].join('\n');
}
