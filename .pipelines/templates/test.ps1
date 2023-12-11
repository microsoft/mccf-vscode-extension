# Source folder containing .ttf files
$scriptDirectory = $PSScriptRoot
$sourceFolder = Join-Path -Path $scriptDirectory -ChildPath "Fonts"

# Destination folder for fonts
$fontsFolderPath = "C:\Windows\Fonts"

# Iterate through each .ttf file in the source folder
Get-ChildItem -Path $sourceFolder -Filter *.ttf | ForEach-Object {
    # Copy the file to the Fonts folder
    $destinationPath = Join-Path $fontsFolderPath $_.Name
    write-Host "copy file from $($_.FullName) to $destinationPath"
    Copy-Item $_.FullName -Destination $destinationPath -Force

    # Set registry entry for the font
    $fontName = $_.BaseName
    $fontRegistryPath = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts"
    $fontRegistryName = $fontName
    $fontRegistryValue = $_.Name

    write-Host "$fontRegistryPath, $fontRegistryName, $fontRegistryValue"
    Set-ItemProperty -Path $fontRegistryPath -Name $fontRegistryName -Value $fontRegistryValue -Type String
}