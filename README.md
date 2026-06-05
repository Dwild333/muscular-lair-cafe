# Muscular Lair · Café Counter

A clean, modern point-of-sale and tracker for **Muscular Lair**, a strength-cafe/gym in Thailand. Built as a fully client-side app — no backend, no build step — it runs anywhere static files are served.

## Features

- **Register** — tap-to-build POS. Drinks open a flavor + add-ons modal; **À la carte** is a component plate builder with live-totaling steppers; **Custom item** handles anything off-menu (with a *save to catalog* toggle). Every ticket stamps payment (cash/QR), status (paid/open tab), customer, and who logged it.
- **Ledger** — a notebook-style transaction log with gross/cash/QR/open-tab tallies, staff filter, and search.
- **Open tabs** — a dedicated settle-later view with one-tap Cash/QR/Settle.
- **Customers** — saved regulars with name autocomplete at the register, per-customer spend, visit counts, and usual order. Add new customers on the fly.
- **Summary** — Day · Week · Month · Year reporting with a trend chart, sales-by-category breakdown (Drinks / Food / Snacks), top items, and export.
- **Catalog** — manage drinks, food, snacks, à la carte, add-ons, and flavors; tap a price to edit it instantly.
- **Settings** — full **English / ไทย** switch (with a quick top-bar toggle), three themes (Fresh / Iron / Clay), and compact/roomy density.

## Tech

Static `index.html` loading React 18 + Babel Standalone from CDN, with the app split into JSX modules under `app/`. Type pairing: Space Grotesk (display) + Hanken Grotesk (UI, tabular numerals) + IBM Plex Sans Thai.

## Run locally

```bash
python3 -m http.server 4321
# open http://localhost:4321
```

## Notes

This is a prototype handed off from [Claude Design](https://claude.ai/design) — data resets on refresh, and menu/prices/customers are placeholders to be replaced with the owners' real data.
