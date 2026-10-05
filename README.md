# 🍕 Pizzería Express — Colombia

Aplicación completa de delivery de pizza construida desde cero y adaptada 100% al mercado colombiano (`es-CO`, moneda `COP`). Cuenta con personalización avanzada de pizzas (mitad y mitad, bordes rellenos, ingredientes extra), combos promocionales con precios fijos en COP, carrito persistente, checkout sin fricción con dirección colombiana y pagos instantáneos con **Nequi** y **Bre-B** mediante la pasarela **XPAG**.

---

## 🚀 Tecnologías y Stack

- **Framework Web:** Next.js (App Router, React 18, TypeScript 5).
- **Estilos y Diseño:** Tailwind CSS con tokens CSS nativos y diseño ultra-rápido Mobile First.
- **Base de Datos & ORM:** PostgreSQL con Prisma ORM (modelos: `Order`, `OrderItem`, `PaymentTransaction`, `PaymentEvent`).
- **Validaciones:** Zod (esquemas de validación estricta y normalización de celular colombiano).
- **Pasarela de Pagos:** XPAG Colombia (`POST /cashin`, `GET /consult-transaction`, Webhooks de cash-in con idempotencia).
- **Analítica Comercial:** Meta Pixel (`PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `AddPaymentInfo`, `Purchase` server-verified y deduplicado).
- **Pruebas:** Vitest (27+ pruebas automatizadas unitarias, de integración y flujo E2E).

---

## 📦 Instalación y Configuración Local

### 1. Clonar e Instalar Dependencias
```bash
git clone <url-del-repositorio>
cd del-col
npm install
```

### 2. Configurar Variables de Entorno
Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

Variables disponibles:
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pizzeria_co?schema=public"

# Credenciales XPAG (Sandbox o Producción)
XPAG_CLIENT_ID="xpagsandbox_00000000"
XPAG_CLIENT_SECRET="202620262026202620262026"
XPAG_WEBHOOK_SECRET="tu_secreto_de_webhook"
XPAG_BASE_URL="https://api.xpag.global"

# Meta Pixel (Facebook / Instagram Ads)
NEXT_PUBLIC_META_PIXEL_ID=""
```

### 3. Base de Datos y Migraciones
Genera el cliente de Prisma y aplica el esquema a PostgreSQL:
```bash
npm run db:generate
npm run db:push
```
*Nota: Si no tienes PostgreSQL encendido en tu entorno local de desarrollo, el repositorio incluye un modo de almacenamiento en memoria tolerante a fallos para pruebas fluidas.*

### 4. Ejecutar Servidor de Desarrollo
```bash
npm run dev
```
Abre tu navegador en [http://localhost:3000](http://localhost:3000).

---

## 🧪 Pruebas Automatizadas

El proyecto incluye 27 pruebas que garantizan las reglas de negocio críticas:
```bash
npm test
```
Cobertura de pruebas:
- Formateo de moneda colombiana COP.
- Validación de pedido mínimo ($27.900 COP).
- Cálculo de los 6 Super Combos y Combos Especiales ($31.900 COP).
- Precios de bordes por tamaño (Tradicional $0, Queso, Queso + Bocadillo).
- Precios de ingredientes extra por tamaño y límite estricto de máximo 5 extras.
- Mitad y mitad sin sobrecosto.
- Selección individual de gaseosas dentro de combos.
- Recálculo estricto server-side (inmunidad a manipulación de precios desde el cliente).
- Normalización y validación de celular colombiano (10 dígitos comenzando con 3).
- Adaptador XPAG Colombia (Nequi y Bre-B).
- Webhook XPAG (validación de firma/secreto, idempotencia, rechazo de monedas foráneas como BRL o MXN).
- Disparo deduplicado del evento `Purchase` en Meta Pixel solo tras confirmación real.
- Flujo E2E móvil completo (Home -> Configuración Pizza 1 y 2 -> Cross-sell -> Checkout -> Pago -> Confirmación).

---

## ⚙️ Guía de Personalización y Mantenimiento

### 1. Cambiar la Marca, Logo o Colores
Toda la identidad de marca está centralizada en [`config/siteConfig.ts`](file:///d:/Users/Matheus%20Naves/Desktop/del%20col/config/siteConfig.ts):
```ts
export const siteConfig = {
  brand: {
    name: "Tu Pizzería",
    tagline: "Tu eslogan aquí",
    contact: { phone: "+573000000000", email: "contacto@tupizzeria.co" },
    colors: { primary: "#E53935", secondary: "#FFB300", accent: "#43A047" }
  },
  commerce: {
    minOrderCOP: 27900, // Pedido mínimo
  }
}
```

### 2. Cómo Agregar Nuevos Sabores de Pizza
Edita [`catalog/flavors.ts`](file:///d:/Users/Matheus%20Naves/Desktop/del%20col/catalog/flavors.ts):
```ts
export const PIZZA_FLAVORS: Flavor[] = [
  ...
  {
    id: 'mexicana',
    name: 'Mexicana',
    description: 'Carne molida sazonada, jalapeños, maíz tierno y queso mozzarella.',
    ingredients: ['Carne sazonada', 'Jalapeños', 'Maíz tierno', 'Queso mozzarella'],
    badge: 'PICANTE',
    image: '/images/products/pizza-mexicana.webp',
  }
];
```

### 3. Cómo Agregar Nuevos Productos o Combos
Edita [`catalog/products.ts`](file:///d:/Users/Matheus%20Naves/Desktop/del%20col/catalog/products.ts):
- Para combos agrega a `SUPER_COMBOS` o `COMBOS_ESPECIALES` especificando `pizzaCount`, `pizzaSizeId`, `drinkCount`.
- Para acompañamientos o postres agrega en `catalog/sides.ts` o `catalog/desserts.ts`.

### 4. Cómo Modificar Precios de Bordes Rellenos
Edita [`catalog/crusts.ts`](file:///d:/Users/Matheus%20Naves/Desktop/del%20col/catalog/crusts.ts) en `CRUST_OPTIONS`. Los precios son enteros en COP por tamaño.

### 5. Cómo Modificar Precios de Ingredientes Adicionales
Edita [`catalog/extras.ts`](file:///d:/Users/Matheus%20Naves/Desktop/del%20col/catalog/extras.ts) modificando `EXTRA_BASE_PRICES_BY_SIZE`.

---

## 💳 Integración con XPAG Pagos (Colombia)

La integración está aislada en `lib/payments/xpag.ts` cumpliendo la documentación oficial:
- **Cash-in Endpoint:** `POST https://api.xpag.global/cashin`
- **Moneda:** `COP`
- **Métodos:** `NEQUI` y `BREB`
- **Monto mínimo:** $10.000 COP
- **Teléfono:** Celular colombiano de 10 dígitos (ej. 3001234567)
- **Consulta de Estado:** `GET https://api.xpag.global/consult-transaction?transaction_id=...`
- **Webhook Receptor:** `POST /api/webhooks/xpag` (soporta validación por token secreto e idempotencia estricta).

---

## 🚢 Despliegue a Producción

Consulta el archivo [`PRODUCTION_CHECKLIST.md`](file:///d:/Users/Matheus%20Naves/Desktop/del%20col/PRODUCTION_CHECKLIST.md) para verificar cada paso antes de lanzar campañas de tráfico pago.
