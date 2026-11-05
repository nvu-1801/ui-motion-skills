import type { ButtonVariant, ButtonSize } from './models.js';
export function Button(label: string, options: { variant?: ButtonVariant; size?: ButtonSize; onClick?: () => void } = {}): HTMLButtonElement {
  const node = document.createElement('button');
  node.type = 'button';
  node.className = `button button--${options.variant || 'primary'} button--${options.size || 'default'}`;
  node.textContent = label;
  if (options.onClick) node.addEventListener('click', options.onClick);
  return node;
}
export function Text(value: string, role: 'heading' | 'body' | 'caption' = 'body'): HTMLElement {
  const node = document.createElement(role === 'heading' ? 'h1' : 'p');
  node.className = `text text--${role}`; node.textContent = value; return node;
}
export function Dialog(title: string): { element: HTMLDialogElement; open: () => void } {
  const element = document.createElement('dialog');
  const heading = document.createElement('h2'); heading.id = 'confirm-heading'; heading.textContent = title;
  element.setAttribute('aria-labelledby', heading.id);
  let opener: HTMLElement | null = null;
  element.append(heading, Button('Close', { onClick: () => element.close() }));
  element.addEventListener('close', () => opener?.focus());
  return { element, open: () => { opener = document.activeElement as HTMLElement; element.showModal(); } };
}
export function LinkCard(label: string, href: string): HTMLAnchorElement {
  const node = document.createElement('a'); node.className = 'card'; node.href = href; node.textContent = label; return node;
}
export function SelectionCard(label: string): HTMLLabelElement {
  const node = document.createElement('label'); node.className = 'card';
  const checkbox = document.createElement('input'); checkbox.type = 'checkbox';
  node.append(checkbox, document.createTextNode(label)); return node;
}
