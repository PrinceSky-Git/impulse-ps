import { type ShopItem } from './items';

export const HELD_ITEMS_DB: Record<string, ShopItem> = {
	// ─── Key Items / Money ───────────────────────────────────────────────────
	amuletcoin: {
		name: "Amulet Coin", icon: "Amulet Coin", type: "key", category: "Key Items",
		desc: "Boosts money earned after winning battles.", moneyMultiplier: 1.0, tier: "Rare",
	},
	goldenpunch: {
		name: "Golden Punch", icon: "Punching Glove", type: "key", category: "Key Items",
		desc: "Massively boosts money earned after winning battles.", moneyMultiplier: 1.5, tier: "Epic",
	},

	// ─── Berries ─────────────────────────────────────────────────────────────
	sitrusberry: {
		name: "Sitrus Berry", icon: "Sitrus Berry", type: "item", category: "Berries",
		desc: "Restores HP when it falls below half.", moneyMultiplier: 0.5, tier: "Common",
	},
	lumberry: {
		name: "Lum Berry", icon: "Lum Berry", type: "item", category: "Berries",
		desc: "Cures any status condition.", moneyMultiplier: 0.5, tier: "Common",
	},
	leppaberry: {
		name: "Leppa Berry", icon: "Leppa Berry", type: "item", category: "Berries",
		desc: "Restores 10 PP when a move runs out of PP.", moneyMultiplier: 0.5, tier: "Common",
	},
	enigmaberry: {
		name: "Enigma Berry", icon: "Enigma Berry", type: "item", category: "Berries",
		desc: "Restores HP when hit by a supereffective attack.", moneyMultiplier: 1.0, tier: "Rare",
	},
	oranberry: {
		name: "Oran Berry", icon: "Oran Berry", type: "item", category: "Berries",
		desc: "Restores 10 HP when HP falls below half.", moneyMultiplier: 0.2, tier: "Common",
	},
	pechaberry: {
		name: "Pecha Berry", icon: "Pecha Berry", type: "item", category: "Berries",
		desc: "Cures the Poison status condition.", moneyMultiplier: 0.2, tier: "Common",
	},
	chestoberry: {
		name: "Chesto Berry", icon: "Chesto Berry", type: "item", category: "Berries",
		desc: "Cures the Sleep status condition.", moneyMultiplier: 0.2, tier: "Common",
	},
	rawstberry: {
		name: "Rawst Berry", icon: "Rawst Berry", type: "item", category: "Berries",
		desc: "Cures the Burn status condition.", moneyMultiplier: 0.2, tier: "Common",
	},
	aspearberry: {
		name: "Aspear Berry", icon: "Aspear Berry", type: "item", category: "Berries",
		desc: "Cures the Frozen status condition.", moneyMultiplier: 0.2, tier: "Common",
	},
	persimberry: {
		name: "Persim Berry", icon: "Persim Berry", type: "item", category: "Berries",
		desc: "Cures the Confused status condition.", moneyMultiplier: 0.2, tier: "Common",
	},
	chilanberry: {
		name: "Chilan Berry", icon: "Chilan Berry", type: "item", category: "Berries",
		desc: "Weakens a Normal-type attack against the holder.", moneyMultiplier: 0.5, tier: "Common",
	},
	occaberry: {
		name: "Occa Berry", icon: "Occa Berry", type: "item", category: "Berries",
		desc: "Weakens a supereffective Fire-type move against the holder.", moneyMultiplier: 0.5, tier: "Common",
	},
	passhoberry: {
		name: "Passho Berry", icon: "Passho Berry", type: "item", category: "Berries",
		desc: "Weakens a supereffective Water-type move against the holder.", moneyMultiplier: 0.5, tier: "Common",
	},
	wacanberry: {
		name: "Wacan Berry", icon: "Wacan Berry", type: "item", category: "Berries",
		desc: "Weakens a supereffective Electric-type move against the holder.", moneyMultiplier: 0.5, tier: "Common",
	},
	rindoberry: {
		name: "Rindo Berry", icon: "Rindo Berry", type: "item", category: "Berries",
		desc: "Weakens a supereffective Grass-type move against the holder.", moneyMultiplier: 0.5, tier: "Common",
	},
	yacheberry: {
		name: "Yache Berry", icon: "Yache Berry", type: "item", category: "Berries",
		desc: "Weakens a supereffective Ice-type move against the holder.", moneyMultiplier: 0.5, tier: "Common",
	},
	chopleberry: {
		name: "Chople Berry", icon: "Chople Berry", type: "item", category: "Berries",
		desc: "Weakens a supereffective Fighting-type move against the holder.", moneyMultiplier: 0.5, tier: "Common",
	},
	kebiaberry: {
		name: "Kebia Berry", icon: "Kebia Berry", type: "item", category: "Berries",
		desc: "Weakens a supereffective Poison-type move against the holder.", moneyMultiplier: 0.5, tier: "Common",
	},
	shucaberry: {
		name: "Shuca Berry", icon: "Shuca Berry", type: "item", category: "Berries",
		desc: "Weakens a supereffective Ground-type move against the holder.", moneyMultiplier: 0.5, tier: "Common",
	},
	cobaberry: {
		name: "Coba Berry", icon: "Coba Berry", type: "item", category: "Berries",
		desc: "Weakens a supereffective Flying-type move against the holder.", moneyMultiplier: 0.5, tier: "Common",
	},
	payapaberry: {
		name: "Payapa Berry", icon: "Payapa Berry", type: "item", category: "Berries",
		desc: "Weakens a supereffective Psychic-type move against the holder.", moneyMultiplier: 0.5, tier: "Common",
	},
	tangaberry: {
		name: "Tanga Berry", icon: "Tanga Berry", type: "item", category: "Berries",
		desc: "Weakens a supereffective Bug-type move against the holder.", moneyMultiplier: 0.5, tier: "Common",
	},
	chartiberry: {
		name: "Charti Berry", icon: "Charti Berry", type: "item", category: "Berries",
		desc: "Weakens a supereffective Rock-type move against the holder.", moneyMultiplier: 0.5, tier: "Common",
	},
	kasibberry: {
		name: "Kasib Berry", icon: "Kasib Berry", type: "item", category: "Berries",
		desc: "Weakens a supereffective Ghost-type move against the holder.", moneyMultiplier: 0.5, tier: "Common",
	},
	habanberry: {
		name: "Haban Berry", icon: "Haban Berry", type: "item", category: "Berries",
		desc: "Weakens a supereffective Dragon-type move against the holder.", moneyMultiplier: 0.5, tier: "Common",
	},
	colburberry: {
		name: "Colbur Berry", icon: "Colbur Berry", type: "item", category: "Berries",
		desc: "Weakens a supereffective Dark-type move against the holder.", moneyMultiplier: 0.5, tier: "Common",
	},
	babiriberry: {
		name: "Babiri Berry", icon: "Babiri Berry", type: "item", category: "Berries",
		desc: "Weakens a supereffective Steel-type move against the holder.", moneyMultiplier: 0.5, tier: "Common",
	},
	roseliberry: {
		name: "Roseli Berry", icon: "Roseli Berry", type: "item", category: "Berries",
		desc: "Weakens a supereffective Fairy-type move against the holder.", moneyMultiplier: 0.5, tier: "Common",
	},
	liechiberry: {
		name: "Liechi Berry", icon: "Liechi Berry", type: "item", category: "Berries",
		desc: "Raises Attack when HP falls below 1/4.", moneyMultiplier: 1.0, tier: "Rare",
	},
	ganlonberry: {
		name: "Ganlon Berry", icon: "Ganlon Berry", type: "item", category: "Berries",
		desc: "Raises Defense when HP falls below 1/4.", moneyMultiplier: 1.0, tier: "Rare",
	},
	salacberry: {
		name: "Salac Berry", icon: "Salac Berry", type: "item", category: "Berries",
		desc: "Raises Speed when HP falls below 1/4.", moneyMultiplier: 1.0, tier: "Rare",
	},
	petayaberry: {
		name: "Petaya Berry", icon: "Petaya Berry", type: "item", category: "Berries",
		desc: "Raises Sp. Atk when HP falls below 1/4.", moneyMultiplier: 1.0, tier: "Rare",
	},
	apicotberry: {
		name: "Apicot Berry", icon: "Apicot Berry", type: "item", category: "Berries",
		desc: "Raises Sp. Def when HP falls below 1/4.", moneyMultiplier: 1.0, tier: "Rare",
	},
	lansatberry: {
		name: "Lansat Berry", icon: "Lansat Berry", type: "item", category: "Berries",
		desc: "Raises critical hit ratio when HP falls below 1/4.", moneyMultiplier: 1.0, tier: "Rare",
	},
	starfberry: {
		name: "Starf Berry", icon: "Starf Berry", type: "item", category: "Berries",
		desc: "Sharply raises a random stat when HP falls below 1/4.", moneyMultiplier: 1.0, tier: "Rare",
	},
	micleberry: {
		name: "Micle Berry", icon: "Micle Berry", type: "item", category: "Berries",
		desc: "Boosts the accuracy of the next move when HP falls below 1/4.", moneyMultiplier: 1.0, tier: "Rare",
	},
	custapberry: {
		name: "Custap Berry", icon: "Custap Berry", type: "item", category: "Berries",
		desc: "Lets the holder move first when HP falls below 1/4.", moneyMultiplier: 1.0, tier: "Rare",
	},
	jabocaberry: {
		name: "Jaboca Berry", icon: "Jaboca Berry", type: "item", category: "Berries",
		desc: "Damages the attacker when hit by a physical move.", moneyMultiplier: 1.0, tier: "Rare",
	},
	rowapberry: {
		name: "Rowap Berry", icon: "Rowap Berry", type: "item", category: "Berries",
		desc: "Damages the attacker when hit by a special move.", moneyMultiplier: 1.0, tier: "Rare",
	},
	keeberry: {
		name: "Kee Berry", icon: "Kee Berry", type: "item", category: "Berries",
		desc: "Raises Defense when hit by a physical move.", moneyMultiplier: 1.0, tier: "Rare",
	},
	marangaberry: {
		name: "Maranga Berry", icon: "Maranga Berry", type: "item", category: "Berries",
		desc: "Raises Sp. Def when hit by a special move.", moneyMultiplier: 1.0, tier: "Rare",
	},

	// ─── Type-Boosting Items ──────────────────────────────────────────────────
	charcoal: {
		name: "Charcoal", icon: "Charcoal", type: "item", category: "Held Items",
		desc: "Boosts the power of Fire-type moves.", moneyMultiplier: 0.5, tier: "Common",
	},
	mysticwater: {
		name: "Mystic Water", icon: "Mystic Water", type: "item", category: "Held Items",
		desc: "Boosts the power of Water-type moves.", moneyMultiplier: 0.5, tier: "Common",
	},
	miracleseed: {
		name: "Miracle Seed", icon: "Miracle Seed", type: "item", category: "Held Items",
		desc: "Boosts the power of Grass-type moves.", moneyMultiplier: 0.5, tier: "Common",
	},
	magnet: {
		name: "Magnet", icon: "Magnet", type: "item", category: "Held Items",
		desc: "Boosts the power of Electric-type moves.", moneyMultiplier: 0.5, tier: "Common",
	},
	nevermeltice: {
		name: "Never-Melt Ice", icon: "Never-Melt Ice", type: "item", category: "Held Items",
		desc: "Boosts the power of Ice-type moves.", moneyMultiplier: 0.5, tier: "Common",
	},
	blackbelt: {
		name: "Black Belt", icon: "Black Belt", type: "item", category: "Held Items",
		desc: "Boosts the power of Fighting-type moves.", moneyMultiplier: 0.5, tier: "Common",
	},
	poisonbarb: {
		name: "Poison Barb", icon: "Poison Barb", type: "item", category: "Held Items",
		desc: "Boosts the power of Poison-type moves.", moneyMultiplier: 0.5, tier: "Common",
	},
	softsand: {
		name: "Soft Sand", icon: "Soft Sand", type: "item", category: "Held Items",
		desc: "Boosts the power of Ground-type moves.", moneyMultiplier: 0.5, tier: "Common",
	},
	sharpbeak: {
		name: "Sharp Beak", icon: "Sharp Beak", type: "item", category: "Held Items",
		desc: "Boosts the power of Flying-type moves.", moneyMultiplier: 0.5, tier: "Common",
	},
	twistedspoon: {
		name: "Twisted Spoon", icon: "Twisted Spoon", type: "item", category: "Held Items",
		desc: "Boosts the power of Psychic-type moves.", moneyMultiplier: 0.5, tier: "Common",
	},
	silverpowder: {
		name: "Silver Powder", icon: "Silver Powder", type: "item", category: "Held Items",
		desc: "Boosts the power of Bug-type moves.", moneyMultiplier: 0.5, tier: "Common",
	},
	hardstone: {
		name: "Hard Stone", icon: "Hard Stone", type: "item", category: "Held Items",
		desc: "Boosts the power of Rock-type moves.", moneyMultiplier: 0.5, tier: "Common",
	},
	spelltag: {
		name: "Spell Tag", icon: "Spell Tag", type: "item", category: "Held Items",
		desc: "Boosts the power of Ghost-type moves.", moneyMultiplier: 0.5, tier: "Common",
	},
	dragonfang: {
		name: "Dragon Fang", icon: "Dragon Fang", type: "item", category: "Held Items",
		desc: "Boosts the power of Dragon-type moves.", moneyMultiplier: 0.5, tier: "Common",
	},
	blackglasses: {
		name: "Black Glasses", icon: "Black Glasses", type: "item", category: "Held Items",
		desc: "Boosts the power of Dark-type moves.", moneyMultiplier: 0.5, tier: "Common",
	},
	metalcoatitem: {
		name: "Metal Coat (Item)", icon: "Metal Coat", type: "item", category: "Held Items",
		desc: "Boosts the power of Steel-type moves.", moneyMultiplier: 0.5, tier: "Common",
	},
	silkscarf: {
		name: "Silk Scarf", icon: "Silk Scarf", type: "item", category: "Held Items",
		desc: "Boosts the power of Normal-type moves.", moneyMultiplier: 0.5, tier: "Common",
	},
	fairyfeather: {
		name: "Fairy Feather", icon: "Fairy Feather", type: "item", category: "Held Items",
		desc: "Boosts the power of Fairy-type moves.", moneyMultiplier: 0.5, tier: "Common",
	},

	// ─── Choice Items ─────────────────────────────────────────────────────────
	choiceband: {
		name: "Choice Band", icon: "Choice Band", type: "item", category: "Held Items",
		desc: "Boosts Attack, but allows the use of only one of its moves.", moneyMultiplier: 1.5, tier: "Epic",
	},
	choicespecs: {
		name: "Choice Specs", icon: "Choice Specs", type: "item", category: "Held Items",
		desc: "Boosts Sp. Atk, but allows the use of only one of its moves.", moneyMultiplier: 1.5, tier: "Epic",
	},
	choicescarf: {
		name: "Choice Scarf", icon: "Choice Scarf", type: "item", category: "Held Items",
		desc: "Boosts Speed, but allows the use of only one of its moves.", moneyMultiplier: 1.5, tier: "Epic",
	},

	// ─── Sash / Band ─────────────────────────────────────────────────────────
	focussash: {
		name: "Focus Sash", icon: "Focus Sash", type: "item", category: "Held Items",
		desc: "If holding this item and at full HP, it endures a potential KO attack with 1 HP.", moneyMultiplier: 1.0, tier: "Rare",
	},
	focusband: {
		name: "Focus Band", icon: "Focus Band", type: "item", category: "Held Items",
		desc: "Has a 10% chance to endure a potential KO attack with 1 HP.", moneyMultiplier: 0.5, tier: "Common",
	},

	// ─── Orbs / Recovery ─────────────────────────────────────────────────────
	lifeorb: {
		name: "Life Orb", icon: "Life Orb", type: "item", category: "Held Items",
		desc: "Boosts the power of moves by 30%, but holder loses 10% HP each time it attacks.", moneyMultiplier: 1.5, tier: "Epic",
	},
	leftovers: {
		name: "Leftovers", icon: "Leftovers", type: "item", category: "Held Items",
		desc: "Restores 1/16 of max HP at the end of each turn.", moneyMultiplier: 1.0, tier: "Rare",
	},
	blacksludge: {
		name: "Black Sludge", icon: "Black Sludge", type: "item", category: "Held Items",
		desc: "Restores 1/16 max HP each turn for Poison-types; damages other types.", moneyMultiplier: 1.0, tier: "Rare",
	},
	shellbell: {
		name: "Shell Bell", icon: "Shell Bell", type: "item", category: "Held Items",
		desc: "Restores 1/8 of the damage dealt to foes after each attack.", moneyMultiplier: 0.5, tier: "Common",
	},

	// ─── Defense Items ────────────────────────────────────────────────────────
	rockyhelmet: {
		name: "Rocky Helmet", icon: "Rocky Helmet", type: "item", category: "Held Items",
		desc: "Damages attackers who make contact with the holder for 1/6 of their max HP.", moneyMultiplier: 1.0, tier: "Rare",
	},
	assaultvest: {
		name: "Assault Vest", icon: "Assault Vest", type: "item", category: "Held Items",
		desc: "Boosts Sp. Def by 50%, but prevents the use of status moves.", moneyMultiplier: 1.5, tier: "Epic",
	},
	eviolite: {
		name: "Eviolite", icon: "Eviolite", type: "item", category: "Held Items",
		desc: "Boosts Defense and Sp. Def by 50% if the holder can still evolve.", moneyMultiplier: 1.5, tier: "Epic",
	},
	heavydutyboots: {
		name: "Heavy-Duty Boots", icon: "Heavy-Duty Boots", type: "item", category: "Held Items",
		desc: "Prevents damage from entry hazards.", moneyMultiplier: 1.5, tier: "Epic",
	},
	airballoon: {
		name: "Air Balloon", icon: "Air Balloon", type: "item", category: "Held Items",
		desc: "Holder floats above the ground, immune to Ground-type moves, until hit.", moneyMultiplier: 1.0, tier: "Rare",
	},
	shedshell: {
		name: "Shed Shell", icon: "Shed Shell", type: "item", category: "Held Items",
		desc: "Allows the holder to switch out even when trapped.", moneyMultiplier: 0.5, tier: "Common",
	},
	safetygoggles: {
		name: "Safety Goggles", icon: "Safety Goggles", type: "item", category: "Held Items",
		desc: "Protects the holder from weather damage and powder/spore moves.", moneyMultiplier: 1.0, tier: "Rare",
	},
	covertcloak: {
		name: "Covert Cloak", icon: "Covert Cloak", type: "item", category: "Held Items",
		desc: "Protects the holder from the additional effects of moves.", moneyMultiplier: 1.0, tier: "Rare",
	},
	protectivepads: {
		name: "Protective Pads", icon: "Protective Pads", type: "item", category: "Held Items",
		desc: "Protects the holder from effects caused by making direct contact.", moneyMultiplier: 1.0, tier: "Rare",
	},
	clearamulet: {
		name: "Clear Amulet", icon: "Clear Amulet", type: "item", category: "Held Items",
		desc: "Prevents the holder's stats from being lowered by opponents.", moneyMultiplier: 1.5, tier: "Epic",
	},
	utilityumbrella: {
		name: "Utility Umbrella", icon: "Utility Umbrella", type: "item", category: "Held Items",
		desc: "Protects the holder from the effects of harsh weather.", moneyMultiplier: 1.0, tier: "Rare",
	},

	// ─── Stat-Boosting / Setup ────────────────────────────────────────────────
	weaknesspolicy: {
		name: "Weakness Policy", icon: "Weakness Policy", type: "item", category: "Held Items",
		desc: "Sharply raises Attack and Sp. Atk when hit by a supereffective move.", moneyMultiplier: 1.5, tier: "Epic",
	},
	expertbelt: {
		name: "Expert Belt", icon: "Expert Belt", type: "item", category: "Held Items",
		desc: "Boosts the power of supereffective moves by 20%.", moneyMultiplier: 1.0, tier: "Rare",
	},
	wiseglasses: {
		name: "Wise Glasses", icon: "Wise Glasses", type: "item", category: "Held Items",
		desc: "Boosts the power of special moves by 10%.", moneyMultiplier: 1.0, tier: "Rare",
	},
	muscleband: {
		name: "Muscle Band", icon: "Muscle Band", type: "item", category: "Held Items",
		desc: "Boosts the power of physical moves by 10%.", moneyMultiplier: 1.0, tier: "Rare",
	},
	punchingglove: {
		name: "Punching Glove", icon: "Punching Glove", type: "item", category: "Held Items",
		desc: "Boosts the power of punching moves by 10% and prevents contact.", moneyMultiplier: 1.0, tier: "Rare",
	},
	loadeddice: {
		name: "Loaded Dice", icon: "Loaded Dice", type: "item", category: "Held Items",
		desc: "Causes multi-hit moves to always hit the maximum number of times.", moneyMultiplier: 1.5, tier: "Epic",
	},
	metronome: {
		name: "Metronome", icon: "Metronome", type: "item", category: "Held Items",
		desc: "Boosts the power of a move used consecutively by 20% each time, up to 100%.", moneyMultiplier: 1.0, tier: "Rare",
	},
	widelens: {
		name: "Wide Lens", icon: "Wide Lens", type: "item", category: "Held Items",
		desc: "Boosts the holder's accuracy by 10%.", moneyMultiplier: 0.5, tier: "Common",
	},
	zoomlens: {
		name: "Zoom Lens", icon: "Zoom Lens", type: "item", category: "Held Items",
		desc: "Boosts the holder's accuracy by 20% if it moves after the target.", moneyMultiplier: 0.5, tier: "Common",
	},
	scopelens: {
		name: "Scope Lens", icon: "Scope Lens", type: "item", category: "Held Items",
		desc: "Boosts the holder's critical hit ratio.", moneyMultiplier: 1.0, tier: "Rare",
	},
	razorclaw: {
		name: "Razor Claw", icon: "Razor Claw", type: "item", category: "Held Items",
		desc: "Boosts the holder's critical hit ratio.", moneyMultiplier: 1.0, tier: "Rare",
	},
	luckypunch: {
		name: "Lucky Punch", icon: "Lucky Punch", type: "item", category: "Held Items",
		desc: "Greatly boosts Chansey's critical hit ratio.", moneyMultiplier: 0.5, tier: "Common",
	},

	// ─── Speed Control ────────────────────────────────────────────────────────
	ironball: {
		name: "Iron Ball", icon: "Iron Ball", type: "item", category: "Held Items",
		desc: "Halves the holder's Speed. Grounds Flying-types and Pokémon with Levitate.", moneyMultiplier: 0.5, tier: "Common",
	},
	laggingtail: {
		name: "Lagging Tail", icon: "Lagging Tail", type: "item", category: "Held Items",
		desc: "Makes the holder move last in its priority bracket.", moneyMultiplier: 0.5, tier: "Common",
	},
	roomservice: {
		name: "Room Service", icon: "Room Service", type: "item", category: "Held Items",
		desc: "Lowers Speed when Trick Room is set up.", moneyMultiplier: 0.5, tier: "Common",
	},
	quickclaw: {
		name: "Quick Claw", icon: "Quick Claw", type: "item", category: "Held Items",
		desc: "Has a 20% chance to move first in its priority bracket.", moneyMultiplier: 0.5, tier: "Common",
	},
	custapberry2: {
		name: "Custap Berry", icon: "Custap Berry", type: "item", category: "Held Items",
		desc: "Lets the holder move first once when HP falls below 1/4.", moneyMultiplier: 1.0, tier: "Rare",
	},

	// ─── Trick / Utility ──────────────────────────────────────────────────────
	stickybarb: {
		name: "Sticky Barb", icon: "Sticky Barb", type: "item", category: "Held Items",
		desc: "Damages the holder each turn. Transfers to attackers that make contact.", moneyMultiplier: 0.5, tier: "Common",
	},
	flameorb: {
		name: "Flame Orb", icon: "Flame Orb", type: "item", category: "Held Items",
		desc: "Burns the holder at the end of each turn.", moneyMultiplier: 1.0, tier: "Rare",
	},
	toxicorb: {
		name: "Toxic Orb", icon: "Toxic Orb", type: "item", category: "Held Items",
		desc: "Badly poisons the holder at the end of each turn.", moneyMultiplier: 1.0, tier: "Rare",
	},
	ejectbutton: {
		name: "Eject Button", icon: "Eject Button", type: "item", category: "Held Items",
		desc: "Switches the holder out when it takes damage from a move.", moneyMultiplier: 1.0, tier: "Rare",
	},
	ejectpack: {
		name: "Eject Pack", icon: "Eject Pack", type: "item", category: "Held Items",
		desc: "Switches the holder out when any of its stats are lowered.", moneyMultiplier: 1.0, tier: "Rare",
	},
	redcard: {
		name: "Red Card", icon: "Red Card", type: "item", category: "Held Items",
		desc: "Forces the attacker to switch out after hitting the holder.", moneyMultiplier: 1.0, tier: "Rare",
	},
	mentalherb: {
		name: "Mental Herb", icon: "Mental Herb", type: "item", category: "Held Items",
		desc: "Cures attraction, Taunt, Encore, Torment, Heal Block, and Disable.", moneyMultiplier: 0.5, tier: "Common",
	},
	powerherb: {
		name: "Power Herb", icon: "Power Herb", type: "item", category: "Held Items",
		desc: "Allows the holder to skip the charge turn of two-turn moves once.", moneyMultiplier: 1.0, tier: "Rare",
	},
	whiteherb: {
		name: "White Herb", icon: "White Herb", type: "item", category: "Held Items",
		desc: "Restores any lowered stats once.", moneyMultiplier: 0.5, tier: "Common",
	},
	blunderpolicy: {
		name: "Blunder Policy", icon: "Blunder Policy", type: "item", category: "Held Items",
		desc: "Sharply boosts Speed when the holder misses due to accuracy.", moneyMultiplier: 1.0, tier: "Rare",
	},
	throatspray: {
		name: "Throat Spray", icon: "Throat Spray", type: "item", category: "Held Items",
		desc: "Raises Sp. Atk after the holder uses a sound-based move.", moneyMultiplier: 1.0, tier: "Rare",
	},
	boosterenergy: {
		name: "Booster Energy", icon: "Booster Energy", type: "item", category: "Held Items",
		desc: "Activates the Protosynthesis or Quark Drive ability outside of sun or electric terrain.", moneyMultiplier: 1.5, tier: "Epic",
	},
	terrainextender: {
		name: "Terrain Extender", icon: "Terrain Extender", type: "item", category: "Held Items",
		desc: "Extends the duration of terrain moves used by the holder to 8 turns.", moneyMultiplier: 1.0, tier: "Rare",
	},

	// ─── Weather-Related ──────────────────────────────────────────────────────
	heatrock: {
		name: "Heat Rock", icon: "Heat Rock", type: "item", category: "Held Items",
		desc: "Extends the duration of harsh sunlight from Sunny Day to 8 turns.", moneyMultiplier: 0.5, tier: "Common",
	},
	damprock: {
		name: "Damp Rock", icon: "Damp Rock", type: "item", category: "Held Items",
		desc: "Extends the duration of rain from Rain Dance to 8 turns.", moneyMultiplier: 0.5, tier: "Common",
	},
	icyrock: {
		name: "Icy Rock", icon: "Icy Rock", type: "item", category: "Held Items",
		desc: "Extends the duration of hail from Hail to 8 turns.", moneyMultiplier: 0.5, tier: "Common",
	},
	smoothrock: {
		name: "Smooth Rock", icon: "Smooth Rock", type: "item", category: "Held Items",
		desc: "Extends the duration of sandstorm from Sandstorm to 8 turns.", moneyMultiplier: 0.5, tier: "Common",
	},

	// ─── Plates (Arceus) ──────────────────────────────────────────────────────
	fistplate: {
		name: "Fist Plate", icon: "Fist Plate", type: "item", category: "Plates",
		desc: "Boosts Fighting-type moves. Changes Arceus to the Fighting type.", moneyMultiplier: 1.0, tier: "Rare",
	},
	skyplate: {
		name: "Sky Plate", icon: "Sky Plate", type: "item", category: "Plates",
		desc: "Boosts Flying-type moves. Changes Arceus to the Flying type.", moneyMultiplier: 1.0, tier: "Rare",
	},
	toxicplate: {
		name: "Toxic Plate", icon: "Toxic Plate", type: "item", category: "Plates",
		desc: "Boosts Poison-type moves. Changes Arceus to the Poison type.", moneyMultiplier: 1.0, tier: "Rare",
	},
	earthplate: {
		name: "Earth Plate", icon: "Earth Plate", type: "item", category: "Plates",
		desc: "Boosts Ground-type moves. Changes Arceus to the Ground type.", moneyMultiplier: 1.0, tier: "Rare",
	},
	stoneplate: {
		name: "Stone Plate", icon: "Stone Plate", type: "item", category: "Plates",
		desc: "Boosts Rock-type moves. Changes Arceus to the Rock type.", moneyMultiplier: 1.0, tier: "Rare",
	},
	insectplate: {
		name: "Insect Plate", icon: "Insect Plate", type: "item", category: "Plates",
		desc: "Boosts Bug-type moves. Changes Arceus to the Bug type.", moneyMultiplier: 1.0, tier: "Rare",
	},
	spookyplate: {
		name: "Spooky Plate", icon: "Spooky Plate", type: "item", category: "Plates",
		desc: "Boosts Ghost-type moves. Changes Arceus to the Ghost type.", moneyMultiplier: 1.0, tier: "Rare",
	},
	ironplate: {
		name: "Iron Plate", icon: "Iron Plate", type: "item", category: "Plates",
		desc: "Boosts Steel-type moves. Changes Arceus to the Steel type.", moneyMultiplier: 1.0, tier: "Rare",
	},
	flameplate: {
		name: "Flame Plate", icon: "Flame Plate", type: "item", category: "Plates",
		desc: "Boosts Fire-type moves. Changes Arceus to the Fire type.", moneyMultiplier: 1.0, tier: "Rare",
	},
	splashplate: {
		name: "Splash Plate", icon: "Splash Plate", type: "item", category: "Plates",
		desc: "Boosts Water-type moves. Changes Arceus to the Water type.", moneyMultiplier: 1.0, tier: "Rare",
	},
	meadowplate: {
		name: "Meadow Plate", icon: "Meadow Plate", type: "item", category: "Plates",
		desc: "Boosts Grass-type moves. Changes Arceus to the Grass type.", moneyMultiplier: 1.0, tier: "Rare",
	},
	zapplate: {
		name: "Zap Plate", icon: "Zap Plate", type: "item", category: "Plates",
		desc: "Boosts Electric-type moves. Changes Arceus to the Electric type.", moneyMultiplier: 1.0, tier: "Rare",
	},
	mindplate: {
		name: "Mind Plate", icon: "Mind Plate", type: "item", category: "Plates",
		desc: "Boosts Psychic-type moves. Changes Arceus to the Psychic type.", moneyMultiplier: 1.0, tier: "Rare",
	},
	icicleplate: {
		name: "Icicle Plate", icon: "Icicle Plate", type: "item", category: "Plates",
		desc: "Boosts Ice-type moves. Changes Arceus to the Ice type.", moneyMultiplier: 1.0, tier: "Rare",
	},
	dracoplate: {
		name: "Draco Plate", icon: "Draco Plate", type: "item", category: "Plates",
		desc: "Boosts Dragon-type moves. Changes Arceus to the Dragon type.", moneyMultiplier: 1.0, tier: "Rare",
	},
	dreadplate: {
		name: "Dread Plate", icon: "Dread Plate", type: "item", category: "Plates",
		desc: "Boosts Dark-type moves. Changes Arceus to the Dark type.", moneyMultiplier: 1.0, tier: "Rare",
	},
	pixieplate: {
		name: "Pixie Plate", icon: "Pixie Plate", type: "item", category: "Plates",
		desc: "Boosts Fairy-type moves. Changes Arceus to the Fairy type.", moneyMultiplier: 1.0, tier: "Rare",
	},

	// ─── Species-Specific ─────────────────────────────────────────────────────
	thickclub: {
		name: "Thick Club", icon: "Thick Club", type: "item", category: "Held Items",
		desc: "Doubles the Attack of Cubone or Marowak.", moneyMultiplier: 1.0, tier: "Rare",
	},
	souldew: {
		name: "Soul Dew", icon: "Soul Dew", type: "item", category: "Held Items",
		desc: "Boosts Sp. Atk and Sp. Def of Latios and Latias by 50%.", moneyMultiplier: 1.5, tier: "Epic",
	},
	adamantorb: {
		name: "Adamant Orb", icon: "Adamant Orb", type: "item", category: "Held Items",
		desc: "Boosts Dragon and Steel moves of Dialga by 20%.", moneyMultiplier: 1.5, tier: "Epic",
	},
	lustrousorb: {
		name: "Lustrous Orb", icon: "Lustrous Orb", type: "item", category: "Held Items",
		desc: "Boosts Dragon and Water moves of Palkia by 20%.", moneyMultiplier: 1.5, tier: "Epic",
	},
	griseousorb: {
		name: "Griseous Orb", icon: "Griseous Orb", type: "item", category: "Held Items",
		desc: "Boosts Dragon and Ghost moves of Giratina-Origin by 20%.", moneyMultiplier: 1.5, tier: "Epic",
	},
	rustedshield: {
		name: "Rusted Shield", icon: "Rusted Shield", type: "item", category: "Held Items",
		desc: "Changes Zamazenta to Crowned Shield form.", moneyMultiplier: 1.5, tier: "Epic",
	},
	rustedsword: {
		name: "Rusted Sword", icon: "Rusted Sword", type: "item", category: "Held Items",
		desc: "Changes Zacian to Crowned Sword form.", moneyMultiplier: 1.5, tier: "Epic",
	},

	// ─── Misc Competitive ─────────────────────────────────────────────────────
	brightpowder: {
		name: "BrightPowder", icon: "BrightPowder", type: "item", category: "Held Items",
		desc: "Lowers the opponent's accuracy by 10%.", moneyMultiplier: 0.5, tier: "Common",
	},
	laxincense: {
		name: "Lax Incense", icon: "Lax Incense", type: "item", category: "Held Items",
		desc: "Lowers the opponent's accuracy by 10%.", moneyMultiplier: 0.5, tier: "Common",
	},
	luckyeg: {
		name: "Lucky Egg", icon: "Lucky Egg", type: "item", category: "Held Items",
		desc: "Boosts the Exp. Points gained in battle.", moneyMultiplier: 1.0, tier: "Rare",
	},
	absorbbulb: {
		name: "Absorb Bulb", icon: "Absorb Bulb", type: "item", category: "Held Items",
		desc: "Raises Sp. Atk once when hit by a Water-type move.", moneyMultiplier: 0.5, tier: "Common",
	},
	cellbattery: {
		name: "Cell Battery", icon: "Cell Battery", type: "item", category: "Held Items",
		desc: "Raises Attack once when hit by an Electric-type move.", moneyMultiplier: 0.5, tier: "Common",
	},
	luminousmoss: {
		name: "Luminous Moss", icon: "Luminous Moss", type: "item", category: "Held Items",
		desc: "Raises Sp. Def once when hit by a Water-type move.", moneyMultiplier: 0.5, tier: "Common",
	},
	snowball: {
		name: "Snowball", icon: "Snowball", type: "item", category: "Held Items",
		desc: "Raises Attack once when hit by an Ice-type move.", moneyMultiplier: 0.5, tier: "Common",
	},
	electricseed: {
		name: "Electric Seed", icon: "Electric Seed", type: "item", category: "Held Items",
		desc: "Raises Defense in Electric Terrain.", moneyMultiplier: 0.5, tier: "Common",
	},
	grassyseed: {
		name: "Grassy Seed", icon: "Grassy Seed", type: "item", category: "Held Items",
		desc: "Raises Defense in Grassy Terrain.", moneyMultiplier: 0.5, tier: "Common",
	},
	mistyseed: {
		name: "Misty Seed", icon: "Misty Seed", type: "item", category: "Held Items",
		desc: "Raises Sp. Def in Misty Terrain.", moneyMultiplier: 0.5, tier: "Common",
	},
	psychicseed: {
		name: "Psychic Seed", icon: "Psychic Seed", type: "item", category: "Held Items",
		desc: "Raises Sp. Def in Psychic Terrain.", moneyMultiplier: 0.5, tier: "Common",
	},
};
