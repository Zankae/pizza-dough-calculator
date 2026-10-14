# Calculator QA report

## Scope and result

Calculator-only app: all controls, ingredient output, flour modes, instructions, persistence, clipboard fallback, print layout, install dialog, offline navigation, viewports, and JavaScript/external-request checks.

The final local production-build run passed **1,339 unit/component tests** and **26 browser tests**, with **zero failed, skipped or flaky browser tests**. Browser tests use Chromium and WebKit with iPad Pro emulation. Production build and dependency security audit passed (zero reported vulnerabilities).

## Source compatibility

Reference data was collected from the original calculator running in a real browser, not synthesized. All 660 combinations are present and uniquely keyed: 10–20-inch diameters, 1–10 pizzas, three thicknesses and two flour modes. Summary values, six displayed ingredient weights and tip priority/text match the reference fixtures.

The static website HTML's default numbers differed from the live JavaScript results. The app matches the live calculator. The source's dough-ball estimate is deliberately preserved and labelled an estimate rather than being recalculated as total mass.

## Browser checks

- Regular default recipe and six ingredient rows.
- Standalone/relative-path manifest and any-orientation configuration.
- No automatically focused inputs.
- Size, count, thickness and gluten-free mode; making instructions update accordingly.
- Saved settings survive reloads; bad or unavailable storage falls back safely.
- Size and count step buttons stop at the original bounds.
- Installation dialog opens/closes and restores keyboard focus.
- Touch controls have at least 44 CSS-pixel height.
- No horizontal overflow; default calculator fits without vertical scrolling at tested tablet sizes.
- Offline cold reload and query-string navigation work after first caching.
- Settings remain editable and are preserved offline.
- Print media shows recipe and all instructions, not controls.
- No uncaught page JavaScript errors or third-party network requests during the browser checks.

Viewports: 834×1194, 1194×834, 1024×1366, 1366×1024, 1024×768 and 390×844.

## Issues caught and fixed before publishing

1. Landscape content required unnecessary scrolling. Measured real element sizes; adjusted landscape spacing without reducing button hit targets. The layout regression tests now pass in both engines.
2. WebKit did not restore focus to a clicked install button after the native dialog closed. Added explicit opener focus restoration and verified the original failing WebKit test now passes.
3. After reopening online, the first-install-only callback could leave the offline indicator saying “Preparing offline…” despite an active worker. Read this app's controlling service worker as well as the first-install callback; added a failing reopen regression test and verified it passes in both engines.

No known unresolved functional issue was found in the tested scope.

## Limitations

No physical iPad was connected. Home Screen installation, iPadOS's actual Share/Print sheet and real on-device background-storage retention still require an owner device check. Browser emulation is not hardware certification. Offline use requires an initial online visit; iPadOS can clear stored website data. Clipboard behavior was checked through component tests (including permission denial), while actual print-media layout and native dialog behavior were exercised in both browser engines.

Screenshots and machine-readable browser results are generated under `test-results/`, intentionally excluded from Git. The live deployment is verified separately after publishing.
