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

        const ENDLESS_BOSS_LEVELS_1 = new Set([10]);
        const ENDLESS_BOSS_LEVELS_2 = new Set([16, 24, 32, 38, 48, 56, 64, 74]);
        const ENDLESS_BOSS_LEVELS_3 = new Set([84, 94, 104, 114, 126, 138]);
        const ENDLESS_BOSS_LEVELS_4 = new Set([
            150, 162, 174, 188, 200,
            246, 252, 258, 265, 278, 284, 291, 298, 305, 312, 319,
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
            2715, 2737, 2760, 2783, 2806, 2829, 2852,
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
