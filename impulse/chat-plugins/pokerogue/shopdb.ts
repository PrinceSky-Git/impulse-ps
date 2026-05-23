import { type ShopItem } from './items';
import { type PokeRogueState } from './types';

export const SHOP_DB: Record<string, ShopItem> = {
	pokeball: {
		name: "Poke Ball", icon: "Poke Ball", type: "pokeball", category: "Pokéballs",
		desc: "A standard ball for catching wild Pokemon.",
		moneyMultiplier: 0.2, tier: "Common",
		weight: 40, minWeight: 5, maxWeight: 40,
		weightFunc: (state: PokeRogueState) => {
			// Weight drops slowly as your run gets deeper
			return Math.max(5, 40 - Math.floor(state.floor / 10));
		}
	},
	greatball: {
		name: "Great Ball", icon: "Great Ball", type: "pokeball", category: "Pokéballs",
		desc: "A good ball with a higher catch rate.",
		moneyMultiplier: 0.6, tier: "Great",
		weight: 30, minWeight: 5, maxWeight: 30,
		weightFunc: (state: PokeRogueState) => {
			return Math.max(5, 30 - Math.floor(state.floor / 15));
		}
	},
	ultraball: {
		name: "Ultra Ball", icon: "Ultra Ball", type: "pokeball", category: "Pokéballs",
		desc: "An excellent ball with a very high catch rate.",
		moneyMultiplier: 1.5, tier: "Ultra",
		weight: 20, minWeight: 5, maxWeight: 20,
	},
	masterball: {
		name: "Master Ball", icon: "Master Ball", type: "pokeball", category: "Pokéballs",
		desc: "Catches any wild Pokemon without fail.",
		moneyMultiplier: 10.0, tier: "Master",
		weight: 1, minWeight: 1, maxWeight: 1,
	},
	potion: {
		name: "Potion", icon: "Potion", type: "healHP", category: "Medicine",
		desc: "Restores 20 HP or 10% HP, whichever is higher.",
		moneyMultiplier: 0.2, tier: "Common", isShopItem: true, minFloor: 1,
		healAmount: 20, healPercent: 10,
		weight: 12, minWeight: 0, maxWeight: 24,
		weightFunc: (state: PokeRogueState) => {
			const damagedCount = state.team.filter(m => (m.currentHp ?? 100) > 0 && (m.currentHp ?? 100) < 100).length;
			return Math.min(24, 12 + (damagedCount * 4));
		}
	},
	superpotion: {
		name: "Super Potion", icon: "Super Potion", type: "healHP", category: "Medicine",
		desc: "Restores 50 HP or 25% HP, whichever is higher.",
		moneyMultiplier: 0.45, tier: "Great", isShopItem: true, minFloor: 21,
		healAmount: 50, healPercent: 25,
		weight: 12, minWeight: 0, maxWeight: 24,
		weightFunc: (state: PokeRogueState) => {
			const damagedCount = state.team.filter(m => (m.currentHp ?? 100) > 0 && (m.currentHp ?? 100) < 100).length;
			return Math.min(24, 12 + (damagedCount * 4));
		}
	},
	hyperpotion: {
		name: "Hyper Potion", icon: "Hyper Potion", type: "healHP", category: "Medicine",
		desc: "Restores 200 HP or 50% HP, whichever is higher.",
		moneyMultiplier: 0.8, tier: "Ultra", isShopItem: true, minFloor: 81,
		healAmount: 200, healPercent: 50,
		weight: 12, minWeight: 0, maxWeight: 24,
		weightFunc: (state: PokeRogueState) => {
			const damagedCount = state.team.filter(m => (m.currentHp ?? 100) > 0 && (m.currentHp ?? 100) < 100).length;
			return Math.min(24, 12 + (damagedCount * 4));
		}
	},
	maxpotion: {
		name: "Max Potion", icon: "Max Potion", type: "healHP", category: "Medicine",
		desc: "Restores 100% HP.",
		moneyMultiplier: 1.5, tier: "Rogue", isShopItem: true, minFloor: 111,
		isMax: true,
		weight: 12, minWeight: 0, maxWeight: 24,
		weightFunc: (state: PokeRogueState) => {
			const damagedCount = state.team.filter(m => (m.currentHp ?? 100) > 0 && (m.currentHp ?? 100) < 100).length;
			return Math.min(24, 12 + (damagedCount * 4));
		}
	},
	revive: {
		name: "Revive", icon: "Revive", type: "revive", category: "Medicine",
		desc: "Revives one Pokémon and restores 50% HP.",
		moneyMultiplier: 2.0, tier: "Great", isShopItem: true, minFloor: 1,
		reviveAmount: 50,
		weight: 4, minWeight: 0, maxWeight: 16,
		weightFunc: (state: PokeRogueState) => {
			const faintedCount = state.team.filter(m => (m.currentHp ?? 100) <= 0).length;
			return Math.min(16, 4 + (faintedCount * 4));
		}
	},
	maxrevive: {
		name: "Max Revive", icon: "Max Revive", type: "revive", category: "Medicine",
		desc: "Revives one Pokémon and restores 100% HP.",
		moneyMultiplier: 2.75, tier: "Rogue", isShopItem: true, minFloor: 81,
		isMax: true,
		weight: 4, minWeight: 0, maxWeight: 16,
		weightFunc: (state: PokeRogueState) => {
			const faintedCount = state.team.filter(m => (m.currentHp ?? 100) <= 0).length;
			return Math.min(16, 4 + (faintedCount * 4));
		}
	},
	fullheal: {
		name: "Full Heal", icon: "Full Heal", type: "cureStatus", category: "Medicine",
		desc: "Heals any status ailment for one Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", isShopItem: true, minFloor: 21,
		weight: 8, minWeight: 0, maxWeight: 16,
		weightFunc: (state: PokeRogueState) => {
			const statusCount = state.team.filter(m => m.status).length;
			return Math.min(16, 8 + (statusCount * 4));
		}
	},
	fullrestore: {
		name: "Full Restore", icon: "Full Restore", type: "healHP", category: "Medicine",
		desc: "Fully restores HP for one Pokémon and heals any status ailment.",
		moneyMultiplier: 2.25, tier: "Rogue", isShopItem: true, minFloor: 141,
		isMax: true, curesStatus: true,
		weight: 8, minWeight: 0, maxWeight: 16,
		weightFunc: (state: PokeRogueState) => {
			const needsHelpCount = state.team.filter(m => m.status || ((m.currentHp ?? 100) > 0 && (m.currentHp ?? 100) < 100)).length;
			return Math.min(16, 8 + (needsHelpCount * 4));
		}
	},
	sacredash: {
		name: "Sacred Ash", icon: "Sacred Ash", type: "itemPack", category: "Medicine",
		desc: "Revives all fainted Pokémon, fully restoring HP.",
		moneyMultiplier: 10.0, tier: "Master", isShopItem: true, minFloor: 171,
		weight: 1, minWeight: 0, maxWeight: 2,
	},
	memorymushroom: {
		name: "Memory Mushroom", icon: "Big Mushroom", type: "item", category: "Medicine",
		desc: "Recall one Pokémon's forgotten move.",
		moneyMultiplier: 4.0, tier: "Ultra", isShopItem: true, minFloor: 1,
		weight: 4, minWeight: 0, maxWeight: 8,
	},	
	expall: {
		name: "Exp. All", icon: "Exp Share", type: "key", category: "Key Items",
		desc: "Gives 20% Exp. to all non-fainted Pokemon not in the battle. Stacks up to 5 times.",
		moneyMultiplier: 2.0, tier: "Rogue",
		weight: 4, minWeight: 0, maxWeight: 4,
		weightFunc: (state: PokeRogueState) => {
			return (state.keyItems?.['Exp. All'] || 0) >= 5 ? 0 : 4;
		}
	},
	expcharm: {
		name: "Exp. Charm", icon: "Exp. Share", type: "key", category: "Key Items",
		desc: "Boosts total EXP gained by the entire party by 25%. Stacks up to 99 times.",
		moneyMultiplier: 1.5, tier: "Ultra",
		weight: 8, minWeight: 0, maxWeight: 8,
		weightFunc: (state: PokeRogueState) => {
			return (state.keyItems?.['Exp. Charm'] || 0) >= 99 ? 0 : 8;
		}
	},
	hpup: {
		name: "HP Up", icon: "HP Up", type: "vitamin", category: "Vitamins",
		desc: "Raises the HP EVs of a Pokémon by 20. Max 252 per stat, 508 total.",
		moneyMultiplier: 1.0, tier: "Ultra", evStat: "hp", evGain: 20,
		weight: 4, minWeight: 0, maxWeight: 8,
	},
	protein: {
		name: "Protein", icon: "Protein", type: "vitamin", category: "Vitamins",
		desc: "Raises the Attack EVs of a Pokémon by 20. Max 252 per stat, 508 total.",
		moneyMultiplier: 1.0, tier: "Ultra", evStat: "atk", evGain: 20,
		weight: 4, minWeight: 0, maxWeight: 8,
	},
	iron: {
		name: "Iron", icon: "Iron", type: "vitamin", category: "Vitamins",
		desc: "Raises the Defense EVs of a Pokémon by 20. Max 252 per stat, 508 total.",
		moneyMultiplier: 1.0, tier: "Ultra", evStat: "def", evGain: 20,
		weight: 4, minWeight: 0, maxWeight: 8,
	},
	calcium: {
		name: "Calcium", icon: "Calcium", type: "vitamin", category: "Vitamins",
		desc: "Raises the Sp. Atk EVs of a Pokémon by 20. Max 252 per stat, 508 total.",
		moneyMultiplier: 1.0, tier: "Ultra", evStat: "spa", evGain: 20,
		weight: 4, minWeight: 0, maxWeight: 8,
	},
	zinc: {
		name: "Zinc", icon: "Zinc", type: "vitamin", category: "Vitamins",
		desc: "Raises the Sp. Def EVs of a Pokémon by 20. Max 252 per stat, 508 total.",
		moneyMultiplier: 1.0, tier: "Ultra", evStat: "spd", evGain: 20,
		weight: 4, minWeight: 0, maxWeight: 8,
	},
	carbos: {
		name: "Carbos", icon: "Carbos", type: "vitamin", category: "Vitamins",
		desc: "Raises the Speed EVs of a Pokémon by 20. Max 252 per stat, 508 total.",
		moneyMultiplier: 1.0, tier: "Ultra", evStat: "spe", evGain: 20,
		weight: 4, minWeight: 0, maxWeight: 8,
	}
};
