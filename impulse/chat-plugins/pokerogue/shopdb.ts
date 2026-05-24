import { type ShopItem } from './items';
import { type PokeRogueState } from './types';

const getEvoItemWeight = (state: PokeRogueState) => Math.min(8, Math.max(1, Math.floor(state.floor / 15)));

const MEGA_STONES = [
	"Abomasite", "Absolite", "Aerodactylite", "Aggronite", "Alakazite", "Altarianite",
	"Ampharosite", "Audinite", "Banettite", "Beedrillite", "Blastoisinite", "Blazikenite",
	"Cameruptite", "Charizardite X", "Charizardite Y", "Diancite", "Galladite", "Garchompite",
	"Gardevoirite", "Gengarite", "Glalitite", "Gyaradosite", "Heracronite", "Houndoominite",
	"Kangaskhanite", "Latiasite", "Latiosite", "Lopunnite", "Lucarionite", "Manectite",
	"Mawilite", "Medichamite", "Metagrossite", "Mewtwonite X", "Mewtwonite Y", "Pidgeotite",
	"Pinsirite", "Sablenite", "Salamencite", "Sceptilite", "Scizorite", "Sharpedonite",
	"Slowbronite", "Steelixite", "Swampertite", "Tyranitarite", "Venusaurite"
];

const generatedMegaStones: Record<string, ShopItem> = {};
for (const stone of MEGA_STONES) {
	const id = stone.toLowerCase().replace(/[^a-z0-9]/g, '');
	generatedMegaStones[id] = {
		name: stone,
		icon: stone,
		type: "megaStone",
		category: "Mega Stones",
		desc: `A mysterious stone that allows certain Pokémon to Mega Evolve.`,
		moneyMultiplier: 1.0,
		tier: "Rogue",
		weight: 4, minWeight: 4, maxWeight: 4,
	};
}

export const SHOP_DB: Record<string, ShopItem> = {
	...generatedMegaStones,
	
	megabracelet: {
		name: "Mega Bracelet", icon: "Mega Bracelet", type: "key", category: "Key Items",
		desc: "A cuff that enables Pokémon to Mega Evolve. Unlocks Mega Stones in the item pool.",
		moneyMultiplier: 0, tier: "Rogue",
		maxStack: 1,
		weight: 4, minWeight: 4, maxWeight: 4,
		weightFunc: (state: PokeRogueState) => {
			return (state.keyItems?.['Mega Bracelet'] || 0) >= 1 ? 0 : 4;
		},
	},
	pokeball: {
		name: "Poke Ball", icon: "Poke Ball", type: "pokeball", category: "Pokéballs",
		desc: "A standard ball for catching wild Pokemon.",
		moneyMultiplier: 0.2, tier: "Common",
		maxStack: 99,
		weight: 40, minWeight: 5, maxWeight: 40,
		weightFunc: (state: PokeRogueState) => {
			return Math.max(5, 40 - Math.floor(state.floor / 10));
		},
	},
	greatball: {
		name: "Great Ball", icon: "Great Ball", type: "pokeball", category: "Pokéballs",
		desc: "A good ball with a higher catch rate.",
		moneyMultiplier: 0.6, tier: "Great",
		maxStack: 99,
		weight: 30, minWeight: 5, maxWeight: 30,
		weightFunc: (state: PokeRogueState) => {
			return Math.max(5, 30 - Math.floor(state.floor / 15));
		},
	},
	ultraball: {
		name: "Ultra Ball", icon: "Ultra Ball", type: "pokeball", category: "Pokéballs",
		desc: "An excellent ball with a very high catch rate.",
		moneyMultiplier: 1.5, tier: "Ultra",
		maxStack: 99,
		weight: 20, minWeight: 5, maxWeight: 20,
	},
	masterball: {
		name: "Master Ball", icon: "Master Ball", type: "pokeball", category: "Pokéballs",
		desc: "Catches any wild Pokemon without fail.",
		moneyMultiplier: 10.0, tier: "Master",
		maxStack: 99,
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
		},
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
		},
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
		},
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
		},
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
		},
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
		},
	},
	fullheal: {
		name: "Full Heal", icon: "Full Heal", type: "cureStatus", category: "Medicine",
		desc: "Heals any status ailment for one Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", isShopItem: true,
		weight: 8, minWeight: 0, maxWeight: 16,
		weightFunc: (state: PokeRogueState) => {
			const statusCount = state.team.filter(m => m.status).length;
			return Math.min(16, 8 + (statusCount * 4));
		},
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
		},
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
	rarecandy: {
		name: "Rare Candy", icon: "Rare Candy", type: "rareCandy", category: "Level Up",
		desc: "Increases a Pokémon's level by 1. Bypasses the level cap. Stacks with Candy Jar.",
		moneyMultiplier: 1.0, tier: "Common",
		weight: 2, minWeight: 2, maxWeight: 2,
	},
	rarercandy: {
		name: "Rarer Candy", icon: "Rare Candy", type: "itemPack", category: "Level Up",
		desc: "Increases the entire party's level by 1. Bypasses the level cap. Stacks with Candy Jar.",
		moneyMultiplier: 3.0, tier: "Ultra",
		weight: 4, minWeight: 4, maxWeight: 4,
	},
	candyjar: {
		name: "Candy Jar", icon: "Candy Jar", type: "key", category: "Key Items",
		desc: "Increases the number of levels added by Rare Candy and Rarer Candy items by 1. Stacks up to 99 times.",
		moneyMultiplier: 2.0, tier: "Ultra",
		maxStack: 99,
		weight: 5, minWeight: 5, maxWeight: 5,
	},
	expall: {
		name: "Exp. All", icon: "Exp Share", type: "key", category: "Key Items",
		desc: "Gives 20% Exp. to all non-fainted Pokemon not in the battle. Stacks up to 5 times.",
		moneyMultiplier: 2.0, tier: "Rogue",
		maxStack: 5,
		weight: 4, minWeight: 0, maxWeight: 4,
		weightFunc: (state: PokeRogueState) => {
			return (state.keyItems?.['Exp. All'] || 0) >= 5 ? 0 : 4;
		},
	},
	expcharm: {
		name: "Exp. Charm", icon: "Exp. Share", type: "key", category: "Key Items",
		desc: "Boosts total EXP gained by the entire party by 25%. Stacks up to 99 times.",
		moneyMultiplier: 1.5, tier: "Ultra",
		maxStack: 99,
		weight: 8, minWeight: 0, maxWeight: 8,
		weightFunc: (state: PokeRogueState) => {
			return (state.keyItems?.['Exp. Charm'] || 0) >= 99 ? 0 : 8;
		},
	},
	superexpcharm: {
		name: "Super Exp. Charm", icon: "Exp. Charm", type: "key", category: "Key Items",
		desc: "Boosts total EXP gained by the entire party by 60%. Stacks up to 30 times.",
		moneyMultiplier: 2.5, tier: "Rogue",
		maxStack: 30,
		weight: 8, minWeight: 8, maxWeight: 8,
	},
	shinycharm: {
		name: "Shiny Charm", icon: "Shiny Charm", type: "key", category: "Key Items",
		desc: "Greatly increases the chance of finding Shiny Pokémon. (Max 4)",
		moneyMultiplier: 0, tier: "Master",
		maxStack: 4,
		weight: 2, minWeight: 2, maxWeight: 2,
	},
	abilitycharm: {
		name: "Ability Charm", icon: "Ability Charm", type: "key", category: "Key Items",
		desc: "Increases the chance of wild Pokémon having their Hidden Ability. (Max 4)",
		moneyMultiplier: 0, tier: "Rogue",
		maxStack: 4,
		weight: 4, minWeight: 4, maxWeight: 4,
	},
	lure: {
		name: "Lure", icon: "Lure", type: "itemPack", category: "Buffs",
		desc: "Greatly increases the chance of encountering double battles for 5 floors.",
		moneyMultiplier: 0, tier: "Great",
		weight: 3, minWeight: 3, maxWeight: 3,
	},
	superlure: {
		name: "Super Lure", icon: "Lure", type: "itemPack", category: "Buffs",
		desc: "Greatly increases the chance of encountering double battles for 10 floors.",
		moneyMultiplier: 0, tier: "Ultra",
		weight: 3, minWeight: 3, maxWeight: 3,
	},
	maxlure: {
		name: "Max Lure", icon: "Lure", type: "itemPack", category: "Buffs",
		desc: "Greatly increases the chance of encountering double battles for 25 floors.",
		moneyMultiplier: 0, tier: "Rogue",
		weight: 1, minWeight: 1, maxWeight: 1,
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
	},

	linkingcord: {
		name: "Linking Cord", icon: "Linking Cord", type: "evolveItem", category: "Evolution Items",
		desc: "A string exuding a mysterious energy. Evolves certain Pokémon without trading.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	firestone: {
		name: "Fire Stone", icon: "Fire Stone", type: "evolveItem", category: "Evolution Items",
		desc: "A peculiar stone that can make certain species of Pokémon evolve.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	waterstone: {
		name: "Water Stone", icon: "Water Stone", type: "evolveItem", category: "Evolution Items",
		desc: "A peculiar stone that can make certain species of Pokémon evolve.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	thunderstone: {
		name: "Thunder Stone", icon: "Thunder Stone", type: "evolveItem", category: "Evolution Items",
		desc: "A peculiar stone that can make certain species of Pokémon evolve.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	leafstone: {
		name: "Leaf Stone", icon: "Leaf Stone", type: "evolveItem", category: "Evolution Items",
		desc: "A peculiar stone that can make certain species of Pokémon evolve.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	moonstone: {
		name: "Moon Stone", icon: "Moon Stone", type: "evolveItem", category: "Evolution Items",
		desc: "A peculiar stone that can make certain species of Pokémon evolve.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	sunstone: {
		name: "Sun Stone", icon: "Sun Stone", type: "evolveItem", category: "Evolution Items",
		desc: "A peculiar stone that can make certain species of Pokémon evolve.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	shinystone: {
		name: "Shiny Stone", icon: "Shiny Stone", type: "evolveItem", category: "Evolution Items",
		desc: "A peculiar stone that can make certain species of Pokémon evolve.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	duskstone: {
		name: "Dusk Stone", icon: "Dusk Stone", type: "evolveItem", category: "Evolution Items",
		desc: "A peculiar stone that can make certain species of Pokémon evolve.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	dawnstone: {
		name: "Dawn Stone", icon: "Dawn Stone", type: "evolveItem", category: "Evolution Items",
		desc: "A peculiar stone that can make certain species of Pokémon evolve.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	icestone: {
		name: "Ice Stone", icon: "Ice Stone", type: "evolveItem", category: "Evolution Items",
		desc: "A peculiar stone that can make certain species of Pokémon evolve.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	metalcoat: {
		name: "Metal Coat", icon: "Metal Coat", type: "evolveItem", category: "Evolution Items",
		desc: "A special metallic film. Evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	kingsrock: {
		name: "King's Rock", icon: "King's Rock", type: "evolveItem", category: "Evolution Items",
		desc: "A rock that may make a Pokémon flinch. Evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	dragonscale: {
		name: "Dragon Scale", icon: "Dragon Scale", type: "evolveItem", category: "Evolution Items",
		desc: "A very tough and inflexible scale. Evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	upgrade: {
		name: "Up-Grade", icon: "Up-Grade", type: "evolveItem", category: "Evolution Items",
		desc: "A transparent device filled with all sorts of data. Evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	dubiousdisc: {
		name: "Dubious Disc", icon: "Dubious Disc", type: "evolveItem", category: "Evolution Items",
		desc: "A transparent device overflowing with dubious data. Evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	protector: {
		name: "Protector", icon: "Protector", type: "evolveItem", category: "Evolution Items",
		desc: "A protective item of some sort. Evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	electirizer: {
		name: "Electirizer", icon: "Electirizer", type: "evolveItem", category: "Evolution Items",
		desc: "A box packed with a tremendous amount of electric energy. Evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	magmarizer: {
		name: "Magmarizer", icon: "Magmarizer", type: "evolveItem", category: "Evolution Items",
		desc: "A box packed with a tremendous amount of magma energy. Evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	reapercloth: {
		name: "Reaper Cloth", icon: "Reaper Cloth", type: "evolveItem", category: "Evolution Items",
		desc: "A cloth imbued with horrifying spiritual energy. Evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	prismscale: {
		name: "Prism Scale", icon: "Prism Scale", type: "evolveItem", category: "Evolution Items",
		desc: "A mysterious scale that evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	whippeddream: {
		name: "Whipped Dream", icon: "Whipped Dream", type: "evolveItem", category: "Evolution Items",
		desc: "A soft and sweet treat. Evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	sachet: {
		name: "Sachet", icon: "Sachet", type: "evolveItem", category: "Evolution Items",
		desc: "A sachet filled with fragrant perfumes. Evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	ovalstone: {
		name: "Oval Stone", icon: "Oval Stone", type: "evolveItem", category: "Evolution Items",
		desc: "A peculiar stone that can make certain species of Pokémon evolve.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	razorclaw: {
		name: "Razor Claw", icon: "Razor Claw", type: "evolveItem", category: "Evolution Items",
		desc: "A sharply hooked claw. Evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	razorfang: {
		name: "Razor Fang", icon: "Razor Fang", type: "evolveItem", category: "Evolution Items",
		desc: "A sharply hooked fang. Evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	sweetapple: {
		name: "Sweet Apple", icon: "Sweet Apple", type: "evolveItem", category: "Evolution Items",
		desc: "A peculiar apple that can make certain species of Pokémon evolve.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	tartapple: {
		name: "Tart Apple", icon: "Tart Apple", type: "evolveItem", category: "Evolution Items",
		desc: "A peculiar apple that can make certain species of Pokémon evolve.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	syrupyapple: {
		name: "Syrupy Apple", icon: "Syrupy Apple", type: "evolveItem", category: "Evolution Items",
		desc: "A peculiar apple that can make certain species of Pokémon evolve.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	crackedpot: {
		name: "Cracked Pot", icon: "Cracked Pot", type: "evolveItem", category: "Evolution Items",
		desc: "A peculiar teapot that can make certain species of Pokémon evolve.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	chippedpot: {
		name: "Chipped Pot", icon: "Chipped Pot", type: "evolveItem", category: "Evolution Items",
		desc: "A peculiar teapot that can make certain species of Pokémon evolve.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	unremarkableteacup: {
		name: "Unremarkable Teacup", icon: "Unremarkable Teacup", type: "evolveItem", category: "Evolution Items",
		desc: "A peculiar teacup that can make certain species of Pokémon evolve.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	masterpieceteacup: {
		name: "Masterpiece Teacup", icon: "Masterpiece Teacup", type: "evolveItem", category: "Evolution Items",
		desc: "A peculiar teacup that can make certain species of Pokémon evolve.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	auspiciousarmor: {
		name: "Auspicious Armor", icon: "Auspicious Armor", type: "evolveItem", category: "Evolution Items",
		desc: "A peculiar armor that can make certain species of Pokémon evolve.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	maliciousarmor: {
		name: "Malicious Armor", icon: "Malicious Armor", type: "evolveItem", category: "Evolution Items",
		desc: "A peculiar armor that can make certain species of Pokémon evolve.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	peatblock: {
		name: "Peat Block", icon: "Peat Block", type: "evolveItem", category: "Evolution Items",
		desc: "A block of muddy material. Evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	blackaugurite: {
		name: "Black Augurite", icon: "Black Augurite", type: "evolveItem", category: "Evolution Items",
		desc: "A glossy black stone. Evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	scrollofdarkness: {
		name: "Scroll of Darkness", icon: "Scroll of Darkness", type: "evolveItem", category: "Evolution Items",
		desc: "A peculiar scroll that can make certain species of Pokémon evolve.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	scrollofwaters: {
		name: "Scroll of Waters", icon: "Scroll of Waters", type: "evolveItem", category: "Evolution Items",
		desc: "A peculiar scroll that can make certain species of Pokémon evolve.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	galaricacuff: {
		name: "Galarica Cuff", icon: "Galarica Cuff", type: "evolveItem", category: "Evolution Items",
		desc: "A cuff made from woven Galarica Twigs. Evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	galaricawreath: {
		name: "Galarica Wreath", icon: "Galarica Wreath", type: "evolveItem", category: "Evolution Items",
		desc: "A wreath made from woven Galarica Twigs. Evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	leaderscrest: {
		name: "Leader's Crest", icon: "Leader's Crest", type: "evolveItem", category: "Evolution Items",
		desc: "A shard of what appears to be an old crest. Evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	gimmighoulcoin: {
		name: "Gimmighoul Coin", icon: "Gimmighoul Coin", type: "evolveItem", category: "Evolution Items",
		desc: "A coin left behind by a Gimmighoul. Evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	metalalloy: {
		name: "Metal Alloy", icon: "Metal Alloy", type: "evolveItem", category: "Evolution Items",
		desc: "A peculiar metal that can make certain species of Pokémon evolve.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	deepseascale: {
		name: "Deep Sea Scale", icon: "Deep Sea Scale", type: "evolveItem", category: "Evolution Items",
		desc: "A scale that shines a pale pink. Evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	deepseatooth: {
		name: "Deep Sea Tooth", icon: "Deep Sea Tooth", type: "evolveItem", category: "Evolution Items",
		desc: "A fang that gleams a sharp silver. Evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	strawberrysweet: {
		name: "Strawberry Sweet", icon: "Strawberry Sweet", type: "evolveItem", category: "Evolution Items",
		desc: "A sweet that evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	lovesweet: {
		name: "Love Sweet", icon: "Love Sweet", type: "evolveItem", category: "Evolution Items",
		desc: "A sweet that evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	berrysweet: {
		name: "Berry Sweet", icon: "Berry Sweet", type: "evolveItem", category: "Evolution Items",
		desc: "A sweet that evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	cloversweet: {
		name: "Clover Sweet", icon: "Clover Sweet", type: "evolveItem", category: "Evolution Items",
		desc: "A sweet that evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	flowersweet: {
		name: "Flower Sweet", icon: "Flower Sweet", type: "evolveItem", category: "Evolution Items",
		desc: "A sweet that evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	starsweet: {
		name: "Star Sweet", icon: "Star Sweet", type: "evolveItem", category: "Evolution Items",
		desc: "A sweet that evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	ribbonsweet: {
		name: "Ribbon Sweet", icon: "Ribbon Sweet", type: "evolveItem", category: "Evolution Items",
		desc: "A sweet that evolves certain Pokémon.",
		moneyMultiplier: 1.0, tier: "Great", weightFunc: getEvoItemWeight,
	},
	lonelymint: {
		name: "Lonely Mint", icon: "Atk Mint", type: "mint", category: "Mints",
		desc: "Changes a Pokémon's stats to match the Lonely nature (+Atk, -Def).",
		moneyMultiplier: 1.0, tier: "Ultra",
		weight: 4, minWeight: 0, maxWeight: 4,
	},
	adamantmint: {
		name: "Adamant Mint", icon: "Atk Mint", type: "mint", category: "Mints",
		desc: "Changes a Pokémon's stats to match the Adamant nature (+Atk, -SpA).",
		moneyMultiplier: 1.0, tier: "Ultra",
		weight: 4, minWeight: 0, maxWeight: 4,
	},
	naughtymint: {
		name: "Naughty Mint", icon: "Atk Mint", type: "mint", category: "Mints",
		desc: "Changes a Pokémon's stats to match the Naughty nature (+Atk, -SpD).",
		moneyMultiplier: 1.0, tier: "Ultra",
		weight: 4, minWeight: 0, maxWeight: 4,
	},
	bravemint: {
		name: "Brave Mint", icon: "Atk Mint", type: "mint", category: "Mints",
		desc: "Changes a Pokémon's stats to match the Brave nature (+Atk, -Spe).",
		moneyMultiplier: 1.0, tier: "Ultra",
		weight: 4, minWeight: 0, maxWeight: 4,
	},
	boldmint: {
		name: "Bold Mint", icon: "Def Mint", type: "mint", category: "Mints",
		desc: "Changes a Pokémon's stats to match the Bold nature (+Def, -Atk).",
		moneyMultiplier: 1.0, tier: "Ultra",
		weight: 4, minWeight: 0, maxWeight: 4,
	},
	impishmint: {
		name: "Impish Mint", icon: "Def Mint", type: "mint", category: "Mints",
		desc: "Changes a Pokémon's stats to match the Impish nature (+Def, -SpA).",
		moneyMultiplier: 1.0, tier: "Ultra",
		weight: 4, minWeight: 0, maxWeight: 4,
	},
	laxmint: {
		name: "Lax Mint", icon: "Def Mint", type: "mint", category: "Mints",
		desc: "Changes a Pokémon's stats to match the Lax nature (+Def, -SpD).",
		moneyMultiplier: 1.0, tier: "Ultra",
		weight: 4, minWeight: 0, maxWeight: 4,
	},
	relaxedmint: {
		name: "Relaxed Mint", icon: "Def Mint", type: "mint", category: "Mints",
		desc: "Changes a Pokémon's stats to match the Relaxed nature (+Def, -Spe).",
		moneyMultiplier: 1.0, tier: "Ultra",
		weight: 4, minWeight: 0, maxWeight: 4,
	},
	modestmint: {
		name: "Modest Mint", icon: "SpAtk Mint", type: "mint", category: "Mints",
		desc: "Changes a Pokémon's stats to match the Modest nature (+SpA, -Atk).",
		moneyMultiplier: 1.0, tier: "Ultra",
		weight: 4, minWeight: 0, maxWeight: 4,
	},
	mildmint: {
		name: "Mild Mint", icon: "SpAtk Mint", type: "mint", category: "Mints",
		desc: "Changes a Pokémon's stats to match the Mild nature (+SpA, -Def).",
		moneyMultiplier: 1.0, tier: "Ultra",
		weight: 4, minWeight: 0, maxWeight: 4,
	},
	rashmint: {
		name: "Rash Mint", icon: "SpAtk Mint", type: "mint", category: "Mints",
		desc: "Changes a Pokémon's stats to match the Rash nature (+SpA, -SpD).",
		moneyMultiplier: 1.0, tier: "Ultra",
		weight: 4, minWeight: 0, maxWeight: 4,
	},
	quietmint: {
		name: "Quiet Mint", icon: "SpAtk Mint", type: "mint", category: "Mints",
		desc: "Changes a Pokémon's stats to match the Quiet nature (+SpA, -Spe).",
		moneyMultiplier: 1.0, tier: "Ultra",
		weight: 4, minWeight: 0, maxWeight: 4,
	},
	calmmint: {
		name: "Calm Mint", icon: "SpDef Mint", type: "mint", category: "Mints",
		desc: "Changes a Pokémon's stats to match the Calm nature (+SpD, -Atk).",
		moneyMultiplier: 1.0, tier: "Ultra",
		weight: 4, minWeight: 0, maxWeight: 4,
	},
	gentlemint: {
		name: "Gentle Mint", icon: "SpDef Mint", type: "mint", category: "Mints",
		desc: "Changes a Pokémon's stats to match the Gentle nature (+SpD, -Def).",
		moneyMultiplier: 1.0, tier: "Ultra",
		weight: 4, minWeight: 0, maxWeight: 4,
	},
	carefulmint: {
		name: "Careful Mint", icon: "SpDef Mint", type: "mint", category: "Mints",
		desc: "Changes a Pokémon's stats to match the Careful nature (+SpD, -SpA).",
		moneyMultiplier: 1.0, tier: "Ultra",
		weight: 4, minWeight: 0, maxWeight: 4,
	},
	sassymint: {
		name: "Sassy Mint", icon: "SpDef Mint", type: "mint", category: "Mints",
		desc: "Changes a Pokémon's stats to match the Sassy nature (+SpD, -Spe).",
		moneyMultiplier: 1.0, tier: "Ultra",
		weight: 4, minWeight: 0, maxWeight: 4,
	},
	timidmint: {
		name: "Timid Mint", icon: "Spe Mint", type: "mint", category: "Mints",
		desc: "Changes a Pokémon's stats to match the Timid nature (+Spe, -Atk).",
		moneyMultiplier: 1.0, tier: "Ultra",
		weight: 4, minWeight: 0, maxWeight: 4,
	},
	hastymint: {
		name: "Hasty Mint", icon: "Spe Mint", type: "mint", category: "Mints",
		desc: "Changes a Pokémon's stats to match the Hasty nature (+Spe, -Def).",
		moneyMultiplier: 1.0, tier: "Ultra",
		weight: 4, minWeight: 0, maxWeight: 4,
	},
	jollymint: {
		name: "Jolly Mint", icon: "Spe Mint", type: "mint", category: "Mints",
		desc: "Changes a Pokémon's stats to match the Jolly nature (+Spe, -SpA).",
		moneyMultiplier: 1.0, tier: "Ultra",
		weight: 4, minWeight: 0, maxWeight: 4,
	},
	naivemint: {
		name: "Naive Mint", icon: "Spe Mint", type: "mint", category: "Mints",
		desc: "Changes a Pokémon's stats to match the Naive nature (+Spe, -SpD).",
		moneyMultiplier: 1.0, tier: "Ultra",
		weight: 4, minWeight: 0, maxWeight: 4,
	},
	seriousmint: {
		name: "Serious Mint", icon: "Neutral Mint", type: "mint", category: "Mints",
		desc: "Changes a Pokémon's stats to match the Serious nature (Neutral).",
		moneyMultiplier: 1.0, tier: "Ultra",
		weight: 4, minWeight: 0, maxWeight: 4,
	},
	nugget: {
		name: "Nugget", icon: "Nugget", type: "itemPack", category: "Money",
		desc: "A nugget of purest gold. Gives a large amount of money.",
		moneyMultiplier: 5, tier: "Great",
		weight: 4, minWeight: 4, maxWeight: 4,
	},
	bignugget: {
		name: "Big Nugget", icon: "Big Nugget", type: "itemPack", category: "Money",
		desc: "A big nugget of purest gold. Gives a huge amount of money.",
		moneyMultiplier: 10, tier: "Ultra",
		weight: 4, minWeight: 4, maxWeight: 4,
	},
	relicgold: {
		name: "Relic Gold", icon: "Relic Gold", type: "itemPack", category: "Money",
		desc: "A gold coin used by an ancient civilization. Gives a massive amount of money.",
		moneyMultiplier: 20, tier: "Master",
		weight: 1, minWeight: 1, maxWeight: 1,
	},
	amuletcoin: {
		name: "Amulet Coin", icon: "Amulet Coin", type: "key", category: "Key Items",
		desc: "Increases the amount of money gained from battles by 20%. Stacks up to 5 times.",
		moneyMultiplier: 1.0, tier: "Rogue",
		maxStack: 5,
		weight: 4, minWeight: 0, maxWeight: 4,
		weightFunc: (state: PokeRogueState) => {
			return (state.keyItems?.['Amulet Coin'] || 0) >= 5 ? 0 : 4;
		},
	},
};