# Portfolio sources

This portfolio was assembled on 1 November 2026 from the three links supplied by the user.

| Collection | Source | Included video records |
| --- | --- | ---: |
| Recent work | [Google Drive folder](https://drive.google.com/drive/folders/1OVBoUsmGwxdpdvaNiiuj3IwnyG2YIvOS) | 46 |
| Studio archive | [Google Drive folder](https://drive.google.com/drive/folders/1XfxZksvCKHHjooAOz_fha2iaS-8BdAlZ) | 54 |
| Behance selection | [Videographer Portfolio 2026](https://www.behance.net/gallery/253951715/VIDEOGRAPHER-PORTFOLIO-2026) | 21 |

## Coverage and naming

The catalog contains all **121 source video records**, each with a distinct original Drive or YouTube ID. The archive was traversed through its `WALKTHROUGH`, `PRODUCT`, and `PRESENTATION` subfolders. Distinct files, alternate exports, and the same work published on another platform are retained. Therefore 121 records does not assert 121 distinct productions.

`public/catalog.js` defines `window.FILMS`. Each entry retains its original title and source URL. Readable display titles remove file extensions and production filename clutter while preserving numbered versions and alternate exports. Unclear camera filenames remain identifiable, for example `Product study · C2581`. Categories are editorial groupings based on filenames, original folder labels, and visible thumbnail subjects, and can be corrected in the owner editor. No running times, client relationships, credits, outcomes, awards, or production dates have been invented.

`build-catalog.py` regenerates the catalog from the local research files in the workspace `tmp` directory: `shivad-drive-recent-enriched.json`, `shivad-drive-archive.json`, and `shivad-behance.json`. Run it with Python 3. It checks collection counts, unique IDs, nonempty titles, HTTPS links, and the existence of every thumbnail. The generated catalog is committed with the site, so serving the site requires no Python runtime or research files.

## Identity

The Behance project identifies its owner as **Shivad S R**, located in **Kozhikode, India**, and identifies the work as videography and video editing. Its author profile is [Shivad S R on Behance](https://www.behance.net/shadowgaming56). YouTube's public oEmbed metadata for all 21 embedded videos identifies the channel as [Shivad SR](https://www.youtube.com/@Neemushivad). No email address or telephone number was verified.

## Video and image handling

Videos remain hosted at their original Google Drive or YouTube locations. The website uses their embedded players and links to their original pages. Access, playback availability, processing status, and geographic or account restrictions remain controlled by those providers and the source owner.

The local artwork consists of authentic thumbnails for the supplied videos. Drive thumbnails were retrieved from their public thumbnail endpoints. YouTube thumbnail URLs came from public oEmbed metadata; seven featured images also have available 1280 × 720 `maxresdefault` versions. Filenames are `assets/drive-ID.jpg`, `assets/youtube-ID.jpg`, and, where available, `assets/youtube-ID-large.jpg`. The catalog prefers the larger YouTube variant when present.

No Drive sharing permissions were changed, and no source videos were downloaded or republished. Source inventories may report shared files, but that alone does not guarantee anonymous video playback. This file contains no credentials or private access tokens.

## November redesign and editing

The hero artwork `public/assets/shivad-hero.png` is the image supplied by the user. Its black, deep-red, and monochrome direction is carried through the film gallery and owner editor.

The site uses the Sites Vinext Worker starter with a D1 `DB` binding. `portfolio_state` stores a single ordered collection of the existing 121 video IDs, each with category, hidden, and featured flags. Migrations are in `drizzle/`. The original videos are never deleted by the editor. Hidden entries can be restored.

The server authorizes writes only for an authenticated visitor whose email matches the verified Site owner account. The local starter mock identity is mapped to that account only during development; this branch is absent from production. The owner-private hosting policy remains in place. A same-origin check, strict payload validation, and atomic revision comparison protect writes. Concurrent stale edits receive a conflict instead of overwriting newer changes.

The page and assets, local D1 save/reload, reorder, hide/restore, category update, authenticated authorization, forged-header rejection, and stale-save behavior were checked. The production build and eight backend tests passed. Automated visual browser QA could not be completed because the browser connection was unavailable. Embedded Drive/YouTube playback remains subject to the original provider and network permissions.
