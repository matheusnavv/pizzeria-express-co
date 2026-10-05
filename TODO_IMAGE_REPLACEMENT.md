# TODO: Reemplazo de Imágenes para Producción (TODO_IMAGE_REPLACEMENT)

Este documento registra los activos de imagen utilizados en el proyecto y los requisitos para su sustitución por fotografías reales de alta resolución antes del lanzamiento comercial.

## Reglas para las imágenes finales
1. **Formato:** WebP optimizado o AVIF con compresión progresiva.
2. **Dimensiones sugeridas:**
   - Hero / Banners: 1200x800px (desktop), 800x600px (mobile)
   - Productos / Combos / Pizzas: 600x600px (aspect ratio 1:1)
   - Bordes / Acompañamientos / Postres / Bebidas: 400x400px (aspect ratio 1:1)
   - Favicon / Logo: SVG vectorial y PNG transparente
3. **Ubicación en el repositorio:** `/public/images/`
   - `/public/images/brand/` -> Logo, favicon, Open Graph
   - `/public/images/products/` -> Pizzas, combos, acompañamientos, bebidas, postres
   - `/public/images/crusts/` -> Bordes rellenos
4. **No Hotlinking:** Todas las imágenes deben residir en la carpeta `/public` local para evitar fallas de disponibilidad de terceros y latencia.

## Lista de Archivos a Sustituir:

### Identidad de Marca:
- [ ] `/public/images/brand/logo.svg` — Logotipo oficial de la marca
- [ ] `/public/images/brand/og-image.jpg` — Imagen para compartir en redes sociales (1200x630px)
- [ ] `/public/images/brand/favicon.ico` — Ícono de pestaña

### Super Combos:
- [ ] `/public/images/products/super-combo-1.webp` — 2 Pizzas Personales + 1 Gaseosa 1.5L
- [ ] `/public/images/products/super-combo-2.webp` — 2 Pizzas Medianas + 1 Gaseosa 1.5L
- [ ] `/public/images/products/super-combo-3.webp` — 2 Pizzas Familiares + 1 Gaseosa 1.5L
- [ ] `/public/images/products/super-combo-4.webp` — 2 Pizzas Gigantes + 1 Gaseosa 1.5L
- [ ] `/public/images/products/super-combo-5.webp` — 2 Pizzas Extragrandes + 2 Gaseosas 1.5L (Más Vendido)
- [ ] `/public/images/products/super-combo-6.webp` — 3 Pizzas Extragrandes + 3 Gaseosas 1.5L (Mejor para Compartir)

### Combos Especiales:
- [ ] `/public/images/products/combo-especial-hawaiana.webp` — Pizza Mediana Hawaiana + Gaseosa
- [ ] `/public/images/products/combo-especial-pepperoni.webp` — Pizza Mediana Pepperoni + Gaseosa
- [ ] `/public/images/products/combo-especial-pollo-champinones.webp` — Pizza Mediana Pollo con Champiñones + Gaseosa
- [ ] `/public/images/products/combo-especial-carnes.webp` — Pizza Mediana Carnes + Gaseosa
- [ ] `/public/images/products/combo-especial-paisa.webp` — Pizza Mediana Paisa + Gaseosa
- [ ] `/public/images/products/combo-especial-jamon-queso.webp` — Pizza Mediana Jamón y Queso + Gaseosa

### Sabores de Pizza:
- [ ] `/public/images/products/pizza-hawaiana.webp`
- [ ] `/public/images/products/pizza-pollo-champinones.webp`
- [ ] `/public/images/products/pizza-pepperoni.webp`
- [ ] `/public/images/products/pizza-jamon-queso.webp`
- [ ] `/public/images/products/pizza-carnes.webp`
- [ ] `/public/images/products/pizza-criolla.webp`
- [ ] `/public/images/products/pizza-paisa.webp`
- [ ] `/public/images/products/pizza-pollo-tocineta.webp`
- [ ] `/public/images/products/pizza-miel-mostaza.webp`
- [ ] `/public/images/products/pizza-vegetariana.webp`

### Bordes Rellenos:
- [ ] `/public/images/crusts/borde-tradicional.webp` — Masa crocante dorada
- [ ] `/public/images/crusts/borde-queso.webp` — Queso derretido estirándose
- [ ] `/public/images/crusts/borde-queso-bocadillo.webp` — Combinación típica colombiana de queso y bocadillo de guayaba

### Acompañamientos:
- [ ] `/public/images/products/pan-de-ajo.webp` — Pan de Ajo con Queso (4 und)
- [ ] `/public/images/products/dedos-de-queso.webp` — Dedos de Queso crocantes (6 und)
- [ ] `/public/images/products/papas-a-la-francesa.webp` — Papas a la francesa doradas

### Postres:
- [ ] `/public/images/products/pizza-arequipe-queso.webp` — Arequipe colombiano y queso derretido
- [ ] `/public/images/products/pizza-bocadillo-queso.webp` — Bocadillo veleño y queso
- [ ] `/public/images/products/pizza-nutella.webp` — Nutella cremosa
- [ ] `/public/images/products/brownie.webp` — Brownie de chocolate suave

### Bebidas:
- [ ] `/public/images/products/coca-cola-original.webp` — Coca-Cola Original 1.5 L
- [ ] `/public/images/products/coca-cola-zero.webp` — Coca-Cola Zero 1.5 L
- [ ] `/public/images/products/colombiana-postobon.webp` — Gaseosa Colombiana Postobón 1.5 L
- [ ] `/public/images/products/manzana-postobon.webp` — Gaseosa Manzana Postobón 1.5 L
