export type EggTier = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export const EGG_POOLS: Record<EggTier, string[]> = {
	Common: [
		// Generation 1 Base Forms
		'caterpie', 'weedle', 'pidgey', 'rattata', 'spearow', 'ekans', 'sandshrew',
		'nidoranf', 'nidoranm', 'vulpix', 'zubat', 'oddish', 'paras', 'venonat',
		'diglett', 'meowth', 'psyduck', 'mankey', 'growlithe', 'poliwag', 'abra',
		'machop', 'bellsprout', 'tentacool', 'geodude', 'ponyta', 'slowpoke',
		'magnemite', 'farfetchd', 'doduo', 'seel', 'grimer', 'shellder', 'gastly',
		'onix', 'drowzee', 'krabby', 'voltorb', 'exeggcute', 'cubone', 'koffing',
		'rhyhorn', 'tangela', 'horsea', 'goldeen', 'staryu', 'magikarp', 'ditto',

		// Generation 2 Base Forms
		'sentret', 'hoothoot', 'ledyba', 'spinarak', 'chinchou', 'pichu', 'cleffa',
		'igglybuff', 'togepi', 'mareep', 'hoppip', 'aipom', 'sunkern', 'yanma',
		'wooper', 'murkrow', 'misdreavus', 'unown', 'girafarig', 'pineco', 'dunsparce',
		'gligar', 'snubbull', 'qwilfish', 'shuckle', 'sneasel', 'teddiursa', 'slugma', 
		'swinub', 'corsola', 'remoraid', 'delibird', 'houndour', 'phanpy', 'stantler', 
		'smeargle', 'tyrogue', 'smoochum', 'elekid', 'magby',

		// Generation 3 Base Forms
		'poochyena', 'zigzagoon', 'wurmple', 'lotad', 'seedot', 'taillow', 'wingull',
		'ralts', 'surskit', 'shroomish', 'slakoth', 'nincada', 'whismur', 'makuhita',
		'azurill', 'nosepass', 'skitty', 'sableye', 'mawile', 'aron', 'meditite',
		'electrike', 'plusle', 'minun', 'volbeat', 'illumise', 'gulpin', 'carvanha',
		'wailmer', 'numel', 'spoink', 'spinda', 'trapinch', 'cacnea', 'swablu', 
		'zangoose', 'seviper', 'lunatone', 'solrock', 'barboach', 'corphish', 'baltoy', 
		'lileep', 'anorith', 'feebas', 'castform', 'kecleon', 'shuppet', 'duskull', 
		'wynaut', 'snorunt', 'spheal', 'clamperl', 'luvdisc',

		// Generation 4 Base Forms
		'starly', 'bidoof', 'kricketot', 'shinx', 'cranidos', 'shieldon', 'burmy',
		'combee', 'pachirisu', 'buizel', 'cherubi', 'shellos', 'drifloon', 'buneary',
		'glameow', 'chingling', 'stunky', 'bronzor', 'bonsly', 'mimejr', 'happiny',
		'chatot', 'hippopotas', 'skorupi', 'croagunk', 'carnivine', 'finneon',
		'mantyke', 'snover',

		// Generation 5 Base Forms
		'patrat', 'lillipup', 'purrloin', 'pansage', 'pansear', 'panpour', 'munna',
		'pidove', 'blitzle', 'roggenrola', 'woobat', 'drilbur', 'audino', 'timburr',
		'tympole', 'throh', 'sawk', 'sewaddle', 'venipede', 'cottonee', 'petilil',
		'basculin', 'sandile', 'darumaka', 'maractus', 'dwebble', 'scraggy', 'yamask', 
		'tirtouga', 'archen', 'trubbish', 'minccino', 'gothita', 'solosis', 'ducklett', 
		'vanillite', 'deerling', 'emolga', 'karrablast', 'foongus', 'frillish', 
		'alomomola', 'joltik', 'ferroseed', 'klink', 'tynamo', 'elgyem', 'litwick', 
		'axew', 'cubchoo', 'shelmet', 'stunfisk', 'mienfoo', 'golett', 'pawniard', 
		'rufflet', 'vullaby', 'heatmor',

		// Generation 6 Base Forms
		'bunnelby', 'fletchling', 'scatterbug', 'litleo', 'flabebe', 'skiddo', 'pancham',
		'espurr', 'honedge', 'spritzee', 'swirlix', 'inkay', 'binacle', 'skrelp', 
		'clauncher', 'helioptile', 'dedenne', 'phantump', 'pumpkaboo', 'bergmite', 'noibat',

		// Generation 7 Base Forms
		'pikipek', 'yungoos', 'grubbin', 'crabrawler', 'oricorio', 'cutiefly', 'rockruff',
		'wishiwashi', 'mareanie', 'mudbray', 'dewpider', 'fomantis', 'morelull', 'salandit',
		'stufful', 'bounsweet', 'wimpod', 'sandygast', 'pyukumuku', 'minior', 'komala',

		// Generation 8 Base Forms
		'skwovet', 'rookidee', 'blipbug', 'nickit', 'gossifleur', 'wooloo', 'chewtle',
		'yamper', 'rolycoly', 'applin', 'silicobra', 'arrokuda', 'toxel', 'sizzlipede', 
		'clobbopus', 'sinistea', 'hatenna', 'impidimp', 'milcery', 'pincurchin', 'snom', 
		'indeedee', 'cufant',

		// Generation 9 Base Forms
		'lechonk', 'tarountula', 'nymble', 'pawmi', 'tandemaus', 'fidough', 'smoliv',
		'squawkabilly', 'nacli', 'charcadet', 'tadbulb', 'wattrel', 'maschiff', 'shroodle',
		'bramblin', 'toedscool', 'klawf', 'capsakid', 'rellor', 'flittle', 'tinkatink',
		'wiglett', 'bombirdier', 'finizen', 'varoom', 'glimmet', 'greavard', 'cetoddle', 
		'poltchageist',

		// Regional Variants (Base Forms Only)
		'rattataalola', 'sandshrewalola', 'vulpixalola', 'diglettalola', 'meowthalola',
		'geodudealola', 'grimeralola', 'ponytagalar', 'farfetchdgalar', 'corsolagalar',
		'zigzagoongalar', 'darumakagalar', 'yamaskgalar', 'stunfiskgalar', 'meowthgalar',
		'slowpokegalar', 'growlithehisui', 'voltorbhisui', 'qwilfishhisui', 'sneaselhisui',
		'basculinwhitestriped', 'wooperpaldea'
	],
	Rare: [
		// Starters Base Forms
		'bulbasaur', 'charmander', 'squirtle', 'chikorita', 'cyndaquil', 'totodile',
		'treecko', 'torchic', 'mudkip', 'turtwig', 'chimchar', 'piplup', 'snivy', 'tepig',
		'oshawott', 'chespin', 'fennekin', 'froakie', 'rowlet', 'litten', 'popplio',
		'grookey', 'scorbunny', 'sobble', 'sprigatito', 'fuecoco', 'quaxly',

		// Pseudo-Legendary Base Forms
		'dratini', 'larvitar', 'bagon', 'beldum', 'gible', 'deino', 'goomy', 'jangmoo',
		'dreepy', 'frigibax',

		// Strong Single-Stage, Rare Spawns, and High-BST Bases
		'eevee', 'aerodactyl', 'lapras', 'snorlax', 'scyther', 'pinsir', 'tauros', 
		'kangaskhan', 'omanyte', 'kabuto', 'porygon', 'heracross', 'miltank', 'skarmory', 
		'tropius', 'absol', 'relicanth', 'torkoal', 'munchlax', 'riolu', 'rotom', 
		'spiritomb', 'zorua', 'zoruahisui', 'larvesta', 'sigilyph', 'druddigon', 
		'bouffalant', 'durant', 'cryogonal', 'furfrou', 'hawlucha', 'carbink', 'klefki', 
		'comfey', 'oranguru', 'passimian', 'togedemaru', 'bruxish', 'drampa', 'dhelmise', 
		'turtonator', 'mimikyu', 'cramorant', 'falinks', 'stonjourner', 'eiscue', 'morpeko', 
		'cyclizar', 'orthworm', 'flamigo', 'veluza', 'dondozo', 'tatsugiri', 'gimmighoul',
		'taurospaldeacombat', 'taurospaldeablaze', 'taurospaldeaaqua'
	],
	Epic: [
		// Sub-Legendaries & Birds/Beasts/Regis/Genies
		'articuno', 'zapdos', 'moltres', 'articunogalar', 'zapdosgalar', 'moltresgalar',
		'raikou', 'entei', 'suicune',
		'regirock', 'regice', 'registeel', 'regieleki', 'regidrago',
		'latias', 'latios',
		'uxie', 'mesprit', 'azelf', 'heatran', 'cresselia',
		'cobalion', 'terrakion', 'virizion', 'tornadus', 'thundurus', 'landorus', 'enamorus',
		
		// Tapus & Ultra Beasts
		'tapukoko', 'tapulele', 'tapubulu', 'tapufini',
		'nihilego', 'buzzwole', 'pheromosa', 'xurkitree', 'celesteela', 'kartana', 
		'guzzlord', 'poipole', 'stakataka', 'blacephalon', 
		
		// Minor Mythicals, Steeds & Special High-Tier Bases
		'typenull', 'phione', 'glastrier', 'spectrier', 'meltan', 'ogerpon', 'duraludon',
		
		// Paldean Loyal Three & Ruinous Quartet
		'okidogi', 'munkidori', 'fezandipiti',
		'wochien', 'chienpao', 'tinglu', 'chiyu',

		// Paradox Pokémon (Past & Future)
		'greattusk', 'screamtail', 'brutebonnet', 'fluttermane', 'slitherwing', 'sandyshocks',
		'irontreads', 'ironbundle', 'ironhands', 'ironjugulis', 'ironmoth', 'ironthorns',
		'roaringmoon', 'ironvaliant', 'walkingwake', 'ironleaves', 'gougingfire', 
		'ragingbolt', 'ironboulder', 'ironcrown'
	],
	Legendary: [
		// Box Legendaries & Major Mythicals
		'mewtwo', 'mew', 'lugia', 'hooh', 'celebi',
		'kyogre', 'groudon', 'rayquaza', 'jirachi', 'deoxys',
		'dialga', 'palkia', 'giratina', 'manaphy', 'darkrai', 'shaymin', 'arceus',
		'reshiram', 'zekrom', 'kyurem', 'keldeo', 'meloetta', 'genesect', 'victini',
		'xerneas', 'yveltal', 'zygarde', 'diancie', 'hoopa', 'volcanion',
		'cosmog', 'necrozma', 'magearna', 'marshadow', 'zeraora',
		'zacian', 'zamazenta', 'eternatus', 'kubfu', 'zarude', 'calyrex',
		'koraidon', 'miraidon', 'terapagos', 'pecharunt'
	]
};
