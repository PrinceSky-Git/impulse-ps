export const BIOME_TRANSITIONS: Record<string, string[]> = {
	'Town': ['Plains'],
	'Plains': ['Metropolis', 'Grass', 'Lake'],
	'Metropolis': ['Slum'],
	'Slum': ['Construction Site'],
	'Construction Site': ['Dojo', 'Power Plant'],
	'Power Plant': ['Factory', 'Metropolis'],
	'Factory': ['Laboratory', 'Power Plant'],
	'Laboratory': ['Construction Site', 'Factory'],
	'Dojo': ['Jungle', 'Construction Site'],
	'Grass': ['Tall Grass', 'Swamp'],
	'Swamp': ['Tall Grass', 'Graveyard'],
	'Graveyard': ['Abyss'],
	'Tall Grass': ['Forest', 'Cave'],
	'Forest': ['Jungle', 'Meadow'],
	'Jungle': ['Temple'],
	'Meadow': ['Fairy Cave', 'Plains'],
	'Fairy Cave': ['Ice Cave', 'Space'],
	'Lake': ['Beach', 'Sea'],
	'Beach': ['Island', 'Sea'],
	'Island': ['Sea'],
	'Sea': ['Seabed', 'Ice Cave'],
	'Seabed': ['Cave', 'Volcano', 'Sea'],
	'Cave': ['Badlands', 'Mountain'],
	'Badlands': ['Desert', 'Mountain'],
	'Desert': ['Ancient Ruins', 'Badlands'],
	'Ancient Ruins': ['Space', 'Abyss'],
	'Space': ['Fairy Cave', 'Ice Cave'],
	'Abyss': ['Wasteland', 'Cave'],
	'Wasteland': ['Ancient Ruins', 'Mountain'],
	'Mountain': ['Volcano', 'Ice Cave', 'Wasteland'],
	'Volcano': ['Beach', 'Mountain'],
	'Ice Cave': ['Snowy Forest', 'Mountain'],
	'Snowy Forest': ['Ice Cave', 'Lake'],
};

export const BIOMES = {
	'Town': {
		'Common': [
			'caterpie', 'weedle',
			'pidgey', 'rattata',
			'spearow', 'sentret',
			'hoothoot', 'ledyba',
			'spinarak', 'hoppip',
			'sunkern', 'poochyena',
			'zigzagoon', 'wurmple',
			'silcoon', 'cascoon',
			'taillow', 'starly',
			'bidoof', 'patrat',
			'lillipup', 'purrloin',
			'pidove', 'cottonee',
			'fletchling', 'scatterbug',
			'yungoos', 'skwovet',
			'blipbug', 'wooloo',
			'lechonk',
		],
		'Uncommon': [
			'ekans', 'nidoranf',
			'nidoranm', 'oddish',
			'paras', 'venonat',
			'meowth', 'bellsprout',
			'lotad', 'seedot',
			'shroomish', 'whismur',
			'skitty', 'kricketot',
			'combee', 'cherubi',
			'venipede', 'minccino',
			'pawmi', 'fidough',
		],
		'Rare': [
			'abra', 'cleffa',
			'igglybuff', 'surskit',
			'happiny', 'rookidee',
			'tandemaus',
		],
		'Super Rare': [
			'eevee', 'pichu',
			'togepi', 'ralts',
			'nincada', 'riolu',
		],
		'Ultra Rare': [
			'ditto', 'munchlax',
			'zorua',
		],
		'Boss': [],
		'Boss Rare': [],
		'Boss Super Rare': [],
		'Boss Ultra Rare': [],
	},
	'Plains': {
		'Common': [
			'sentret', 'yungoos',
			'skwovet', 'zigzagoon',
			'bidoof', 'lechonk',
			'zubat', 'meowth',
			'poochyena',
		],
		'Uncommon': [
			'doduo', 'starly',
			'pidove', 'rockruff',
			'pawmi', 'mankey',
			'nickit', 'pidgey',
			'spearow', 'pikachu',
			'fletchling',
		],
		'Rare': [
			'abra', 'buneary',
			'rookidee', 'shinx',
			'taurospaldea',
		],
		'Super Rare': [
			'farfetchd', 'lickitung',
			'chansey', 'eevee',
			'snorlax', 'dunsparce',
		],
		'Ultra Rare': [
			'ditto', 'latias',
			'latios',
		],
		'Boss': [
			'dodrio', 'furret',
			'gumshoos', 'greedent',
			'persian', 'mightyena',
			'linoone', 'bibarel',
			'lopunny', 'oinkologne',
		],
		'Boss Rare': [
			'farfetchd', 'snorlax',
			'lickilicky', 'dudunsparce',
			'pawmot', 'taurospaldea',
			'lycanroc',
		],
		'Boss Super Rare': [
			'latias', 'latios',
		],
		'Boss Ultra Rare': [],
	},
	'Grass': {
		'Common': [
			'hoppip', 'silcoon',
			'cascoon', 'shroomish',
			'venipede', 'cottonee',
			'petilil',
		],
		'Uncommon': [
			'sunkern', 'combee',
			'seedot', 'miltank',
			'cherubi', 'foongus',
		],
		'Rare': [
			'bulbasaur', 'growlithe',
			'turtwig', 'bonsly',
			'noibat',
		],
		'Super Rare': [],
		'Ultra Rare': ['virizion'],
		'Boss': [
			'jumpluff', 'vespiquen',
			'noivern', 'miltank',
			'scolipede', 'whimsicott',
			'lilligant',
		],
		'Boss Rare': [
			'venusaur', 'arcanine',
			'sudowoodo', 'torterra',
		],
		'Boss Super Rare': ['virizion'],
		'Boss Ultra Rare': [],
	},
	'Tall Grass': {
		'Common': [
			'nidoranf', 'nidoranm',
			'bounsweet', 'oddish',
			'spinarak', 'kricketot',
			'paras', 'fomantis',
			'nymble', 'scatterbug',
		],
		'Uncommon': [
			'vulpix', 'venonat',
			'nincada', 'zangoose',
			'seviper',
		],
		'Rare': [
			'pinsir', 'chikorita',
			'girafarig', 'kecleon',
			'tropius', 'audino',
			'pawniard',
		],
		'Super Rare': [
			'scyther', 'shedinja',
		],
		'Ultra Rare': [],
		'Boss': [
			'nidoqueen', 'nidoking',
			'tsareena', 'vileplume',
			'ariados', 'kricketune',
			'ninjask', 'zangoose',
			'seviper', 'kecleon',
			'lurantis', 'lokix',
		],
		'Boss Rare': [
			'bellossom', 'scyther',
			'pinsir', 'meganium',
			'farigiraf', 'kingambit',
		],
		'Boss Super Rare': [],
		'Boss Ultra Rare': [],
	},
	'Metropolis': {
		'Common': [
			'rattata', 'zigzagoon',
			'patrat', 'lillipup',
			'yamper', 'houndour',
		],
		'Uncommon': [
			'pikachu', 'glameow',
			'furfrou', 'fidough',
			'squawkabilly', 'indeedee',
			'espurr',
		],
		'Rare': [
			'smeargle', 'castform',
			'varoom', 'tandemaus',
			'morpeko',
		],
		'Super Rare': [
			'ditto', 'eevee',
		],
		'Ultra Rare': [],
		'Boss': [
			'boltund', 'meowstic',
			'castform', 'stoutland',
			'furfrou', 'dachsbun',
		],
		'Boss Rare': [
			'maushold', 'revavroom',
		],
		'Boss Super Rare': [],
		'Boss Ultra Rare': [],
	},
	'Forest': {
		'Common': [
			'butterfree', 'beedrill',
			'bellsprout', 'combee',
			'petilil', 'deerling',
			'vivillon', 'venonat',
			'spinarak', 'pineco',
			'seedot', 'shroomish',
			'venipede', 'tarountula',
			'nymble', 'shroodle',
			'beautifly', 'dustox',
		],
		'Uncommon': [
			'roselia', 'mothim',
			'sewaddle', 'dottler',
			'hoothoot', 'rockruff',
			'ekans', 'teddiursa',
			'burmy', 'pansage',
		],
		'Rare': [
			'exeggcute', 'stantler',
			'scyther', 'heracross',
			'treecko', 'tropius',
			'karrablast', 'shelmet',
			'chespin', 'rowlet',
			'squawkabilly', 'toedscool',
		],
		'Super Rare': [
			'durant', 'bloodmoonursaluna',
		],
		'Ultra Rare': [
			'kartana', 'wochien',
		],
		'Boss': [
			'victreebel', 'mothim',
			'vespiquen', 'lilligant',
			'sawsbuck', 'beautifly',
			'ariados', 'forretress',
			'shiftry', 'breloom',
			'scolipede', 'orbeetle',
			'venomoth', 'noctowl',
			'dustox', 'wormadam',
			'simisage', 'spidops',
			'lokix', 'grafaiai',
		],
		'Boss Rare': [
			'stantler', 'heracross',
			'sceptile', 'escavalier',
			'accelgor', 'durant',
			'chesnaught', 'decidueye',
			'toedscruel', 'lycanroc',
			'bloodmoonursaluna',
		],
		'Boss Super Rare': [
			'kartana', 'wochien',
		],
		'Boss Ultra Rare': ['calyrex'],
	},
	'Sea': {
		'Common': [
			'tentacool', 'wailmer',
			'slowpoke', 'wingull',
			'cramorant', 'finizen',
			'finneon', 'inkay',
		],
		'Uncommon': [
			'poliwag', 'horsea',
			'goldeen', 'magikarp',
			'buizel', 'panpour',
			'wattrel', 'staryu',
			'shellder', 'chinchou',
			'carvanha',
		],
		'Rare': [
			'lapras', 'piplup',
			'popplio',
		],
		'Super Rare': [
			'kingdra', 'tirtouga',
		],
		'Ultra Rare': [],
		'Boss': [
			'pelipper', 'cramorant',
			'palafin', 'sharpedo',
			'malamar', 'lumineon',
			'tentacruel', 'floatzel',
			'simipour', 'kilowattrel',
		],
		'Boss Rare': [
			'gyarados', 'kingdra',
			'empoleon', 'primarina',
		],
		'Boss Super Rare': [],
		'Boss Ultra Rare': ['lugia'],
	},
	'Swamp': {
		'Common': [
			'poliwag', 'gulpin',
			'shellos', 'tympole',
			'wooper', 'lotad',
			'ekans', 'wooperpaldea',
		],
		'Uncommon': [
			'psyduck', 'barboach',
			'skorupi', 'stunfisk',
			'mareanie', 'croagunk',
		],
		'Rare': [
			'totodile', 'mudkip',
		],
		'Super Rare': [
			'slowpokegalar', 'sliggoohisui',
			'politoed', 'stunfiskgalar',
		],
		'Ultra Rare': [
			'azelf', 'poipole',
		],
		'Boss': [
			'quagsire', 'ludicolo',
			'arbok', 'clodsire',
			'poliwrath', 'swalot',
			'whiscash', 'gastrodon',
			'seismitoad', 'stunfisk',
			'toxapex',
		],
		'Boss Rare': [
			'slowbrogalar', 'slowkinggalar',
			'goodrahisui', 'feraligatr',
			'politoed', 'swampert',
			'stunfiskgalar',
		],
		'Boss Super Rare': [
			'azelf', 'poipole',
		],
		'Boss Ultra Rare': [],
	},
	'Beach': {
		'Common': [
			'krabby', 'corphish',
			'dwebble', 'binacle',
			'mareanie', 'wiglett',
			'staryu', 'shellder',
		],
		'Uncommon': [
			'burmy', 'clauncher',
			'sandygast',
		],
		'Rare': [
			'quaxly', 'tatsugiri',
		],
		'Super Rare': ['tirtouga'],
		'Ultra Rare': [
			'cresselia', 'keldeo',
			'tapufini',
		],
		'Boss': [
			'starmie', 'cloyster',
			'kingler', 'crawdaunt',
			'wormadam', 'crustle',
			'barbaracle', 'clawitzer',
			'toxapex', 'palossand',
		],
		'Boss Rare': [
			'carracosta', 'quaquaval',
		],
		'Boss Super Rare': [
			'cresselia', 'keldeo',
			'tapufini',
		],
		'Boss Ultra Rare': [],
	},
	'Lake': {
		'Common': [
			'psyduck', 'goldeen',
			'wooper', 'surskit',
			'chewtle', 'lotad',
			'ducklett', 'marill',
		],
		'Uncommon': [
			'slowpoke', 'magikarp',
			'wishiwashi', 'dewpider',
		],
		'Rare': [
			'squirtle', 'oshawott',
			'froakie', 'sobble',
			'flamigo',
		],
		'Super Rare': [
			'vaporeon', 'slowking',
		],
		'Ultra Rare': [
			'suicune', 'mesprit',
		],
		'Boss': [
			'swanna', 'araquanid',
			'azumarill', 'golduck',
			'slowbro', 'seaking',
			'masquerain', 'wishiwashi',
			'drednaw',
		],
		'Boss Rare': [
			'blastoise', 'gyarados',
			'vaporeon', 'slowking',
			'samurott', 'greninja',
			'inteleon',
		],
		'Boss Super Rare': [
			'suicune', 'mesprit',
		],
		'Boss Ultra Rare': [],
	},
	'Seabed': {
		'Common': [
			'chinchou', 'remoraid',
			'clamperl', 'basculin',
			'frillish', 'arrokuda',
			'veluza',
		],
		'Uncommon': [
			'tentacool', 'shellder',
			'wailmer', 'luvdisc',
			'shellos', 'skrelp',
			'pincurchin', 'dondozo',
		],
		'Rare': [
			'qwilfish', 'corsola',
			'octillery', 'feebas',
			'mantyke', 'alomomola',
			'tynamo', 'dhelmise',
		],
		'Super Rare': [
			'omanyte', 'kabuto',
			'relicanth', 'pyukumuku',
			'corsolagalar', 'arctovish',
			'qwilfishhisui',
		],
		'Ultra Rare': ['nihilego'],
		'Boss': [
			'lanturn', 'qwilfish',
			'corsola', 'octillery',
			'mantine', 'wailord',
			'huntail', 'gorebyss',
			'luvdisc', 'jellicent',
			'alomomola', 'dragalge',
			'barraskewda', 'dondozo',
		],
		'Boss Rare': [
			'omastar', 'kabutops',
			'milotic', 'relicanth',
			'eelektross', 'pyukumuku',
			'dhelmise', 'cursola',
			'arctovish', 'basculegion',
			'overqwil',
		],
		'Boss Super Rare': ['nihilego'],
		'Boss Ultra Rare': ['kyogre'],
	},
	'Mountain': {
		'Common': [
			'pidgey', 'spearow',
			'skiddo', 'taillow',
			'swablu', 'starly',
			'pidove', 'fletchling',
			'rhyhorn', 'aron',
			'roggenrola',
		],
		'Uncommon': [
			'machop', 'geodude',
			'natu', 'slugma',
			'rufflet', 'rookidee',
			'flittle', 'bombirdier',
			'vullaby', 'murkrow',
		],
		'Rare': [
			'skarmory', 'torchic',
			'spoink', 'hawlucha',
			'nacli',
		],
		'Super Rare': [
			'larvitar', 'cranidos',
			'shieldon', 'gible',
			'archeops', 'axew',
		],
		'Ultra Rare': [
			'tornadus', 'tinglu',
			'ogerpon',
		],
		'Boss': [
			'swellow', 'altaria',
			'staraptor', 'unfezant',
			'braviary', 'talonflame',
			'corviknight', 'espathra',
			'mandibuzz', 'pidgeot',
			'fearow', 'skarmory',
			'aggron', 'gogoat',
		],
		'Boss Rare': [
			'braviaryhisui', 'blaziken',
			'rampardos', 'bastiodon',
			'hawlucha', 'garganacl',
		],
		'Boss Super Rare': [
			'tornadus', 'tinglu',
			'ogerpon',
		],
		'Boss Ultra Rare': ['hooh'],
	},
	'Badlands': {
		'Common': [
			'diglett', 'geodude',
			'rhyhorn', 'drilbur',
			'mudbray', 'phanpy',
			'cubone',
		],
		'Uncommon': [
			'sandshrew', 'numel',
			'roggenrola', 'cufant',
			'sizzlipede', 'capsakid',
		],
		'Rare': [
			'onix', 'gligar',
			'klawf', 'poltchageist',
		],
		'Super Rare': [],
		'Ultra Rare': [
			'landorus', 'okidogi',
		],
		'Boss': [
			'donphan', 'centiskorch',
			'scovillain', 'marowak',
			'dugtrio', 'golem',
			'rhyperior', 'gliscor',
			'excadrill', 'mudsdale',
			'copperajah',
		],
		'Boss Rare': [
			'steelix', 'sinistcha',
		],
		'Boss Super Rare': [
			'landorus', 'okidogi',
		],
		'Boss Ultra Rare': ['groudon'],
	},
	'Cave': {
		'Common': [
			'zubat', 'paras',
			'teddiursa', 'whismur',
			'roggenrola', 'woobat',
			'bunnelby',
		],
		'Uncommon': [
			'geodude', 'makuhita',
			'nosepass', 'noibat',
			'wimpod', 'rockruff',
		],
		'Rare': [
			'onix', 'ferroseed',
			'carbink', 'nacli',
			'glimmet',
		],
		'Super Rare': ['shuckle'],
		'Ultra Rare': ['uxie'],
		'Boss': [
			'parasect', 'onix',
			'crobat', 'ursaring',
			'exploud', 'probopass',
			'gigalith', 'swoobat',
			'diggersby', 'noivern',
			'golisopod',
		],
		'Boss Rare': [
			'shuckle', 'ferrothorn',
			'garganacl', 'glimmora',
			'lycanroc',
		],
		'Boss Super Rare': ['uxie'],
		'Boss Ultra Rare': ['terapagos'],
	},
	'Desert': {
		'Common': [
			'sandshrew', 'skorupi',
			'silicobra', 'bramblin',
			'rellor', 'trapinch',
			'helioptile', 'cacnea',
		],
		'Uncommon': [
			'numel', 'hippopotas',
			'sandile', 'orthworm',
			'maractus', 'gligar',
			'yamask',
		],
		'Rare': [
			'doduo', 'darumaka',
			'sigilyph', 'stonjourner',
		],
		'Super Rare': [
			'lileep', 'anorith',
			'gible',
		],
		'Ultra Rare': [
			'regirock', 'tapubulu',
			'pheromosa',
		],
		'Boss': [
			'maractus', 'heliolisk',
			'flygon', 'gliscor',
			'cacturne', 'cofagrigus',
			'sandslash', 'hippowdon',
			'drapion', 'krookodile',
			'darmanitan', 'sandaconda',
			'brambleghast',
		],
		'Boss Rare': [
			'dodrio', 'cradily',
			'armaldo', 'garchomp',
			'sigilyph', 'stonjourner',
		],
		'Boss Super Rare': [
			'regirock', 'tapubulu',
			'pheromosa',
		],
		'Boss Ultra Rare': [],
	},
	'Ice Cave': {
		'Common': [
			'seel', 'swinub',
			'snorunt', 'vanillite',
			'cubchoo', 'bergmite',
			'crabrawler', 'snom',
		],
		'Uncommon': [
			'slowking', 'sneasel',
			'smoochum', 'spheal',
			'eiscue', 'cetoddle',
		],
		'Rare': [
			'lapras', 'delibird',
			'cryogonal',
		],
		'Super Rare': ['amaura'],
		'Ultra Rare': [
			'articuno', 'regice',
		],
		'Boss': [
			'dewgong', 'glalie',
			'walrein', 'weavile',
			'mamoswine', 'froslass',
			'vanilluxe', 'beartic',
			'cryogonal', 'avalugg',
			'crabominable', 'cetitan',
		],
		'Boss Rare': [
			'jynx', 'lapras',
			'glaceon', 'aurorus',
		],
		'Boss Super Rare': [
			'articuno', 'regice',
		],
		'Boss Ultra Rare': ['kyurem'],
	},
	'Meadow': {
		'Common': [
			'blitzle', 'flabebe',
			'cutiefly', 'gossifleur',
			'wooloo', 'ledyba',
			'roselia', 'cottonee',
			'minccino',
		],
		'Uncommon': [
			'ponyta', 'snubbull',
			'skitty', 'bouffalant',
			'smoliv', 'jigglypuff',
			'mareep', 'ralts',
			'glameow', 'oricorio',
		],
		'Rare': [
			'tauros', 'eevee',
			'miltank', 'spinda',
			'applin', 'sprigatito',
			'volbeat', 'illumise',
		],
		'Super Rare': [
			'chansey', 'sylveon',
		],
		'Ultra Rare': ['meloetta'],
		'Boss': [
			'ledian', 'granbull',
			'delcatty', 'roserade',
			'cinccino', 'bouffalant',
			'arboliva', 'tauros',
			'miltank', 'gardevoir',
			'purugly', 'zebstrika',
			'florges', 'ribombee',
			'dubwool',
		],
		'Boss Rare': [
			'lilliganthisui', 'blissey',
			'sylveon', 'flapple',
			'appletun', 'meowscarada',
			'hydrapple',
		],
		'Boss Super Rare': ['meloetta'],
		'Boss Ultra Rare': ['shaymin'],
	},
	'Power Plant': {
		'Common': [
			'pikachu', 'voltorb',
			'electrike', 'shinx',
			'dedenne', 'grubbin',
			'pawmi', 'tadbulb',
		],
		'Uncommon': [
			'magnemite', 'electabuzz',
			'plusle', 'minun',
			'pachirisu', 'emolga',
			'togedemaru',
		],
		'Rare': [
			'mareep', 'rotom',
		],
		'Super Rare': [
			'jolteon', 'voltorbhisui',
		],
		'Ultra Rare': [
			'raikou', 'thundurus',
			'xurkitree', 'zeraora',
			'regieleki',
		],
		'Boss': [
			'raichu', 'manectric',
			'luxray', 'magnezone',
			'electivire', 'dedenne',
			'vikavolt', 'togedemaru',
			'pawmot', 'bellibolt',
		],
		'Boss Rare': [
			'jolteon', 'ampharos',
			'electrodehisui',
		],
		'Boss Super Rare': [
			'zapdos', 'raikou',
			'thundurus', 'xurkitree',
			'zeraora', 'regieleki',
		],
		'Boss Ultra Rare': ['zekrom'],
	},
	'Volcano': {
		'Common': [
			'vulpix', 'growlithe',
			'ponyta', 'slugma',
			'numel', 'spoink',
			'swablu', 'rolycoly',
			'poochyena',
		],
		'Uncommon': [
			'magmar', 'meditite',
			'torkoal', 'pansear',
			'heatmor', 'salandit',
			'turtonator', 'diglettalola',
		],
		'Rare': [
			'charmander', 'cyndaquil',
			'chimchar', 'tepig',
			'fennekin', 'litten',
			'scorbunny', 'charcadet',
		],
		'Super Rare': [
			'flareon', 'larvesta',
			'growlithehisui',
		],
		'Ultra Rare': [
			'entei', 'heatran',
			'volcanion', 'chiyu',
		],
		'Boss': [
			'ninetales', 'arcanine',
			'rapidash', 'magcargo',
			'camerupt', 'torkoal',
			'magmortar', 'simisear',
			'heatmor', 'salazzle',
			'turtonator', 'coalossal',
			'dugtrioalola',
		],
		'Boss Rare': [
			'charizard', 'flareon',
			'typhlosion', 'infernape',
			'emboar', 'volcarona',
			'delphox', 'incineroar',
			'cinderace', 'armarouge',
			'arcaninehisui',
		],
		'Boss Super Rare': [
			'moltres', 'entei',
			'heatran', 'volcanion',
			'chiyu',
		],
		'Boss Ultra Rare': ['reshiram'],
	},
	'Graveyard': {
		'Common': [
			'gastly', 'shuppet',
			'duskull', 'drifloon',
			'litwick', 'phantump',
			'pumpkaboo', 'greavard',
		],
		'Uncommon': [
			'misdreavus', 'sableye',
			'yamask', 'sinistea',
			'indeedee', 'fluttermane',
		],
		'Rare': [
			'spiritomb', 'golett',
			'honedge', 'mimikyu',
		],
		'Super Rare': [
			'runerigus', 'ceruledge',
		],
		'Ultra Rare': [
			'marshadow', 'spectrier',
		],
		'Boss': [
			'gengar', 'banette',
			'dusknoir', 'drifblim',
			'chandelure', 'trevenant',
			'gourgeist', 'houndstone',
		],
		'Boss Rare': [
			'mismagius', 'golurk',
			'aegislash', 'mimikyu',
		],
		'Boss Super Rare': [
			'marshadow', 'spectrier',
		],
		'Boss Ultra Rare': ['giratina'],
	},
	'Dojo': {
		'Common': [
			'mankey', 'machop',
			'makuhita', 'meditite',
			'croagunk', 'mienfoo',
			'crabrawler', 'passimian',
		],
		'Uncommon': [
			'tyrogue', 'riolu',
			'stufful', 'falinks',
		],
		'Rare': [
			'scraggy', 'hawlucha',
			'pancham',
		],
		'Super Rare': [
			'gallade', 'pangoro',
		],
		'Ultra Rare': [
			'terrakion', 'buzzwole',
		],
		'Boss': [
			'primeape', 'machamp',
			'hariyama', 'medicham',
			'toxicroak', 'mienshao',
			'crabominable',
		],
		'Boss Rare': [
			'lucario', 'bewear',
			'pangoro', 'annihilape',
		],
		'Boss Super Rare': [
			'terrakion', 'buzzwole',
		],
		'Boss Ultra Rare': ['kubfu'],
	},
	'Factory': {
		'Common': [
			'klink', 'bronzor',
			'magnemite', 'voltorb',
			'grimer', 'koffing',
			'varoom',
		],
		'Uncommon': [
			'geodude', 'porygon',
			'trubbish', 'pawniard',
		],
		'Rare': [
			'solrock', 'lunatone',
			'golett', 'duraludon',
		],
		'Super Rare': [
			'porygon2', 'rotom',
		],
		'Ultra Rare': [
			'genesect', 'magearna',
		],
		'Boss': [
			'klinklang', 'bronzong',
			'magnezone', 'electrode',
			'muk', 'weezing',
			'garbodor',
		],
		'Boss Rare': [
			'porygonz', 'bisharp',
			'golurk', 'revavroom',
			'archaludon',
		],
		'Boss Super Rare': [
			'genesect', 'magearna',
		],
		'Boss Ultra Rare': ['mewtwo'],
	},
	'Ancient Ruins': {
		'Common': [
			'natu', 'sigilyph',
			'yamask', 'elgyem',
			'inkay', 'carbink',
			'tinkatink',
		],
		'Uncommon': [
			'spoink', 'mimejr',
			'baltoy', 'archen',
			'golett',
		],
		'Rare': [
			'unown', 'solrock',
			'lunatone', 'gimmighoul',
		],
		'Super Rare': [
			'claydol', 'cofagrigus',
		],
		'Ultra Rare': [
			'registeel', 'jirachi',
			'palkia',
		],
		'Boss': [
			'xatu', 'cofagrigus',
			'beheeyem', 'malamar',
			'diancie', 'tinkaton',
		],
		'Boss Rare': [
			'claydol', 'archeops',
			'golurk', 'gholdengo',
		],
		'Boss Super Rare': [
			'registeel', 'jirachi',
		],
		'Boss Ultra Rare': ['regigigas'],
	},
	'Wasteland': {
		'Common': [
			'vibrava', 'flygon',
			'swablu', 'altaria',
			'axew', 'fraxure',
			'haxorus', 'deino',
		],
		'Uncommon': [
			'goomy', 'sliggoo',
			'goodra', 'jangmoo',
			'hakamoo', 'kommoo',
		],
		'Rare': [
			'larvitar', 'pupitar',
			'tyranitar', 'bagon',
			'shelgon', 'salamence',
			'gible', 'gabite',
			'garchomp',
		],
		'Super Rare': [
			'zweilous', 'hydreigon',
		],
		'Ultra Rare': [
			'zygarde', 'rayquaza',
		],
		'Boss': [
			'flygon', 'altaria',
			'haxorus', 'goodra',
			'kommoo',
		],
		'Boss Rare': [
			'tyranitar', 'salamence',
			'garchomp', 'hydreigon',
		],
		'Boss Super Rare': [
			'zygarde', 'rayquaza',
		],
		'Boss Ultra Rare': ['eternatus'],
	},
	'Abyss': {
		'Common': [
			'murkrow', 'houndour',
			'houndoom', 'sableye',
			'purrloin', 'liepard',
			'pawniard', 'bisharp',
			'nickit', 'thievul',
			'impidimp', 'morgrem',
			'grimmsnarl', 'maschiff',
			'mabosstiff',
		],
		'Uncommon': [
			'absol', 'zorua',
			'deino', 'zweilous',
			'kingambit',
		],
		'Rare': [
			'spiritomb', 'umbreon',
		],
		'Super Rare': [
			'zoroark', 'hydreigon',
		],
		'Ultra Rare': [
			'darkrai', 'moltresgalar',
		],
		'Boss': [
			'houndoom', 'sableye',
			'absol', 'grimmsnarl',
			'mabosstiff', 'kingambit',
		],
		'Boss Rare': [
			'moltres', 'zoroark',
		],
		'Boss Super Rare': [
			'darkrai', 'moltresgalar',
		],
		'Boss Ultra Rare': ['yveltal'],
	},
	'Space': {
		'Common': [
			'clefairy', 'jigglypuff',
			'lunatone', 'solrock',
			'bronzor', 'elgyem',
			'minior',
		],
		'Uncommon': [
			'staryu', 'baltoy',
			'chingling', 'munna',
			'dedenne',
		],
		'Rare': [
			'clefable', 'natu',
			'snorunt', 'froslass',
		],
		'Super Rare': [
			'jirachi', 'beheeyem',
		],
		'Ultra Rare': [
			'deoxys', 'celesteela',
		],
		'Boss': [
			'clefable', 'claydol',
			'beheeyem', 'bronzong',
			'minior',
		],
		'Boss Rare': [
			'jirachi', 'togekiss',
		],
		'Boss Super Rare': [
			'deoxys', 'celesteela',
		],
		'Boss Ultra Rare': ['rayquaza'],
	},
	'Construction Site': {
		'Common': [
			'machop', 'machoke',
			'magnemite', 'magneton',
			'drilbur', 'excadrill',
			'timburr', 'gurdurr',
		],
		'Uncommon': [
			'grimer', 'muk',
			'koffing', 'weezing',
			'rhyhorn', 'rhydon',
			'scraggy', 'scrafty',
		],
		'Rare': [
			'onix', 'hitmonlee',
			'hitmonchan', 'duraludon',
			'meowthgalar', 'perrserker',
		],
		'Super Rare': [
			'ditto', 'hitmontop',
		],
		'Ultra Rare': [
			'cobalion', 'stakataka',
		],
		'Boss': [
			'machamp', 'conkeldurr',
		],
		'Boss Rare': [
			'perrserker', 'archaludon',
		],
		'Boss Super Rare': [
			'cobalion', 'stakataka',
		],
		'Boss Ultra Rare': [],
	},
	'Jungle': {
		'Common': [
			'paras', 'exeggcute',
			'tropius', 'aipom',
			'mankey', 'pansage',
			'sewaddle', 'bounsweet',
			'fomantis', 'toedscool',
		],
		'Uncommon': [
			'scyther', 'heracross',
			'tangela', 'pinsir',
			'shroomish', 'breloom',
		],
		'Rare': [
			'chikorita', 'treecko',
			'turtwig', 'rowlet',
			'grookey', 'sprigatito',
		],
		'Super Rare': [
			'durant', 'komala',
		],
		'Ultra Rare': [
			'wochien', 'tapukoko',
		],
		'Boss': [
			'exeggutor', 'breloom',
			'vespiquen', 'lurantis',
			'tsareena', 'toedscruel',
		],
		'Boss Rare': [
			'scizor', 'heracross',
			'meganium', 'sceptile',
			'torterra', 'rillaboom',
			'meowscarada', 'kleavor',
		],
		'Boss Super Rare': [
			'wochien', 'tapukoko',
		],
		'Boss Ultra Rare': ['mew'],
	},
	'Fairy Cave': {
		'Common': [
			'clefairy', 'togepi',
			'snubbull', 'ralts',
			'marill', 'mawile',
			'cottonee', 'flabebe',
			'sylveon', 'carbink',
		],
		'Uncommon': [
			'mimejr', 'togekiss',
			'morganite', 'ribombee',
			'comfey', 'hatenna',
		],
		'Rare': [
			'igglybuff', 'snubbull',
			'azumarill', 'gardevoir',
		],
		'Super Rare': [
			'togekiss', 'florges',
		],
		'Ultra Rare': [
			'xerneas', 'terapagos',
		],
		'Boss': [
			'clefable', 'wigglytuff',
			'granbull', 'gardevoir',
			'togekiss', 'diancie',
		],
		'Boss Rare': [
			'sylveon', 'florges',
			'grimmsnarl', 'hatterene',
		],
		'Boss Super Rare': [
			'xerneas', 'terapagos',
		],
		'Boss Ultra Rare': ['zacian'],
	},
	'Temple': {
		'Common': [
			'gastly', 'natu',
			'baltoy', 'yamask',
			'elgyem', 'litwick',
			'inkay', 'sinistea',
		],
		'Uncommon': [
			'slowpoke', 'sigilyph',
			'woobat', 'golett',
			'pumpkaboo',
		],
		'Rare': [
			'xatu', 'claydol',
			'cofagrigus', 'runerigus',
		],
		'Super Rare': [
			'beheeyem', 'golurk',
		],
		'Ultra Rare': [
			'hoopa', 'tapulele',
		],
		'Boss': [
			'gengar', 'xatu',
			'claydol', 'cofagrigus',
			'beheeyem', 'chandelure',
			'malamar',
		],
		'Boss Rare': [
			'golurk', 'aegislash',
		],
		'Boss Super Rare': [
			'hoopa', 'tapulele',
		],
		'Boss Ultra Rare': ['necrozma'],
	},
	'Slum': {
		'Common': [
			'rattata', 'grimer',
			'koffing', 'trubbish',
			'zigzagoon', 'nickit',
			'impidimp', 'maschiff',
		],
		'Uncommon': [
			'meowth', 'corphish',
			'pawniard', 'morpeko',
			'zigzagoongalar',
		],
		'Rare': [
			'scrafty', 'incineroar',
			'obstagoon',
		],
		'Super Rare': [
			'toxicroak', 'ditto',
		],
		'Ultra Rare': [],
		'Boss': [
			'raticate', 'muk',
			'weezing', 'garbodor',
			'liepard', 'thievul',
			'grimmsnarl', 'mabosstiff',
		],
		'Boss Rare': [
			'persian', 'obstagoon',
		],
		'Boss Super Rare': [],
		'Boss Ultra Rare': [],
	},
	'Snowy Forest': {
		'Common': [
			'snover', 'swinub',
			'cubchoo', 'bergmite',
			'delibird', 'snom',
			'cetoddle',
		],
		'Uncommon': [
			'sneasel', 'stantler',
			'piloswine', 'froslass',
			'zoruahisui',
		],
		'Rare': [
			'lapras', 'absol',
			'cryogonal', 'frosmoth',
		],
		'Super Rare': [
			'glaceon', 'zoroarkhisui',
		],
		'Ultra Rare': [
			'calyrex', 'enamorus',
		],
		'Boss': [
			'abomasnow', 'mamoswine',
			'beartic', 'frosmoth',
			'cetitan',
		],
		'Boss Rare': [
			'wyrdeer', 'weavile',
			'lapras', 'glaceon',
			'zoroarkhisui',
		],
		'Boss Super Rare': [
			'calyrex', 'enamorus',
		],
		'Boss Ultra Rare': ['articuno'],
	},
	'Island': {
		'Common': [
			'exeggcute', 'rattataalola',
			'sandshrewalola', 'vulpixalola',
			'cutiefly', 'comfey',
			'crabrawler', 'bruxish',
		],
		'Uncommon': [
			'meowthalola', 'oricorio',
			'wishiwashi', 'turtonator',
			'togedemaru',
		],
		'Rare': [
			'diglettalola', 'geodudealola',
			'grimeralola', 'stufful',
		],
		'Super Rare': [
			'exeggutoralola', 'komala',
		],
		'Ultra Rare': [
			'solgaleo', 'victini',
		],
		'Boss': [
			'exeggutoralola', 'ribombee',
			'comfey', 'crabominable',
			'bruxish',
		],
		'Boss Rare': [
			'bewear', 'ninetalesalola',
			'mukalola', 'golemalola',
		],
		'Boss Super Rare': [
			'solgaleo', 'victini',
		],
		'Boss Ultra Rare': ['tapubulu'],
	},
	'Laboratory': {
		'Common': [
			'magnemite', 'magneton',
			'grimer', 'muk',
			'voltorb', 'electrode',
			'bronzor', 'bronzong',
			'klink', 'klang',
			'klinklang',
		],
		'Uncommon': [
			'solosis', 'duosion',
			'reuniclus',
		],
		'Rare': [
			'ditto', 'porygon',
			'porygon2', 'rotom',
			'typenull', 'castform',
		],
		'Super Rare': [],
		'Ultra Rare': ['mewtwo'],
		'Boss': [
			'muk', 'electrode',
			'bronzong', 'magnezone',
			'porygonz', 'reuniclus',
			'klinklang', 'rotom',
		],
		'Boss Rare': ['silvally'],
		'Boss Super Rare': ['zygarde'],
		'Boss Ultra Rare': ['mewtwo'],
	},
	'End': {
		'Common': [],
		'Uncommon': [],
		'Rare': [],
		'Super Rare': [],
		'Ultra Rare': [],
		'Boss': [
			'great_tusk', 'scream_tail', 
			'brute_bonnet', 'flutter_mane', 
			'slither_wing', 'sandy_shocks', 
			'iron_treads', 'iron_bundle', 
			'iron_hands', 'iron_jugulis', 
			'iron_moth', 'iron_thorns',
		],
		'Boss Rare': [
			'roaring_moon', 'iron_valiant',
		],
		'Boss Super Rare': [
			'walking_wake', 'iron_leaves',
			'gouging_fire', 'iron_boulder',
			'raging_bolt', 'iron_crown',
		],
		'Boss Ultra Rare': [
			'eternatus',
		],
	},
};
