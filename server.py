from http.server import HTTPServer, SimpleHTTPRequestHandler
import webbrowser
import os
import sys

class CustomHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        sys.stderr.write("%s - - [%s] %s\n" %
                        (self.address_string(),
                         self.log_date_time_string(),
                         format % args))

    def do_GET(self):
        try:
            return SimpleHTTPRequestHandler.do_GET(self)
        except Exception as e:
            print(f"Error handling request: {e}")
            self.send_error(500, f"Internal server error: {str(e)}")

def run(server_class=HTTPServer, handler_class=CustomHandler):
    try:
        # Get the directory where server.py is located
        current_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(current_dir)  # Change to that directory
        
        server_address = ('', 8000)
        httpd = server_class(server_address, handler_class)
        print("Starting server at http://localhost:8000")
        print("Current working directory:", os.getcwd())
        print("Available files:", os.listdir('.'))
        webbrowser.open('http://localhost:8000')
        httpd.serve_forever()
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    run() 