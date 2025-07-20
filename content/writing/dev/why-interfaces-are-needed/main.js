function showDetail(liElement) {
  const screen = liElement.closest('.typical-screen');
  const detail = screen.querySelector('.navigation-detail');
  const list = screen.querySelector('.list');

  const title = liElement.textContent.trim();

  detail.classList.add('shown');
  list.classList.add('shown');

  detail.querySelector('.title').textContent = title;
  detail.querySelector('.content').textContent = title;
}

function hideDetail(button) {
  const screen = button.closest('.typical-screen');
  const detail = screen.querySelector('.navigation-detail');
  const list = screen.querySelector('.list');

  detail.classList.remove('shown');
  list.classList.remove('shown');
}

document.querySelectorAll('.component-slot').forEach(slot => {
  const template = document.getElementById('screen-template');
  const clone = template.content.cloneNode(true);

  const title = slot.dataset.title || 'Untitled';
  const items = (slot.dataset.items || '').split(',').map(item => item.trim());

  clone.querySelector('.navigation-title').textContent = title;

  const ul = clone.querySelector('ul');

  items.forEach(text => {
    const li = document.createElement('li');
    li.textContent = text;
    li.onclick = () => showDetail(li);
    ul.appendChild(li);
  });

  slot.replaceWith(clone);
});

// Tabbar logic

function switchTab(el, index) {
  const tabs = document.querySelectorAll('.tabbar .tab');
  tabs.forEach(t => t.classList.remove('active'));
  el.classList.add('active');

  const slots = document.querySelectorAll('.screen');
  slots.forEach(s => s.classList.remove('active'));
  if (slots[index]) slots[index].classList.add('active');
}
