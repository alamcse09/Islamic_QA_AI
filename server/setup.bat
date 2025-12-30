@echo off
echo --- Creating Virtual Environment ---
python -m venv venv

echo --- Activating Environment ---
call venv\Scripts\activate

echo --- Installing Dependencies ---
pip install -r requirements.txt

echo --- Setup Complete! ---
pause