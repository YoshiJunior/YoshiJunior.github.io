/**
 * Cloaking utility for opening games in about:blank tabs with full-screen iframes.
 * This allows games to run without showing the actual game URL in the address bar.
 */

/**
 * Opens a URL in a cloaked about:blank tab with a full-screen iframe.
 * @param {string} url - The relative or absolute URL of the game to open
 * @param {string} title - The title for the cloaked tab
 */
function openCloaked(url, title) {
    // Convert to absolute URL since about:blank has no base URL
    const absoluteUrl = new URL(url, location.href).href;

    // Open about:blank in a new tab
    const popup = window.open('about:blank', '_blank');

    if (!popup) {
        alert('Popups are blocked. Please allow popups for this site to open the game.');
        return false;
    }

    // Set the title
    popup.document.title = title;

    // Inject styles and iframe
    popup.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                html, body { height: 100%; width: 100%; overflow: hidden; }
                body { background: #000; }
                iframe {
                    border: 0;
                    width: 100%;
                    height: 100%;
                    display: block;
                }
            </style>
        </head>
        <body>
            <iframe
                src="${absoluteUrl}"
                allow="fullscreen; autoplay; gamepad"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-downloads allow-modals allow-orientation-lock">
            </iframe>
        </body>
        </html>
    `);
    popup.document.close();

    return true;
}

/**
 * Checks if a URL is a game URL (internal to this site).
 * @param {string} url - The URL to check
 * @returns {boolean} - True if it's a game URL
 */
function isGameUrl(url) {
    if (!url) return false;

    // Handle relative URLs
    try {
        const parsed = new URL(url, location.href);
        const origin = location.origin;

        // Must be same origin
        if (parsed.origin !== origin) return false;

        // Check if it's a game path
        const pathname = parsed.pathname;

        // Game URLs are under /titles/ or are specific game HTML files
        return pathname.startsWith('/titles/') ||
               pathname.match(/^\/[^/]+\.html$/);
    } catch {
        return false;
    }
}

/**
 * Extracts a game title from a game card element.
 * @param {Element} card - The game card element
 * @returns {string} - The game title
 */
function getGameTitle(card) {
    const titleEl = card.querySelector('h3');
    if (titleEl) return titleEl.textContent.trim();

    // Fallback: try to get from alt text of image
    const img = card.querySelector('img');
    if (img && img.alt) return img.alt.trim();

    // Fallback: extract from URL
    const url = card.getAttribute('data-url');
    if (url) {
        const match = url.match(/\/([^/]+)\.html$/);
        if (match) return match[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    return 'Game';
}

/**
 * Sets up delegated click handler for game cards on a page.
 * Call this on pages that list games (like home.html).
 */
function setupGameCardCloaking() {
    document.addEventListener('click', function(event) {
        // Find the closest game card
        const card = event.target.closest('.game-card');
        if (!card) return;

        const url = card.getAttribute('data-url');
        if (!url) return;

        // Prevent default navigation (game cards don't have href, but just in case)
        event.preventDefault();

        // Get title
        const title = getGameTitle(card);

        // Check if it's a game URL (same-origin) - use cloaking
        if (isGameUrl(url)) {
            openCloaked(url, title);
        } else {
            // External URL - open in new tab normally
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }, true); // Use capture phase to intercept before other handlers
}

// Auto-setup if game cards exist on the page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupGameCardCloaking, { once: true });
} else {
    setupGameCardCloaking();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { openCloaked, isGameUrl, getGameTitle, setupGameCardCloaking };
}