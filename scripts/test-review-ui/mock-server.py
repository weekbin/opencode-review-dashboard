#!/usr/bin/env python3
"""Mock server for the opencode-review-dashboard UI test harness.

Serves:
  /                → dist/ui/review.html
  /review/<id>     → dist/ui/review.html (also parsed by app.js for reviewID)
  /assets/<file>   → dist/ui/<file>  (with correct MIME type)
  /api/review/<id> → mock JSON payload
  /health          → "ok"

Usage:
  python3 mock-server.py [PORT]

The mock data is configurable via MOCK_DATA_FILE env var (JSON file).
Default is the built-in MOCK_PAYLOAD below.
"""
import http.server
import json
import mimetypes
import os
import sys
from urllib.parse import urlparse

ROOT = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.normpath(os.path.join(ROOT, "..", "..", "dist", "ui"))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8890

# Make sure .js files get the right MIME type on this OS
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/javascript", ".mjs")

DEFAULT_MOCK = {
    "id": "test",
    "session_id": "test-session",
    "repo_root": "/tmp/fake/repo",
    "scope_root": "/tmp/fake/repo",
    "round": 1,
    "files": [
        {
            "path": "src/feature.ts",
            "status": "modified",
            "additions": 3,
            "deletions": 0,
            "before": "",
            "after": "export const x = 1;\nexport const y = 2;\nexport const z = 3;\n",
        },
        {
            "path": "src/sub/deep/nested/dir/file.txt",
            "status": "modified",
            "additions": 2,
            "deletions": 1,
            "before": "old\n",
            "after": "new line 1\nnew line 2\n",
        },
        {
            "path": "README.md",
            "status": "added",
            "additions": 5,
            "deletions": 0,
            "before": "",
            "after": "# Test\n\nHello world.\n",
        },
    ],
    "existing_findings": [],
    "draft": {"notes": "", "new_findings": []},
    "taxonomy": {
        "categories": ["recommend", "bug", "style", "perf", "question"],
        "severities": ["medium", "high", "low"],
    },
}


def load_mock():
    mock_file = os.environ.get("MOCK_DATA_FILE")
    if mock_file and os.path.exists(mock_file):
        with open(mock_file) as f:
            return json.load(f)
    return DEFAULT_MOCK


class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        sys.stderr.write("[srv] " + (fmt % args) + "\n")

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/health":
            self.send_text("ok")
            return
        if path.startswith("/assets/"):
            self.serve_asset(path[len("/assets/"):])
            return
        if path.startswith("/api/review/"):
            self.serve_mock()
            return
        # Default: review.html (root or /review/<id>)
        self.serve_html()

    def send_text(self, text, status=200, mime="text/plain"):
        body = text.encode()
        self.send_response(status)
        self.send_header("content-type", mime)
        self.send_header("content-length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def serve_html(self):
        path = os.path.join(DIST, "review.html")
        if not os.path.exists(path):
            self.send_text(f"review.html not found at {path}; run 'bun run build' first", 500)
            return
        with open(path, "rb") as f:
            body = f.read()
        self.send_response(200)
        self.send_header("content-type", "text/html; charset=utf-8")
        self.send_header("content-length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def serve_asset(self, name):
        if not name or "\x00" in name or ".." in name.split("/"):
            self.send_text("bad request", 400)
            return
        path = os.path.join(DIST, name)
        if not os.path.isfile(path):
            self.send_text("not found", 404)
            return
        with open(path, "rb") as f:
            body = f.read()
        mime, _ = mimetypes.guess_type(path)
        self.send_response(200)
        self.send_header("content-type", mime or "application/octet-stream")
        self.send_header("content-length", str(len(body)))
        self.send_header("cache-control", "no-cache")
        self.end_headers()
        self.wfile.write(body)

    def serve_mock(self):
        body = json.dumps(load_mock()).encode()
        self.send_response(200)
        self.send_header("content-type", "application/json")
        self.send_header("cache-control", "no-cache")
        self.send_header("content-length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    if not os.path.isdir(DIST):
        print(f"ERROR: {DIST} not found. Run 'bun run build' first.", file=sys.stderr)
        sys.exit(1)
    server = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"review-dashboard mock server: http://127.0.0.1:{PORT}", flush=True)
    print(f"  dist: {DIST}", flush=True)
    print(f"  override mock data: MOCK_DATA_FILE=/path/to/data.json", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()
