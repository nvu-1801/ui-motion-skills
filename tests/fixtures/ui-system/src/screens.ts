import { Button, Text, Dialog, LinkCard, SelectionCard } from './ui.js';
import { priceLabel } from './format.js';
const main = document.querySelector('main')!;
const modal = Dialog('Confirm action');
for (const screen of ['Home', 'Settings', 'Checkout']) {
  const section = document.createElement('section'); section.dataset.screen = screen.toLowerCase();
  section.append(Text(screen, 'heading'), Text(priceLabel({ title: 'Sample', unitCents: 125 })));
  // A scoped compact variant leaves the shared default and other screens unchanged.
  section.append(Button(`Confirm ${screen}`, { size: screen === 'Checkout' ? 'compact' : 'default', onClick: modal.open }));
  main.append(section);
}
main.append(LinkCard('View details', '#details'), SelectionCard('Choose item'));
main.append(Text('Details', 'body')); main.lastElementChild!.id = 'details';
document.body.append(modal.element);
