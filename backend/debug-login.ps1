try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email": "admin@chocoops.com", "password": "password"}'
    Write-Host "Success: $($response | ConvertTo-Json)"
}
catch {
    Write-Host "Error Response:"
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $body = $reader.ReadToEnd()
    Write-Host $body
}
