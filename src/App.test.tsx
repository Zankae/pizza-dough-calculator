import { expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { calculate } from './calculator';
import { STORAGE_KEY } from './storage';
vi.mock('virtual:pwa-register/react', () => ({ useRegisterSW: () => ({ offlineReady: [true, vi.fn()], needRefresh: [false, vi.fn()], updateServiceWorker: vi.fn() }) }));
it('copies the recipe using the clipboard', async () => {
  const user = userEvent.setup();
  const copy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
  render(<App />);
  await user.click(screen.getByRole('button', { name: /Copy recipe/ }));
  expect(copy).toHaveBeenCalledWith(expect.stringContaining('Bread flour: 1705 g'));
  expect(screen.getByText('Recipe copied.')).toBeVisible();
  copy.mockRestore();
});
it('provides selectable recipe text when clipboard access is denied', async () => {
  const user = userEvent.setup();
  const copy = vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Permission denied'));
  render(<App />);
  await user.click(screen.getByRole('button', { name: /Copy recipe/ }));
  expect((screen.getByRole('textbox', { name: 'Recipe text' }) as HTMLTextAreaElement).value).toContain('Bread flour: 1705 g');
  copy.mockRestore();
});
it('opens the print/save sheet', async () => {
  const user = userEvent.setup();
  const print = vi.spyOn(window, 'print').mockImplementation(() => {});
  render(<App />);
  await user.click(screen.getByRole('button', { name: /Print \/ save/ }));
  expect(print).toHaveBeenCalledOnce();
  print.mockRestore();
});
it('omits the offline indicator and iPad installation controls', () => {
  render(<App />);
  expect(screen.queryByRole('button', { name: /Install on iPad/ })).not.toBeInTheDocument();
  expect(screen.queryAllByText('Offline ready')).toHaveLength(0);
  expect(screen.queryByText('Install on your iPad')).not.toBeInTheDocument();
});
it('omits the removed recipe headline', () => {
  render(<App />);
  expect(screen.queryByText("Your dough, dialled in.")).not.toBeInTheDocument();
});
it('omits the removed settings headline', () => {
  render(<App />);
  expect(screen.queryByText("Your pizza settings")).not.toBeInTheDocument();
});
it('omits the removed saved-settings message', () => {
  render(<App />);
  expect(screen.queryByText("Settings remembered on this device.")).not.toBeInTheDocument();
});
it('omits the removed dough-ball note', () => {
  render(<App />);
  expect(screen.queryByText("Dough-ball weight follows the original calculator’s estimate; ingredient totals may differ.")).not.toBeInTheDocument();
});
it('omits the removed attribution footer', () => {
  render(<App />);
  expect(screen.queryByText(/Calculator based on/)).not.toBeInTheDocument();
});
it('omits the removed footer slogan', () => {
  render(<App />);
  expect(screen.queryByText("No accounts. No ads. Just pizza.")).not.toBeInTheDocument();
});
it('calculates the selected pizzas through the touch controls and remembers them', async () => {
  const user = userEvent.setup();
  const view = render(<App />);
  expect(screen.getByTestId('stat-ball')).toHaveTextContent('480');
  expect(screen.getByTestId('stat-flour')).toHaveTextContent('1705');
  expect(screen.getByRole('slider', { name: 'Pizza size' })).toHaveValue('16');
  expect(screen.getByRole('slider', { name: 'Number of pizzas' })).toHaveValue('6');
  await user.click(screen.getByRole('button', { name: 'Thin' }));
  await user.click(screen.getByRole('switch', { name: /Gluten free/i }));
  fireEvent.change(screen.getByRole('slider', { name: 'Pizza size' }), { target: { value: '12' } });
  fireEvent.change(screen.getByRole('slider', { name: 'Number of pizzas' }), { target: { value: '3' } });
  const settings = { size: 12, count: 3, thickness: 'thin' as const, glutenFree: true };
  expect(screen.getByTestId('stat-water')).toHaveTextContent(String(calculate(settings).water));
  expect(screen.getByTestId('stat-hydration')).toHaveTextContent('80');
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(settings);
  await user.click(screen.getByText('Gluten-free instructions'));
  expect(within(screen.getByText('Gluten-free instructions').closest('details')!).getByText('Refrigerate up to 48 hours')).toBeVisible();
  view.unmount(); render(<App />);
  expect(screen.getByRole('switch', { name: /Gluten free/i })).toBeChecked();
  expect(screen.getByRole('slider', { name: 'Pizza size' })).toHaveValue('12');
  expect(screen.queryByText('Shop the steel')).not.toBeInTheDocument();
});
