@echo off
cd /d "%~dp0"
echo Kar-Han Tedarik yerel sunucu: http://localhost:8000
echo Durdurmak icin Ctrl+C
start "" http://localhost:8000/index.html
python -m http.server 8000
