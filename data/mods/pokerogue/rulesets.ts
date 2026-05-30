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
	
	pokerogueendless: {
		effectType: 'Rule',
		name: 'PokeRogue Endless',
		desc: 'Applies dynamic Boss Shields and special boss handling for PokéRogue Endless Mode.',

		onSwitchIn(pokemon) {
			if (pokemon.side.id !== 'p2') return;
			if (pokemon.side.pokemon.length !== 1) return;
			if (pokemon.volatiles['bossshield']) return;

			const level = pokemon.level;
			const speciesId = pokemon.species.id;

			// Eternamax Eternatus — major boss every 1000 waves
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

				// Eternamax always gets max shields
				pokemon.m.maxShields = 5;
				pokemon.addVolatile('bossshield');
				return;
			}

			// Eternatus — minor boss every 250 waves
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

				// Eternatus gets 4 shields in endless
				pokemon.m.maxShields = 4;
				pokemon.addVolatile('bossshield');
				return;
			}


			// Dynamic shield calculation for all other bosses in endless.
			// In classic, shields are tied to fixed boss-floor levels (10, 16, 24...).
			// In endless, levels grow past 200, so we derive shields from the level tier:
			//
			// Level  1– 19  → 1 shield  (early game, equivalent to classic floors 10–20)
			// Level 20– 37  → 2 shields (equivalent to classic floors 30–40)
			// Level 38– 63  → 2 shields (classic floors 50–80)
			// Level 64– 83  → 3 shields (classic floors 80–100)
			// Level 84–125  → 3 shields (classic floors 100–130)
			// Level 126–199 → 4 shields (classic floors 140–190)
			// Level 200–299 → 4 shields (first endless cycle past classic cap)
			// Level 300–499 → 5 shields
			// Level 500+    → 6 shields (hard cap — still beatable)
			//
			// High-BST bonus (+1 shield) applies at all tiers, same as classic.
			
			let shields = 0;

			if (level < 20) {
				shields = 1;
			} else if (level < 38) {
				shields = 2;
			} else if (level < 64) {
				shields = 2;
			} else if (level < 84) {
				shields = 3;
			} else if (level < 126) {
				shields = 3;
			} else if (level < 200) {
				shields = 4;
			} else if (level < 300) {
				shields = 4;
			} else if (level < 500) {
				shields = 5;
			} else {
				shields = 6;
			}

			// High-BST bonus: same rule as classic
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
