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

				// Reverse-engineer the expected Boss Floor based on the dynamically scaled level.
				// This perfectly aligns with getLevelScaling() in pokemon.ts.
				let estimatedFloor = 10;
				let minDiff = Infinity;
				for (let f = 10; f <= 200; f += 10) {
					const baseLevel = 1 + f / 2 + Math.pow(f / 25, 2);
					const bossBase = Math.max(1, Math.floor(baseLevel * 1.2));
					const diff = Math.abs(pokemon.level - bossBase);
					if (diff < minDiff) {
						minDiff = diff;
						estimatedFloor = f;
					}
				}

				// Strict tolerance check: Only apply shields if the level tightly aligns with a boss level.
				// This prevents standard wild Pokémon from receiving shields if they happen to spawn alone.
				const expectedBaseLevel = 1 + estimatedFloor / 2 + Math.pow(estimatedFloor / 25, 2);
				const expectedBossBase = Math.max(1, Math.floor(expectedBaseLevel * 1.2));
				const maxOffset = Math.floor(estimatedFloor / 10);
				
				if (Math.abs(pokemon.level - expectedBossBase) > maxOffset + 4) {
					return; // Bypass shields for normal encounters
				}

				if (estimatedFloor >= 160) {
					shields = 4; // Waves 160 - 200
				} else if (estimatedFloor >= 100) {
					shields = 3; // Waves 100 - 150
				} else if (estimatedFloor >= 50) {
					shields = 2; // Waves 50 - 90
				} else if (estimatedFloor >= 10) {
					shields = 1; // Waves 10 - 40
				} else {
					return;
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
