# Shivad film portfolio

## Deploy to GitHub Pages

The `docs/` folder contains the ready-to-publish static site with all 35 video
records, thumbnails, the hero image, search, filters, and embedded video players.
No dependency installation or build service is needed to publish this folder.

The current collection contains only the 35 videos in the selected
[Drive folder](https://drive.google.com/drive/folders/14TMakhjd32Dm0MtW4FImvljjJsg99cB3).
`content/drive-videos.json` is its verified inventory. Run
`node scripts/refresh-catalog.mjs` after changing that inventory, retrieve new
thumbnails with `python scripts/download-thumbnails.py`, then rebuild Pages.

1. Open this repository's **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Select the **main** branch and **/docs** folder, then click **Save**.

GitHub Pages URL after deployment: <https://rohanrhz22.github.io/shivad-portfolio/>.

To update the Pages site, edit `content/index.html` or files in `public/`, run
`npm run build:pages` and `npm run check:pages`, and commit the updated source
and `docs/` folder. These commands require Node.js but no installed packages.
Run `python -m http.server 4174` from the repository root and open
`http://127.0.0.1:4174/docs/` to preview the published files locally.

### Rearrange or remove films on GitHub Pages

1. Open the page and choose **Manage videos** in the footer.
2. Drag rows or use **↑ / ↓** to rearrange. Choose **Remove** to hide a film.
   Enable **Show removed**, then choose **Restore** to bring it back.
3. Choose **Save preview** to keep the changes in this browser.
4. To update the public site, choose **Download layout**, then expand
   **Publish for everyone** and open its GitHub upload link.
5. Upload the downloaded `collection.json` into the repository's `docs/`
   folder, replacing the existing file, and commit to `main`. GitHub Pages
   publishes the updated collection after deployment completes.

Anyone can preview their own layout, but publishing requires repository access.
No original Drive or YouTube video is deleted. **Use published layout** clears
the browser preview. A new published collection automatically supersedes an
older saved browser preview.

GitHub Pages serves a static collection snapshot from `docs/collection.json`.
The builder preserves that file when rebuilding; `content/collection.json`
seeds the first export when no published snapshot exists.
A `null` state uses the bundled catalog's default ordering and selection.
To curate the snapshot manually, set `state.items` to all catalog IDs in the
desired order, with `id`, `category`, `hidden`, and `featured` on each item.
The export validates the complete collection and allows up to six visible
featured films. Rebuild and push to publish changes.

The server-backed source is also retained in this repository. Owner sign-in,
database saves, and direct editing across devices require its original Sites/Workers
hosting. The Pages editor uses browser storage and downloadable layouts instead. Changes made on the hosted
site do not automatically update the static snapshot. Video playback still
depends on the original Google Drive and YouTube sharing permissions.

## Editing the collection

Open the hosted site while signed in with the portfolio owner account. Select **Manage portfolio** in the footer.

- Drag a row, or use its up/down arrows to rearrange videos.
- Choose a category for each video.
- Check **Selected** for up to six films in the opening selection.
- Choose **Remove** to hide a video. Enable **Show removed** and choose **Restore** to bring it back.
- Select **Save changes** to update the hosted collection across devices.

Removal does not delete the original video. Unsaved edits are not published. If another device saves first, reload the latest saved collection before editing again.

## Development

### In-page video playback

`public/playback-sources.js` maps the existing Drive catalog IDs to unlisted
YouTube video IDs. Keep the Drive IDs in the catalog and collection so published
layouts and saved browser previews retain their order, categories, and selection.
Add a mapping only after YouTube has finished SD processing and the video is
unlisted and playable. Mapped videos use the in-page YouTube player on mobile
and desktop; unmapped Drive videos keep their existing fallback.

After editing a mapping, run `npm run build:pages` and `npm run check:pages`,
then publish the generated `docs` files. Check actual embedded playback as well
as the mobile layout; resizing a desktop Drive iframe alone does not reproduce
Android's Drive controls.

The authored page is `content/index.html`; scripts, styling, and images are in `public/`. The API route uses `server/portfolio.mjs` and the D1 schema in `db/schema.ts`. The site identity and logical database binding are preserved in `.openai/hosting.json`.

Run `npm run dev` for the local preview after applying the generated local database migration. Run `node --test tests/portfolio.test.mjs` for backend checks. `node tests/preview-check.mjs` exercises the running local preview and restores its previous collection state. Use the Sites build and source-workflow helpers to package and publish.

## Windows preview without the Workers runtime

Run `npm run dev:preview`, then open `http://127.0.0.1:5173`.
This uses Node only and displays the bundled 35-video collection, search,
filters, and video players. Refresh the browser after editing files.
It is a read-only preview: it does not load the hosted collection's saved edits
or enable owner controls. Use `npm run dev` for the full authenticated editor
and local database workflow on a supported Workers runtime.
