# Root RPG — Woodland Companion

Companion web/PWA para una campaña sandbox física de **Root**.

## Principio

- **Mesa física = mundo**
- **App = memoria y sistema**
- **GPT / GM = interpretación, NPC, consecuencias y lectura del mundo**

## v0.7 — Character System V1

La campaña ya tiene un sistema de personaje propio manteniendo la identidad mecánica de Root.

### Vagabundos disponibles
Solo los tres del juego base:
- **Thief** — oportunismo, sigilo e información.
- **Ranger** — supervivencia, combate y exploración.
- **Tinker** — creación, recuperación y recursos.

El Vagabond Pack queda preparado en la arquitectura, pero no aparece todavía como opción seleccionable.

### Creación de personaje
El único texto obligatorio es el **nombre**. Después se elige el Vagabundo mediante cartas visuales con:
- retrato original;
- identidad;
- habilidad única;
- estilo de juego;
- objetos iniciales.

Los retratos de Thief, Ranger y Tinker son diseños originales creados específicamente para este companion y se muestran tanto en la selección como en **Mi Vagabundo**.

### Progresión
No hay XP, niveles de personaje, HP ni atributos tradicionales.

La progresión ocurre mediante **hitos**:
- completar misiones;
- descubrir y vincular Lugares Míticos;
- conseguir variedad de objetos;
- alcanzar relaciones importantes;
- intervenir en eventos relevantes;
- actuar de acuerdo con el arquetipo.

Los hitos generan elecciones de habilidad. Cada Vagabundo tiene tres ramas de tres habilidades y puede mezclar ramas libremente.

### Misiones por etapas
Las misiones ya no se completan con un solo botón:

**Pista → Objetivo → Resolución → Recompensa**

- La pista consume tiempo y localiza un claro físico.
- Debes viajar realmente a ese claro.
- La escena ofrece opciones generales y opciones exclusivas de habilidades desbloqueadas.
- Las habilidades abren formas distintas de resolver el mismo problema.
- La recompensa vuelve al inventario como un objeto físico de Root.

### Objetos
Los objetos siguen siendo los componentes de Root:
Boot, Sword, Crossbow, Torch, Hammer, Tea, Coin y Bag.

La app registra si un objeto está:
- listo;
- agotado;
- dañado.

En Birdsong, el refresh sigue la lógica del Vagabundo de Root: tres objetos base más dos por cada Tea listo.

### Cartas de Orden
El loop del mundo continúa siendo:

**Carta de Orden → cambio real en mesa → consecuencia → rumor / misión / fondo**

Las órdenes quedan archivadas por día y alimentan la historia emergente.

### Persistencia
La campaña guarda:
- personaje;
- Vagabundo;
- objetos;
- habilidad única;
- habilidades adquiridas;
- hitos;
- reputación;
- descubrimientos;
- eventos importantes;
- misiones;
- rumores;
- mundo y Órdenes.

Todo persiste localmente y puede exportarse/importarse en JSON.


## v0.8 — Rules alignment
- Unique Vagabond ability is once per day and no longer consumes Torch.
- Torch is reserved for ruins / dark exploration.
- Official starting item sets are preserved for Thief, Ranger, and Tinker.
- Skill progression is milestone-based, not XP-based.
- Landmarks stay hidden until a specific Order-derived discovery mission reveals them.
- Physical Vagabond Quest cards are tracked separately from world missions:
  - keep 3 face-up cards;
  - register suit + two printed item requirements;
  - complete them only in a matching clearing and with those items ready;
  - required items become exhausted;
  - 3 completed quests of the same suit grant a regional milestone / skill choice.
