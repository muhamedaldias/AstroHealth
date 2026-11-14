"""Vercel serverless entrypoint for the AstroHealth API."""

import os
import sys

_VENDOR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "vendor")
if _VENDOR not in sys.path:
    sys.path.insert(0, _VENDOR)

from bonetwin_api.main import create_app

app = create_app()
