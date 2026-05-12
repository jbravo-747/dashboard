@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
set "NODE_OPTIONS=--use-system-ca"
cd /d D:\Cosas_imco\metricas_rs
"C:\Program Files\nodejs\npm.cmd" run dev
