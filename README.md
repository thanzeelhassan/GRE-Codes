# GRE-Codes
GRE codes for various institutes

# GRE Institution & Department Codes

A simple static website to browse GRE reporting codes by country and, for the United States, by state.

## Run locally

- Open `index.html` directly in your browser, or serve the folder with any static server.
- If your browser blocks `fetch` from local files, use a local server:
  - Python: `python -m http.server 8080`
  - Node: `npx serve --single --listen 8080`
  - Then visit `http://localhost:8080`.

## Data

Data lives in `data/codes.json` and follows this shape:

```json
{
  "countries": [
    { "code": "US", "name": "United States", "hasStates": true }
  ],
  "regionsByCountry": {
    "US": [ { "code": "CA", "name": "California" } ]
  },
  "institutions": [
    { "country": "US", "region": "CA", "code": "3354", "name": "Academy of Art U" }
  ]
}
```

- Add countries to `countries`. Set `hasStates` to `true` if the country requires a second-level region filter.
- List regions/states under `regionsByCountry[COUNTRY_CODE]`.
- Add institutions to `institutions` with fields:
  - `country`: ISO-like country code matching `countries[].code`
  - `region`: optional; required when the country has states/regions
  - `code`: GRE institution/department code as a string
  - `name`: display name

## Deploy (GitHub Pages)

1. Commit and push this repository to GitHub.
2. In the repo Settings → Pages:
   - Source: Deploy from a branch
   - Branch: `main` (or `master`) → `/ (root)` → Save
3. Your site will publish at `https://<your-username>.github.io/<repository-name>/`.

If you deploy under a subpath, no changes are needed because all asset paths are relative.

## Notes

- Copy a code by clicking on it in the table.
- For countries without states, only the country dropdown is shown.