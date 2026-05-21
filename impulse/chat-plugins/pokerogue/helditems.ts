import { type ShopItem } from './items';

export const HELD_ITEMS_DB: Record<string, ShopItem> = {
	amuletcoin: {
		name: "Amulet Coin", icon: "Amulet Coin", type: "key", category: "Key Items",
		desc: "Boosts money earned after winning battles.", moneyMultiplier: 1.0, tier: "Rare"
	},
	goldenpunch: {
		name: "Golden Punch", icon: "Punching Glove", type: "key", category: "Key Items",
		desc: "Massively boosts money earned after winning battles.", moneyMultiplier: 1.5, tier: "Epic"
	},
	sitrusberry: {
		name: "Sitrus Berry", icon: "Sitrus Berry", type: "item", category: "Berries",
		desc: "Restores HP when it falls below half.", moneyMultiplier: 0.5, tier: "Common"
	},
	lumberry: {
		name: "Lum Berry", icon: "Lum Berry", type: "item", category: "Berries",
		desc: "Cures any status condition.", moneyMultiplier: 0.5, tier: "Common"
	},
	leppaberry: {
		name: "Leppa Berry", icon: "Leppa Berry", type: "item", category: "Berries",
		desc: "Restores 10 PP when a move runs out of PP.", moneyMultiplier: 0.5, tier: "Common"
	},
	enigmaberry: {
		name: "Enigma Berry", icon: "Enigma Berry", type: "item", category: "Berries",
		desc: "Restores HP when hit by a supereffective attack.", moneyMultiplier: 1.0, tier: "Rare"
	},
	charcoal: {
		name: "Charcoal", icon: "Charcoal", type: "item", category: "Held Items",
		desc: "Boosts the power of Fire-type moves.", moneyMultiplier: 0.5, tier: "Common"
	},
	mysticwater: {
		name: "Mystic Water", icon: "Mystic Water", type: "item", category: "Held Items",
		desc: "Boosts the power of Water-type moves.", moneyMultiplier: 0.5, tier: "Common"
	},
	miracleseed: {
		name: "Miracle Seed", icon: "Miracle Seed", type: "item", category: "Held Items",
		desc: "Boosts the power of Grass-type moves.", moneyMultiplier: 0.5, tier: "Common"
	},
	magnet: {
		name: "Magnet", icon: "Magnet", type: "item", category: "Held Items",
		desc: "Boosts the power of Electric-type moves.", moneyMultiplier: 0.5, tier: "Common"
	},
	choiceband: {
		name: "Choice Band", icon: "Choice Band", type: "item", category: "Held Items",
		desc: "Boosts Attack, but allows the use of only one of its moves.", moneyMultiplier: 1.5, tier: "Epic"
	},
	choicespecs: {
		name: "Choice Specs", icon: "Choice Specs", type: "item", category: "Held Items",
		desc: "Boosts Sp. Atk, but allows the use of only one of its moves.", moneyMultiplier: 1.5, tier: "Epic"
	},
	choicescarf: {
		name: "Choice Scarf", icon: "Choice Scarf", type: "item", category: "Held Items",
		desc: "Boosts Speed, but allows the use of only one of its moves.", moneyMultiplier: 1.5, tier: "Epic"
	},
	focussash: {
		name: "Focus Sash", icon: "Focus Sash", type: "item", category: "Held Items",
		desc: "If holding this item and at full HP, it endures a potential KO attack with 1 HP.", moneyMultiplier: 1.0, tier: "Rare"
	},
	focusband: {
		name: "Focus Band", icon: "Focus Band", type: "item", category: "Held Items",
		desc: "Has a 10% chance to endure a potential KO attack with 1 HP.", moneyMultiplier: 0.5, tier: "Common"
	}
};
