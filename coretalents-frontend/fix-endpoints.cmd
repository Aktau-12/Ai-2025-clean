@echo off
REM ————————————————————————————————————————————————
REM fix-endpoints.cmd — массовая замена путей авторизации
REM ————————————————————————————————————————————————

REM 1) Заменяем “${API_URL}/register” → “${API_URL}/auth/register”
powershell -NoProfile -Command ^
  "Get-ChildItem -Path . -Recurse -Include *.ts,*.tsx,*.js,*.jsx | `
    ForEach-Object { `
      (Get-Content $_.FullName) `
        -replace '\$\{API_URL\}/register','\$\{API_URL\}/auth/register' | `
      Set-Content $_.FullName `
    }"

REM 2) Заменяем “${API_URL}/login” → “${API_URL}/auth/login”
powershell -NoProfile -Command ^
  "Get-ChildItem -Path . -Recurse -Include *.ts,*.tsx,*.js,*.jsx | `
    ForEach-Object { `
      (Get-Content $_.FullName) `
        -replace '\$\{API_URL\}/login','\$\{API_URL\}/auth/login' | `
      Set-Content $_.FullName `
    }"

echo.
echo ✅ Все пути в коде поправлены!
pause
