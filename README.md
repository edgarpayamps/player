# Alchemy Player prototype

Clickable prototype of the Alchemy Player redesign (group training on a facilitator laptop), built from the
"Alchemy Player Redesign" and "In-App Notifications" Figma files.

Plain HTML, CSS and JavaScript with no build step and no dependencies. Fonts and icons load from Google Fonts.

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Screens (hash routes)

`#home` (also `#home-ready`, `#home-paused`, `#home-offline`), `#sessions`, `#select-activities`,
`#add-employees`, `#preview`, `#training`, `#results`.

All data, timers, badge lookups and remote responses are simulated in `player.js`.

## Deploy

Netlify serves the repository root as-is (see `netlify.toml`). Every push to `main` redeploys.
