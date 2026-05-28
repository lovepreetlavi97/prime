@echo off
echo Starting Portable Redis Server...
cd redis-server
redis-server.exe redis.windows.conf
pause
