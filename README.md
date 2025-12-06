# SIG-Talento-Interno

## Instrucciones para fusionar con el repositorio de Aldo

Como asistente de IA, no tengo permisos para ejecutar comandos de terminal directamente en tu máquina ni acceso a internet para descargar repositorios externos. Debes ejecutar manualmente los siguientes comandos para traer el código:

1.  Abre una terminal en VS Code (`Terminal` -> `New Terminal`).
2.  Copia y pega el siguiente bloque de comandos:

```powershell
# Añadir el origen remoto
git remote add aldo https://github.com/AldoRJ24/SistemaGestionTalentoFront

# Descargar los cambios
git fetch aldo

# Fusionar con tu código actual
git merge aldo/main --allow-unrelated-histories -m "Fusionando repositorio de Aldo"
```

3.  Si el comando de fusión falla porque la rama se llama `master`, usa:
    `git merge aldo/master --allow-unrelated-histories -m "Fusionando repositorio de Aldo"`

Una vez hecho esto, si aparecen **conflictos** (archivos con marcas `<<<<<<<`), avísame y yo me encargaré de arreglar el código.
