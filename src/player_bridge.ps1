Add-Type -AssemblyName PresentationCore
$player = New-Object System.Windows.Media.MediaPlayer
$wshell = New-Object -ComObject WScript.Shell # Se usa para simular un teclado virtual y aprimir teclas desde shell
$lastStatus = "Stopped"

# --- Soporte SMTC (Windows.Media.Control) para leer la sesion de medios activa del sistema ---
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
})[0]

function Await($WinRtTask, $ResultType) {
    $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
    $netTask = $asTask.Invoke($null, @($WinRtTask))
    $netTask.Wait(-1) | Out-Null
    $netTask.Result
}

[Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager,Windows.Media.Control,ContentType=WindowsRuntime] | Out-Null
$smtcManager = $null

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
            "command" { Invoke-Expression $data.msg; }
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
            # --- Control global de medios (afecta al reproductor activo del sistema, ej. Spotify o el navegador) ---
            "mediaPlayPause"  { $wshell.SendKeys([char]179) } # VK_MEDIA_PLAY_PAUSE
            "mediaNext"       { $wshell.SendKeys([char]176) } # VK_MEDIA_NEXT_TRACK
            "mediaPrevious"   { $wshell.SendKeys([char]177) } # VK_MEDIA_PREV_TRACK
            "mediaVolumeUp"   { $wshell.SendKeys([char]175) } # VK_VOLUME_UP
            "mediaVolumeDown" { $wshell.SendKeys([char]174) } # VK_VOLUME_DOWN
            "mediaInfo" {
                $title = ""
                $artist = ""
                $status = "Unknown"
                try {
                    if ($null -eq $smtcManager) {
                        $smtcManager = Await ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]::RequestAsync()) ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager])
                    }
                    $session = $smtcManager.GetCurrentSession()
                    if ($session) {
                        $info = Await ($session.TryGetMediaPropertiesAsync()) ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionMediaProperties])
                        $title = $info.Title
                        $artist = $info.Artist
                        $status = $session.GetPlaybackInfo().PlaybackStatus.ToString()
                    }
                } catch {
                    # Sin sesion de medios disponible o fallo de SMTC: se responde con campos vacios en vez de propagar el error.
                }
                Write-Host (@{event = "mediaInfo"; title = $title; artist = $artist; status = $status} | ConvertTo-Json -Compress)
            }
            "exit"   { exit }
        }
    } catch {
        # log error
        Write-Host (@{event="error"; message=$_.Exception.Message} | ConvertTo-Json -Compress)
    }
}