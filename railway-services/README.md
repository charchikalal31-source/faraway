# Railway Services — Build Instructions

This project is a small Flask app that serves the static HTML UI from the `HTML/` folder and data from `Data/`.

To build a single-file executable with PyInstaller on Windows:

1. Create and activate a Python virtual environment (recommended):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install requirements:

```powershell
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

3. Build the executable using the provided spec:

```powershell
pyinstaller gg.spec --noconfirm
```

The produced artifacts will be in the `dist/gg/` folder (or `dist/` depending on PyInstaller).

Notes and troubleshooting:
- The `gg.spec` file was regenerated to include the entire `HTML/` and `Data/` directories recursively.
- If your pages use ES modules (`import`/`export`), ensure you load them with `<script type="module">` or remove module syntax.
- The backend `/process-data` endpoint currently only implements login; consider adding separate endpoints for seat-exchange requests and approvals.
