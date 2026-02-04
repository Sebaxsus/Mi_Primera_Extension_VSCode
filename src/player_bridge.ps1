Add-Type -AssemblyName PresentationCore
$player = New-Object System.Windows.Media.MediaPlayer

while ($true) {
    $line = Read-Host # Escucha lo que Node escribe en stdin
    if ($null -eq $line) { break }

    try {
        $data = $line | ConvertFrom-Json
        switch ($data.command) {
            "open"   { $player.Open((Get-Item $data.path).FullName) }
            "play"   { $player.Play() }
            "stop"   { $player.Stop() }
            "pause"  { $player.Pause() }
            "volume" { $player.Volume = [float]$data.value }
            "exit"   { exit }
        }
    } catch {
        # log error
    }
}