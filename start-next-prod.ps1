$env:Path = "C:\Program Files\nodejs;$env:Path"
$env:NODE_OPTIONS = "--use-system-ca"
Set-Location "D:\Cosas_imco\metricas_rs"
& "C:\Program Files\nodejs\npm.cmd" run start
