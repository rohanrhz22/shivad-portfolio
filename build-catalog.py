"""Compatibility entrypoint for the current, single-folder catalog builder."""
from pathlib import Path
import subprocess
subprocess.run(['node', str(Path(__file__).resolve().parent / 'scripts/refresh-catalog.mjs')], check=True)