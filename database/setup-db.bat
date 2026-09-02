@echo off
REM ============================================================
REM  Full database setup script for Pramod Rajput Platform
REM  Run this ONCE after PostgreSQL is installed.
REM  Usage: database\setup-db.bat
REM ============================================================

SET PGPASSWORD=postgres@1234
SET PGBIN=C:\Program Files\PostgreSQL\16\bin
SET DBNAME=pramod_rajput
SET DBUSER=pramod_user
SET DBPASS=pramod@secure2024
SET PGHOST=localhost
SET PGPORT=5432

echo.
echo === Step 1: Creating database and user ===
"%PGBIN%\psql" -U postgres -h %PGHOST% -p %PGPORT% -c "DROP DATABASE IF EXISTS %DBNAME%;" 2>nul
"%PGBIN%\psql" -U postgres -h %PGHOST% -p %PGPORT% -c "DROP USER IF EXISTS %DBUSER%;" 2>nul
"%PGBIN%\psql" -U postgres -h %PGHOST% -p %PGPORT% -c "CREATE DATABASE %DBNAME%;"
"%PGBIN%\psql" -U postgres -h %PGHOST% -p %PGPORT% -c "CREATE USER %DBUSER% WITH ENCRYPTED PASSWORD '%DBPASS%';"
"%PGBIN%\psql" -U postgres -h %PGHOST% -p %PGPORT% -c "GRANT ALL PRIVILEGES ON DATABASE %DBNAME% TO %DBUSER%;"
"%PGBIN%\psql" -U postgres -h %PGHOST% -p %PGPORT% -c "ALTER DATABASE %DBNAME% OWNER TO %DBUSER%;"

echo.
echo === Step 2: Running setup.sql (tables + seed data) ===
"%PGBIN%\psql" -U %DBUSER% -h %PGHOST% -p %PGPORT% -d %DBNAME% -f "%~dp0setup.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: setup.sql failed. Check output above.
    pause
    exit /b 1
)

echo.
echo === Step 3: Running migration_v3.sql (flat social keys) ===
"%PGBIN%\psql" -U %DBUSER% -h %PGHOST% -p %PGPORT% -d %DBNAME% -f "%~dp0migration_v3.sql" 2>nul

echo.
echo === All done! Database is ready. ===
echo   DB Name : %DBNAME%
echo   DB User : %DBUSER%
echo   DB Pass : %DBPASS%
echo.
pause
