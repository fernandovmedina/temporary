# Sistema de Evaluación de Husillos

App Next.js para evaluar configuraciones de husillos industriales. El operador ingresa N configuraciones (P1, P2, …), elige las 3 mejores manualmente, y la app genera gráficas comparativas.

## Stack

- **Next.js 16.2.9** con App Router y Turbopack
- **React 19 / TypeScript 5**
- **Tailwind CSS 4** (configuración vía PostCSS, sin `tailwind.config`)
- **chart.js 4 + react-chartjs-2 5** para todas las gráficas
- **pnpm** como package manager (lock v9)
- Deploy en **Vercel**

## Comandos

```bash
pnpm dev      # servidor de desarrollo en localhost:3000
pnpm build    # build de producción (TypeScript strict)
pnpm lint     # ESLint
```

## Flujo de la aplicación

La app es una máquina de estados controlada en `app/page.tsx` con la variable `fase: FaseApp`.

```
inicio → entrada (manual)  ─┐
       → csv               ─┴→ seleccion → resultados
```

| Fase | Componente | Descripción |
|------|-----------|-------------|
| `inicio` | `FaseInicio` | Elige entrada manual o CSV |
| `entrada` | `FaseEntrada` | Formulario por config; permite agregar N configuraciones y finalizar |
| `csv` | `FaseCSV` | Drag & drop o click para subir `.csv`; muestra preview antes de confirmar |
| `seleccion` | `FaseSeleccion` | Click en orden para elegir 1ro, 2do, 3ro |
| `resultados` | `FaseResultados` | Podio + 5 gráficas + tabla comparativa |

## Tipos principales (`app/types.ts`)

```ts
interface ConfiguracionP {
  nombre: string;          // "P1", "P2", …
  r1912–r1948: number;     // 10 parámetros de registro
  corriente: number;       // Amperes
  rpm: number;
}

type FaseApp = "inicio" | "entrada" | "csv" | "seleccion" | "resultados";
```

`CAMPOS_PARAMETROS` exporta el array canónico de campos con `key`, `label` y `unit`.
Los primeros 10 son parámetros de registro; los últimos 2 son `corriente` y `rpm`.

## Parser CSV (`app/utils/csvParser.ts`)

- Acepta separador `,` o `;` (auto-detectado)
- Elimina BOM de Excel
- Acepta alias de columnas: `r1934[0]` → `r1943_0`, `amperaje`/`velocidad` → `rpm`
- Devuelve `ParseResult | ParseError`; los warnings no bloquean la importación

Formato esperado de cabecera:
```
r1912,r1913,r1915,r1925,r1927,r1932[0],r1932[1],r1934[0],r1936,r1948,Corriente,Amperaje
```

## Gráficas (`FaseResultados` + `GraficaProximidad`)

Todos los registros de ChartJS se hacen con `ChartJS.register(...)` en cada componente que los usa.

| Gráfica | Tipo | Datos |
|---------|------|-------|
| Score global | Bar | Promedio normalizado de los 10 parámetros (0-100%) |
| Proximidad al ideal | Bar horizontal | Mismo score; barra verde = 100% ideal |
| Distribución (campana) | Line | Gaussiana sobre los scores; puntos = configs |
| Radar top 3 | Radar | 10 parámetros normalizados por máximo |
| RPM / Corriente | Bar (×2) | Valores absolutos coloreados por lugar en ranking |

## Estilos

Clases utilitarias propias definidas en `app/globals.css`:

- `.glass-card` — fondo oscuro translúcido con `backdrop-filter: blur`
- `.glow-blue / .glow-orange / .glow-green` — `box-shadow` de color
- `.fade-in` — animación de entrada con `opacity + translateY`
- `.pulse-ring` — pulso azul para indicar el campo activo

## Errores TypeScript conocidos de chart.js

- `borderDash` **no existe** en `ChartDataset<"bar">` — solo aplica a datasets de tipo `"line"`.
- `ctx.parsed.x` puede ser `null` en tooltips de barras horizontales → usar `?? 0`.
