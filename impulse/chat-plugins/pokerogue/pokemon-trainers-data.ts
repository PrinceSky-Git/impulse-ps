export interface TrainerMon {
	species: string;
	moves?: string[];
	ivs?: { hp: number, atk: number, def: number, spa: number, spd: number, spe: number };
	evs?: { hp: number, atk: number, def: number, spa: number, spd: number, spe: number };
	ability?: string;
	teraType?: string;
	item?: string;
}

export interface TrainerData {
	teamSize: number;
	pool?: (string | TrainerMon)[];
	random?: boolean;
	chance?: number;
	spriteUrl?: string;
	dialog?: string;
}

export const TRAINERS: Record<string, Record<string, TrainerData>> = {
	// wave 5: early game test
	'5': {
		'Youngster Joey (Test)': {
			teamSize: 2,
			chance: 100,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/youngster-gen4.png',
			dialog: "My Rattata is in the top percentage of Rattatas!",
			pool: ['rattata', 'pidgey', 'sentret'],
		},
	},

	// wave 165: evil team boss 2
	'165': {
		'Giovanni (Final)': {
			teamSize: 6,
			pool: [
				{ species: 'persian', ability: 'technician' },
				{ species: 'nidoqueen', teraType: 'Ground' },
				{ species: 'nidoking', teraType: 'Ground' },
				{ species: 'dugtrio' },
				{ species: 'marowak', teraType: 'Ground' },
				{ species: 'rhyperior', teraType: 'Ground', item: 'groundgem' },
			],
		},
		'Maxie (Final)': {
			teamSize: 6,
			pool: [
				{ species: 'mightyena' },
				{ species: 'crobat' },
				{ species: 'rhydon', teraType: 'Ground' },
				{ species: 'weezing', teraType: 'Fire' },
				{ species: 'camerupt', teraType: 'Fire', item: 'cameruptite' },
				{ species: 'solrock' },
			],
		},
		'Archie (Final)': {
			teamSize: 6,
			pool: [
				{ species: 'mightyena' },
				{ species: 'crobat' },
				{ species: 'tentacruel', teraType: 'Water' },
				{ species: 'walrein' },
				{ species: 'sharpedo', teraType: 'Water', item: 'sharpedonite' },
				{ species: 'crawdaunt' },
			],
		},
		'Cyrus (Final)': {
			teamSize: 6,
			pool: [
				{ species: 'honchkrow', teraType: 'Dark' },
				{ species: 'gyarados', teraType: 'Dark' },
				{ species: 'crobat' },
				{ species: 'weavile' },
				{ species: 'electivire', item: 'lifeorb' },
				{ species: 'magmortar', item: 'lifeorb' },
			],
		},
		'Ghetsis (Final)': {
			teamSize: 6,
			pool: [
				{ species: 'cofagrigus' },
				{ species: 'bouffalant', teraType: 'Normal' },
				{ species: 'seismitoad', teraType: 'Poison' },
				{ species: 'bisharp' },
				{ species: 'eelektross', item: 'lifeorb' },
				{ species: 'hydreigon', teraType: 'Dragon', item: 'choicespecs' },
			],
		},
		'Lysandre (Final)': {
			teamSize: 6,
			pool: [
				{ species: 'mienshao' },
				{ species: 'gyarados', teraType: 'Fire' },
				{ species: 'honchkrow', teraType: 'Dark' },
				{ species: 'dragalge', teraType: 'Dragon' },
				{ species: 'pyroar', teraType: 'Fire' },
				{ species: 'clawitzer' },
			],
		},
		'Lusamine (Final)': {
			teamSize: 6,
			pool: [
				{ species: 'clefable', teraType: 'Fairy' },
				{ species: 'milotic', teraType: 'Water' },
				{ species: 'bewear' },
				{ species: 'salazzle', teraType: 'Poison' },
				{ species: 'lilligant' },
				{ species: 'mismagius' },
			],
		},
		'Guzma (Final)': {
			teamSize: 6,
			pool: [
				{ species: 'golisopod', teraType: 'Bug' },
				{ species: 'vikavolt' },
				{ species: 'pinsir', item: 'pinsirite' },
				{ species: 'scizor', item: 'scizorite' },
				{ species: 'masquerain' },
				{ species: 'heracross', item: 'heracronite' },
			],
		},
		'Rose (Final)': {
			teamSize: 6,
			pool: [
				{ species: 'escavalier', teraType: 'Steel' },
				{ species: 'ferrothorn', teraType: 'Steel' },
				{ species: 'klinklang' },
				{ species: 'excadrill', teraType: 'Steel' },
				{ species: 'copperajah', teraType: 'Steel' },
				{ species: 'toedscruel', teraType: 'Poison' },
			],
		},
		'Penny (Final)': {
			teamSize: 6,
			pool: [
				{ species: 'annihilape', teraType: 'Fighting' },
				{ species: 'revavroom', teraType: 'Steel' },
				{ species: 'gengar', teraType: 'Ghost' },
				{ species: 'vaporeon', teraType: 'Water' },
				{ species: 'ceruledge', teraType: 'Fire' },
				{ species: 'cyclizar', teraType: 'Electric' },
			],
		},
	},

	// wave 170: sinnoh gym leaders (gardenia / candice)
	'170': {
		'Gym Leader Gardenia': {
			teamSize: 6,
			pool: ['budew', 'roselia', 'roserade', 'cherubi', 'cherrim', 'turtwig', 'grotle', 'torterra', 'leafeon', 'breloom', 'vileplume', 'tropius', 'tangrowth', 'ludicolo'],
		},
		'Gym Leader Candice': {
			teamSize: 6,
			pool: ['froslass', 'snorunt', 'snover', 'abomasnow', 'sneasel', 'weavile', 'glaceon', 'piloswine', 'mamoswine', 'jynx', 'smoochum', 'cloyster', 'lapras', 'dewgong'],
		},
	},

	// wave 180: gym leader (final pre-e4)
	'180': {
		'Gym Leader Piers': {
			teamSize: 6,
			pool: ['zigzagoongalar', 'obstagoon', 'scraggy', 'scrafty', 'toxel', 'toxtricity', 'inkay', 'malamar', 'skuntank', 'liepard', 'morpeko', 'pangoro', 'shiftry', 'absol'],
		},
		'Gym Leader Marnie': {
			teamSize: 6,
			pool: ['impidimp', 'morgrem', 'grimmsnarl', 'morpeko', 'purrloin', 'liepard', 'croagunk', 'toxicroak', 'scrafty', 'obstagoon', 'weavile', 'umbreon', 'bisharp', 'sandaconda'],
		},
	},

	// wave 182: elite four 1
	'182': {
		'Elite Four Lorelei': {
			teamSize: 5,
			pool: ['dewgong', 'slowbro', 'jynx', 'lapras', 'cloyster'],
		},
		'Elite Four Will': {
			teamSize: 5,
			pool: ['exeggutor', 'slowking', 'mrrime', 'wyrdeer', 'xatu'],
		},
		'Elite Four Sidney': {
			teamSize: 5,
			pool: ['mightyena', 'obstagoon', 'shiftry', 'sharpedo', 'absol'],
		},
		'Elite Four Aaron': {
			teamSize: 5,
			pool: ['yanmega', 'heracross', 'pinsir', 'scizor', 'vespiquen'],
		},
		'Elite Four Shauntal': {
			teamSize: 5,
			pool: ['cofagrigus', 'golurk', 'drifblim', 'chandelure', 'jellicent'],
		},
		'Elite Four Malva': {
			teamSize: 5,
			pool: ['pyroar', 'talonflame', 'torkoal', 'chandelure', 'houndoom'],
		},
		'Elite Four Hala': {
			teamSize: 5,
			pool: ['hariyama', 'poliwrath', 'bewear', 'crabominable', 'primeape'],
		},
		'Elite Four Rika': {
			teamSize: 5,
			pool: ['whiscash', 'donphan', 'dugtrio', 'camerupt', 'garchomp'],
		},
	},

	// wave 184: elite four 2
	'184': {
		'Elite Four Bruno': {
			teamSize: 5,
			pool: ['hitmonlee', 'hitmonchan', 'hitmontop', 'steelix', 'machamp'],
		},
		'Elite Four Koga': {
			teamSize: 5,
			pool: ['venomoth', 'muk', 'tentacruel', 'sneasler', 'crobat'],
		},
		'Elite Four Phoebe': {
			teamSize: 5,
			pool: ['sableye', 'banette', 'drifblim', 'dusknoir', 'mismagius'],
		},
		'Elite Four Bertha': {
			teamSize: 5,
			pool: ['whiscash', 'gliscor', 'golem', 'hippowdon', 'rhyperior'],
		},
		'Elite Four Marshal': {
			teamSize: 5,
			pool: ['conkeldurr', 'sawk', 'throh', 'mienshao', 'breloom'],
		},
		'Elite Four Siebold': {
			teamSize: 5,
			pool: ['clawitzer', 'gyarados', 'starmie', 'barbaracle', 'blastoise'],
		},
		'Elite Four Olivia': {
			teamSize: 5,
			pool: ['lycanroc', 'probopass', 'carbink', 'golem', 'gigalith'],
		},
		'Elite Four Poppy': {
			teamSize: 5,
			pool: ['tinkaton', 'corviknight', 'bronzong', 'copperajah', 'magearna'],
		},
	},

	// wave 186: elite four 3
	'186': {
		'Elite Four Agatha': {
			teamSize: 5,
			pool: ['mismagius', 'arbok', 'marowakalola', 'cursola', 'gengar'],
		},
		'Elite Four Karen': {
			teamSize: 5,
			pool: ['umbreon', 'gengar', 'honchkrow', 'weavile', 'houndoom'],
		},
		'Elite Four Glacia': {
			teamSize: 5,
			pool: ['abomasnow', 'glalie', 'froslass', 'ninetalesalola', 'walrein'],
		},
		'Elite Four Flint': {
			teamSize: 5,
			pool: ['houndoom', 'magmortar', 'rapidash', 'infernape', 'flareon'],
		},
		'Elite Four Grimsley': {
			teamSize: 5,
			pool: ['scrafty', 'bisharp', 'krookodile', 'liepard', 'sharpedo'],
		},
		'Elite Four Wikstrom': {
			teamSize: 5,
			pool: ['skarmory', 'probopass', 'klefki', 'aegislash', 'scizor'],
		},
		'Elite Four Acerola': {
			teamSize: 5,
			pool: ['palossand', 'drifblim', 'mimikyu', 'froslass', 'sableye'],
		},
		'Elite Four Larry': {
			teamSize: 5,
			pool: ['staraptor', 'flamigo', 'altaria', 'tropius', 'dodrio'],
		},
	},

	// wave 188: elite four 4
	'188': {
		'Elite Four Lance': {
			teamSize: 5,
			pool: ['kingdra', 'gyarados', 'exeggutoralola', 'salamence', 'dragonite'],
		},
		'Elite Four Drake': {
			teamSize: 5,
			pool: ['shelgon', 'altaria', 'flygon', 'salamence', 'kingdra'],
		},
		'Elite Four Lucian': {
			teamSize: 5,
			pool: ['alakazam', 'espeon', 'gallade', 'bronzong', 'mrmime'],
		},
		'Elite Four Iris': {
			teamSize: 5,
			pool: ['druddigon', 'aggron', 'lapras', 'archeops', 'haxorus'],
		},
		'Elite Four Drasna': {
			teamSize: 5,
			pool: ['dragalge', 'druddigon', 'altaria', 'noivern', 'dragapult'],
		},
		'Elite Four Kahili': {
			teamSize: 5,
			pool: ['crobat', 'skarmory', 'toucannon', 'mandibuzz', 'oricorio'],
		},
		'Elite Four Hassel': {
			teamSize: 5,
			pool: ['noivern', 'flapple', 'appletun', 'dragapult', 'baxcalibur'],
		},
		'Elite Four Marnie': {
			teamSize: 5,
			pool: ['morpeko', 'grimmsnarl', 'liepard', 'toxicroak', 'scrafty'],
		},
	},

	// wave 190: champion
	'190': {
		'Champion Blue': {
			teamSize: 6,
			pool: [
				{ species: 'pidgeot' },
				{ species: 'alakazam' },
				{ species: 'rhydon' },
				{ species: 'gyarados' },
				{ species: 'exeggutor' },
				{ species: 'charizard', teraType: 'Dragon' },
			],
		},
		'Champion Lance': {
			teamSize: 6,
			pool: [
				{ species: 'gyarados' },
				{ species: 'aerodactyl' },
				{ species: 'exeggutoralola', teraType: 'Dragon' },
				{ species: 'salamence' },
				{ species: 'dragonite' },
				{ species: 'kingdra', teraType: 'Dragon' },
			],
		},
		'Champion Steven': {
			teamSize: 6,
			pool: [
				{ species: 'skarmory' },
				{ species: 'claydol' },
				{ species: 'cradily' },
				{ species: 'armaldo' },
				{ species: 'aggron' },
				{ species: 'metagross', teraType: 'Steel', item: 'metagrossite' },
			],
		},
		'Champion Wallace': {
			teamSize: 6,
			pool: [
				{ species: 'wailord' },
				{ species: 'tentacruel' },
				{ species: 'ludicolo', teraType: 'Water' },
				{ species: 'whiscash' },
				{ species: 'gyarados' },
				{ species: 'milotic', teraType: 'Water', item: 'lifeorb' },
			],
		},
		'Champion Cynthia': {
			teamSize: 6,
			pool: [
				{ species: 'spiritomb' },
				{ species: 'roserade' },
				{ species: 'gastrodon' },
				{ species: 'lucario', teraType: 'Fighting' },
				{ species: 'milotic' },
				{ species: 'garchomp', teraType: 'Dragon', item: 'garchompite' },
			],
		},
		'Champion Alder': {
			teamSize: 6,
			pool: [
				{ species: 'accelgor' },
				{ species: 'bouffalant', teraType: 'Normal' },
				{ species: 'druddigon' },
				{ species: 'escavalier' },
				{ species: 'vanilluxe' },
				{ species: 'volcarona', teraType: 'Fire' },
			],
		},
		'Champion Iris': {
			teamSize: 6,
			pool: [
				{ species: 'fraxure' },
				{ species: 'druddigon' },
				{ species: 'lapras', teraType: 'Ice' },
				{ species: 'archeops' },
				{ species: 'beartic' },
				{ species: 'haxorus', teraType: 'Dragon', item: 'lifeorb' },
			],
		},
		'Champion Diantha': {
			teamSize: 6,
			pool: [
				{ species: 'hawlucha' },
				{ species: 'trevenant' },
				{ species: 'aurorus' },
				{ species: 'gourgeist' },
				{ species: 'goodra', teraType: 'Dragon' },
				{ species: 'gardevoir', teraType: 'Fairy', item: 'gardevoirite' },
			],
		},
		'Champion Leon': {
			teamSize: 6,
			pool: [
				{ species: 'aegislash', teraType: 'Steel' },
				{ species: 'haxorus', teraType: 'Dragon' },
				{ species: 'seismitoad' },
				{ species: 'rhyperior' },
				{ species: 'dragapult', teraType: 'Dragon' },
				{ species: 'charizard', teraType: 'Fire', item: 'charizarditex' },
			],
		},
		'Champion Geeta': {
			teamSize: 6,
			pool: [
				{ species: 'espathra', teraType: 'Psychic' },
				{ species: 'gogoat' },
				{ species: 'avalugg' },
				{ species: 'veluza' },
				{ species: 'kingambit', teraType: 'Dark' },
				{ species: 'glimmora', teraType: 'Rock', item: 'lifeorb' },
			],
		},
	},

	// wave 195: rival fight 6 (final)
	'195': {
		'Rival (Final)': {
			teamSize: 6,
			pool: [
				'venusaur', 'charizard', 'blastoise',
				'meganium', 'typhlosion', 'feraligatr',
				'sceptile', 'blaziken', 'swampert',
				'torterra', 'infernape', 'empoleon',
				'serperior', 'emboar', 'samurott',
				'chesnaught', 'delphox', 'greninja',
				'decidueye', 'incineroar', 'primarina',
				'rillaboom', 'cinderace', 'inteleon',
				'meowscarada', 'skeledirge', 'quaquaval',
				'pidgeot', 'noctowl', 'swellow',
				'staraptor', 'unfezant', 'talonflame',
				'toucannon', 'corviknight', 'kilowattrel',
				'nidoqueen', 'nidoking', 'annihilape', 'arcanine',
				'alakazam', 'machamp', 'gengar', 'magnezone',
				'rhyperior', 'tangrowth', 'electivire', 'magmortar',
				'azumarill', 'ursaluna', 'mamoswine', 'gigalith',
				'conkeldurr', 'seismitoad', 'krookodile', 'reuniclus',
				'eelektross', 'chandelure', 'hatterene', 'grimmsnarl',
				'garganacl', 'tinkaton', 'glimmora', 'arboliva',
			],
		},
	},
};
