# Mobile Automation

Automatización de la aplicación Native Demo de WebdriverIO para Android. La
suite está construida con WebdriverIO 9, Appium 3, UiAutomator2, Mocha y
TypeScript, y cubre navegación, registro, autenticación y el carrusel de
Swipe.

## Requisitos

- Node.js `24.20.0` (la versión fijada en `.nvmrc`) y npm 10 o superior.
- Java/JDK 17 o superior, disponible en `PATH`.
- Android SDK con `platform-tools` en `PATH` para disponer de `adb`.
- Un emulador Android o un dispositivo físico con depuración USB habilitada.
- Conexión a internet para descargar el APK si todavía no está en el equipo.

En Windows, Android Studio instala el SDK y el JDK necesarios. Si `adb` no
está en `PATH`, agrega `<Android SDK>/platform-tools`. En Linux o macOS,
configura también `ANDROID_HOME` o `ANDROID_SDK_ROOT` apuntando al SDK.

## Instalación

Clona el repositorio y usa la instalación reproducible basada en el lockfile:

```bash
git clone <repository-url>
cd mobile-automation
npm ci
```

Comprueba que Appium encuentre el driver UiAutomator2 incluido en las
dependencias. La instalación del driver se hace una vez por equipo y queda en
el registro local de Appium:

```bash
npm run appium:install
npm run appium:check
```

## Aplicación bajo prueba

El script descarga la versión oficial `v2.2.0` de WebdriverIO Native Demo App
y verifica tamaño y SHA-256 antes de dejar el APK disponible para el runner.
El binario está excluido de Git y se guarda en:

```text
apps/android/wdio-native-demo-app-2.2.0.apk
```

Descarga y valida el APK con:

```bash
npm run apk:download
```

Si necesitas reemplazar una descarga existente de forma intencional:

```bash
npm run apk:download -- --force
```

## Configurar el objetivo Android

### Emulador

Puedes crear y arrancar un AVD desde Android Studio. Como alternativa, con
las herramientas del SDK instaladas:

```bash
sdkmanager "platform-tools" "platforms;android-35" \
  "system-images;android-35;google_apis;x86_64"
avdmanager create avd -n Pixel_8_API_35 \
  -k "system-images;android-35;google_apis;x86_64"
emulator -avd Pixel_8_API_35
adb devices
```

La salida de `adb devices` debe mostrar el emulador como `device` (no
`offline`). El nombre predeterminado que usa el runner es `Android Emulator`;
puedes cambiarlo con `ANDROID_DEVICE_NAME`.

### Dispositivo físico

Activa las opciones de desarrollador y la depuración USB, conecta el
dispositivo y acepta la autorización RSA. Confirma la conexión con:

```bash
adb devices
```

Usa el identificador mostrado por `adb` cuando haya más de un objetivo:

```bash
ANDROID_UDID=<device-id> npm test
```

### Variables de ejecución

Las variables son opcionales; `.env.example` documenta los valores
predeterminados, pero el runner las recibe desde el entorno del proceso.

| Variable | Predeterminado | Uso |
| --- | --- | --- |
| `ANDROID_APP_PATH` | `apps/android/wdio-native-demo-app-2.2.0.apk` | Ruta a un APK local alternativo. |
| `ANDROID_DEVICE_NAME` | `Android Emulator` | Nombre del dispositivo o AVD. |
| `ANDROID_UDID` | — | Identificador exacto reportado por `adb devices`. |

En PowerShell:

```powershell
$env:ANDROID_DEVICE_NAME = 'Pixel_8_API_35'
$env:ANDROID_UDID = 'emulator-5554'
npm test
```

En bash/zsh:

```bash
ANDROID_DEVICE_NAME=Pixel_8_API_35 ANDROID_UDID=emulator-5554 npm test
```

## Comandos

```bash
npm run quality          # higiene, typecheck y driver Appium
npm run check:solution   # archivos de entrega y ausencia de binarios/enunciados
npm run typecheck        # compilación TypeScript sin emitir archivos
npm run appium:install   # instala la versión fijada de UiAutomator2
npm run appium:check     # driver UiAutomator2 disponible
npm run apk:download     # descarga y validación del APK
npm test                 # suite móvil; requiere APK y objetivo Android
```

La integración continua ejecuta `npm ci`, `check:solution`, `typecheck`, instala
el driver fijado y ejecuta `appium:check`. No arranca un emulador en CI: los
cuatro escenarios se ejecutan localmente contra un dispositivo Android
configurado.

## Arquitectura

```text
config/wdio.conf.ts                 Configuración Appium/WebdriverIO
scripts/download-apk.mjs            Descarga y verificación del APK
scripts/check-solution.mjs          Higiene estática de la entrega
tests/specs/                        Escenarios de comportamiento
tests/support/components/           Componentes compartidos (alerta y tabs)
tests/support/helpers/              Gestos y datos de prueba
tests/support/page-objects/         Page Objects de cada pantalla
apps/android/                       APK local ignorado por Git
```

Cada escenario prepara su propio estado inicial. Los Page Objects centralizan
selectores, esperas y acciones para que las especificaciones describan el
comportamiento del usuario y puedan ejecutarse de forma aislada.

## Solución de problemas

- Si `npm ci` falla, verifica Node con `node --version` y usa la versión de
  `.nvmrc`.
- Si `npm run appium:check` no muestra `uiautomator2`, ejecuta
  `npm run appium:install` y comprueba que no estés usando una instalación
  global distinta.
- Si Appium no encuentra el objetivo, revisa `adb devices`, `ANDROID_UDID` y
  que el emulador haya terminado de arrancar.
- Si la descarga del APK falla por una validación de checksum, no uses un APK
  diferente: revisa la conexión y vuelve a ejecutar el comando.
