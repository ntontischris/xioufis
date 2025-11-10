@echo off
REM ========================================
REM Railway Database Backup Script
REM Political CRM - Automatic Backup
REM ========================================

echo.
echo =====================================
echo   Railway Database Backup
echo   Political CRM System
echo =====================================
echo.

REM Set backup directory
set BACKUP_DIR=%USERPROFILE%\Desktop\CRM_Backups
if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
    echo Created backup directory: %BACKUP_DIR%
    echo.
)

REM Navigate to project directory
cd /d "%~dp0"

REM Check if Railway CLI is installed
railway --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Railway CLI is not installed!
    echo.
    echo Install with: npm install -g @railway/cli
    echo.
    pause
    exit /b 1
)

REM Generate timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set YEAR=%datetime:~0,4%
set MONTH=%datetime:~4,2%
set DAY=%datetime:~6,2%
set HOUR=%datetime:~8,2%
set MINUTE=%datetime:~10,2%
set SECOND=%datetime:~12,2%

set TIMESTAMP=%YEAR%%MONTH%%DAY%_%HOUR%%MINUTE%%SECOND%
set FILENAME=backup_%TIMESTAMP%.sql

echo Starting backup...
echo Timestamp: %TIMESTAMP%
echo Output: %BACKUP_DIR%\%FILENAME%
echo.

REM Run backup via Railway CLI
echo Connecting to Railway PostgreSQL...
railway run pg_dump > "%BACKUP_DIR%\%FILENAME%"

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   SUCCESS - Backup completed!
    echo ========================================
    echo.
    echo File: %FILENAME%
    echo Location: %BACKUP_DIR%

    REM Show file size
    for %%A in ("%BACKUP_DIR%\%FILENAME%") do (
        set size=%%~zA
    )
    echo Size: %size% bytes
    echo.

    REM Keep only last 10 backups
    echo Cleaning old backups...
    for /f "skip=10 delims=" %%F in ('dir /b /o-d "%BACKUP_DIR%\backup_*.sql"') do (
        echo Deleting old backup: %%F
        del "%BACKUP_DIR%\%%F"
    )

    echo.
    echo Backup retention: Last 10 backups kept
    echo.

) else (
    echo.
    echo ========================================
    echo   ERROR - Backup failed!
    echo ========================================
    echo.
    echo Possible issues:
    echo - Railway CLI not logged in (run: railway login)
    echo - Project not linked (run: railway link)
    echo - Database not provisioned
    echo - pg_dump not found (install PostgreSQL client)
    echo.
)

echo ========================================
echo.
pause
