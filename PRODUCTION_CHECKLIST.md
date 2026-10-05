# Checklist de Producción — Pizzería Express Colombia

Este checklist detalla cada uno de los pasos obligatorios requeridos para desplegar la aplicación a producción comercial.

## 1. Identidad de Marca y Visual
- [ ] **Definir nombre comercial definitivo:** Actualizar `siteConfig.brand.name` y `siteConfig.brand.shortName`.
- [ ] **Crear logo oficial:** Reemplazar `/public/images/brand/logo.svg` y favicon `/public/favicon.ico`.
- [ ] **Identidad visual y colores:** Ajustar paleta en `config/siteConfig.ts` y variables CSS en `app/globals.css`.
- [ ] **Sustituir imágenes de catálogo:** Reemplazar los placeholders SVG por fotografías reales de pizzas, combos, bordes y postres según la lista detallada en [TODO_IMAGE_REPLACEMENT.md](file:///d:/Users/Matheus%20Naves/Desktop/del%20col/TODO_IMAGE_REPLACEMENT.md).
- [ ] **Banner Open Graph:** Generar imagen de 1200x630px para `/public/images/brand/og-image.jpg`.

## 2. Catálogo Gastronómico y Precios
- [ ] **Revisar sabores de pizza:** Validar formulación de ingredientes en `catalog/flavors.ts`.
- [ ] **Confirmar porciones físicas:** Confirmar diámetro físico en centímetros de los 5 tamaños (Personal 4 porciones, Mediana 6, Familiar 8, Gigante 10, Extragrande 12).
- [ ] **Confirmar bebidas y convenios:** Validar disponibilidad de referencias Postobón y Coca-Cola en `catalog/drinks.ts`.
- [ ] **Confirmar precios en COP:** Verificar que los precios fijos de Super Combos y Combos Especiales correspondan a la política comercial vigente.
- [ ] **Adicionales y bordes:** Validar ingredientes disponibles para extras (máximo 5 por pizza) y precios de borde relleno de queso y queso con bocadillo.

## 3. Cobertura y Horarios
- [ ] **Configurar horario real de apertura y cierre:** Ajustar `siteConfig.schedule.weekdays` con las horas exactas de cocina para Colombia (UTC-5).
- [ ] **Definir radio de cobertura de domicilios:** Configurar zonas y barrios atendidos para entrega con Domicilio Gratis.

## 4. Datos Jurídicos y Normatividad Colombiana
- [ ] **Razón Social:** Reemplazar el placeholder `LEGAL_COMPANY_NAME` en `config/siteConfig.ts`.
- [ ] **NIT de la empresa:** Reemplazar `LEGAL_NIT` por el Número de Identificación Tributaria con dígito de verificación.
- [ ] **Dirección física:** Reemplazar `LEGAL_ADDRESS` por la dirección de la sede o cocina principal en Colombia.
- [ ] **Correo de atención y PQRs:** Reemplazar `LEGAL_EMAIL` por el correo corporativo (ej. `servicioalcliente@dominio.com`).
- [ ] **Políticas publicadas:** Revisar la Política de Tratamiento de Datos (Ley 1581 de 2012) y Términos y Condiciones (Ley 1480 de 2011).

## 5. Infraestructura y Base de Datos
- [ ] **Aprovisionar PostgreSQL:** Desplegar base de datos PostgreSQL (Supabase, Neon, AWS RDS o similar).
- [ ] **Configurar variable `DATABASE_URL`:** En el panel de hosting (Vercel, Railway, etc.).
- [ ] **Ejecutar migraciones en producción:** Correr `npx prisma db push` o migraciones Prisma.
- [ ] **Dominio y Certificado SSL:** Configurar dominio `.com` o `.co` con HTTPS forzado y headers de seguridad HSTS.

## 6. Pasarela de Pago XPAG (Colombia COP)
- [ ] **Credenciales de producción XPAG:**
  - `XPAG_CLIENT_ID`
  - `XPAG_CLIENT_SECRET`
  - `XPAG_WEBHOOK_SECRET`
  - `XPAG_BASE_URL="https://api.xpag.global"`
- [ ] **Validación de Webhook:** Probar recepción de eventos reales en `/api/webhooks/xpag` con HTTPS.
- [ ] **Prueba de pago real Nequi:** Realizar pago de prueba real de $27.900 COP desde app Nequi.
- [ ] **Prueba de pago real Bre-B:** Realizar transferencia bancaria interoperable hacia la llave o cuenta asignada.
- [ ] **Verificar conciliación:** Confirmar que el webhook active automáticamente el estado `paid` en la base de datos y en la pantalla del cliente.

## 7. Meta Pixel & Marketing
- [ ] **Configurar `NEXT_PUBLIC_META_PIXEL_ID`:** Con el ID del pixel de Facebook / Meta Business Manager.
- [ ] **Verificar eventos estándar con Meta Pixel Helper:**
  - PageView en navegación
  - ViewContent al abrir producto
  - AddToCart al agregar al carrito
  - InitiateCheckout en checkout
  - AddPaymentInfo al seleccionar Nequi o Bre-B
  - Purchase al confirmar pago exitoso (sin duplicidad en refresh)

## 8. Despliegue y Auditoría
- [ ] **Desactivar mocks:** Asegurar que `NODE_ENV="production"`.
- [ ] **Auditoría Mobile en dispositivos reales:** Probar en 360px, 375px, 390px, 414px y 430px.
- [ ] **Ejecutar suite de pruebas:** `npm test` (27+ pruebas unitarias y E2E).
- [ ] **Compilación exitosa:** `npm run build`.
