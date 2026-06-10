# Manual testing checklist

Use this checklist before merging changes that touch `index.html`, board state, storage, Scryfall loading, import/export, or drag-and-drop behavior.

## Smoke test

- [ ] Open the app in a browser.
- [ ] The page loads without console errors.
- [ ] The four board sections are visible.
- [ ] Default seed cards appear on the board.
- [ ] The stats pills show totals for all sections.

## Scryfall data

- [ ] Click **Load Scryfall data**.
- [ ] Card images start appearing.
- [ ] Mana costs and type lines appear on cards.
- [ ] Failed cards show a readable error instead of breaking the app.
- [ ] Clicking a card opens the detail modal.
- [ ] The modal shows Oracle text when Scryfall data is loaded.
- [ ] **Open on Scryfall** opens the correct external page.

## Search and add

- [ ] Search Scryfall with a broad term such as `squirrel`.
- [ ] Results are displayed.
- [ ] Add a result to **Main**.
- [ ] Add a result to **Maybe**.
- [ ] Add a result to **Module**.
- [ ] Duplicate cards are rejected with a readable message.
- [ ] Use fuzzy quick-add with a partial or slightly imperfect card name.

## Board interaction

- [ ] Drag a card from Main to Maybeboard.
- [ ] Drag a card from Maybeboard to Modules.
- [ ] Drag a card to Cut / Avoid.
- [ ] Section counts update after moving cards.
- [ ] Filter by card name.
- [ ] Filter by section.
- [ ] Stack and unstack a section.

## Modal behavior

- [ ] Open a card modal.
- [ ] Move the card to another section from the modal.
- [ ] Close the modal with the close button.
- [ ] Close the modal by clicking outside it.
- [ ] Close the modal with the Escape key.
- [ ] Delete a card from the modal after confirming.

## Import and export

- [ ] Export the board as JSON.
- [ ] Reset the board.
- [ ] Import the exported JSON.
- [ ] Imported cards, sections, loaded Scryfall data, and UI stack state are restored.
- [ ] Invalid JSON shows a readable error.

## Persistence

- [ ] Move at least one card to another section.
- [ ] Refresh the page.
- [ ] The changed board state is still present.
- [ ] Reset clears local changes and restores the default seed board.

## Responsive layout

- [ ] Test desktop width.
- [ ] Test tablet width.
- [ ] Test mobile width.
- [ ] Cards remain usable on mobile.
- [ ] Toolbar controls do not overlap on mobile.
- [ ] Modal remains readable on mobile.
