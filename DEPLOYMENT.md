# Guía de Despliegue de Jaberco en cPanel

## Requisitos Previos

Antes de comenzar el despliegue, asegúrate de tener lo siguiente:

1. Acceso a tu cuenta de cPanel
2. Node.js activado en tu hosting (muchos proveedores tienen la opción "Setup Node.js App")
3. Acceso a la base de datos MySQL o PostgreSQL
4. Los archivos del proyecto preparados para producción

## Paso 1: Preparar los archivos para subir

1. En tu máquina local, ejecuta los siguientes comandos:
   ```bash
   # Instalar dependencias si no están instaladas
   npm install
   
   # Construir el proyecto para producción
   npm run build
   ```

2. Crear un archivo zip con los siguientes archivos y carpetas:
   - `dist/` (carpeta con archivos construidos)
   - `server/` (carpeta con código del servidor)
   - `shared/` (carpeta con esquemas compartidos)
   - `ecosystem.config.js` (configuración de PM2)
   - `.htaccess` (reglas de redirección)
   - `start.js` (script de inicio)
   - `package.json` y `package-lock.json` (dependencias)
   - `drizzle.config.ts` (configuración de la base de datos)

## Paso 2: Configurar Node.js en cPanel

1. Inicia sesión en tu cuenta de cPanel
2. Busca y haz clic en "Setup Node.js App" o "Node.js Selector"
3. Haz clic en "Create Application" o "Create"
4. Configura la aplicación:
   - **Node.js version**: Selecciona la versión 16.x o superior
   - **Application mode**: Production
   - **Application root**: /path/to/your/app (directorio donde subirás los archivos)
   - **Application URL**: Dominio o subdominio para tu aplicación
   - **Application startup file**: dist/index.js

5. Configura las variables de entorno (Environment Variables):
   - `NODE_ENV`: production
   - `PORT`: (el puerto asignado por cPanel, generalmente lo proporciona automáticamente)
   - `DATABASE_URL`: (URL de conexión a tu base de datos PostgreSQL)
   - `CLOUDINARY_CLOUD_NAME`: dsviwqpmy
   - `CLOUDINARY_API_KEY`: (tu clave API de Cloudinary)
   - `CLOUDINARY_API_SECRET`: (tu secreto API de Cloudinary)
   - `STRIPE_SECRET_KEY`: (tu clave secreta de Stripe)
   - `VITE_STRIPE_PUBLIC_KEY`: (tu clave pública de Stripe)
   - `SENDGRID_API_KEY`: (tu clave API de SendGrid)
   - `TWILIO_ACCOUNT_SID`: (tu SID de cuenta Twilio)
   - `TWILIO_AUTH_TOKEN`: (tu token de autenticación Twilio)
   - `TWILIO_PHONE_NUMBER`: (tu número de teléfono Twilio)

6. Haz clic en "Create" o "Save" para crear la aplicación

## Paso 3: Crear y configurar la base de datos

1. En cPanel, busca y haz clic en "MySQL Databases" o "PostgreSQL Databases"
2. Crea una nueva base de datos
3. Crea un nuevo usuario de base de datos
4. Asigna todos los privilegios al usuario para la base de datos creada
5. Anota el nombre de la base de datos, nombre de usuario y contraseña para la configuración

## Paso 4: Subir archivos al servidor

1. En cPanel, busca y haz clic en "File Manager"
2. Navega hasta el directorio raíz de tu aplicación Node.js (configurado en el Paso 2)
3. Sube el archivo zip que creaste en el Paso 1
4. Extrae los archivos del zip
5. Elimina el archivo zip después de extraer

Alternativamente, puedes usar FTP:
1. Usa un cliente FTP como FileZilla
2. Conéctate a tu servidor usando las credenciales de FTP de cPanel
3. Sube los archivos al directorio raíz de tu aplicación

## Paso 5: Instalar dependencias y configurar la base de datos

1. En cPanel, busca y haz clic en "Terminal" o "SSH Access"
2. Navega hasta el directorio de tu aplicación:
   ```bash
   cd /path/to/your/app
   ```

3. Instala las dependencias:
   ```bash
   npm install --production
   ```

4. Ejecuta la migración de la base de datos:
   ```bash
   npx tsx drizzle/migrate.ts
   ```

## Paso 6: Iniciar la aplicación

1. Asegúrate de estar en el directorio de tu aplicación
2. Instala PM2 globalmente (si no está instalado):
   ```bash
   npm install -g pm2
   ```

3. Inicia la aplicación usando PM2:
   ```bash
   pm2 start ecosystem.config.js
   ```

4. Configura PM2 para que se inicie automáticamente después de reinicios:
   ```bash
   pm2 save
   pm2 startup
   ```
   Sigue las instrucciones que proporciona este comando

## Paso 7: Configurar el dominio

1. En cPanel, busca y haz clic en "Domains" o "Subdomains"
2. Configura tu dominio o subdominio para que apunte al directorio de tu aplicación

## Solución de problemas comunes

### La aplicación no inicia
1. Verifica los logs de error:
   ```bash
   pm2 logs
   ```
2. Asegúrate de que todas las variables de entorno estén configuradas correctamente
3. Verifica que la base de datos esté accesible

### Problemas de conexión a la base de datos
1. Verifica que la URL de conexión sea correcta
2. Asegúrate de que el usuario tenga los permisos adecuados
3. Verifica que la base de datos esté creada

### Archivos estáticos no se cargan
1. Verifica que las reglas en el archivo .htaccess sean correctas
2. Asegúrate de que los archivos estén en la carpeta dist/public
3. Verifica los permisos de los archivos (generalmente 644 para archivos, 755 para carpetas)

### Errores 500 Internal Server Error
1. Revisa los logs de error del servidor Apache/Nginx en cPanel
2. Verifica los logs de la aplicación usando `pm2 logs`

## Notas adicionales

* Para actualizar la aplicación, sube los nuevos archivos y reinicia la aplicación:
  ```bash
  pm2 restart jaberco
  ```

* Para detener la aplicación:
  ```bash
  pm2 stop jaberco
  ```

* Para ver el estado de la aplicación:
  ```bash
  pm2 status
  ```

* Para ver los logs en tiempo real:
  ```bash
  pm2 logs jaberco
  ```