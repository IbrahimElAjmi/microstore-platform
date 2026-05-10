$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$services = @(
    @{ Name = "customer-service"; Command = ".\mvnw.cmd"; Args = @("test") },
    @{ Name = "catalog-service"; Command = ".\mvnw.cmd"; Args = @("test") },
    @{ Name = "inventory-service"; Command = "..\catalog-service\mvnw.cmd"; Args = @("-f", "pom.xml", "test") },
    @{ Name = "order-service"; Command = ".\mvnw.cmd"; Args = @("test") },
    @{ Name = "billing-service"; Command = ".\mvnw.cmd"; Args = @("test") }
)

foreach ($service in $services) {
    $servicePath = Join-Path $root $service.Name
    Write-Host ""
    Write-Host "== Testing $($service.Name) =="
    Push-Location $servicePath
    try {
        & $service.Command @($service.Args)
    } finally {
        Pop-Location
    }
}

Write-Host ""
Write-Host "All service tests completed successfully."
