import { useEffect, useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { calculate, type Settings, type Thickness } from './calculator';
import { getGuidance } from './guidance';
import { loadSettings, saveSettings } from './storage';
import { recipeText } from './recipe-text';

export default function App() {
  const installDialog = useRef<HTMLDialogElement>(null);
  const installButton = useRef<HTMLButtonElement>(null);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [saved, setSaved] = useState(true);
  const [copyStatus, setCopyStatus] = useState('');
  const [manualCopy, setManualCopy] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [controlled, setControlled] = useState(() => navigator.serviceWorker?.controller?.scriptURL === new URL(`${import.meta.env.BASE_URL}sw.js`, location.href).href);
  const { offlineReady: [offlineReady], needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW();
  const recipe = calculate(settings);
  const guidance = getGuidance(settings);

  useEffect(() => { setSaved(saveSettings(settings)); }, [settings]);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update); window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);

  useEffect(() => {
    if (!navigator.serviceWorker) return;
    const update = () => setControlled(navigator.serviceWorker.controller?.scriptURL === new URL(`${import.meta.env.BASE_URL}sw.js`, location.href).href);
    navigator.serviceWorker.addEventListener('controllerchange', update);
    return () => navigator.serviceWorker.removeEventListener('controllerchange', update);
  }, []);

  async function copyRecipe() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(recipeText(settings));
      setManualCopy(false); setCopyStatus('Recipe copied.');
    } catch {
      setManualCopy(true); setCopyStatus('Select the recipe below and copy it.');
    }
  }

  return <div className="app-shell">
    <header className="app-header">
      <div className="brand"><img src={`${import.meta.env.BASE_URL}pizza.svg`} width="42" height="42" alt="" /><div><p className="eyebrow">JUST THE DOUGH</p><h1>Dough <span>Calculator.</span></h1></div></div>
      <div className="header-actions"><span className="offline-status" role="status"><i />{!online ? 'Offline' : offlineReady || controlled ? 'Offline ready' : 'Preparing offline…'}</span><button ref={installButton} className="install-button" type="button" onClick={() => installDialog.current?.showModal()}>Install on iPad <span aria-hidden="true">↗</span></button></div>
    </header>
    <main className="app-content">
      <div className="calculator-grid">
        <section className="settings-panel panel" aria-labelledby="settings-heading">
          <div className="section-heading"><p className="eyebrow">01 / SETTINGS</p><h2 id="settings-heading">Your pizza settings</h2></div>
          <div className="slider-field">
            <div className="field-heading"><label htmlFor="pizza-size">Pizza size</label><output htmlFor="pizza-size">{settings.size}<span>″</span></output></div>
            <div className="range-row"><button className="step-button" type="button" aria-label="Smaller pizza" disabled={settings.size <= 10} onClick={() => setSettings(s => ({ ...s, size: s.size - 1 }))}>−</button><input id="pizza-size" type="range" min="10" max="20" step="1" value={settings.size} onChange={e => setSettings(s => ({ ...s, size: Number(e.target.value) }))} /><button className="step-button" type="button" aria-label="Larger pizza" disabled={settings.size >= 20} onClick={() => setSettings(s => ({ ...s, size: s.size + 1 }))}>+</button></div>
            <div className="range-labels"><span>10″</span><span>15″</span><span>20″</span></div>
          </div>
          <div className="slider-field">
            <div className="field-heading"><label htmlFor="pizza-count">Number of pizzas</label><output htmlFor="pizza-count">{settings.count}</output></div>
            <div className="range-row"><button className="step-button" type="button" aria-label="Fewer pizzas" disabled={settings.count <= 1} onClick={() => setSettings(s => ({ ...s, count: s.count - 1 }))}>−</button><input id="pizza-count" type="range" min="1" max="10" step="1" value={settings.count} onChange={e => setSettings(s => ({ ...s, count: Number(e.target.value) }))} /><button className="step-button" type="button" aria-label="More pizzas" disabled={settings.count >= 10} onClick={() => setSettings(s => ({ ...s, count: s.count + 1 }))}>+</button></div>
            <div className="range-labels"><span>1</span><span>5</span><span>10</span></div>
          </div>
          <fieldset className="thickness-field"><legend>Thickness</legend><div className="segmented-control">{(['thin', 'regular', 'thick'] as Thickness[]).map(thickness => <button key={thickness} type="button" className={settings.thickness === thickness ? 'selected' : ''} aria-pressed={settings.thickness === thickness} onClick={() => setSettings(s => ({ ...s, thickness }))}>{thickness[0].toUpperCase() + thickness.slice(1)}</button>)}</div></fieldset>
          <label className="gf-row" htmlFor="gluten-free"><div><span className="gf-title">Gluten free</span><small>GF flour + adjusted hydration</small></div><input id="gluten-free" type="checkbox" role="switch" checked={settings.glutenFree} onChange={e => setSettings(s => ({ ...s, glutenFree: e.target.checked }))} /><span className="switch-track" aria-hidden="true" /></label>
          {guidance.tip && <aside className="tip"><strong>{guidance.tip.title}</strong><p>{guidance.tip.text}</p></aside>}
          <p className="saved-note">{saved ? 'Settings remembered on this device.' : 'Storage unavailable. Settings will reset when closed.'}</p>
        </section>
        <section className="recipe-panel panel" aria-labelledby="recipe-heading">
          <div className="recipe-heading"><div><p className="eyebrow">02 / RECIPE</p><h2 id="recipe-heading">Your dough, dialled in.</h2></div><span className="recipe-tag">{settings.glutenFree ? 'Gluten-free' : 'Regular dough'}</span></div>
          <div className="stats-grid">
            <div className="stat"><p>Dough ball</p><strong data-testid="stat-ball">{recipe.ball}</strong><small>grams each · estimate</small></div>
            <div className="stat"><p>Total flour</p><strong data-testid="stat-flour">{recipe.flour}</strong><small>grams</small></div>
            <div className="stat"><p>Total water</p><strong data-testid="stat-water">{recipe.water}</strong><small>grams</small></div>
            <div className="stat"><p>Hydration</p><strong data-testid="stat-hydration">{recipe.hydration}<span>%</span></strong><small>water / flour</small></div>
          </div>
          <table className="ingredient-table"><caption className="sr-only">Ingredient weights for all {settings.count} pizzas</caption><thead><tr><th scope="col">Ingredient</th><th scope="col">Amount</th><th scope="col">Baker's %</th></tr></thead><tbody>{recipe.ingredients.map(ingredient => <tr key={ingredient.name}><th scope="row">{ingredient.name}{ingredient.detail && <small>{ingredient.detail}</small>}</th><td>{ingredient.amount}<span className="unit">g</span></td><td>{ingredient.percent}</td></tr>)}</tbody></table>
          <div className="recipe-meta"><span>{guidance.fermentation}</span><span>{settings.count} {settings.count === 1 ? 'ball' : 'balls'} · {settings.size}″ · {settings.thickness}</span></div>
          <details className="instructions"><summary>{settings.glutenFree ? 'Gluten-free instructions' : 'Dough making instructions'}<span aria-hidden="true">+</span></summary><ol>{guidance.instructions.map((step, index) => <li key={step}><span className="step-number">{String(index + 1).padStart(2, '0')}</span>{step}</li>)}</ol></details>
          <section className="print-only"><h3>Making instructions</h3><ol>{guidance.instructions.map(step => <li key={step}>{step}</li>)}</ol></section>
          <div className="recipe-actions"><button className="primary-button" type="button" onClick={() => void copyRecipe()}>Copy recipe <span aria-hidden="true">⧉</span></button><button className="secondary-button" type="button" onClick={() => window.print()}>Print / save <span aria-hidden="true">↗</span></button></div>
          {manualCopy && <textarea className="manual-copy" readOnly aria-label="Recipe text" rows={10} value={recipeText(settings)} />}
          {copyStatus && <p className="copy-feedback" role="status">{copyStatus}</p>}
          <p className="estimate-note">Dough-ball weight follows the original calculator’s estimate; ingredient totals may differ.</p>
        </section>
      </div>
      <footer className="app-footer"><span>Calculator based on <a href="https://doughguy.co/pages/dough" target="_blank" rel="noreferrer">Dough Guy</a>. Independent app.</span><span>No accounts. No ads. Just pizza.</span></footer>
    </main>
    <dialog ref={installDialog} onClose={() => installButton.current?.focus()} className="install-dialog" aria-labelledby="install-title">
      <p className="eyebrow">YOUR KITCHEN COMPANION</p><h2 id="install-title">Install on your iPad</h2>
      <ol><li>Open this app’s link in <strong>Safari</strong>.</li><li>Tap the <strong>Share</strong> button.</li><li>Choose <strong>Add to Home Screen</strong>.</li><li>Keep <strong>Open as Web App</strong> on, if shown, then tap <strong>Add</strong>.</li></ol>
      <p>Open the Home Screen app online once and wait for <strong>Offline ready</strong>. Then you can use the calculator without Wi-Fi.</p>
      <p className="dialog-note">Your settings stay on this device. No App Store download or account needed.</p>
      <button className="primary-button" type="button" onClick={() => installDialog.current?.close()}>Got it</button>
    </dialog>
    {needRefresh && <div className="update-bar" role="status"><span>New version ready.</span><button type="button" onClick={() => void updateServiceWorker(true)}>Update app</button></div>}
  </div>;
}
