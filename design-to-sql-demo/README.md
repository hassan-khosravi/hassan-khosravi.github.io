# Whisker Haven — relational database teaching demo

Two self-contained pages (no build step, no server, no dependencies):

- `index.html` — the walkthrough: universe of discourse → ER diagram → (7+1) mapping steps → live SQL
- `portal.html` — the finished adoption website, with a study panel showing the SQL behind every page

SQLite runs inside the browser (WebAssembly, embedded in each file), so every query
works on GitHub Pages as-is. The database resets on each page load.

## Publish on GitHub Pages
1. Push this folder to a repository.
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)` → Save.
3. Open `https://<username>.github.io/<repo>/` (the walkthrough) — the button on it opens `portal.html`.

Animal photos via Pixabay (free licence).
