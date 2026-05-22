import { type ShopItem } from './items';
import { TMS_DB } from './tms';
import { HELD_ITEMS_DB } from './helditems';

const MINTS = ['Adamant', 'Bold', 'Brave', 'Calm', 'Careful', 'Gentle', 'Hasty', 'Impish', 'Jolly', 'Lax', 'Lonely', 'Mild', 'Modest', 'Naive', 'Naughty', 'Quiet', 'Rash', 'Relaxed', 'Sassy', 'Serious', 'Timid'];
const MINT_DB: Record<string, ShopItem> = {};
for (const mint of MINTS) {
	MINT_DB[`${mint.toLowerCase()}mint`] = {
		name: `${mint} Mint`, icon: "Mint", type: "mint", category: "Mints",
		desc: `Changes a Pokémon's stats to match the ${mint} nature.`, tier: "Ultra", nature: mint, 
		weight: 2, minWeight: 2, maxWeight: 8, maxStack: 99
	};
}

const TERA_SHARDS = ['Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];
const TERA_DB: Record<string, ShopItem> = {};
for (const type of TERA_SHARDS) {
	TERA_DB[`terashard${type.toLowerCase()}`] = {
		name: `Tera Shard ${type}`, icon: "Tera Shard", type: "teraShard", category: "Tera Shards",
		desc: `Changes a Pokémon's Tera Type to ${type}.`, tier: "Ultra", teraType: type, 
		weight: 3, minWeight: 1, maxWeight: 4, maxStack: 99
	};
}

export const SHOP_DB: Record<string, ShopItem> = {
	...TMS_DB,
	...HELD_ITEMS_DB,
	...MINT_DB,
	...TERA_DB,
	rarecandy: {
		name: "Rare Candy", icon: "Rare Candy", type: "candy", category: "Medicine",
		desc: "Instantly raises a Pokémon's level by 1.", tier: "Common", weight: 2, maxStack: 99
	},
	rarercandy: {
		name: "Rarer Candy", icon: "Rare Candy", type: "candy", category: "Medicine",
		desc: "Instantly raises a Pokémon's level by 3.", tier: "Rare", weight: 1, maxStack: 99
	},
	candyjar: {
		name: "Candy Jar", icon: "Candy Jar", type: "key", category: "Key Items",
		desc: "Increases the level gain from Rare Candies by 1.", tier: "Ultra", weight: 1, maxStack: 99
	},
	map: {
		name: "Map", icon: "Town Map", type: "key", category: "Key Items",
		desc: "Allows you to select your destination when biomes branch.", tier: "Ultra", weight: 1, maxStack: 1
	},
	pokeball: {
		name: "Poke Ball", icon: "Poke Ball", type: "pokeball", category: "Pokéballs",
		desc: "A standard ball for catching wild Pokemon.", tier: "Common", weight: 12, maxStack: 99, draftAmount: 3
	},
	greatball: {
		name: "Great Ball", icon: "Great Ball", type: "pokeball", category: "Pokéballs",
		desc: "A good ball with a higher catch rate.", tier: "Great", weight: 6, maxStack: 99, draftAmount: 2
	},
	ultraball: {
		name: "Ultra Ball", icon: "Ultra Ball", type: "pokeball", category: "Pokéballs",
		desc: "An excellent ball with a very high catch rate.", tier: "Ultra", weight: 4, maxStack: 99, draftAmount: 1
	},
	masterball: {
		name: "Master Ball", icon: "Master Ball", type: "pokeball", category: "Pokéballs",
		desc: "Catches any wild Pokemon without fail.", tier: "Master", weight: 1, maxStack: 99, draftAmount: 1
	},
	potion: {
		name: "Potion", icon: "Potion", type: "healHP", category: "Medicine",
		desc: "Restores 20 HP or 10% HP, whichever is higher.", moneyMultiplier: 0.2, tier: "Common", isShopItem: true, minFloor: 1, healAmount: 20, healPercent: 10, weight: 10, maxStack: 99
	},
	superpotion: {
		name: "Super Potion", icon: "Super Potion", type: "healHP", category: "Medicine",
		desc: "Restores 50 HP or 25% HP, whichever is higher.", moneyMultiplier: 0.45, tier: "Great", isShopItem: true, minFloor: 21, healAmount: 50, healPercent: 25, weight: 10, maxStack: 99
	},
	hyperpotion: {
		name: "Hyper Potion", icon: "Hyper Potion", type: "healHP", category: "Medicine",
		desc: "Restores 200 HP or 50% HP, whichever is higher.", moneyMultiplier: 0.8, tier: "Rare", isShopItem: true, minFloor: 81, healAmount: 200, healPercent: 50, weight: 10, maxStack: 99
	},
	maxpotion: {
		name: "Max Potion", icon: "Max Potion", type: "healHP", category: "Medicine",
		desc: "Restores 100% HP.", moneyMultiplier: 1.5, tier: "Ultra", isShopItem: true, minFloor: 111, isMax: true, weight: 10, maxStack: 99
	},
	revive: {
		name: "Revive", icon: "Revive", type: "revive", category: "Medicine",
		desc: "Revives one Pokémon and restores 50% HP.", moneyMultiplier: 2.0, tier: "Rare", isShopItem: true, minFloor: 1, reviveAmount: 50, weight: 10, maxStack: 99
	},
	maxrevive: {
		name: "Max Revive", icon: "Max Revive", type: "revive", category: "Medicine",
		desc: "Revives one Pokémon and restores 100% HP.", moneyMultiplier: 2.75, tier: "Ultra", isShopItem: true, minFloor: 81, isMax: true, weight: 10, maxStack: 99
	},
	fullheal: {
		name: "Full Heal", icon: "Full Heal", type: "cureStatus", category: "Medicine",
		desc: "Heals any status ailment for one Pokémon.", moneyMultiplier: 1.0, tier: "Great", isShopItem: true, minFloor: 21, weight: 10, maxStack: 99
	},
	fullrestore: {
		name: "Full Restore", icon: "Full Restore", type: "healHP", category: "Medicine",
		desc: "Fully restores HP for one Pokémon and heals any status ailment.", moneyMultiplier: 2.25, tier: "Ultra", isShopItem: true, minFloor: 141, isMax: true, curesStatus: true, weight: 10, maxStack: 99
	},
	sacredash: {
		name: "Sacred Ash", icon: "Sacred Ash", type: "itemPack", category: "Medicine",
		desc: "Revives all fainted Pokémon, fully restoring HP.", moneyMultiplier: 10.0, tier: "Master", isShopItem: true, minFloor: 171, weight: 1, maxStack: 99
	},
	memorymushroom: {
		name: "Memory Mushroom", icon: "Big Mushroom", type: "item", category: "Medicine",
		desc: "Recall one Pokémon's forgotten move.", moneyMultiplier: 4.0, tier: "Rare", isShopItem: true, minFloor: 81, weight: 12, minWeight: 4, maxWeight: 32, maxStack: 99
	},	
	lure: {
		name: "Lure", icon: "Chipped Pot", type: "key", category: "Key Items",
		desc: "50% chance to encounter 2 wild Pokémon instead of 1.", tier: "Rare", weight: 10, maxStack: 5
	},
	expall: {
		name: "Exp. All", icon: "Exp Share", type: "key", category: "Key Items",
		desc: "Gives 20% Exp. to all non-fainted Pokemon not in the battle. Stacks up to 5 times.", tier: "Ultra", weight: 10, maxStack: 5
	},
	expcharm: {
		name: "Exp. Charm", icon: "Exp. Share", type: "key", category: "Key Items",
		desc: "Boosts total EXP gained by the entire party by 25%. Stacks up to 99 times.", tier: "Rare", weight: 10, maxStack: 99
	},
	hpup: {
		name: "HP Up", icon: "HP Up", type: "vitamin", category: "Vitamins",
		desc: "Raises the HP EVs of a Pokémon by 10. Max 252 per stat, 508 total.", tier: "Great", evStat: "hp", weight: 10, maxStack: 99
	},
	protein: {
		name: "Protein", icon: "Protein", type: "vitamin", category: "Vitamins",
		desc: "Raises the Attack EVs of a Pokémon by 10. Max 252 per stat, 508 total.", tier: "Great", evStat: "atk", weight: 10, maxStack: 99
	},
	iron: {
		name: "Iron", icon: "Iron", type: "vitamin", category: "Vitamins",
		desc: "Raises the Defense EVs of a Pokémon by 10. Max 252 per stat, 508 total.", tier: "Great", evStat: "def", weight: 10, maxStack: 99
	},
	calcium: {
		name: "Calcium", icon: "Calcium", type: "vitamin", category: "Vitamins",
		desc: "Raises the Sp. Atk EVs of a Pokémon by 10. Max 252 per stat, 508 total.", tier: "Great", evStat: "spa", weight: 10, maxStack: 99
	},
	zinc: {
		name: "Zinc", icon: "Zinc", type: "vitamin", category: "Vitamins",
		desc: "Raises the Sp. Def EVs of a Pokémon by 10. Max 252 per stat, 508 total.", tier: "Great", evStat: "spd", weight: 10, maxStack: 99
	},
	carbos: {
		name: "Carbos", icon: "Carbos", type: "vitamin", category: "Vitamins",
		desc: "Raises the Speed EVs of a Pokémon by 10. Max 252 per stat, 508 total.", tier: "Great", evStat: "spe", weight: 10, maxStack: 99
	},
	firestone: {
		name: "Fire Stone", icon: "Fire Stone", type: "evolveItem", category: "Evolutions",
		desc: "Evolves certain species of Pokémon.", tier: "Rare", weight: 4, minWeight: 4, maxWeight: 32, maxStack: 99
	},
	waterstone: {
		name: "Water Stone", icon: "Water Stone", type: "evolveItem", category: "Evolutions",
		desc: "Evolves certain species of Pokémon.", tier: "Rare", weight: 4, minWeight: 4, maxWeight: 32, maxStack: 99
	},
	thunderstone: {
		name: "Thunder Stone", icon: "Thunder Stone", type: "evolveItem", category: "Evolutions",
		desc: "Evolves certain species of Pokémon.", tier: "Rare", weight: 4, minWeight: 4, maxWeight: 32, maxStack: 99
	},
	leafstone: {
		name: "Leaf Stone", icon: "Leaf Stone", type: "evolveItem", category: "Evolutions",
		desc: "Evolves certain species of Pokémon.", tier: "Rare", weight: 4, minWeight: 4, maxWeight: 32, maxStack: 99
	},
	moonstone: {
		name: "Moon Stone", icon: "Moon Stone", type: "evolveItem", category: "Evolutions",
		desc: "Evolves certain species of Pokémon.", tier: "Rare", weight: 4, minWeight: 4, maxWeight: 32, maxStack: 99
	},
	sunstone: {
		name: "Sun Stone", icon: "Sun Stone", type: "evolveItem", category: "Evolutions",
		desc: "Evolves certain species of Pokémon.", tier: "Rare", weight: 4, minWeight: 4, maxWeight: 32, maxStack: 99
	},
	shinystone: {
		name: "Shiny Stone", icon: "Shiny Stone", type: "evolveItem", category: "Evolutions",
		desc: "Evolves certain species of Pokémon.", tier: "Rare", weight: 4, minWeight: 4, maxWeight: 32, maxStack: 99
	},
	duskstone: {
		name: "Dusk Stone", icon: "Dusk Stone", type: "evolveItem", category: "Evolutions",
		desc: "Evolves certain species of Pokémon.", tier: "Rare", weight: 4, minWeight: 4, maxWeight: 32, maxStack: 99
	},
	dawnstone: {
		name: "Dawn Stone", icon: "Dawn Stone", type: "evolveItem", category: "Evolutions",
		desc: "Evolves certain species of Pokémon.", tier: "Rare", weight: 4, minWeight: 4, maxWeight: 32, maxStack: 99
	},
	icestone: {
		name: "Ice Stone", icon: "Ice Stone", type: "evolveItem", category: "Evolutions",
		desc: "Evolves certain species of Pokémon.", tier: "Rare", weight: 4, minWeight: 4, maxWeight: 32, maxStack: 99
	},
	linkingcord: {
		name: "Linking Cord", icon: "Link Cable", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Pokémon that normally require trading.", tier: "Ultra", weight: 6, minWeight: 6, maxWeight: 24, maxStack: 99
	},
	metalcoat: {
		name: "Metal Coat", icon: "Metal Coat", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Onix and Scyther.", tier: "Ultra", weight: 6, minWeight: 6, maxWeight: 24, maxStack: 99
	},
	dragonscale: {
		name: "Dragon Scale", icon: "Dragon Scale", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Seadra into Kingdra.", tier: "Ultra", weight: 6, minWeight: 6, maxWeight: 24, maxStack: 99
	},
	kingsrock: {
		name: "King's Rock", icon: "King's Rock", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Poliwhirl and Slowpoke.", tier: "Ultra", weight: 6, minWeight: 6, maxWeight: 24, maxStack: 99
	},
	protector: {
		name: "Protector", icon: "Protector", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Rhydon into Rhyperior.", tier: "Ultra", weight: 6, minWeight: 6, maxWeight: 24, maxStack: 99
	},
	electirizer: {
		name: "Electirizer", icon: "Electirizer", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Electabuzz into Electivire.", tier: "Ultra", weight: 6, minWeight: 6, maxWeight: 24, maxStack: 99
	},
	magmarizer: {
		name: "Magmarizer", icon: "Magmarizer", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Magmar into Magmortar.", tier: "Ultra", weight: 6, minWeight: 6, maxWeight: 24, maxStack: 99
	},
	upgrade: {
		name: "Up-Grade", icon: "Up-Grade", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Porygon into Porygon2.", tier: "Ultra", weight: 6, minWeight: 6, maxWeight: 24, maxStack: 99
	},
	dubiousdisc: {
		name: "Dubious Disc", icon: "Dubious Disc", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Porygon2 into Porygon-Z.", tier: "Ultra", weight: 6, minWeight: 6, maxWeight: 24, maxStack: 99
	},
	reapercloth: {
		name: "Reaper Cloth", icon: "Reaper Cloth", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Dusclops into Dusknoir.", tier: "Ultra", weight: 6, minWeight: 6, maxWeight: 24, maxStack: 99
	},
	prismscale: {
		name: "Prism Scale", icon: "Prism Scale", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Feebas into Milotic.", tier: "Ultra", weight: 6, minWeight: 6, maxWeight: 24, maxStack: 99
	},
	deepseatooth: {
		name: "Deep Sea Tooth", icon: "Deep Sea Tooth", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Clamperl into Huntail.", tier: "Ultra", weight: 6, minWeight: 6, maxWeight: 24, maxStack: 99
	},
	deepseascale: {
		name: "Deep Sea Scale", icon: "Deep Sea Scale", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Clamperl into Gorebyss.", tier: "Ultra", weight: 6, minWeight: 6, maxWeight: 24, maxStack: 99
	},
	sachet: {
		name: "Sachet", icon: "Sachet", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Spritzee into Aromatisse.", tier: "Ultra", weight: 6, minWeight: 6, maxWeight: 24, maxStack: 99
	},
	whippeddream: {
		name: "Whipped Dream", icon: "Whipped Dream", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Swirlix into Slurpuff.", tier: "Ultra", weight: 6, minWeight: 6, maxWeight: 24, maxStack: 99
	},
	nugget: {
		name: "Nugget", icon: "Nugget", type: "itemPack", category: "Treasure",
		desc: "A nugget of pure gold. Immediately adds $5000 to your funds.", tier: "Rare", weight: 10, maxStack: 99
	},
	big_nugget: {
		name: "Big Nugget", icon: "Big Nugget", type: "itemPack", category: "Treasure",
		desc: "A massive gold nugget. Immediately adds $20,000 to your funds.", tier: "Ultra", weight: 10, maxStack: 99
	},
	starter_token: {
		name: "Starter Token", icon: "Gacha Ticket", type: "itemPack", category: "Meta",
		desc: "Unlocks a random new basic Pokémon in your Starter selection.", tier: "Ultra", weight: 1, maxStack: 99
	}
};
