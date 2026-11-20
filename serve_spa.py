import http.server
import socketserver
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get('PORT', 5173))
DIRECTORY = os.path.join(os.path.dirname(__file__), 'build')

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Translate requested path to filesystem
        path = self.translate_path(self.path)
        # If the file doesn't exist and doesn't look like a static asset, serve index.html (SPA routing)
        if not os.path.exists(path) and not '.' in os.path.basename(self.path):
            self.path = '/index.html'
        return super().do_GET()

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', PORT), SPAHandler) as httpd:
        print(f"Frontend SPA server running at http://127.0.0.1:{PORT}")
        httpd.serve_forever()
