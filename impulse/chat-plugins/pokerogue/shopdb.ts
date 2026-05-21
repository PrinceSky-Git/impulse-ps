import { type ShopItem } from './items';
import { TMS_DB } from './tms';
import { HELD_ITEMS_DB } from './helditems';

const MINTS = ['Adamant', 'Bold', 'Brave', 'Calm', 'Careful', 'Gentle', 'Hasty', 'Impish', 'Jolly', 'Lax', 'Lonely', 'Mild', 'Modest', 'Naive', 'Naughty', 'Quiet', 'Rash', 'Relaxed', 'Sassy', 'Serious', 'Timid'];
const MINT_DB: Record<string, ShopItem> = {};
for (const mint of MINTS) {
	MINT_DB[`${mint.toLowerCase()}mint`] = {
		name: `${mint} Mint`, icon: "Mint", type: "mint", category: "Mints",
		desc: `Changes a Pokémon's stats to match the ${mint} nature.`, moneyMultiplier: 1.0, tier: "Rare", nature: mint
	};
}

const TERA_SHARDS = ['Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];
const TERA_DB: Record<string, ShopItem> = {};
for (const type of TERA_SHARDS) {
	TERA_DB[`terashard${type.toLowerCase()}`] = {
		name: `Tera Shard ${type}`, icon: "Tera Shard", type: "teraShard", category: "Tera Shards",
		desc: `Changes a Pokémon's Tera Type to ${type}.`, moneyMultiplier: 1.5, tier: "Epic", teraType: type
	};
}

export const SHOP_DB: Record<string, ShopItem> = {
	...TMS_DB,
	...HELD_ITEMS_DB,
	...MINT_DB,
	...TERA_DB,
	rarecandy: {
		name: "Rare Candy", icon: "Rare Candy", type: "candy", category: "Medicine",
		desc: "Instantly raises a Pokémon's level by 1.", moneyMultiplier: 0.5, tier: "Common"
	},
	rarercandy: {
		name: "Rarer Candy", icon: "Rare Candy", type: "candy", category: "Medicine",
		desc: "Instantly raises a Pokémon's level by 3.", moneyMultiplier: 1.0, tier: "Rare"
	},
	candyjar: {
		name: "Candy Jar", icon: "Candy Jar", type: "key", category: "Key Items",
		desc: "Increases the level gain from Rare Candies by 1.", moneyMultiplier: 1.5, tier: "Epic"
	},
	map: {
		name: "Map", icon: "Town Map", type: "key", category: "Key Items",
		desc: "Allows you to select your destination when biomes branch.", moneyMultiplier: 1.5, tier: "Epic"
	},
	pokeball: {
		name: "Poke Ball", icon: "Poke Ball", type: "pokeball", category: "Pokéballs",
		desc: "A standard ball for catching wild Pokemon.", moneyMultiplier: 0.2, tier: "Common"
	},
	greatball: {
		name: "Great Ball", icon: "Great Ball", type: "pokeball", category: "Pokéballs",
		desc: "A good ball with a higher catch rate.", moneyMultiplier: 0.6, tier: "Rare"
	},
	ultraball: {
		name: "Ultra Ball", icon: "Ultra Ball", type: "pokeball", category: "Pokéballs",
		desc: "An excellent ball with a very high catch rate.", moneyMultiplier: 1.5, tier: "Epic"
	},
	masterball: {
		name: "Master Ball", icon: "Master Ball", type: "pokeball", category: "Pokéballs",
		desc: "Catches any wild Pokemon without fail.", moneyMultiplier: 10.0, tier: "Master"
	},
	potion: {
		name: "Potion", icon: "Potion", type: "healHP", category: "Medicine",
		desc: "Restores 20 HP or 10% HP, whichever is higher.", moneyMultiplier: 0.2, tier: "Common", isShopItem: true, minFloor: 1, healAmount: 20, healPercent: 10
	},
	superpotion: {
		name: "Super Potion", icon: "Super Potion", type: "healHP", category: "Medicine",
		desc: "Restores 50 HP or 25% HP, whichever is higher.", moneyMultiplier: 0.45, tier: "Common", isShopItem: true, minFloor: 21, healAmount: 50, healPercent: 25
	},
	hyperpotion: {
		name: "Hyper Potion", icon: "Hyper Potion", type: "healHP", category: "Medicine",
		desc: "Restores 200 HP or 50% HP, whichever is higher.", moneyMultiplier: 0.8, tier: "Rare", isShopItem: true, minFloor: 81, healAmount: 200, healPercent: 50
	},
	maxpotion: {
		name: "Max Potion", icon: "Max Potion", type: "healHP", category: "Medicine",
		desc: "Restores 100% HP.", moneyMultiplier: 1.5, tier: "Epic", isShopItem: true, minFloor: 111, isMax: true
	},
	revive: {
		name: "Revive", icon: "Revive", type: "revive", category: "Medicine",
		desc: "Revives one Pokémon and restores 50% HP.", moneyMultiplier: 2.0, tier: "Rare", isShopItem: true, minFloor: 1, reviveAmount: 50
	},
	maxrevive: {
		name: "Max Revive", icon: "Max Revive", type: "revive", category: "Medicine",
		desc: "Revives one Pokémon and restores 100% HP.", moneyMultiplier: 2.75, tier: "Epic", isShopItem: true, minFloor: 81, isMax: true
	},
	fullheal: {
		name: "Full Heal", icon: "Full Heal", type: "cureStatus", category: "Medicine",
		desc: "Heals any status ailment for one Pokémon.", moneyMultiplier: 1.0, tier: "Common", isShopItem: true, minFloor: 21
	},
	fullrestore: {
		name: "Full Restore", icon: "Full Restore", type: "healHP", category: "Medicine",
		desc: "Fully restores HP for one Pokémon and heals any status ailment.", moneyMultiplier: 2.25, tier: "Rare", isShopItem: true, minFloor: 141, isMax: true, curesStatus: true
	},
	sacredash: {
		name: "Sacred Ash", icon: "Sacred Ash", type: "itemPack", category: "Medicine",
		desc: "Revives all fainted Pokémon, fully restoring HP.", moneyMultiplier: 10.0, tier: "Master", isShopItem: true, minFloor: 171
	},
	memorymushroom: {
		name: "Memory Mushroom", icon: "Big Mushroom", type: "item", category: "Medicine",
		desc: "Recall one Pokémon's forgotten move.", moneyMultiplier: 4.0, tier: "Rare", isShopItem: true, minFloor: 81
	},	
	lure: {
		name: "Lure", icon: "Chipped Pot", type: "key", category: "Key Items",
		desc: "50% chance to encounter 2 wild Pokémon instead of 1.", moneyMultiplier: 1.5, tier: "Rare"
	},
	expall: {
		name: "Exp. All", icon: "Exp Share", type: "key", category: "Key Items",
		desc: "Gives 20% Exp. to all non-fainted Pokemon not in the battle. Stacks up to 5 times.", moneyMultiplier: 2.0, tier: "Epic"
	},
	expcharm: {
		name: "Exp. Charm", icon: "Exp. Share", type: "key", category: "Key Items",
		desc: "Boosts total EXP gained by the entire party by 25%. Stacks up to 99 times.", moneyMultiplier: 1.5, tier: "Rare"
	},
	hpup: {
		name: "HP Up", icon: "HP Up", type: "vitamin", category: "Vitamins",
		desc: "Raises the HP EVs of a Pokémon by 10. Max 252 per stat, 508 total.", moneyMultiplier: 1.0, tier: "Rare", evStat: "hp"
	},
	protein: {
		name: "Protein", icon: "Protein", type: "vitamin", category: "Vitamins",
		desc: "Raises the Attack EVs of a Pokémon by 10. Max 252 per stat, 508 total.", moneyMultiplier: 1.0, tier: "Rare", evStat: "atk"
	},
	iron: {
		name: "Iron", icon: "Iron", type: "vitamin", category: "Vitamins",
		desc: "Raises the Defense EVs of a Pokémon by 10. Max 252 per stat, 508 total.", moneyMultiplier: 1.0, tier: "Rare", evStat: "def"
	},
	calcium: {
		name: "Calcium", icon: "Calcium", type: "vitamin", category: "Vitamins",
		desc: "Raises the Sp. Atk EVs of a Pokémon by 10. Max 252 per stat, 508 total.", moneyMultiplier: 1.0, tier: "Rare", evStat: "spa"
	},
	zinc: {
		name: "Zinc", icon: "Zinc", type: "vitamin", category: "Vitamins",
		desc: "Raises the Sp. Def EVs of a Pokémon by 10. Max 252 per stat, 508 total.", moneyMultiplier: 1.0, tier: "Rare", evStat: "spd"
	},
	carbos: {
		name: "Carbos", icon: "Carbos", type: "vitamin", category: "Vitamins",
		desc: "Raises the Speed EVs of a Pokémon by 10. Max 252 per stat, 508 total.", moneyMultiplier: 1.0, tier: "Rare", evStat: "spe"
	},
	firestone: {
		name: "Fire Stone", icon: "Fire Stone", type: "evolveItem", category: "Evolutions",
		desc: "Evolves certain species of Pokémon.", moneyMultiplier: 1.0, tier: "Rare"
	},
	waterstone: {
		name: "Water Stone", icon: "Water Stone", type: "evolveItem", category: "Evolutions",
		desc: "Evolves certain species of Pokémon.", moneyMultiplier: 1.0, tier: "Rare"
	},
	thunderstone: {
		name: "Thunder Stone", icon: "Thunder Stone", type: "evolveItem", category: "Evolutions",
		desc: "Evolves certain species of Pokémon.", moneyMultiplier: 1.0, tier: "Rare"
	},
	leafstone: {
		name: "Leaf Stone", icon: "Leaf Stone", type: "evolveItem", category: "Evolutions",
		desc: "Evolves certain species of Pokémon.", moneyMultiplier: 1.0, tier: "Rare"
	},
	moonstone: {
		name: "Moon Stone", icon: "Moon Stone", type: "evolveItem", category: "Evolutions",
		desc: "Evolves certain species of Pokémon.", moneyMultiplier: 1.0, tier: "Rare"
	},
	sunstone: {
		name: "Sun Stone", icon: "Sun Stone", type: "evolveItem", category: "Evolutions",
		desc: "Evolves certain species of Pokémon.", moneyMultiplier: 1.0, tier: "Rare"
	},
	shinystone: {
		name: "Shiny Stone", icon: "Shiny Stone", type: "evolveItem", category: "Evolutions",
		desc: "Evolves certain species of Pokémon.", moneyMultiplier: 1.0, tier: "Rare"
	},
	duskstone: {
		name: "Dusk Stone", icon: "Dusk Stone", type: "evolveItem", category: "Evolutions",
		desc: "Evolves certain species of Pokémon.", moneyMultiplier: 1.0, tier: "Rare"
	},
	dawnstone: {
		name: "Dawn Stone", icon: "Dawn Stone", type: "evolveItem", category: "Evolutions",
		desc: "Evolves certain species of Pokémon.", moneyMultiplier: 1.0, tier: "Rare"
	},
	icestone: {
		name: "Ice Stone", icon: "Ice Stone", type: "evolveItem", category: "Evolutions",
		desc: "Evolves certain species of Pokémon.", moneyMultiplier: 1.0, tier: "Rare"
	},
	linkingcord: {
		name: "Linking Cord", icon: "Link Cable", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Pokémon that normally require trading.", moneyMultiplier: 1.5, tier: "Epic"
	},
	metalcoat: {
		name: "Metal Coat", icon: "Metal Coat", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Onix and Scyther.", moneyMultiplier: 1.5, tier: "Epic"
	},
	dragonscale: {
		name: "Dragon Scale", icon: "Dragon Scale", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Seadra into Kingdra.", moneyMultiplier: 1.5, tier: "Epic"
	},
	kingsrock: {
		name: "King's Rock", icon: "King's Rock", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Poliwhirl and Slowpoke.", moneyMultiplier: 1.5, tier: "Epic"
	},
	protector: {
		name: "Protector", icon: "Protector", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Rhydon into Rhyperior.", moneyMultiplier: 1.5, tier: "Epic"
	},
	electirizer: {
		name: "Electirizer", icon: "Electirizer", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Electabuzz into Electivire.", moneyMultiplier: 1.5, tier: "Epic"
	},
	magmarizer: {
		name: "Magmarizer", icon: "Magmarizer", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Magmar into Magmortar.", moneyMultiplier: 1.5, tier: "Epic"
	},
	upgrade: {
		name: "Up-Grade", icon: "Up-Grade", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Porygon into Porygon2.", moneyMultiplier: 1.5, tier: "Epic"
	},
	dubiousdisc: {
		name: "Dubious Disc", icon: "Dubious Disc", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Porygon2 into Porygon-Z.", moneyMultiplier: 1.5, tier: "Epic"
	},
	reapercloth: {
		name: "Reaper Cloth", icon: "Reaper Cloth", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Dusclops into Dusknoir.", moneyMultiplier: 1.5, tier: "Epic"
	},
	prismscale: {
		name: "Prism Scale", icon: "Prism Scale", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Feebas into Milotic.", moneyMultiplier: 1.5, tier: "Epic"
	},
	deepseatooth: {
		name: "Deep Sea Tooth", icon: "Deep Sea Tooth", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Clamperl into Huntail.", moneyMultiplier: 1.5, tier: "Epic"
	},
	deepseascale: {
		name: "Deep Sea Scale", icon: "Deep Sea Scale", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Clamperl into Gorebyss.", moneyMultiplier: 1.5, tier: "Epic"
	},
	sachet: {
		name: "Sachet", icon: "Sachet", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Spritzee into Aromatisse.", moneyMultiplier: 1.5, tier: "Epic"
	},
	whippeddream: {
		name: "Whipped Dream", icon: "Whipped Dream", type: "evolveItem", category: "Evolutions",
		desc: "Evolves Swirlix into Slurpuff.", moneyMultiplier: 1.5, tier: "Epic"
	},
	nugget: {
		name: "Nugget", icon: "Nugget", type: "itemPack", category: "Treasure",
		desc: "A nugget of pure gold. Immediately adds $5000 to your funds.", moneyMultiplier: 0, tier: "Rare"
	},
	big_nugget: {
		name: "Big Nugget", icon: "Big Nugget", type: "itemPack", category: "Treasure",
		desc: "A massive gold nugget. Immediately adds $20,000 to your funds.", moneyMultiplier: 0, tier: "Epic"
	},
	starter_token: {
		name: "Starter Token", icon: "Gacha Ticket", type: "itemPack", category: "Meta",
		desc: "Unlocks a random new basic Pokémon in your Starter selection.", moneyMultiplier: 0, tier: "Epic"
	}
};
