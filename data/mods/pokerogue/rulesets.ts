export const Rulesets: import('../../../sim/dex-formats').FormatDataTable = {
	pokerogueclassic: {
		effectType: 'Rule',
		name: 'PokeRogue Classic',
		desc: 'Applies Boss Shields to designated Pokémon following exact PokéRogue Classic Mode mechanics.',

		onSwitchIn(pokemon) {
			if (pokemon.side.id === 'p2') {
				if (pokemon.side.pokemon.length !== 1) return;
				if (pokemon.volatiles['bossshield']) return;

				if (pokemon.species.id === 'eternatus') {
					(pokemon as any).level = 200;
					
					const phase1Moves = ['dynamaxcannon', 'sludgebomb', 'flamethrower', 'cosmicpower'];
					pokemon.moveSlots = [];
					(pokemon as any).baseMoveSlots = [];
					for (const moveid of phase1Moves) {
						const move = this.dex.moves.get(moveid);
						if (move.exists) {
							pokemon.moveSlots.push({
								move: move.name,
								id: move.id,
								pp: Math.floor(move.pp * 1.6),
								maxpp: Math.floor(move.pp * 1.6),
								target: move.target,
								disabled: false,
								used: false,
								virtual: true,
							});
						}
					}
					
					pokemon.setItem('lumberry');
					this.add('-message', `Eternatus radiates an overwhelming, otherworldly aura!`);
				}

				let shields = 0;

				if ([150, 162, 174, 188, 200].includes(pokemon.level)) {
					shields = 4;
				} else if ([84, 94, 104, 114, 126, 138].includes(pokemon.level)) {
					shields = 3;
				} else if ([38, 48, 56, 64, 74].includes(pokemon.level)) {
					shields = 2;
				} else if ([10, 16, 24, 32].includes(pokemon.level)) {
					shields = 1;
				} else {
					return;
				}

				const species = this.dex.species.get(pokemon.species.id);
				if (species.exists) {
					const bs = species.baseStats;
					const bst = bs.hp + bs.atk + bs.def + bs.spa + bs.spd + bs.spe;
					if (bst >= 670) {
						shields += 1;
					}
				}

				if (shields > 0) {
					pokemon.m.maxShields = shields;
					pokemon.addVolatile('bossshield');
				}
			}
		},

		onModifyMovePriority: -1,
		onModifyMove(move, pokemon, target) {
			if (!target || target.side.id !== 'p2') return;
			if (!target.volatiles['bossshield']) return;

			if (move.ohko) {
				move.ohko = false;
				move.basePower = 200;
				move.accuracy = 100;
				this.add('-message', `OHKO moves deal 200 fixed BP damage against boss Pokémon!`);
			}
		},
	},

	pokerogueendlessrule: {
    effectType: 'Rule',
    name: 'PokeRogue Endless Rule',
    desc: 'Applies dynamic Boss Shields and special boss handling for PokéRogue Endless Mode.',

    onSwitchIn(pokemon) {
        if (pokemon.side.id !== 'p2') return;
        if (pokemon.side.pokemon.length !== 1) return;
        if (pokemon.volatiles['bossshield']) return;

        const level = pokemon.level;
        const speciesId = pokemon.species.id;

        if (speciesId === 'eternatuseternamax') {
            const phase1Moves = ['dynamaxcannon', 'crosspoison', 'recover', 'cosmicpower'];
            pokemon.moveSlots = [];
            (pokemon as any).baseMoveSlots = [];
            for (const moveid of phase1Moves) {
                const move = this.dex.moves.get(moveid);
                if (move.exists) {
                    pokemon.moveSlots.push({
                        move: move.name,
                        id: move.id,
                        pp: Math.floor(move.pp * 1.6),
                        maxpp: Math.floor(move.pp * 1.6),
                        target: move.target,
                        disabled: false,
                        used: false,
                        virtual: true,
                    });
                }
            }
            pokemon.setItem('blacksludge');
            this.add('-message', `Eternamax Eternatus looms with terrifying, cosmic power!`);

            pokemon.m.maxShields = 5;
            pokemon.addVolatile('bossshield');
            return;
        }

        if (speciesId === 'eternatus') {
            const phase1Moves = ['dynamaxcannon', 'sludgebomb', 'dragondance', 'cosmicpower'];
            pokemon.moveSlots = [];
            (pokemon as any).baseMoveSlots = [];
            for (const moveid of phase1Moves) {
                const move = this.dex.moves.get(moveid);
                if (move.exists) {
                    pokemon.moveSlots.push({
                        move: move.name,
                        id: move.id,
                        pp: Math.floor(move.pp * 1.6),
                        maxpp: Math.floor(move.pp * 1.6),
                        target: move.target,
                        disabled: false,
                        used: false,
                        virtual: true,
                    });
                }
            }
            pokemon.setItem('lumberry');
            this.add('-message', `Eternatus radiates an overwhelming, otherworldly aura!`);

            pokemon.m.maxShields = 4;
            pokemon.addVolatile('bossshield');
            return;
        }

        // Generated from endlessLevelScaling for floors 10–4000 (multiples of 250/1000 excluded — handled as Eternatus/Eternamax)
        const ENDLESS_BOSS_LEVELS_1 = new Set([10]);
        const ENDLESS_BOSS_LEVELS_2 = new Set([16, 24, 32, 38, 48, 56, 64, 74]);
        const ENDLESS_BOSS_LEVELS_3 = new Set([84, 94, 104, 114, 126, 138]);
        const ENDLESS_BOSS_LEVELS_4 = new Set([
            150, 162, 174, 188, 200, 246, 252, 258, 265, 278,
            284, 291, 298, 305, 312, 319,
        ]);
        const ENDLESS_BOSS_LEVELS_5 = new Set([
            326, 333, 341, 348, 356, 364, 371, 379, 387, 395,
            403, 412, 420, 428, 437, 446, 454, 472, 481, 490,
            499, 509, 518, 528, 537, 547, 557, 567, 577, 587,
            597, 607, 618, 628,
        ]);
        const ENDLESS_BOSS_LEVELS_6 = new Set([
            639, 649, 660, 671, 682, 693, 704, 727, 738, 749,
            761, 773, 785, 797, 809, 821, 833, 845, 857, 870,
            883, 895, 908, 921, 934, 947, 960, 973, 987, 1000,
            1014, 1041, 1055, 1069, 1083, 1097, 1111, 1125, 1140, 1154,
            1169, 1183, 1198, 1213, 1228, 1243, 1258, 1274, 1289, 1304,
            1320, 1336, 1351, 1367, 1383, 1415, 1432, 1448, 1464, 1481,
            1497, 1514, 1531, 1548, 1565, 1582, 1599, 1616, 1634, 1651,
            1669, 1686, 1704, 1722, 1740, 1758, 1776, 1794, 1813, 1850,
            1868, 1887, 1906, 1925, 1944, 1963, 1982, 2001, 2021, 2040,
            2060, 2080, 2099, 2119, 2139, 2159, 2179, 2200, 2220, 2240,
            2261, 2282, 2302, 2344, 2365, 2386, 2407, 2429, 2450, 2472,
            2493, 2515, 2537, 2559, 2581, 2603, 2625, 2647, 2670, 2692,
            2715, 2737, 2760, 2783, 2806, 2829, 2852, 2899, 2922, 2945,
            2969, 2993, 3017, 3041, 3065, 3089, 3113, 3137, 3161, 3186,
            3211, 3235, 3260, 3285, 3310, 3335, 3360, 3385, 3411, 3436,
            3462, 3513, 3539, 3565, 3591, 3617, 3643, 3669, 3696, 3722,
            3749, 3775, 3802, 3829, 3856, 3883, 3910, 3938, 3965, 3992,
            4020, 4048, 4075, 4103, 4131, 4187, 4216, 4244, 4272, 4301,
            4329, 4358, 4387, 4416, 4445, 4474, 4503, 4532, 4562, 4591,
            4621, 4650, 4680, 4710, 4740, 4770, 4800, 4830, 4861, 4922,
            4952, 4983, 5014, 5045, 5076, 5107, 5138, 5169, 5201, 5232,
            5264, 5296, 5327, 5359, 5391, 5423, 5455, 5488, 5520, 5552,
            5585, 5618, 5650, 5716, 5749, 5782, 5815, 5849, 5882, 5916,
            5949, 5983, 6017, 6051, 6085, 6119, 6153, 6187, 6222, 6256,
            6291, 6325, 6360, 6395, 6430, 6465, 6500, 6571, 6606, 6641,
            6677, 6713, 6749, 6785, 6821, 6857, 6893, 6929, 6965, 7002,
            7039, 7075, 7112, 7149, 7186, 7223, 7260, 7297, 7335, 7372,
            7410, 7485, 7523, 7561, 7599, 7637, 7675, 7713, 7752, 7790,
            7829, 7867, 7906, 7945, 7984, 8023, 8062, 8102, 8141, 8180,
            8220, 8260, 8299, 8339, 8379, 8459, 8500, 8540, 8580, 8621,
            8661, 8702, 8743, 8784, 8825, 8866, 8907, 8948, 8990, 9031,
            9073, 9114, 9156, 9198, 9240, 9282, 9324, 9366, 9409,
        ]);

        let shields = 0;
        if (ENDLESS_BOSS_LEVELS_1.has(level)) {
            shields = 1;
        } else if (ENDLESS_BOSS_LEVELS_2.has(level)) {
            shields = 2;
        } else if (ENDLESS_BOSS_LEVELS_3.has(level)) {
            shields = 3;
        } else if (ENDLESS_BOSS_LEVELS_4.has(level)) {
            shields = 4;
        } else if (ENDLESS_BOSS_LEVELS_5.has(level)) {
            shields = 5;
        } else if (ENDLESS_BOSS_LEVELS_6.has(level)) {
            shields = 6;
        } else {
            return;
        }

        const species = this.dex.species.get(speciesId);
        if (species.exists) {
            const bs = species.baseStats;
            const bst = bs.hp + bs.atk + bs.def + bs.spa + bs.spd + bs.spe;
            if (bst >= 670) shields += 1;
        }

        if (shields > 0) {
            pokemon.m.maxShields = shields;
            pokemon.addVolatile('bossshield');
        }
    },

    onModifyMovePriority: -1,
    onModifyMove(move, pokemon, target) {
        if (!target || target.side.id !== 'p2') return;
        if (!target.volatiles['bossshield']) return;

        if (move.ohko) {
            move.ohko = false;
            move.basePower = 200;
            move.accuracy = 100;
            this.add('-message', `OHKO moves deal 200 fixed BP damage against boss Pokémon!`);
        }
    },
},
	
	pokerogueexptracker: {
		effectType: 'Rule',
		name: 'PokeRogue EXP Tracker',
		desc: 'Tracks participation natively and outputs exact EXP yields on faint.',

		onBegin() {
			if (!(this as any).p1Participants) {
				(this as any).p1Participants = new Set<string>();
			}
		},

		onSwitchIn(pokemon) {
			if (pokemon.side.id === 'p1') {
				if (!(this as any).p1Participants) {
					(this as any).p1Participants = new Set<string>();
				}
				(this as any).p1Participants.add(pokemon.species.id);
			}
		},

		onFaint(pokemon) {
			if (pokemon.side.id === 'p2') {
				const participants = Array.from((this as any).p1Participants || []).join(',');
				const species = pokemon.species.id;
				const level = pokemon.level;
				
				this.add('-message', `PR_EXP|${species}|${level}|${participants}`);
				
				if ((this as any).p1Participants) {
					(this as any).p1Participants.clear();
					
					const p1 = this.sides[0];
					if (p1 && p1.active) {
						for (const activeMon of p1.active) {
							if (activeMon && !activeMon.fainted) {
								(this as any).p1Participants.add(activeMon.species.id);
							}
						}
					}
				}
			}
		}
	},
};
