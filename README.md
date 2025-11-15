# Data-Visualization-TUD

## Running the Project (Python Local Server)

To run the D3.js visualizations locally, you need to start a simple web server.  
This is because browsers block loading local files (CSV/JSON) using `file://`.

### Steps

1. Open a terminal and navigate to the project folder:

   ```bash
   cd "/path/to/datavis-a2-main"
2. Start a local server with Python:
   ```bash
   python3 -m http.server 8000

3. Open your browser and go to:
   ```bash
   http://localhost:8000/index.html
