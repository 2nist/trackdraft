# Install LuaSocket for Reaper - Alternative Sources
# This script tries multiple sources to get working LuaSocket binaries

param(
    [switch]$SystemWide
)

Write-Host "TrackDraft Reaper Bridge - LuaSocket Installer (Alternative Sources)" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

# Determine installation path
if ($SystemWide) {
    $ReaperScriptsPath = "C:\Program Files\REAPER\Scripts"
    Write-Host "Installing to system-wide location (requires admin)" -ForegroundColor Yellow
} else {
    $ReaperScriptsPath = "$env:APPDATA\REAPER\Scripts"
    Write-Host "Installing to user location: $ReaperScriptsPath" -ForegroundColor Green
}

# Create Scripts directory if it doesn't exist
if (-not (Test-Path $ReaperScriptsPath)) {
    Write-Host "Creating Reaper Scripts directory..." -ForegroundColor Yellow
    try {
        New-Item -ItemType Directory -Path $ReaperScriptsPath -Force | Out-Null
        Write-Host "Directory created successfully." -ForegroundColor Green
    } catch {
        Write-Host "Error: Could not create directory: $_" -ForegroundColor Red
        exit 1
    }
}

# Create temp directory
$TempDir = Join-Path $env:TEMP "luasocket-install-alt"
if (Test-Path $TempDir) {
    Remove-Item -Path $TempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

Write-Host ""
Write-Host "Checking for pre-built LuaSocket binaries from alternative sources..." -ForegroundColor Cyan
Write-Host ""

# Option 1: Try alain-riedinger/luasocket releases
Write-Host "Option 1: Checking alain-riedinger/luasocket repository..." -ForegroundColor Yellow
try {
    $releases = Invoke-RestMethod -Uri "https://api.github.com/repos/alain-riedinger/luasocket/releases" -UseBasicParsing
    $latestRelease = $releases[0]
    
    Write-Host "  Latest release: $($latestRelease.tag_name)" -ForegroundColor Gray
    
    # Look for Windows binaries
    $windowsAssets = $latestRelease.assets | Where-Object { 
        $_.name -match 'win|Win|windows|Windows' -or 
        $_.name -match '\.dll|\.zip' 
    }
    
    if ($windowsAssets.Count -gt 0) {
        Write-Host "  Found $($windowsAssets.Count) potential Windows asset(s)" -ForegroundColor Green
        foreach ($asset in $windowsAssets) {
            Write-Host "    - $($asset.name) ($([math]::Round($asset.size/1KB, 0)) KB)" -ForegroundColor Gray
        }
        Write-Host ""
        Write-Host "  Download URL: $($latestRelease.html_url)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Please download the Windows binary ZIP file from:" -ForegroundColor Yellow
        Write-Host "  $($latestRelease.html_url)" -ForegroundColor White
        Write-Host ""
        Write-Host "Then extract it and look for:" -ForegroundColor Yellow
        Write-Host "  - socket/ folder (with .dll files)" -ForegroundColor White
        Write-Host "  - socket.lua" -ForegroundColor White
        Write-Host "  - ltn12.lua" -ForegroundColor White
        Write-Host "  - mime.lua" -ForegroundColor White
        Write-Host ""
        Write-Host "Copy these to: $ReaperScriptsPath" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host "  No Windows binaries found in latest release" -ForegroundColor Red
    }
} catch {
    Write-Host "  Error checking repository: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=" -ForegroundColor Gray
Write-Host ""

# Option 2: Check if user already has the files from source code
Write-Host "Option 2: Checking if you have LuaSocket source code to compile..." -ForegroundColor Yellow
$SourcePath = "$ReaperScriptsPath\luasocket-3.1.0\src"
if (Test-Path $SourcePath) {
    Write-Host "  Found LuaSocket source code at: $SourcePath" -ForegroundColor Green
    Write-Host ""
    Write-Host "  To compile from source, you need:" -ForegroundColor Yellow
    Write-Host "    1. Visual Studio (with C++ tools)" -ForegroundColor White
    Write-Host "    2. Or MinGW compiler" -ForegroundColor White
    Write-Host ""
    Write-Host "  Build instructions:" -ForegroundColor Yellow
    Write-Host "    - Open Visual Studio" -ForegroundColor White
    Write-Host "    - Open luasocket.sln" -ForegroundColor White
    Write-Host "    - Build for Release/x64 (or Win32)" -ForegroundColor White
    Write-Host "    - Copy output DLLs to $ReaperScriptsPath\socket\" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "  No source code found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=" -ForegroundColor Gray
Write-Host ""

# Option 3: File-based IPC alternative
Write-Host "Option 3: Alternative - File-based IPC (No LuaSocket needed)" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Instead of HTTP/TCP, we could use file-based communication:" -ForegroundColor Gray
Write-Host "    - TrackDraft writes commands to a JSON file" -ForegroundColor White
Write-Host "    - Reaper script polls the file and processes commands" -ForegroundColor White
Write-Host "    - Reaper writes responses back to another file" -ForegroundColor White
Write-Host ""
Write-Host "  This would require modifying the bridge code, but:" -ForegroundColor Gray
Write-Host "    ✓ No external dependencies" -ForegroundColor Green
Write-Host "    ✓ Works on all platforms" -ForegroundColor Green
Write-Host "    ✓ Easier to set up" -ForegroundColor Green
Write-Host "    ✗ Slightly slower (file I/O)" -ForegroundColor Yellow
Write-Host "    ✗ Requires code changes" -ForegroundColor Yellow
Write-Host ""

Write-Host ""
Write-Host "=" -ForegroundColor Gray
Write-Host ""

# Summary
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "=======" -ForegroundColor Cyan
Write-Host ""
Write-Host "Recommended approach:" -ForegroundColor Yellow
Write-Host "1. Try to download pre-built binaries from alain-riedinger/luasocket" -ForegroundColor White
Write-Host "2. If that doesn't work, compile from source (you already have the source)" -ForegroundColor White
Write-Host "3. As a last resort, we could implement file-based IPC (requires code changes)" -ForegroundColor White
Write-Host ""

# Cleanup
Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Current status:" -ForegroundColor Cyan
$socketLua = Join-Path $ReaperScriptsPath "socket.lua"
$socketFolder = Join-Path $ReaperScriptsPath "socket"
if (Test-Path $socketLua) {
    Write-Host "  ✓ socket.lua found" -ForegroundColor Green
} else {
    Write-Host "  ✗ socket.lua missing" -ForegroundColor Red
}
if (Test-Path $socketFolder) {
    $dllCount = (Get-ChildItem -Path $socketFolder -Filter "*.dll" -ErrorAction SilentlyContinue).Count
    Write-Host "  ✓ socket/ folder found ($dllCount .dll files)" -ForegroundColor Green
} else {
    Write-Host "  ✗ socket/ folder missing (needs DLL files)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

