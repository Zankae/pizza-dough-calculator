# Calculator research

Source: https://doughguy.co/pages/dough

## Included

Only the calculator: diameter 10–20 inches, count 1–10, thin/regular/thick, gluten-free toggle, dough-ball estimate, flour/water/hydration summary, six ingredient rows and baker's percentages, contextual tips, copy/print and making instructions. No shop, cart, account, promotions, pixels or analytics.

## Live calculations (not the stale static HTML placeholders)

- Default: six 16-inch regular pizzas → 480 g ball estimate, 1705 g flour, 1057 g water, 62% hydration.
- Thickness factors: thin 1.8, regular 2.11, thick 2.75.
- Regular flour basis: `1509.797685 * (480 / 425)` for six regular 16-inch pizzas.
- Gluten-free flour basis: `333 * 6`.
- Flour: `basis * (diameter / 16)^2 * (count / 6) * (thicknessFactor / 2.11)`.
- Hydration: regular 62%, gluten-free 80%.
- Yeast 0.4%, salt 2.5%, sugar 2%, oil 3.3%, all relative to unrounded flour.
- Ingredient weights are rounded to whole grams except yeast (one decimal place).
- The source's ball estimate uses `round(flour * (2550 / 1509.797685) / count)` in BOTH modes. In gluten-free mode especially, this does not equal the summed ingredient mass divided by count. The app retains the source estimate for compatibility and labels it an estimate; it does not silently change the recipe.
- Source baking tips use Fahrenheit. Instructions retain these units, with Celsius equivalents added for convenience.

## Reference evidence

Recorded the original calculator's rendered results for all 660 combinations: 11 diameters × 10 counts × 3 thicknesses × 2 flour modes. Reference fixtures include settings, four summary values, all six displayed ingredient weights and contextual tip text. These are calculator input/output data, not the original site's source files.

## PWA examples consulted

- Local GAINZ: React/Vite/TypeScript, prompt-based service-worker updates, precached local fonts and GitHub Actions Pages deployment.
- Local Daily Task Manager: standalone manifest, relative scope/start URL, any-orientation configuration and maskable icons.

## Installation

On iPad use Safari → Share → Add to Home Screen → enable Open as Web App if shown → Add. First visit must be online until the offline-ready indicator appears. Safari controls installation; a website cannot install itself on iPad. Home Screen/browser storage may be separate; open the installed app online once before relying on it offline.
