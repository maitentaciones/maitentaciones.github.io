# MaiTentaciones

Página de pastelería artesanal con vitrina de precios, armador de tortas a medida y
panel de administración. Los pedidos salen por WhatsApp y quedan guardados en la base.

- **Backend:** FastAPI + SQLAlchemy + SQLite (entorno virtual en `.venv/`)
- **Frontend:** React 19 + Vite + Tailwind 4

## Arrancar

```bash
./start.sh
```

Levanta las dos cosas:

- Frontend: http://localhost:5173
- API y documentación interactiva: http://localhost:8001/docs

Para arrancarlos por separado:

```bash
cd backend && ../.venv/bin/python -m uvicorn app.main:app --reload --port 8001
```

```bash
npm run dev --prefix frontend
```

> El backend usa el puerto **8001** porque el 8000 ya estaba ocupado en esta máquina.
> Si querés otro, cambialo en el comando de uvicorn y arrancá el frontend con
> `BACKEND_URL=http://127.0.0.1:8000 npm run dev --prefix frontend`.

## Panel de administración

http://localhost:5173/admin

- Usuario: `admin@maitentaciones.com`
- Contraseña: `cambiala1234`

**Cambiá estas credenciales antes de publicar la página.** Copiá `backend/.env.example`
a `backend/.env`, poné ahí el email y la contraseña definitivos y borrá la base
(`backend/pasteleria.db`) para que se vuelva a crear el usuario, o creá el nuevo admin a
mano desde `python -m app.seed`.

Desde el panel se maneja todo sin tocar código:

| Pestaña | Para qué sirve |
| --- | --- |
| Pedidos | Ver los encargos que entraron, cambiar su estado y escribirle al cliente |
| Productos | Cargar tortas, cookies, precios, fotos y qué se muestra en la portada |
| Categorías | Las secciones de la vitrina |
| Personalizador | Los pasos del armador de tortas y el precio de cada opción |

## Configuración de la marca

Todo lo que cambia según el negocio está en `backend/.env` (copiá `.env.example`):

```
SHOP_NAME=MaiTentaciones
WHATSAPP_NUMBER=5491100000000   # solo números, con código de país y sin el 15
INSTAGRAM_USER=maitentaciones
CONTACT_EMAIL=hola@maitentaciones.com
```

El número de WhatsApp es el que recibe los pedidos: **hay que cambiarlo antes de
publicar**, ahora tiene uno de ejemplo.

`SHOP_NAME` es el único lugar donde vive el nombre del negocio: de ahí salen el título
de la pestaña, el logo del encabezado, el pie de página y el encabezado del mensaje de
WhatsApp. Si el nombre cambia, se cambia acá y se reinicia el backend, nada más.

## Cómo funciona el armador de tortas

Cada paso del armador es un `OptionGroup` con sus `Option`. El paso marcado como
«precio base» (por defecto, *Tamaño*) fija el precio de arranque; el resto de las
opciones suman su valor. El dibujo de la torta lee los pasos por su slug:

| Slug | Qué controla en el dibujo |
| --- | --- |
| `tamano` | Alto, ancho y si la torta es de dos pisos |
| `bizcochuelo` | Color de las capas internas |
| `relleno` | Color de las franjas entre capas (hasta 2) |
| `cobertura` | Terminación exterior: lisa, naked, drip, merengue o fondant |
| `decoracion` / `extras` | Flores, frutas, macarons, velas, topper |

Si agregás pasos nuevos con otros slugs, funcionan igual para el precio y para el
resumen del pedido: simplemente no modifican el dibujo.

## Estructura

```
.venv/                    entorno virtual de Python
backend/
  app/
    main.py               app FastAPI y CORS
    models.py             tablas
    schemas.py            validación de entrada y salida
    auth.py               login del panel (JWT)
    seed.py               datos de ejemplo
    routers/
      catalog.py          vitrina y armador (público)
      orders.py           alta de pedidos (público)
      admin.py            login y ABM del panel
  pasteleria.db           base SQLite (se crea sola)
frontend/
  src/
    pages/                Home, Catalogo, Personalizar, Nosotros, Admin
    components/
      CakePreview.jsx     dibujo de la torta en SVG
      CartDrawer.jsx      carrito y envío por WhatsApp
      admin/              paneles del administrador
    lib/                  cliente HTTP, formato de precios, mensaje de WhatsApp
    store/                carrito y datos del negocio
```

## Publicar en GitHub Pages

GitHub Pages solo sirve archivos estáticos: no puede correr el backend. Como los
pedidos salen por WhatsApp (que es un simple link, sin servidor), la web publicada
funciona igual — vitrina, armador de tortas, precios y envío del pedido. Lo único
que cambia es que **el catálogo queda congelado al momento de publicar**: para
cambiar un precio se edita en el panel local y se vuelve a publicar.

El panel de administración no viaja: en la web publicada, `/admin` avisa que corre
en la computadora del proyecto.

### La primera vez

1. Exportá el catálogo y creá el repositorio:

   ```bash
   cd backend && ../.venv/bin/python -m app.export_static && cd ..
   git init -b main
   git add .
   git commit -m "Primera versión de la web"
   ```

2. Creá un repositorio **público** en GitHub (Pages gratuito no funciona en
   repositorios privados) y conectalo:

   ```bash
   git remote add origin https://github.com/USUARIO/REPOSITORIO.git
   git push -u origin main
   ```

3. En GitHub, entrá a **Settings → Pages** y en «Source» elegí **GitHub Actions**.

4. Listo. En un par de minutos la página queda en:
   `https://USUARIO.github.io/REPOSITORIO/`

### Cada vez que cambien precios o productos

```bash
./publicar.sh
```

Exporta el catálogo actualizado, lo sube y GitHub republica la página sola.

### Cómo funciona por dentro

- `python -m app.export_static` vuelca la base a `frontend/public/data/*.json`.
- El workflow `.github/workflows/deploy.yml` construye con `VITE_STATIC=1`, que hace
  que la web lea esos JSON en vez de llamar a la API, y con `BASE_PATH` apuntando al
  nombre del repositorio, porque Pages publica en una subcarpeta.
- El build copia `index.html` a `404.html`: sin eso, entrar directo a `/catalogo`
  daría error, ya que Pages no conoce las rutas internas de React.

### Probar antes de publicar

```bash
cd frontend && BASE_PATH=/REPOSITORIO/ VITE_STATIC=1 npm run build
BASE_PATH=/REPOSITORIO/ npx vite preview
```

Abre `http://localhost:4173/REPOSITORIO/`, igual que se va a ver publicada.

### Antes de compartir el link

- Poné el número real de WhatsApp en `backend/.env` y volvé a exportar: el que está
  ahora es de ejemplo y los pedidos no llegan a ningún lado.
- Cargá los productos y precios reales desde el panel.
- Tené en cuenta que el repositorio es público: el código queda a la vista. La base
  de datos y el archivo `.env` no se suben (están en `.gitignore`), pero el número
  de WhatsApp y los precios sí son visibles, como en cualquier web.

## Publicar en otro hosting (con backend)

Si más adelante querés que el panel funcione online y los pedidos queden guardados,
hace falta un servidor que corra Python (un VPS, por ejemplo):

1. `npm run build --prefix frontend` genera `frontend/dist/` para servir como estático.
2. El backend corre con uvicorn detrás de nginx, con `/api` apuntando a él.
3. Acordate de definir `SECRET_KEY`, cambiar `ADMIN_PASSWORD` y, si el frontend está en
   otro dominio, agregarlo a `CORS_ORIGINS` y configurar `VITE_API_URL`.

## Datos de ejemplo

Los 18 productos y sus precios son de muestra para que se vea cómo queda: hay que
reemplazarlos por los reales desde el panel. Para volver a cargarlos:

```bash
cd backend && ../.venv/bin/python -m app.seed
```
