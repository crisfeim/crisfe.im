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
