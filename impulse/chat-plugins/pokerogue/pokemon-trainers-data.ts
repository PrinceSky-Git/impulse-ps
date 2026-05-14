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

/* * Dev Note: Data Routing Architecture
 * Keys are dynamically targeted by `pokerogue.ts` during the `prebattle` phase.
 * 'fixed_X' keys handle rigid story encounters (Rivals, Evil Teams, Elite 4, Champions).
 * 'gym_leader_tier_X' keys scale gym leader team sizes based on how many the player has fought.
 * 'random_X' keys serve as fallback encounter tables for standard non-boss floors.
 */
export const TRAINERS: Record<string, Record<string, TrainerData>> = {

	// ==========================================
	// FIXED WAVES (Story, Rivals, Bosses)
	// ==========================================
	'fixed_5': {
		'Youngster Joey': {
			teamSize: 2,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/youngster-gen4.png',
			dialog: "My Rattata is in the top percentage of Rattatas!",
			pool: ['rattata', 'pidgey', 'sentret'],
		},
		'Lass Sally': {
			teamSize: 2,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lass-gen4.png',
			dialog: "Are you looking at my cute Pokémon?",
			pool: ['jigglypuff', 'clefairy', 'marill'],
		}
	},
	'fixed_8': {
		'Rival Finn': {
			teamSize: 2,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lucas.png',
			dialog: "Let's see how much stronger you've gotten!",
			pool: ['charmander', 'squirtle', 'bulbasaur', 'pidgey', 'starly', 'fletchling'],
		},
	},
	'fixed_25': {
		'Rival Finn': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lucas.png',
			dialog: "I've been catching new Pokémon too!",
			pool: ['charmeleon', 'wartortle', 'ivysaur', 'pidgeotto', 'staravia', 'fletchinder', 'pikachu', 'eevee'],
		},
	},
	'fixed_35': {
		'Team Rocket Grunt': {
			teamSize: 2,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/rocketgrunt.png',
			dialog: "We're Team Rocket! Hand over your Pokémon!",
			pool: ['zubat', 'koffing', 'rattata', 'ekans', 'sandshrew'],
		},
	},
	'fixed_55': {
		'Rival Finn': {
			teamSize: 4,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lucas.png',
			dialog: "My team is really coming together!",
			pool: ['charizard', 'blastoise', 'venusaur', 'pidgeot', 'staraptor', 'talonflame', 'raichu', 'snorlax'],
		},
	},
	'fixed_62': {
		'Team Rocket Grunt': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/rocketgruntf.png',
			dialog: "You won't get past us so easily this time!",
			pool: ['golbat', 'weezing', 'raticate', 'arbok', 'sandslash', 'machoke'],
		},
	},
	'fixed_64': {
		'Team Rocket Grunt': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/rocketgrunt.png',
			dialog: "For the glory of Team Rocket!",
			pool: ['golbat', 'weezing', 'raticate', 'arbok', 'sandslash', 'machoke'],
		},
	},
	'fixed_66': {
		'Team Rocket Admin': {
			teamSize: 4,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/archer.png',
			dialog: "I will not let a child ruin our plans!",
			pool: ['crobat', 'weezing', 'houndoom', 'muk', 'rhydon', 'persian'],
		},
	},
	'fixed_95': {
		'Rival Finn': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lucas.png',
			dialog: "Get ready to see my partner's true power!",
			pool: [
				{ species: 'charizard', teraType: 'Fire' },
				{ species: 'blastoise', teraType: 'Water' },
				{ species: 'venusaur', teraType: 'Grass' },
				'pidgeot', 'staraptor', 'talonflame', 'raichu', 'snorlax', 'lucario', 'garchomp'
			],
		},
	},
	'fixed_112': {
		'Team Rocket Grunt': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/rocketgrunt.png',
			dialog: "Intruder spotted! Engaging!",
			pool: ['crobat', 'weezing', 'arbok', 'sandslash', 'machamp', 'gyarados'],
		},
	},
	'fixed_114': {
		'Team Rocket Admin': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/ariana.png',
			dialog: "You've caused enough trouble!",
			pool: ['crobat', 'weezing', 'houndoom', 'muk', 'rhyperior', 'persian'],
		},
	},
	'fixed_115': {
		'Boss Giovanni': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/giovanni.png',
			dialog: "You dare stand in the way of Team Rocket? I will crush you myself!",
			pool: [
				{ species: 'persian' },
				{ species: 'nidoking' },
				{ species: 'rhyperior' },
				{ species: 'dugtrio' },
				{ species: 'marowak' },
				{ species: 'kangaskhan', item: 'kangaskhanite' }, 
			],
		},
	},
	'fixed_145': {
		'Rival Finn': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lucas.png',
			dialog: "I've found a new partner that will blow you away!",
			pool: [
				{ species: 'charizard', teraType: 'Fire' },
				{ species: 'blastoise', teraType: 'Water' },
				{ species: 'venusaur', teraType: 'Grass' },
				'pidgeot', 'staraptor', 'snorlax', 'lucario', 'garchomp', 'rayquaza'
			],
		},
	},
	'fixed_165': {
		'Boss Giovanni (Rematch)': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/giovanni.png',
			dialog: "This time, I will not hold back. Behold the ultimate power!",
			pool: [
				{ species: 'tyranitar' },
				{ species: 'hippowdon' },
				{ species: 'excadrill' },
				{ species: 'gastrodon' },
				{ species: 'kangaskhan', item: 'kangaskhanite' },
				{ species: 'mewtwo' },
			],
		},
	},
	'fixed_182': {
		'Elite Four Lorelei': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lorelei.png',
			dialog: "No one can best me when it comes to icy Pokémon.",
			pool: [
				{ species: 'dewgong' },
				{ species: 'slowbro' },
				{ species: 'jynx' },
				{ species: 'cloyster' },
				{ species: 'lapras', teraType: 'Ice' }
			],
		},
		'Elite Four Aaron': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/aaron.png',
			dialog: "I love bug Pokémon! They're beautiful and strong!",
			pool: [
				{ species: 'yanmega' },
				{ species: 'heracross' },
				{ species: 'vespiquen' },
				{ species: 'beautifly' },
				{ species: 'drapion', teraType: 'Bug' } 
			],
		},
	},
	'fixed_184': {
		'Elite Four Bruno': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/bruno.png',
			dialog: "I've lived and trained with my fighting Pokémon! We will grind you down!",
			pool: [
				{ species: 'hitmontop' },
				{ species: 'hitmonchan' },
				{ species: 'hitmonlee' },
				{ species: 'steelix' },
				{ species: 'machamp', teraType: 'Fighting' }
			],
		},
		'Elite Four Bertha': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/bertha.png',
			dialog: "You must be tough to make it here. Let's see how tough!",
			pool: [
				{ species: 'quagsire' },
				{ species: 'sudowoodo' },
				{ species: 'golem' },
				{ species: 'whiscash' },
				{ species: 'hippowdon', teraType: 'Ground' }
			],
		}
	},
	'fixed_186': {
		'Elite Four Agatha': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/agatha.png',
			dialog: "I'll show you how a real trainer fights!",
			pool: [
				{ species: 'gengar' },
				{ species: 'golbat' },
				{ species: 'arbok' },
				{ species: 'crobat' },
				{ species: 'gengar', teraType: 'Ghost' }
			],
		},
		'Elite Four Flint': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/flint.png',
			dialog: "I'm going to burn you to cinders!",
			pool: [
				{ species: 'rapidash' },
				{ species: 'steelix' },
				{ species: 'drifblim' },
				{ species: 'lopunny' },
				{ species: 'infernape', teraType: 'Fire' }
			],
		}
	},
	'fixed_188': {
		'Elite Four Lance': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lance.png',
			dialog: "You know that dragons are mythical Pokémon! They're hard to catch and raise, but their powers are superior!",
			pool: [
				{ species: 'gyarados' },
				{ species: 'dragonair' },
				{ species: 'aerodactyl' },
				{ species: 'dragonite' },
				{ species: 'dragonite', teraType: 'Dragon' }
			],
		},
		'Elite Four Lucian': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lucian.png',
			dialog: "I have read many books, and I have foreseen your defeat.",
			pool: [
				{ species: 'mrmime' },
				{ species: 'girafarig' },
				{ species: 'medicham' },
				{ species: 'alakazam' },
				{ species: 'bronzong', teraType: 'Psychic' }
			],
		}
	},
	'fixed_190': {
		'Champion Blue': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/blue.png',
			dialog: "I am the most powerful trainer in the world!",
			pool: [
				{ species: 'pidgeot' },
				{ species: 'alakazam' },
				{ species: 'rhydon' },
				{ species: 'exeggutor' },
				{ species: 'gyarados' },
				{ species: 'charizard', item: 'charizarditex', teraType: 'Dragon' }
			],
		},
		'Champion Cynthia': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/cynthia.png',
			dialog: "I, the Champion, will be your opponent!",
			pool: [
				{ species: 'spiritomb' },
				{ species: 'roserade' },
				{ species: 'gastrodon' },
				{ species: 'lucario' },
				{ species: 'milotic' },
				{ species: 'garchomp', item: 'garchompite', teraType: 'Dragon' }
			],
		}
	},
	'fixed_195': {
		'Rival Finn (Final)': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lucas.png',
			dialog: "This is it. The absolute peak of our journey. Let's go!",
			pool: [
				{ species: 'charizard', teraType: 'Fire' },
				{ species: 'blastoise', teraType: 'Water' },
				{ species: 'venusaur', teraType: 'Grass' },
				'pidgeot', 'staraptor', 'snorlax', 'lucario', 'garchomp', 
				{ species: 'rayquaza', item: 'meteorite' }
			],
		},
	},
	'fixed_200': {
		'Eternatus': {
			teamSize: 1,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/unknown.png',
			dialog: "...",
			pool: [
				{ species: 'eternatus' }
			],
		},
	},

	// ==========================================
	// GYM LEADERS (Scaling Tiers)
	// ==========================================
	
	'gym_leader_tier_1': {
		'Gym Leader Brock': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/brock.png',
			dialog: "I believe in rock hard defense!",
			pool: ['geodude', 'onix'],
		},
		'Gym Leader Misty': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/misty.png',
			dialog: "I'm the world-famous water-type master!",
			pool: ['staryu', 'psyduck'],
		},
		'Gym Leader Lt. Surge': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/ltsurge.png',
			dialog: "I'll zap you into paralysis!",
			pool: ['voltorb', 'pikachu', 'electabuzz'],
		},
		'Gym Leaders Tate & Liza': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/tateandliza.png',
			dialog: "We fight as one! Even in single battles!",
			pool: ['solrock', 'lunatone', 'natu', 'spoink'], 
		},
		'Gym Leader Iono': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/iono.png',
			dialog: "Ello, 'ello, hola! Ciao and bonjour!",
			pool: ['tadbulb', 'wattrel', 'voltorb'],
		},
		'Gym Leader Piers': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/piers.png',
			dialog: "Let's get this concert started!",
			pool: ['zigzagoongalar', 'scraggy', 'inkay'],
		}
	},

	'gym_leader_tier_2': {
		'Gym Leader Brock': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/brock.png',
			dialog: "My rock Pokémon have grown tougher!",
			pool: ['geodude', 'graveler', 'onix'],
		},
		'Gym Leader Misty': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/misty.png',
			dialog: "My water Pokémon are overflowing with power!",
			pool: ['staryu', 'starmie', 'psyduck', 'golduck'],
		},
		'Gym Leader Lt. Surge': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/ltsurge.png',
			dialog: "The voltage is rising!",
			pool: ['voltorb', 'electrode', 'raichu', 'electabuzz'],
		},
		'Gym Leaders Tate & Liza': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/tateandliza.png',
			dialog: "Our psychic connection is getting stronger!",
			pool: ['solrock', 'lunatone', 'xatu', 'grumpig', 'gallade', 'gardevoir'],
		},
		'Gym Leader Iono': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/iono.png',
			dialog: "Your eyeballs are mine! Caught in my Electroweb!",
			pool: ['bellibolt', 'kilowattrel', 'electrode'],
		},
		'Gym Leader Piers': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/piers.png',
			dialog: "Turn the volume up to eleven!",
			pool: ['obstagoon', 'scrafty', 'malamar'],
		}
	},

	'gym_leader_tier_3': {
		'Gym Leader Brock': {
			teamSize: 4,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/brock.png',
			dialog: "You're tough, but we won't crumble!",
			pool: ['golem', 'onix', 'rhyhorn', 'omanyte', 'kabuto'],
		},
		'Gym Leader Misty': {
			teamSize: 4,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/misty.png',
			dialog: "Get ready for a tsunami!",
			pool: ['starmie', 'golduck', 'seaking', 'lapras'],
		},
		'Gym Leader Lt. Surge': {
			teamSize: 4,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/ltsurge.png',
			dialog: "Ten-hut! Prepare to be shocked!",
			pool: ['electrode', 'raichu', 'electabuzz', 'magneton', 'jolteon'],
		},
		'Gym Leaders Tate & Liza': {
			teamSize: 4,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/tateandliza.png',
			dialog: "Our minds are perfectly synchronized!",
			pool: ['solrock', 'lunatone', 'xatu', 'grumpig', 'gallade', 'gardevoir'],
		},
		'Gym Leader Iono': {
			teamSize: 4,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/iono.png',
			dialog: "Let's see if you can keep up with the chat!",
			pool: ['bellibolt', 'kilowattrel', 'electrode', 'luxray'],
		},
		'Gym Leader Piers': {
			teamSize: 4,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/piers.png',
			dialog: "We're going to rock this stage!",
			pool: ['obstagoon', 'scrafty', 'malamar', 'skuntank'],
		}
	},

	'gym_leader_tier_4': {
		'Gym Leader Brock': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/brock.png',
			dialog: "I'll show you the true power of rock!",
			pool: ['golem', 'steelix', 'rhydon', 'omastar', 'kabutops', 'aerodactyl'],
		},
		'Gym Leader Misty': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/misty.png',
			dialog: "You're going to get washed away!",
			pool: ['starmie', 'golduck', 'seaking', 'lapras', 'gyarados', 'vaporeon'],
		},
		'Gym Leader Lt. Surge': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/ltsurge.png',
			dialog: "I survived war with my Electric Pokémon! You don't stand a chance!",
			pool: ['electrode', 'raichu', 'electivire', 'magnezone', 'jolteon', 'ampharos'],
		},
		'Gym Leaders Tate & Liza': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/tateandliza.png',
			dialog: "We foresee your defeat!",
			pool: ['solrock', 'lunatone', 'xatu', 'grumpig', 'gallade', 'gardevoir', 'claydol', 'bronzong'],
		},
		'Gym Leader Iono': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/iono.png',
			dialog: "Smash that subscribe button!",
			pool: ['bellibolt', 'kilowattrel', 'electrode', 'luxray', 'pawmot'],
		},
		'Gym Leader Piers': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/piers.png',
			dialog: "This is our grand finale!",
			pool: ['obstagoon', 'scrafty', 'malamar', 'skuntank', 'toxtricity'],
		}
	},

	'gym_leader_tier_5': {
		'Gym Leader Brock': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/brock.png',
			dialog: "Prepare to be crushed by my Terastallized Ace!",
			pool: [
				{ species: 'golem' }, 
				{ species: 'relicanth' }, 
				{ species: 'rampardos' }, 
				{ species: 'crustle' }, 
				{ species: 'aerodactyl' }, 
				{ species: 'onix', teraType: 'Rock', item: 'hardstone' } 
			],
		},
		'Gym Leader Misty': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/misty.png',
			dialog: "My Terastallized Pokémon will wash you out!",
			pool: [
				{ species: 'golduck' }, 
				{ species: 'vaporeon' }, 
				{ species: 'lapras' }, 
				{ species: 'gyarados' }, 
				{ species: 'milotic' }, 
				{ species: 'starmie', teraType: 'Water', item: 'mysticwater' } 
			],
		},
		'Gym Leader Lt. Surge': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/ltsurge.png',
			dialog: "I'll fry you with 100,000 volts of pure Terastallized power!",
			pool: [
				{ species: 'electrode' }, 
				{ species: 'magnezone' }, 
				{ species: 'jolteon' }, 
				{ species: 'ampharos' }, 
				{ species: 'electivire' }, 
				{ species: 'raichu', teraType: 'Electric', item: 'magnet' } 
			],
		},
		'Gym Leaders Tate & Liza': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/tateandliza.png',
			dialog: "Our ultimate psychic resonance is unstoppable!",
			pool: [
				{ species: 'xatu' },
				{ species: 'grumpig' },
				{ species: 'claydol' },
				{ species: 'bronzong' },
				{ species: 'gallade' },
				{ species: 'solrock', teraType: 'Psychic' },
				{ species: 'lunatone', teraType: 'Psychic' },
				{ species: 'gardevoir', teraType: 'Psychic' }
			],
		},
		'Gym Leader Iono': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/iono.png',
			dialog: "Catch my stream! Time to Terastallize!",
			pool: [
				{ species: 'bellibolt' }, 
				{ species: 'kilowattrel' }, 
				{ species: 'electrode' }, 
				{ species: 'luxray' }, 
				{ species: 'pawmot' }, 
				{ species: 'mismagius', teraType: 'Electric' }
			],
		},
		'Gym Leader Piers': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/piers.png',
			dialog: "Let's blow the roof off this place!",
			pool: [
				{ species: 'scrafty' }, 
				{ species: 'malamar' }, 
				{ species: 'skuntank' }, 
				{ species: 'toxtricity' }, 
				{ species: 'grimmsnarl' }, 
				{ species: 'obstagoon', teraType: 'Dark', item: 'blackglasses' }
			],
		}
	},

	// ==========================================
	// RANDOM TRAINER ENCOUNTERS
	// ==========================================
	
	'random_early': {
		'Bug Catcher Rick': {
			teamSize: 2,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/bugcatcher.png',
			dialog: "Check out my awesome bugs!",
			pool: ['caterpie', 'weedle', 'venonat', 'paras', 'wurmple', 'scatterbug'],
		},
		'Hiker David': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/hiker.png',
			dialog: "I've been hiking these mountains for days!",
			pool: ['geodude', 'machop', 'zubat', 'makuhita', 'roggenrola'],
		},
		'Lass Sally': {
			teamSize: 2,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/lass-gen4.png',
			dialog: "My Pokémon are super cute!",
			pool: ['jigglypuff', 'clefairy', 'marill', 'skitty', 'nidoranf'],
		}
	},

	'random_mid': {
		'Ace Trainer Chase': {
			teamSize: 4,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/acetrainer-gen4.png',
			dialog: "I'm aiming for the top! Don't slow me down!",
			pool: ['staraptor', 'luxray', 'gastrodon', 'rapidash', 'roselia', 'kadabra'],
		},
		'Black Belt Kenji': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/blackbelt-gen4.png',
			dialog: "My fists are as hard as my Pokémon!",
			pool: ['machamp', 'hitmonlee', 'hitmonchan', 'primeape', 'poliwrath'],
		},
		'Scientist Albert': {
			teamSize: 3,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/scientist.png',
			dialog: "Let's test my theories in battle!",
			pool: ['magneton', 'porygon2', 'muk', 'weezing', 'electrode'],
		}
	},

	'random_late': {
		'Veteran Harold': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/veteran.png',
			dialog: "I've been battling since before you were born!",
			pool: ['snorlax', 'lapras', 'dragonite', 'arcanine', 'exeggutor', 'gyarados'],
		},
		'Elite Trainer Cynthia (Not Champion)': {
			teamSize: 6,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/cynthia.png',
			dialog: "Show me the bond you share with your Pokémon.",
			pool: ['garchomp', 'lucario', 'milotic', 'togekiss', 'roserade', 'spiritomb'],
		},
		'Dragon Tamer Lance (Fan)': {
			teamSize: 5,
			spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/dragontamer.png',
			dialog: "Dragons are the ultimate creatures!",
			pool: ['dragonite', 'salamence', 'flygon', 'haxorus', 'hydreigon', 'goodra'],
		}
	}
};