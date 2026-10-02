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

const captchaStorageKey = 'yoshis-site-verified';
let captchaVerified = false;

try {
  captchaVerified = window.localStorage.getItem(captchaStorageKey) === 'true';
} catch {
  captchaVerified = false;
}

if (!captchaVerified) {
  const showCaptcha = () => {
    const captchaStyles = document.createElement('style');
    captchaStyles.textContent = `
      .captcha-dialog {
        width: min(360px, calc(100vw - 32px));
        box-sizing: border-box;
        padding: 20px;
        border: 1px solid #d6d6d6;
        border-radius: 3px;
        color: #202124;
        background: #fafafa;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        font: 14px/1.4 Arial, sans-serif;
      }
      .captcha-dialog::backdrop {
        background: linear-gradient(145deg, #000, #202020);
      }
      .captcha-dialog h1 {
        margin: 0 0 14px;
        font-size: 15px;
        font-weight: 500;
      }
      .captcha-checkbox {
        position: relative;
        display: flex;
        min-height: 56px;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border: 1px solid #d3d3d3;
        border-radius: 2px;
        background: #fff;
        cursor: pointer;
      }
      .captcha-input {
        position: absolute;
        width: 1px;
        height: 1px;
        opacity: 0;
      }
      .captcha-input:focus-visible + .captcha-box {
        outline: 2px solid #1a73e8;
        outline-offset: 3px;
      }
      .captcha-box {
        display: grid;
        flex: 0 0 26px;
        width: 26px;
        height: 26px;
        place-items: center;
        box-sizing: border-box;
        border: 2px solid #777;
        border-radius: 2px;
        background: #fff;
        transition: background-color 160ms ease, border-color 160ms ease;
      }
      .captcha-mark {
        width: 18px;
        height: 18px;
        fill: none;
        stroke: #fff;
        stroke-dasharray: 24;
        stroke-dashoffset: 24;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-width: 3;
      }
      .captcha-spinner {
        display: none;
        width: 17px;
        height: 17px;
        box-sizing: border-box;
        border: 2px solid #d6e2f5;
        border-top-color: #1a73e8;
        border-radius: 50%;
      }
      .captcha-label {
        flex: 1;
        font-size: 14px;
      }
      .captcha-badge {
        color: #5f6368;
        font-size: 10px;
        line-height: 1.2;
        text-align: center;
      }
      .captcha-status {
        min-height: 17px;
        margin: 8px 0 0 50px;
        color: #5f6368;
        font-size: 12px;
      }
      .captcha-checkbox.is-verifying {
        cursor: wait;
      }
      .captcha-checkbox.is-verifying .captcha-mark {
        display: none;
      }
      .captcha-checkbox.is-verifying .captcha-spinner {
        display: block;
        animation: captcha-spin 700ms linear infinite;
      }
      .captcha-checkbox.is-verified .captcha-box {
        border-color: #188038;
        background: #188038;
        animation: captcha-pop 220ms ease-out;
      }
      .captcha-checkbox.is-verified .captcha-mark {
        stroke-dashoffset: 0;
        transition: stroke-dashoffset 240ms ease 60ms;
      }
      @keyframes captcha-spin {
        to { transform: rotate(360deg); }
      }
      @keyframes captcha-pop {
        50% { transform: scale(1.15); }
      }
      @media (prefers-reduced-motion: reduce) {
        .captcha-checkbox *, .captcha-checkbox::before {
          animation-duration: 0.01ms !important;
          transition-duration: 0.01ms !important;
        }
      }
      @media (max-width: 480px) {
        .captcha-dialog { padding: 24px; }
      }
    `;

    const captchaDialog = document.createElement('dialog');
    captchaDialog.className = 'captcha-dialog';
    captchaDialog.setAttribute('aria-labelledby', 'captcha-title');
    captchaDialog.innerHTML = `
      <h1 id="captcha-title">Verify you are human</h1>
      <label class="captcha-checkbox">
        <input class="captcha-input" type="checkbox" autocomplete="off">
        <span class="captcha-box" aria-hidden="true">
          <svg class="captcha-mark" viewBox="0 0 20 20"><path d="M3.5 10.5 8 15l8.5-9"></path></svg>
          <span class="captcha-spinner"></span>
        </span>
        <span class="captcha-label">I'm not a robot</span>
        <span class="captcha-badge" aria-hidden="true">SECURITY<br>CHECK</span>
      </label>
      <p class="captcha-status" aria-live="polite"></p>
    `;

    document.head.append(captchaStyles);
    document.body.append(captchaDialog);
    captchaDialog.addEventListener('cancel', event => event.preventDefault());
    const captchaCheckbox = captchaDialog.querySelector('.captcha-checkbox');
    const captchaInput = captchaDialog.querySelector('.captcha-input');
    const captchaStatus = captchaDialog.querySelector('.captcha-status');

    captchaInput.addEventListener('change', event => {
      if (!event.currentTarget.checked) return;

      captchaInput.disabled = true;
      captchaCheckbox.classList.add('is-verifying');
      captchaStatus.textContent = 'Verifying...';

      window.setTimeout(() => {
        captchaCheckbox.classList.remove('is-verifying');
        captchaCheckbox.classList.add('is-verified');
        captchaStatus.textContent = 'Verified';

        try {
          window.localStorage.setItem(captchaStorageKey, 'true');
        } catch {}

        window.setTimeout(() => {
          captchaDialog.close();
          captchaDialog.remove();
        }, 320);
      }, 700);
    });
    captchaDialog.showModal();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showCaptcha, { once: true });
  } else {
    showCaptcha();
  }
}
