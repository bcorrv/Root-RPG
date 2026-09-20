# Root RPG — Woodland Companion

Companion web/PWA para una campaña sandbox física de **Root**.

## Principio
- **Mesa física = mundo**
- **App = memoria y sistema**
- **GPT / GM = interpretación, NPC, consecuencias y lectura del mundo**

## v0.6 — Character System V1

La progresión del Vagabundo ya no usa HP, XP ni niveles genéricos. El personaje crece mediante:

**habilidades → objetos → relaciones → reputación → hitos → historia**

### Vagabundos disponibles
Por ahora solo los tres del juego base:
- **Thief**
- **Ranger**
- **Tinker**

La arquitectura está separada en `characters.js` para añadir posteriormente Vagabond Pack u otros personajes sin reescribir la interfaz.

### Crear Vagabundo
Flujo de tres pasos:
1. nombre del personaje — único campo de texto obligatorio;
2. elegir una carta visual grande: Thief, Ranger o Tinker;
3. confirmar y comenzar.

Cada carta usa un retrato personalizado creado para el proyecto y muestra identidad, habilidad única y objetos iniciales.

### Objetos Root
El inventario usa exclusivamente los objetos de Root: Boot, Sword, Crossbow, Torch, Hammer, Tea, Coin y Bag.

Cada objeto puede reflejar su estado físico: **listo / agotado / dañado**.

### Habilidades
Cada personaje tiene tres ramas con tres tiers. Se desbloquean mediante **hitos**, no XP.

Los hitos pueden surgir de completar misiones, descubrir o vincular Lugares Míticos, reputación alta, variedad de objetos, acciones propias del arquetipo o eventos importantes.

Las habilidades abren nuevas opciones dentro de misiones y eventos.

### Misiones multietapa
El loop central ahora es:

**Carta de Orden → Rumor/Misión → Investigar pista → localizar claro → llegar físicamente → resolver escena → obtener objeto**

Las habilidades desbloqueadas pueden abrir rutas exclusivas para resolver una misma escena.

### Cartas de Orden
Las Cartas de Orden siguen siendo el motor causal del sandbox:

**Carta de Orden → cambio real en mesa → consecuencia → rumor / misión / fondo**

La app nunca sustituye la resolución oficial de los bots ni el estado físico del tablero.