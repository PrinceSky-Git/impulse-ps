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
