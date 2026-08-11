# Generative Explainable AI in Education — survey companion

Single self-contained HTML page. 47 papers, seven research questions,
nine coded dimensions.

## What this folder is

Drop `genai-xai/` into a GitHub Pages site and it serves at
`https://<user>.github.io/genai-xai/`. Nothing else is required — no build
step, no dependencies, no network requests at runtime.

## Before publishing

Edit the `BUILD` block near the bottom of `index.html` if you want a citation
line, and confirm the title/subtitle read as you want them.

## Jekyll notes

If the host site runs Jekyll (academicpages, al-folio, minimal-mistakes):

- **Do not add YAML front matter** (`---`) to `index.html`. Without it Jekyll
  copies the file verbatim, which is what you want. With it, Jekyll wraps the
  file in the site layout and injects a second `<html>` element.
- **Do not place this folder inside a directory beginning with `_`**
  (e.g. `_pages/`). Jekyll treats those as source, not output.

Verified: the file contains no Liquid syntax (`{{` or `{%`), so a Jekyll build
cannot fail because of it.
