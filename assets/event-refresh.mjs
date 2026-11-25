import {upcomingEvents} from './event-model.mjs';
import {renderEventCard} from './event-rendering.mjs';

// Keep live nodes (and their focus/disclosure state) until their content changes.
export function createEventReconciler(list, language, translations) {
  // CMS owns this list after initialization; discard any file-catalog fallback
  // once, before tracking CMS nodes. Subsequent refreshes reconcile in place.
  for (const child of [...list.children]) child.remove();
  const cards = new Map();
  return (records, {homepage = false, now = new Date()} = {}) => {
    const events = upcomingEvents(records, now, {includeCancelled: !homepage});
    const retained = new Set(events.map(event => event.id));
    for (const [id, card] of cards) {
      if (!retained.has(id)) {card.node.remove(); cards.delete(id);}
    }
    for (const [index, event] of events.entries()) {
      const html = renderEventCard(event, language, translations);
      let card = cards.get(event.id);
      if (!card || card.html !== html) {
        const template = list.ownerDocument.createElement('template');
        template.innerHTML = html;
        const node = template.content.firstElementChild;
        if (card) {
          const previousDetails = card.node.querySelector('details');
          const nextDetails = node.querySelector('details');
          if (previousDetails && nextDetails) nextDetails.open = previousDetails.open;
          card.node.replaceWith(node);
        }
        card = {html, node};
        cards.set(event.id, card);
      }
      if (list.children[index] !== card.node) {
        const focus = list.ownerDocument.activeElement;
        const restoreFocus = card.node.contains(focus);
        list.insertBefore(card.node, list.children[index] || null);
        if (restoreFocus) focus.focus({preventScroll: true});
      }
    }
  };
}
