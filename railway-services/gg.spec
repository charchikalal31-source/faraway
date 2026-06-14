# -*- mode: python ; coding: utf-8 -*-

import os
from PyInstaller.building.build_main import Analysis, PYZ, EXE

block_cipher = None

def collect_dir(src, dest):
    """Collect files under src and map them into dest/relative/path
    returns list of tuples (src_file, dest_folder)
    """
    items = []
    if not os.path.exists(src):
        return items
    for root, _, files in os.walk(src):
        for f in files:
            src_path = os.path.join(root, f)
            rel_dir = os.path.relpath(root, src)
            dest_dir = os.path.join(dest, rel_dir) if rel_dir != '.' else dest
            items.append((src_path, dest_dir))
    return items

datas = collect_dir('HTML', 'HTML') + collect_dir('Data', 'Data')

a = Analysis(
    ['gg.py'],
    pathex=['.'],
    binaries=[],
    datas=datas,
    hiddenimports=[],
    hookspath=[],
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    name='gg',
    debug=False,
    strip=False,
    upx=True,
    console=True,
)
