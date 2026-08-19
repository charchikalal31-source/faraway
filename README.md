# Railway Services — User Guide

This guide provides instructions on how to start the Railway Services Flask application and access it in your browser. 

The application can be run in two ways:
1. **Running from Source Code** (via a Python Virtual Environment using Command Prompt)
2. **Running the Pre-compiled Executable** (directly from the `dist` folder)

---

## Way 1: Running from Source Code (Using Command Prompt)

Follow these steps to set up a Python virtual environment, install dependencies, and run the application.

### 1. Open Command Prompt (CMD)
Press `Win + R`, type `cmd`, and press **Enter** to open the Command Prompt.

### 2. Navigate to the Project Directory
Use the `cd` command to navigate to the `railway-services` folder. For example:
```cmd
cd /d "c:\Users\vedan\Downloads\railway-services (2)\railway-services"
```

### 3. Create a Virtual Environment
Run the following command to create a new virtual environment named `venv`:
```cmd
python -m venv venv
```

### 4. Activate the Virtual Environment
Activate the created virtual environment using the activation script for CMD:
```cmd
venv\Scripts\activate.bat
```
*(Once activated, you should see `(venv)` prepended to your command prompt line.)*

### 5. Install Dependencies
Install the required packages (like Flask) using `pip`:
```cmd
pip install -r requirements.txt
```

### 6. Run the Application
Start the Flask server by running the python file:
```cmd
python gg.py
```

### 7. Access the App
Open your web browser (Chrome, Edge, Firefox, etc.) and navigate to:
* **URL:** [http://127.0.0.1:5000](http://127.0.0.1:5000) or [http://localhost:5000](http://localhost:5000)

---

## Way 2: Running the Pre-compiled Executable (`dist/gg.exe`)

This method does not require Python or any package installations. The executable is pre-packaged with all required libraries.

### 1. Locate the Executable File
Open **File Explorer** and navigate to the project directory:
`railway-services/dist/`

Inside this folder, you will find the executable file named `gg.exe`.

### 2. Run the Executable
You can run the application in one of two ways:
* **Double-click:** Double-click on `gg.exe` in File Explorer. A command window will pop up indicating that the Flask server is running.
* **Via Command Prompt:**
  ```cmd
  cd /d "c:\Users\vedan\Downloads\railway-services (2)\railway-services\dist"
  gg.exe
  ```

### 3. Access the App
Keep the console window open (do not close it, as it runs the background server) and open your browser to:
* **URL:** [http://127.0.0.1:5000](http://127.0.0.1:5000) or [http://localhost:5000](http://localhost:5000)

---

## Stopping the Application
To stop the server in either method:
* Press `Ctrl + C` in the Command Prompt window, or
* Simply close the console window running the server.
