export const Rulesets: import('../../../sim/dex-formats').FormatDataTable = {
	pokerogueclassic: {
		effectType: 'Rule',
		name: 'PokeRogue Classic',
		desc: 'Applies Boss Shields to designated Pokémon following exact PokéRogue Classic Mode mechanics.',

		onSwitchIn(pokemon) {
			if (pokemon.side.id === 'p2') {
				if (pokemon.side.pokemon.length !== 1) return;
				if (pokemon.volatiles['bossshield']) return;

				// --- HARDCODE ETERNATUS PHASE 1 ---
				if (pokemon.species.id === 'eternatus') {
					(pokemon as any).level = 200; // Force Level 200
					
					// Force canonical PokéRogue Phase 1 Moveset
					const phase1Moves = ['dynamaxcannon', 'sludgebomb', 'flamethrower', 'cosmicpower'];
					pokemon.moveSlots = [];
					(pokemon as any).baseMoveSlots = [];
					for (const moveid of phase1Moves) {
						const move = this.dex.moves.get(moveid);
						if (move.exists) {
							pokemon.moveSlots.push({
								move: move.name,
								id: move.id,
								pp: Math.floor(move.pp * 1.6), // Max PP
								maxpp: Math.floor(move.pp * 1.6),
								target: move.target,
								disabled: false,
								used: false,
								virtual: true,
							});
						}
					}
					// Give it a Lum Berry to block the first status condition
					pokemon.setItem('lumberry');
					this.add('-message', `Eternatus radiates an overwhelming, otherworldly aura!`);
				}
				// ----------------------------------

				let shields = 0;

				// Exact Classic Mode Boss Levels mapped to base shield counts
				if ([150, 162, 174, 188, 200].includes(pokemon.level)) {
					shields = 4; // Waves 160 - 200
				} else if ([84, 94, 104, 114, 126, 138].includes(pokemon.level)) {
					shields = 3; // Waves 100 - 150
				} else if ([38, 48, 56, 64, 74].includes(pokemon.level)) {
					shields = 2; // Waves 50 - 90
				} else if ([10, 16, 24, 32].includes(pokemon.level)) {
					shields = 1; // Waves 10 - 40
				} else {
					return; // If the level doesn't exactly match a boss wave cap, no shields are applied!
				}

				// Legendary/Paradox check (BST >= 670 gets +1 Shield)
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
				move.basePower = 200; // Accurately reflects PokéRogue's 200 BP override
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
					
					// Re-add the currently active P1 Pokémon so it gets 
					// credit for the next kill if it stays in!
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
