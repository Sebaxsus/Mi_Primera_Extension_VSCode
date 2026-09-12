- [ ] Agregar un sección de configuración a la Web View, Debe tener la info de La alarma, Tiempo de trabajo, Tiempo de descanso, Mínimo Diario.
- [ ] Implementar una función para reproducir música desde el pwsh.
- [ ] Probar la función de YT.
- [ ] Probar la función de Spotify (Incluyendo el Auth Supongo).
- [ ] Refactorizar el WebView de Extension y separarlo.
- [ ] Separar el HTML String de la función de WebView para mejorar su mantenibilidad


## FIXES

- [ ] En el timer cambiar el stopTimer, y onTimerFinish
- [ ] Incluir un Estado para la alarma con el fin de determinar si se esta ejecutando o no.


## NUEVAS (detectadas en revisión de código, 2026-09-12)

- [ ] Implementar la etapa de "estiramiento" (nueva sección de timer, configuración y alarma asociada) — actualmente no existe en el código, solo trabajo y descanso.
- [ ] Conectar o eliminar `src/Spotify/playerManager.ts` y `src/Spotify/Local_AND_pwsh.ts` (código exploratorio no integrado al flujo principal).
- [ ] Quitar la ruta absoluta hardcodeada de `player_bridge.ps1` en `MusicPlayer` (rompe portabilidad entre máquinas).
- [ ] Actualizar README.md/CHANGELOG.md para reflejar que Spotify y YouTube siguen en fase experimental (ver `doc/current_status.md`).