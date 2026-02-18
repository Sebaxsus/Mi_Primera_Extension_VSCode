Add-Type -AssemblyName PresentationCore
$player = New-Object System.Windows.Media.MediaPlayer
$lastStatus = "Stopped"

function SendInfo($type, $msg) {
    $timestamp = Get-Date -Format 'HH:mm:ss';

    Write-Host(@{ event = "info";timestamp = $timestamp;type = $type; msg = $msg } | ConvertTo-Json -Compress)
}

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
            "open"   { $player.Open((Get-Item $data.path).FullName); SendInfo("INFO", "Opened source " + $player.source.AbsoluteUri) } # Establece la fuente a reproducir (URI)
            "play"   { $player.Play(); $lastStatus = "Playing"; SendInfo("INFO", $lastStatus) } # Ejecuta la fuente
            "stop"   { $player.Stop(); $lastStatus = "Stopped"; SendInfo("INFO", $lastStatus) } # Detiene la ejecucion
            "pause"  { $player.Pause(); $lastStatus = "Paused"; SendInfo("INFO", $lastStatus) } # Pausa la ejecicion en el punto actual
            "close" { $player.Close(); $lastStatus = "Closed"; SendInfo("INFO", $lastStatus + " Debe volver a abrir un recurso") } # Cierra la fuente (La quita)
            "volume" { $player.Volume = [float]$data.value; SendInfo("INFO", "Volume set to " + $player.volume.ToString()) } # Establece el volumen de ejecucion en un rango de 0.0 a 1.0 Default to 0.5
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