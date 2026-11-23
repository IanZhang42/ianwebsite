// The full collections are present in HTML so links and browser search work without JavaScript.
for (const list of document.querySelectorAll('[data-filter-list]')) {
  const buttons = [...list.querySelectorAll('button[data-filter]')];
  const items = [...list.querySelectorAll('[data-filter-item]')];
  const input = list.querySelector('[data-filter-search]');
  const count = list.querySelector('[data-result-count]');
  const empty = list.querySelector('[data-empty-results]');
  const groups = [...list.querySelectorAll('[data-filter-group]')];
  let selected = buttons.find(button => button.getAttribute('aria-pressed') === 'true')?.dataset.filter || 'all';

  function update() {
    const query = (input?.value || '').trim().toLocaleLowerCase();
    let matches = 0;
    for (const item of items) {
      const match = (selected === 'all' || item.dataset.filterItem.split(/\s+/).includes(selected)) &&
        (!query || item.textContent.toLocaleLowerCase().includes(query));
      item.hidden = !match;
      if (match) matches += 1;
    }
    for (const group of groups) group.hidden = !group.querySelector('[data-filter-item]:not([hidden])');
    if (count) count.textContent = matches + ' ' + (matches === 1 ? count.dataset.singular : count.dataset.plural);
    if (empty) empty.hidden = matches > 0;
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.filter === selected));
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      selected = button.dataset.filter;
      update();
    });
  }
  input?.addEventListener('input', update);
  update();
}
