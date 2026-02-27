@echo off
echo Abriendo proyecto en VS Code...

cd /d "%~dp0"
code .

exit

:: @echo off: Evita que se muestren los comandos en la consola
:: echo Abriendo proyecto en VS Code...: Muestra un mensaje indicando que se está abriendo el proyecto
:: cd /d "%~dp0": Cambia el directorio actual al directorio donde se encuentra el archivo .bat
:: code .: Abre Visual Studio Code en el directorio actual
:: exit: Cierra la ventana de la consola después de ejecutar los comandos

REM Si VS Code no está en la variable de entorno PATH, descomenta la siguiente línea y ajusta la ruta
:: "C:\Ruta\A\VSCode\Code.exe" .