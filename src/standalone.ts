import { mountFigure } from './adapters/host.js';
import { catalog } from './examples/index.js';

const mounted = mountFigure(document.querySelector('#figure')!, {
  rendererId: 'vizforge.d3',
  spec: catalog.find((c) => c.id === 'ranking')!.story,
});
const controls = document.querySelector('#controls')!;
for (const [label, action] of [
  ['Reset', mounted.player!.reset],
  ['Previous', mounted.player!.previous],
  ['Play', mounted.player!.play],
  ['Pause', mounted.player!.pause],
  ['Next', mounted.player!.next],
] as const) {
  const button = document.createElement('button');
  button.textContent = label;
  button.addEventListener('click', action);
  button.style.cssText = 'padding:12px 20px;margin:4px;cursor:pointer';
  controls.append(button);
}
const state = document.createElement('p');
state.setAttribute('aria-live', 'polite');
controls.append(state);
const update = () => {
  state.textContent = mounted.player!.getScene().caption;
};
mounted.player!.subscribe(update);
update();
window.addEventListener('pagehide', mounted.destroy, { once: true });
