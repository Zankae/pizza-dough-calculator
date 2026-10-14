import type { Settings } from './calculator';
export interface Guidance { tip: { title: string; text: string } | null; instructions: string[]; fermentation: string }
export function getGuidance(settings: Settings): Guidance {
  const tip = settings.glutenFree ? { title: 'GF tip', text: 'GF dough is stickier — oil your hands before shaping.' }
    : settings.size >= 18 ? { title: 'Big pizza tip', text: `${settings.size}\" is large — preheat for the full 45 min at max temp.` }
    : settings.count >= 8 ? { title: 'Batch tip', text: `Making ${settings.count} pizzas? Shape all balls at once — they keep 4 days in the fridge.` }
    : settings.thickness === 'thick' ? { title: 'Thick crust', text: 'Drop to 450°F and give it 10–12 min instead of 6–8.' }
    : settings.thickness === 'thin' ? { title: 'Thin crust', text: 'Thin crust cooks fast — 4–5 minutes. Watch it closely.' } : null;
  if (settings.glutenFree) return { tip, instructions: ['Add cold water and yeast', 'Add GF flour + olive oil, mix 2 min', 'Add sugar and salt, mix 3–4 min', 'Refrigerate 15 min to firm up', 'Oil hands, shape into balls', 'Refrigerate up to 48 hours', 'Bring to room temp before using'], fermentation: 'Cold rest up to 48hrs' };
  return { tip, instructions: ['Cool water to under 60°F (16°C)', 'Mix water + active dry yeast', 'Add flour + olive oil, mix 2 min', 'Add sugar and salt on low', 'Mix 10 more minutes', 'Cover, rest 1–3 hours', 'Shape into balls, seal seam', 'Refrigerate 2–4 days (3 ideal)', 'Bring to room temp before using'], fermentation: 'Cold ferment 2–4 days' }; }
