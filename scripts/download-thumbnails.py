"""Retrieve public thumbnails only; never download the original video files."""
import concurrent.futures
import json
from pathlib import Path
from urllib.request import Request, urlopen

root = Path(__file__).resolve().parent.parent
inventory = json.loads((root / 'content/drive-videos.json').read_text(encoding='utf-8'))

def download(file):
    target = root / 'public' / 'assets' / ('drive-' + file['id'] + '.jpg')
    if target.exists():
        return file['title']
    request = Request('https://drive.google.com/thumbnail?id=' + file['id'] + '&sz=w1000', headers={'User-Agent': 'Mozilla/5.0'})
    with urlopen(request, timeout=45) as response:
        if not response.headers.get('Content-Type', '').startswith('image/'):
            raise ValueError('Thumbnail endpoint did not return an image: ' + file['title'])
        image = response.read()
    if not image:
        raise ValueError('Empty thumbnail: ' + file['title'])
    target.write_bytes(image)
    return file['title']

with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    for title in pool.map(download, inventory['files']):
        print('Thumbnail ready:', title, flush=True)
