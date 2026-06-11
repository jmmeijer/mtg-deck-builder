# MTG Deck Builder

A lightweight browser app for building and testing a Magic: The Gathering deck candidate pool.

The current version is themed around **The Rotwood Accord**: a Golgari Elf/Squirrel Commander candidate board powered by Scryfall data.

## What it does

- Shows cards in four working sections: **Main V1 Pool**, **Maybeboard**, **Modules / Combo Packages**, and **Cut / Avoid**.
- Loads card images, mana costs, type lines, Oracle text, set data, and Scryfall links from the Scryfall API.
- Lets you drag cards between sections.
- Lets you search Scryfall and add cards directly to the board.
- Supports fuzzy quick-add by card name.
- Saves progress locally in the browser with `localStorage`.
- Supports JSON export and import so a board state can be backed up or shared.
- Registers a service worker that caches the app shell, Scryfall API responses, and card images.

## Running locally

No build step is needed. This is currently a static HTML app.

```bash
# From the repository root
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

You can also open `index.html` directly in a browser, but service workers require a secure context or localhost. For testing offline/image caching, use a local server or GitHub Pages.

## Current structure

```text
.
├── index.html        # HTML shell and critical first-paint CSS
├── css/
│   └── styles.css    # Non-critical app styling
├── js/
│   └── script.js     # App state, rendering, Scryfall calls, import/export, events
├── sw.js             # Service worker for app/Scryfall/image caching
└── README.md         # Project documentation
```

## Service worker caching

The service worker uses:

- cache-first for local app files
- network-first for Scryfall API responses
- cache-first for Scryfall image files

This should make repeated card browsing much faster and reduce duplicate image downloads. It does not replace the browser `localStorage` board state; JSON export is still the safest backup.

## Suggested next improvements

### 1. Improve drag ordering

The board currently supports moving cards between sections. A useful next improvement is order-preserving drag/drop within a section, so cards can be ranked manually.

### 2. Add deck-analysis features

Useful deck-builder metrics:

- mana curve
- color identity check
- Commander legality warnings
- banned-card warning
- land count
- creature / removal / ramp / draw / protection counts
- average mana value
- duplicate detection
- tags for roles such as ramp, draw, sacrifice outlet, token maker, finisher, recursion, protection, removal

### 3. Improve persistence

Current state is saved in browser `localStorage`. That is fine for a prototype, but fragile.

Future options:

- keep local JSON import/export as the simple baseline
- add named saved boards
- add shareable compressed deck-state URLs
- optionally add GitHub Gist export/import later

### 4. Prepare GitHub Pages deployment

This app is a good fit for GitHub Pages because it is static.

Suggested steps:

1. Keep `index.html` and `sw.js` in the repository root.
2. Enable GitHub Pages for the `main` branch.
3. Add the live URL to this README.

## Development notes

The app uses the public Scryfall API from the browser. There is no backend and no API key in this project.

Because the deck state is stored locally in the browser, clearing site data or switching browsers/devices will remove local progress unless the board has been exported as JSON first.

## Project direction

The strongest direction for this project is not just “a card list with pictures,” but a practical deck-building workbench:

- candidate board first
- deck legality checker second
- synergy and role analysis third
- export to common deck formats later

That keeps the app useful while avoiding the classic hobby-project trap: trying to become Scryfall, EDHREC, Moxfield, Archidekt, and a toaster at the same time.
