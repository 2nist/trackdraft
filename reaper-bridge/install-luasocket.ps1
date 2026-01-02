# Install LuaSocket for Reaper
# This script downloads and installs LuaSocket to Reaper's Scripts directory

param(
    [switch]$SystemWide
)

Write-Host "TrackDraft Reaper Bridge - LuaSocket Installer" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Determine installation path
if ($SystemWide) {
    $ReaperScriptsPath = "C:\Program Files\REAPER\Scripts"
    Write-Host "Installing to system-wide location (requires admin)" -ForegroundColor Yellow
} else {
    $ReaperScriptsPath = "$env:APPDATA\REAPER\Scripts"
    Write-Host "Installing to user location: $ReaperScriptsPath" -ForegroundColor Green
}

# Check if Reaper Scripts directory exists
if (-not (Test-Path $ReaperScriptsPath)) {
    Write-Host "Creating Reaper Scripts directory..." -ForegroundColor Yellow
    try {
        New-Item -ItemType Directory -Path $ReaperScriptsPath -Force | Out-Null
        Write-Host "Directory created successfully." -ForegroundColor Green
    } catch {
        Write-Host "Error: Could not create directory: $_" -ForegroundColor Red
        Write-Host "You may need to run this script as Administrator for system-wide installation." -ForegroundColor Yellow
        exit 1
    }
}

# Check if LuaSocket is already installed
$SocketFolder = Join-Path $ReaperScriptsPath "socket"
$SocketLua = Join-Path $ReaperScriptsPath "socket.lua"
$Ltn12Lua = Join-Path $ReaperScriptsPath "ltn12.lua"
$MimeLua = Join-Path $ReaperScriptsPath "mime.lua"

if ((Test-Path $SocketFolder) -and (Test-Path $SocketLua) -and (Test-Path $Ltn12Lua) -and (Test-Path $MimeLua)) {
    Write-Host "LuaSocket appears to be already installed!" -ForegroundColor Green
    Write-Host "Socket folder: $SocketFolder" -ForegroundColor Gray
    Write-Host "Socket files: socket.lua, ltn12.lua, mime.lua" -ForegroundColor Gray
    $overwrite = Read-Host "Do you want to reinstall? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Installation cancelled." -ForegroundColor Yellow
        exit 0
    }
}

# Create temp directory for download
$TempDir = Join-Path $env:TEMP "luasocket-install"
if (Test-Path $TempDir) {
    Remove-Item -Path $TempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

Write-Host ""
Write-Host "Step 1: Downloading LuaSocket..." -ForegroundColor Cyan

$ZipPath = Join-Path $TempDir "luasocket.zip"

try {
    # Get latest release info from GitHub API
    Write-Host "Fetching latest LuaSocket release from GitHub..." -ForegroundColor Gray
    $ReleaseInfo = Invoke-RestMethod -Uri "https://api.github.com/repos/diegonehab/luasocket/releases/latest" -UseBasicParsing
    
    # Find Windows ZIP file (usually luasocket-X.X.X-WIN32.zip)
    $WindowsAsset = $ReleaseInfo.assets | Where-Object { 
        $_.name -like "*WIN32*.zip" -or $_.name -like "*win32*.zip" -or $_.name -like "*windows*.zip"
    } | Select-Object -First 1
    
    if (-not $WindowsAsset) {
        # Fallback: try to find any ZIP file
        $WindowsAsset = $ReleaseInfo.assets | Where-Object { $_.name -like "*.zip" } | Select-Object -First 1
    }
    
    if ($WindowsAsset) {
        Write-Host "Downloading: $($WindowsAsset.name) ($([math]::Round($WindowsAsset.size / 1KB, 2)) KB)..." -ForegroundColor Gray
        Invoke-WebRequest -Uri $WindowsAsset.browser_download_url -OutFile $ZipPath -UseBasicParsing
        Write-Host "Download complete." -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "==============================================" -ForegroundColor Yellow
        Write-Host "Windows binaries not found in latest release" -ForegroundColor Yellow
        Write-Host "==============================================" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "The latest release ($($ReleaseInfo.tag_name)) doesn't include pre-built Windows binaries." -ForegroundColor Gray
        Write-Host ""
        Write-Host "For Reaper on Windows, you have two options:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Option 1: Manual Installation (Recommended)" -ForegroundColor Green
        Write-Host "1. Visit: https://github.com/diegonehab/luasocket/releases" -ForegroundColor White
        Write-Host "2. Look for an older release with Windows binaries (e.g., luasocket-3.0.0-rc1)" -ForegroundColor White
        Write-Host "3. Download the Windows ZIP file (usually named luasocket-X.X.X-WIN32.zip)" -ForegroundColor White
        Write-Host "4. Extract the following files to: $ReaperScriptsPath" -ForegroundColor White
        Write-Host "   - socket.lua" -ForegroundColor Gray
        Write-Host "   - ltn12.lua" -ForegroundColor Gray
        Write-Host "   - mime.lua" -ForegroundColor Gray
        Write-Host "   - socket/ folder (with DLL files inside)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Option 2: Use this script with manual download" -ForegroundColor Green
        Write-Host "1. Download a Windows ZIP file from the releases page" -ForegroundColor White
        Write-Host "2. Save it to: $ZipPath" -ForegroundColor White
        Write-Host "3. Press Enter to continue, or 'q' to quit and install manually" -ForegroundColor White
        Write-Host ""
        $continue = Read-Host "Press Enter to continue (if you've downloaded the file), or 'q' to quit"
        
        if ($continue -eq "q" -or $continue -eq "Q") {
            Write-Host ""
            Write-Host "Installation cancelled. Please install LuaSocket manually." -ForegroundColor Yellow
            Write-Host "See the README.md for detailed instructions." -ForegroundColor Yellow
            Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
            exit 0
        }
        
        if (-not (Test-Path $ZipPath)) {
            Write-Host ""
            Write-Host "Error: File not found at $ZipPath" -ForegroundColor Red
            Write-Host "Please download the Windows ZIP file and save it to that location, then run this script again." -ForegroundColor Yellow
            Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
            exit 1
        }
    }
} catch {
    Write-Host "Error downloading from GitHub: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download manually from: https://github.com/diegonehab/luasocket/releases/latest" -ForegroundColor Yellow
    Write-Host "Save the Windows ZIP file to: $ZipPath" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Press Enter after downloading (or 'q' to quit)"
    
    if ($continue -eq "q" -or $continue -eq "Q") {
        Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
        exit 0
    }
    
    if (-not (Test-Path $ZipPath)) {
        Write-Host "Error: File not found at $ZipPath" -ForegroundColor Red
        Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
        exit 1
    }
}

Write-Host ""
Write-Host "Step 2: Extracting LuaSocket..." -ForegroundColor Cyan

try {
    Expand-Archive -Path $ZipPath -DestinationPath $TempDir -Force
    Write-Host "Extraction successful." -ForegroundColor Green
} catch {
    Write-Host "Error extracting ZIP: $_" -ForegroundColor Red
    Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Host ""
Write-Host "Step 3: Installing LuaSocket files..." -ForegroundColor Cyan

# Find the extracted directory (usually luasocket-X.X.X-WIN32)
$ExtractedDirs = Get-ChildItem -Path $TempDir -Directory | Where-Object { $_.Name -like "luasocket*" }
if ($ExtractedDirs.Count -eq 0) {
    Write-Host "Error: Could not find extracted LuaSocket directory" -ForegroundColor Red
    Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    exit 1
}

$ExtractedPath = $ExtractedDirs[0].FullName

# Copy socket folder
$SourceSocketFolder = Join-Path $ExtractedPath "socket"
if (Test-Path $SourceSocketFolder) {
    Copy-Item -Path $SourceSocketFolder -Destination $ReaperScriptsPath -Recurse -Force
    Write-Host "Copied socket/ folder" -ForegroundColor Green
} else {
    Write-Host "Warning: socket/ folder not found in extracted files" -ForegroundColor Yellow
}

# Copy individual .lua files
$FilesToCopy = @("socket.lua", "ltn12.lua", "mime.lua")
foreach ($file in $FilesToCopy) {
    $SourceFile = Join-Path $ExtractedPath $file
    if (Test-Path $SourceFile) {
        Copy-Item -Path $SourceFile -Destination $ReaperScriptsPath -Force
        Write-Host "Copied $file" -ForegroundColor Green
    } else {
        Write-Host "Warning: $file not found in extracted files" -ForegroundColor Yellow
    }
}

# Verify installation
Write-Host ""
Write-Host "Step 4: Verifying installation..." -ForegroundColor Cyan

$AllFilesPresent = $true
if (-not (Test-Path $SocketFolder)) {
    Write-Host "Error: socket/ folder not found" -ForegroundColor Red
    $AllFilesPresent = $false
}
if (-not (Test-Path $SocketLua)) {
    Write-Host "Error: socket.lua not found" -ForegroundColor Red
    $AllFilesPresent = $false
}
if (-not (Test-Path $Ltn12Lua)) {
    Write-Host "Error: ltn12.lua not found" -ForegroundColor Red
    $AllFilesPresent = $false
}
if (-not (Test-Path $MimeLua)) {
    Write-Host "Error: mime.lua not found" -ForegroundColor Red
    $AllFilesPresent = $false
}

if ($AllFilesPresent) {
    Write-Host ""
    Write-Host "==============================================" -ForegroundColor Green
    Write-Host "LuaSocket installed successfully!" -ForegroundColor Green
    Write-Host "==============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Installation location: $ReaperScriptsPath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Restart Reaper if it's currently running" -ForegroundColor White
    Write-Host "2. Load the TrackDraft bridge script in Reaper" -ForegroundColor White
    Write-Host "3. The bridge should now work without LuaSocket errors" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "==============================================" -ForegroundColor Red
    Write-Host "Installation incomplete - some files are missing" -ForegroundColor Red
    Write-Host "==============================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the extracted files manually." -ForegroundColor Yellow
    Write-Host "Expected location: $ExtractedPath" -ForegroundColor Gray
    exit 1
}

# Cleanup
Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Done!" -ForegroundColor Green

