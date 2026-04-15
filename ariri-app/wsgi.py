"""Entry point para deploy no Render."""
import sys
import os

# Ensure this directory is in the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app import create_app

app = create_app()

if __name__ == '__main__':
    app.run()
