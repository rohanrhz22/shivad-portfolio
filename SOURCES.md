# Current portfolio collection

The user selected one replacement Google Drive folder on 5 November 2026:
[Selected portfolio](https://drive.google.com/drive/folders/14TMakhjd32Dm0MtW4FImvljjJsg99cB3).

The folder listing contains 35 video files and no subfolders. The catalog
contains exactly those 35 original Drive IDs. The previous 121 entries and their
thumbnail assets have been removed from the current website. Original videos
in Google Drive have not been deleted or modified.

content/drive-videos.json records the verified filenames, video MIME types,
file IDs, and source URLs. Run node scripts/refresh-catalog.mjs (or python
build-catalog.py) after updating it. The builder preserves curation when folder
membership stays the same and resets it when the collection changes.

Readable titles and categories retain previous editorial labels when filenames
match; otherwise the original filename is used without its extension. Unclear
filenames remain identifiable. Categories can be changed in the manager.

scripts/download-thumbnails.py retrieves public Drive thumbnails for these IDs.
It never downloads the original video files. The hero image remains the image
supplied by the user. No artificial video imagery is used.

Playback uses each new file's Google Drive embedded player. Access, playback,
and any account restrictions are controlled by the original provider and file
owner. No Drive sharing permissions were changed.

Behance and YouTube links remain profile links; their former video collections
are no longer included in the gallery or source collection links.