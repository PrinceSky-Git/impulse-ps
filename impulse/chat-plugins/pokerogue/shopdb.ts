import { type ShopItem } from './items';

export const SHOP_DB: Record<string, ShopItem> = {
	pokeball: {
		name: "Poke Ball",
		icon: "Poke Ball",
		type: "pokeball",
		category: "Pokéballs",
		desc: "A standard ball for catching wild Pokemon.",
		moneyMultiplier: 0.2,
		tier: "Common"
	},
	greatball: {
		name: "Great Ball",
		icon: "Great Ball",
		type: "pokeball",
		category: "Pokéballs",
		desc: "A good ball with a higher catch rate.",
		moneyMultiplier: 0.6,
		tier: "Rare"
	},
	ultraball: {
		name: "Ultra Ball",
		icon: "Ultra Ball",
		type: "pokeball",
		category: "Pokéballs",
		desc: "An excellent ball with a very high catch rate.",
		moneyMultiplier: 1.5,
		tier: "Epic"
	},
	masterball: {
		name: "Master Ball",
		icon: "Master Ball",
		type: "pokeball",
		category: "Pokéballs",
		desc: "Catches any wild Pokemon without fail.",
		moneyMultiplier: 10.0,
		tier: "Master"
	},
	potion: {
		name: "Potion",
		icon: "Potion",
		type: "healHP",
		category: "Medicine",
		desc: "Heals 20 HP.",
		moneyMultiplier: 0.2,
		tier: "Common",
		healAmount: 20
	},
	superpotion: {
		name: "Super Potion",
		icon: "Super Potion",
		type: "healHP",
		category: "Medicine",
		desc: "Heals 60 HP.",
		moneyMultiplier: 0.5,
		tier: "Rare",
		healAmount: 60
	},
	maxpotion: {
		name: "Max Potion",
		icon: "Max Potion",
		type: "healHP",
		category: "Medicine",
		desc: "Heals a pokemon's HP fully.",
		moneyMultiplier: 3.0,
		tier: "Epic",
		healAmount: 100,
		isMax: true
	},
	fullheal: {
		name: "Full Heal",
		icon: "Full Heal",
		type: "cureStatus",
		category: "Medicine",
		desc: "Cures a pokemon's status.",
		moneyMultiplier: 0.5,
		tier: "Common"
	},
	lure: {
		name: "Lure",
		icon: "Chipped Pot",
		type: "key",
		category: "Key Items",
		desc: "50% chance to encounter 2 wild Pokémon instead of 1.",
		moneyMultiplier: 1.5,
		tier: "Rare"
	},
	revive: {
		name: "Revive",
		icon: "Revive",
		type: "revive",
		category: "Medicine",
		desc: "Revives a Pokemon to half its maximum HP.",
		moneyMultiplier: 1.5,
		tier: "Rare",
		reviveAmount: 50
	},
	maxrevive: {
		name: "Max Revive",
		icon: "Revive",
		type: "revive",
		category: "Medicine",
		desc: "Revives a Pokemon to its maximum HP.",
		moneyMultiplier: 3.0,
		tier: "Epic",
		reviveAmount: 100,
		isMax: true
	},
	expall: {
		name: "Exp. All",
		icon: "Exp Share",
		type: "key",
		category: "Key Items",
		desc: "Gives 20% Exp. to all non-fainted Pokemon not in the battle. Stacks up to 5 times.",
		moneyMultiplier: 2.0,
		tier: "Epic"
	},
	expcharm: {
		name: "Exp. Charm",
		icon: "Exp. Share",
		type: "key",
		category: "Key Items",
		desc: "Boosts total EXP gained by the entire party by 25%. Stacks up to 99 times.",
		moneyMultiplier: 1.5,
		tier: "Rare"
	},
	hpup: {
		name: "HP Up",
		icon: "HP Up",
		type: "vitamin",
		category: "Vitamins",
		desc: "Raises the HP EVs of a Pokémon by 10. Max 252 per stat, 508 total.",
		moneyMultiplier: 1.0,
		tier: "Rare",
		evStat: "hp"
	},
	protein: {
		name: "Protein",
		icon: "Protein",
		type: "vitamin",
		category: "Vitamins",
		desc: "Raises the Attack EVs of a Pokémon by 10. Max 252 per stat, 508 total.",
		moneyMultiplier: 1.0,
		tier: "Rare",
		evStat: "atk"
	},
	iron: {
		name: "Iron",
		icon: "Iron",
		type: "vitamin",
		category: "Vitamins",
		desc: "Raises the Defense EVs of a Pokémon by 10. Max 252 per stat, 508 total.",
		moneyMultiplier: 1.0,
		tier: "Rare",
		evStat: "def"
	},
	calcium: {
		name: "Calcium",
		icon: "Calcium",
		type: "vitamin",
		category: "Vitamins",
		desc: "Raises the Sp. Atk EVs of a Pokémon by 10. Max 252 per stat, 508 total.",
		moneyMultiplier: 1.0,
		tier: "Rare",
		evStat: "spa"
	},
	zinc: {
		name: "Zinc",
		icon: "Zinc",
		type: "vitamin",
		category: "Vitamins",
		desc: "Raises the Sp. Def EVs of a Pokémon by 10. Max 252 per stat, 508 total.",
		moneyMultiplier: 1.0,
		tier: "Rare",
		evStat: "spd"
	},
	carbos: {
		name: "Carbos",
		icon: "Carbos",
		type: "vitamin",
		category: "Vitamins",
		desc: "Raises the Speed EVs of a Pokémon by 10. Max 252 per stat, 508 total.",
		moneyMultiplier: 1.0,
		tier: "Rare",
		evStat: "spe"
	},
	firestone: {
		name: "Fire Stone",
		icon: "Fire Stone",
		type: "evolveItem",
		category: "Evolutions",
		desc: "Evolves certain species of Pokémon.",
		moneyMultiplier: 1.0,
		tier: "Rare"
	},
	waterstone: {
		name: "Water Stone",
		icon: "Water Stone",
		type: "evolveItem",
		category: "Evolutions",
		desc: "Evolves certain species of Pokémon.",
		moneyMultiplier: 1.0,
		tier: "Rare"
	},
	thunderstone: {
		name: "Thunder Stone",
		icon: "Thunder Stone",
		type: "evolveItem",
		category: "Evolutions",
		desc: "Evolves certain species of Pokémon.",
		moneyMultiplier: 1.0,
		tier: "Rare"
	},
	leafstone: {
		name: "Leaf Stone",
		icon: "Leaf Stone",
		type: "evolveItem",
		category: "Evolutions",
		desc: "Evolves certain species of Pokémon.",
		moneyMultiplier: 1.0,
		tier: "Rare"
	},
	moonstone: {
		name: "Moon Stone",
		icon: "Moon Stone",
		type: "evolveItem",
		category: "Evolutions",
		desc: "Evolves certain species of Pokémon.",
		moneyMultiplier: 1.0,
		tier: "Rare"
	},
	sunstone: {
		name: "Sun Stone",
		icon: "Sun Stone",
		type: "evolveItem",
		category: "Evolutions",
		desc: "Evolves certain species of Pokémon.",
		moneyMultiplier: 1.0,
		tier: "Rare"
	},
	shinystone: {
		name: "Shiny Stone",
		icon: "Shiny Stone",
		type: "evolveItem",
		category: "Evolutions",
		desc: "Evolves certain species of Pokémon.",
		moneyMultiplier: 1.0,
		tier: "Rare"
	},
	duskstone: {
		name: "Dusk Stone",
		icon: "Dusk Stone",
		type: "evolveItem",
		category: "Evolutions",
		desc: "Evolves certain species of Pokémon.",
		moneyMultiplier: 1.0,
		tier: "Rare"
	},
	dawnstone: {
		name: "Dawn Stone",
		icon: "Dawn Stone",
		type: "evolveItem",
		category: "Evolutions",
		desc: "Evolves certain species of Pokémon.",
		moneyMultiplier: 1.0,
		tier: "Rare"
	},
	icestone: {
		name: "Ice Stone",
		icon: "Ice Stone",
		type: "evolveItem",
		category: "Evolutions",
		desc: "Evolves certain species of Pokémon.",
		moneyMultiplier: 1.0,
		tier: "Rare"
	},
	linkingcord: {
		name: "Linking Cord",
		icon: "Link Cable",
		type: "evolveItem",
		category: "Evolutions",
		desc: "Evolves Pokémon that normally require trading.",
		moneyMultiplier: 1.5,
		tier: "Epic"
	},
	metalcoat: {
		name: "Metal Coat",
		icon: "Metal Coat",
		type: "evolveItem",
		category: "Evolutions",
		desc: "Evolves Onix and Scyther.",
		moneyMultiplier: 1.5,
		tier: "Epic"
	},
	dragonscale: {
		name: "Dragon Scale",
		icon: "Dragon Scale",
		type: "evolveItem",
		category: "Evolutions",
		desc: "Evolves Seadra into Kingdra.",
		moneyMultiplier: 1.5,
		tier: "Epic"
	},
	kingsrock: {
		name: "King's Rock",
		icon: "King's Rock",
		type: "evolveItem",
		category: "Evolutions",
		desc: "Evolves Poliwhirl and Slowpoke.",
		moneyMultiplier: 1.5,
		tier: "Epic"
	},
	protector: {
		name: "Protector",
		icon: "Protector",
		type: "evolveItem",
		category: "Evolutions",
		desc: "Evolves Rhydon into Rhyperior.",
		moneyMultiplier: 1.5,
		tier: "Epic"
	},
	electirizer: {
		name: "Electirizer",
		icon: "Electirizer",
		type: "evolveItem",
		category: "Evolutions",
		desc: "Evolves Electabuzz into Electivire.",
		moneyMultiplier: 1.5,
		tier: "Epic"
	},
	magmarizer: {
		name: "Magmarizer",
		icon: "Magmarizer",
		type: "evolveItem",
		category: "Evolutions",
		desc: "Evolves Magmar into Magmortar.",
		moneyMultiplier: 1.5,
		tier: "Epic"
	},
	upgrade: {
		name: "Up-Grade",
		icon: "Up-Grade",
		type: "evolveItem",
		category: "Evolutions",
		desc: "Evolves Porygon into Porygon2.",
		moneyMultiplier: 1.5,
		tier: "Epic"
	},
	dubiousdisc: {
		name: "Dubious Disc",
		icon: "Dubious Disc",
		type: "evolveItem",
		category: "Evolutions",
		desc: "Evolves Porygon2 into Porygon-Z.",
		moneyMultiplier: 1.5,
		tier: "Epic"
	},
	reapercloth: {
		name: "Reaper Cloth",
		icon: "Reaper Cloth",
		type: "evolveItem",
		category: "Evolutions",
		desc: "Evolves Dusclops into Dusknoir.",
		moneyMultiplier: 1.5,
		tier: "Epic"
	},
	prismscale: {
		name: "Prism Scale",
		icon: "Prism Scale",
		type: "evolveItem",
		category: "Evolutions",
		desc: "Evolves Feebas into Milotic.",
		moneyMultiplier: 1.5,
		tier: "Epic"
	},
	deepseatooth: {
		name: "Deep Sea Tooth",
		icon: "Deep Sea Tooth",
		type: "evolveItem",
		category: "Evolutions",
		desc: "Evolves Clamperl into Huntail.",
		moneyMultiplier: 1.5,
		tier: "Epic"
	},
	deepseascale: {
		name: "Deep Sea Scale",
		icon: "Deep Sea Scale",
		type: "evolveItem",
		category: "Evolutions",
		desc: "Evolves Clamperl into Gorebyss.",
		moneyMultiplier: 1.5,
		tier: "Epic"
	},
	sachet: {
		name: "Sachet",
		icon: "Sachet",
		type: "evolveItem",
		category: "Evolutions",
		desc: "Evolves Spritzee into Aromatisse.",
		moneyMultiplier: 1.5,
		tier: "Epic"
	},
	whippeddream: {
		name: "Whipped Dream",
		icon: "Whipped Dream",
		type: "evolveItem",
		category: "Evolutions",
		desc: "Evolves Swirlix into Slurpuff.",
		moneyMultiplier: 1.5,
		tier: "Epic"
	},
	leftovers: {
		name: "Leftovers",
		icon: "Leftovers",
		type: "item",
		category: "Held Items",
		desc: "Restores 1/16 of the holder's max HP at the end of each turn.",
		moneyMultiplier: 1.5,
		tier: "Epic"
	},
	nugget: {
		name: "Nugget",
		icon: "Nugget",
		type: "itemPack",
		category: "Treasure",
		desc: "A nugget of pure gold. Immediately adds $5000 to your funds.",
		moneyMultiplier: 0,
		tier: "Rare"
	},
	big_nugget: {
		name: "Big Nugget",
		icon: "Big Nugget",
		type: "itemPack",
		category: "Treasure",
		desc: "A massive gold nugget. Immediately adds $20,000 to your funds.",
		moneyMultiplier: 0,
		tier: "Epic"
	},
	starter_token: {
		name: "Starter Token",
		icon: "Gacha Ticket",
		type: "itemPack",
		category: "Meta",
		desc: "Unlocks a random new basic Pokémon in your Starter selection.",
		moneyMultiplier: 0,
		tier: "Epic"
	}
};
