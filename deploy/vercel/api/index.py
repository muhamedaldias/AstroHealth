"""Vercel serverless entrypoint for the AstroHealth API.

Fixture and OSDR data ship under vendor/data; the env-var defaults below point the app at them.
"""

import os
import sys

_VENDOR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "vendor")
if _VENDOR not in sys.path:
    sys.path.insert(0, _VENDOR)

_DATA = os.path.join(_VENDOR, "data")
os.environ.setdefault("BONETWIN_FIXTURES_DIR", os.path.join(_DATA, "fixtures"))
os.environ.setdefault("BONETWIN_OSDR_DIR", os.path.join(_DATA, "osdr"))

from bonetwin_api.main import create_app  # noqa: E402  (must follow the sys.path bootstrap)

app = create_app()
