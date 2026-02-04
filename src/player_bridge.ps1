Add-Type -AssemblyName PresentationCore
$player = New-Object System.Windows.Media.MediaPlayer
$lastStatus = "Stopped"

# Bucle principal
while ($true) {
    # # 1. Escuchar comandos de Node (sin bloquear para poder procesar eventos)
    # if ([Console]::KeyAvailable -or $Host.UI.RawUI.KeyAvailable) {
    #     # Si prefieres evitar el uso de teclas, el Read-Host sigue siendo funcional
    #     # pero para comunicación fluida usaremos esta lógica:
    # }
    
    # Nota: Read-Host es síncrono. Para manejar eventos usaremos un Timer o 
    # simplemente enviaremos el estado actual después de cada comando.
    $line = Read-Host # Escucha lo que Node escribe en stdin
    if ($null -eq $line) { break }

    try {
        $data = $line | ConvertFrom-Json
        switch ($data.command) {
            "open"   { $player.Open((Get-Item $data.path).FullName) }
            "play"   { $player.Play(); $lastStatus = "Playing"}
            "stop"   { $player.Stop(); $lastStatus = "Stopped"}
            "pause"  { $player.Pause(); $lastStatus = "Paused"}
            "volume" { $player.Volume = [float]$data.value }
            "status" { 
                # Reportar estado actual a Node
                $status = @{
                    event = "status_update"
                    playerStatus = $lastStatus
                    position = $player.Position.TotalSeconds
                    buffering = $player.IsBuffering
                    volume = $player.Volume
                }
                Write-Host ($status | ConvertTo-Json -Compress)
            }
            "currentSong" {
                Write-Host (@{event = "currentSong";currentSong = $player.Source.AbsoluteUri} | ConvertTo-Json -Compress)
            }
            "exit"   { exit }
        }
    } catch {
        # log error
        Write-Host (@{event="error"; message=$_.Exception.Message} | ConvertTo-Json -Compress)
    }
}