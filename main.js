const searchInput = document.querySelector('.search-bar');

if (searchInput) {
  const gameCards = Array.from(document.querySelectorAll('.game-card'));
  const noResultsMessage = document.getElementById('noResultsMessage');
  const initialQuery = new URLSearchParams(window.location.search).get('search') || '';

  searchInput.value = initialQuery;

  const filterGames = query => {
    const normalizedQuery = query.trim().toLowerCase();
    let resultsFound = false;

    gameCards.forEach(card => {
      const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const matches = title.includes(normalizedQuery);
      card.style.display = matches ? '' : 'none';
      if (matches) resultsFound = true;
    });

    if (noResultsMessage) {
      noResultsMessage.style.display = normalizedQuery && !resultsFound ? 'flex' : 'none';
    }
  };

  if (gameCards.length) {
    filterGames(initialQuery);
    searchInput.addEventListener('input', () => filterGames(searchInput.value));
  } else {
    searchInput.addEventListener('keydown', event => {
      const query = searchInput.value.trim();
      if (event.key === 'Enter' && query) {
        window.location.href = `index.html?search=${encodeURIComponent(query)}`;
      }
    });
  }
}

const announcementOverlay = document.getElementById('announcement-overlay');
const announcementExit = document.getElementById('announcement-exit');

if (announcementOverlay && announcementExit) {
  announcementExit.addEventListener('click', () => {
    announcementOverlay.style.display = 'none';
  });
}
