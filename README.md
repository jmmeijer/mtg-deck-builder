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

You can also open `index.html` directly in a browser, but using a local server is closer to how it will behave when hosted.

## Current structure

```text
.
├── index.html   # App, styles, seed data, and JavaScript logic
└── README.md    # Project documentation
```

At the moment, the app intentionally lives in one file. That keeps it easy to test and easy to publish through GitHub Pages, but it also means the next serious improvement should be splitting it into smaller files.

## Suggested next improvements

### 1. Split the single file

Move the current inline code into:

```text
src/
├── app.js
├── scryfall.js
├── storage.js
├── render.js
├── deck-data.js
└── styles.css
```

This will make bugs easier to find and future features less painful. Right now `index.html` is doing everything: layout, styling, seed data, state handling, API calls, rendering, modal logic, import/export, and drag/drop. That works, but it will become spaghetti with extra cheese if the project grows.

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

### 4. Add a manual test checklist

Before changing logic, document basic checks:

- load default board
- load Scryfall data
- add card by fuzzy name
- search Scryfall and add result
- drag card between sections
- export JSON
- import JSON
- reset board
- test mobile layout
- test modal open/close

### 5. Prepare GitHub Pages deployment

This app is a good fit for GitHub Pages because it is static.

Suggested steps:

1. Keep `index.html` in the root or configure Pages to serve from `/docs`.
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
