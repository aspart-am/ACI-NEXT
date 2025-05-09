# Script PowerShell pour démarrer l'application
Write-Host "Démarrage de l'application ACI-MSP..." -ForegroundColor Cyan

# Naviguer vers le répertoire de l'application
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Variables pour les commandes
$startCmd = "npx next dev"

# Exécuter la commande
Write-Host "Exécution de: $startCmd" -ForegroundColor Green
Invoke-Expression $startCmd

# Si la commande échoue
if ($LASTEXITCODE -ne 0) {
    Write-Host "La commande a échoué avec le code: $LASTEXITCODE" -ForegroundColor Red
    
    # Vérification si node_modules existe
    if (-not (Test-Path "node_modules")) {
        Write-Host "Le dossier node_modules n'existe pas. Installation des dépendances..." -ForegroundColor Yellow
        Invoke-Expression "npm install"
        
        # Réessayer de démarrer l'application
        Write-Host "Nouvel essai de démarrage..." -ForegroundColor Cyan
        Invoke-Expression $startCmd
    }
}

# Garder la fenêtre ouverte en cas d'erreur
if ($LASTEXITCODE -ne 0) {
    Write-Host "Appuyez sur n'importe quelle touche pour fermer cette fenêtre..." -ForegroundColor Red
    [void][System.Console]::ReadKey($true)
} 