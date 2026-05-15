# PokeRogue Engine Modding Guide

Welcome to the PokeRogue Engine Modding Guide. This document explains how the data-driven engine works, details every configuration field, and provides a step-by-step tutorial on how to create your own custom campaign or game mode.

## 1. Engine Architecture Overview

The PokeRogue engine is entirely data-driven. This means you do not need to edit the core engine files (`pokerogue.ts`, `battle.ts`, `pokemon.ts`) to create a new mode. Instead, all configurations and data are managed in `config.ts` and `types.ts`.

A "Game Mode" consists of two main parts:
- **ModeConfig:** The ruleset. It dictates the generation, economy, pacing, mechanics, and milestone rewards.
- **ModeData:** The content registry. It provides the starter Pokemon, the biomes, the encounter tables, the biome transitions, and the trainer data.

---

## 2. Configuration Fields (ModeConfig)

The `ModeConfig` interface defines the core rules for a game mode. Here is a breakdown of every field:

### Core Engine Rules
- **`generation` (number):** The Pokemon generation ruleset to use (e.g., `9` for Scarlet/Violet, `1` for Red/Blue). This affects the type chart, available moves, and mechanics.
- **`baseFormat` (string):** The Pokemon Showdown format string used to spin up battles. For a Gen 1 mod, this should be `[Gen 1] Custom Battle`.

### Economy & Pacing
- **`economy.startingBP` (number):** The amount of Battle Points (BP) the player starts with.
- **`economy.bpPerWin` (number):** The amount of BP awarded for clearing a standard floor.
- **`economy.bpPerBoss` (number):** The additional BP awarded for defeating a Zone Boss (added to `bpPerWin`).
- **`economy.doubleBpFloor` (number | optional):** If set, all BP rewards are doubled once the player reaches or exceeds this floor (e.g., `100`).

### Progression & Environments
- **`startingBiome` (string):** The biome the player begins their run in (e.g., `Town`).
- **`townEscapeFloor` (number):** The floor number where the player officially leaves the starting biome and normal biome rotation begins.
- **`biomeRotationInterval` (number):** How often (in floors) the biome transitions to a new one (e.g., `10`).
- **`bossInterval` (number):** How often (in floors) a Zone Boss fight occurs (e.g., `10`).
- **`endlessFloorRange` (object | optional):** Defines a range `{ start: number, end: number }`. When the player is within this range, the UI overrides the biome display to "Endless".

### Story Routing & Trainers
- **`hasTrainers` (boolean):** Whether this mode includes trainer battles at all.
- **`storyRouting.fixedTrainerWaves` (number[] | optional):** An array of exact floors where fixed story encounters occur (e.g., Rivals or Evil Teams).
- **`storyRouting.firstGymLeaderWaves` (number[] | optional):** An array of possible floors where the very first Gym Leader can appear. The engine picks from these randomly.
- **`storyRouting.gymLeaderInterval` (number | optional):** How often (in floors) subsequent Gym Leaders appear after the first one is encountered.
- **`storyRouting.maxGymLeaderTier` (number | optional):** The maximum tier of Gym Leader teams to scale up to (usually `5`).

### Randomization Features
- **`randomizeMoves` (boolean):** If true, Pokemon are generated with completely random valid moves instead of their natural learnset.
- **`randomizeAbilities` (boolean):** If true, Pokemon are generated with completely random valid abilities instead of their natural abilities.

### Feature Unlocks
- **`mechanicUnlocks.terastallize` (number | optional):** The floor at which Terastallization becomes available to the AI. If omitted, the mechanic is completely disabled.
- **`mechanicUnlocks.mega` (number | optional):** The floor at which Mega Evolution becomes available to the AI. If omitted, the mechanic is completely disabled.

### Milestone Rewards
- **`milestoneRewards` (array | optional):** A list of item drops granted automatically at specific floors.
  - `floor` (number): The target floor.
  - `interval` (boolean): If true, the reward is granted every time the floor is a multiple of the target floor (e.g., every 50 floors). If false, it is granted only exactly on that floor.
  - `itemType` (string): Either `keyItem` or `inventory` (for Poke Balls).
  - `itemName` (string): The exact name of the item.
  - `amount` (number): The quantity to grant.

---

## 3. Content Registry (ModeData)

The `ModeData` interface holds the actual content that the player interacts with.

- **`starters` (string[]):** An array of Pokemon species IDs. The engine will randomly present 5 of these as starting options at the beginning of a run.
- **`biomes` (Record<string, any>):** The encounter tables. It is structured as Biome Name -> Rarity Tier -> Array of Pokemon and Weights.
- **`transitions` (Record<string, string[]>):** A map defining which biomes can follow the current biome. E.g., `Town: ['Plains']`.
- **`trainers` (Record<string, any>):** The trainer and boss encounter data. Keys represent routing IDs (like `fixed_5` or `gym_leader_tier_1`).
- **`excludedBiomes` (string[] | optional):** A list of biomes to exclude from random wildcard selections if the normal biome pool runs dry.

---

## 4. How to Create a Custom Mod

Here is a step-by-step tutorial on creating a brand new Game Mode, for example, a "Gen 3 Hoenn Only" campaign.

### Step 1: Add the Game Mode Type
Open `impulse/chat-plugins/pokerogue/types.ts`. Find the `GameMode` type and add your new mode:
```typescript
export type GameMode = 'classic' | 'endless' | 'random' | 'gen1' | 'hoenn';
```

### Step 2: Define Your Content
Create a new folder in `impulse/chat-plugins/pokerogue/mods/hoenn/`. Inside, create two files: `biomes.ts` and `trainers.ts`.

In `biomes.ts`, define your Gen 3 encounter tables and transitions.
In `trainers.ts`, define your Gym Leaders (Roxanne, Brawly, etc.) and Rivals (May/Brendan).

### Step 3: Register Your Content and Config
Open `impulse/chat-plugins/pokerogue/config.ts`.

First, define your starter pool at the top:
```typescript
const HOENN_STARTERS = ['treecko', 'torchic', 'mudkip'];
```

Next, add your ruleset to `MODE_CONFIGS`:
```typescript
export const MODE_CONFIGS: Record<GameMode, ModeConfig> = {
    // ... existing modes ...
    hoenn: {
        generation: 3,
        baseFormat: '[Gen 3] Custom Game',
        startingBiome: 'Littleroot',
        townEscapeFloor: 5,
        biomeRotationInterval: 5,
        bossInterval: 10,
        hasTrainers: true,
        randomizeMoves: false,
        randomizeAbilities: false,
        economy: {
            startingBP: 20,
            bpPerWin: 5,
            bpPerBoss: 10
        },
        storyRouting: {
            fixedTrainerWaves: [5, 15, 25, 35], // Rival fights
            firstGymLeaderWaves: [10],
            gymLeaderInterval: 10,
            maxGymLeaderTier: 8
        },
        // Notice we omitted mechanicUnlocks, meaning no Mega or Tera in Gen 3!
        milestoneRewards: [
            { floor: 50, interval: false, itemType: 'inventory', itemName: 'masterball', amount: 1 }
        ]
    }
};
```

Finally, mount your content in `MODE_REGISTRY`:
```typescript
import { BIOMES as HoennBiomes, BIOME_TRANSITIONS as HoennTransitions } from './mods/hoenn/biomes';
import { TRAINERS as HoennTrainers } from './mods/hoenn/trainers';

export const MODE_REGISTRY: Record<GameMode, ModeData> = {
    // ... existing modes ...
    hoenn: {
        biomes: HoennBiomes,
        transitions: HoennTransitions,
        trainers: HoennTrainers,
        starters: HOENN_STARTERS
    }
};
```

### Step 4: Add the UI Button (Optional)
To let players select your new mode from the Welcome Screen, open `impulse/chat-plugins/pokerogue/render.ts`, find `renderWelcomeView()`, and add a button for your mode:
```typescript
buf += renderBtn('/pokerogue newgame hoenn', 'Hoenn', 'pr-btn primary', 'font-size:11px;padding:5px 10px');
```

That is it! The engine will now automatically handle all the Gen 3 rules, routing, and encounters for your players without any further code changes.
