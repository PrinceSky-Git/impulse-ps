/**
 * Impulse Sim Mod
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * Helpers for Impulse Server's custom team properties and battle stat modifiers.
 *
 * @license MIT
 */

import { Dex, toID } from './dex';
import type { Pokemon } from './pokemon';
import type { PokemonSet } from './teams';

export interface ImpulseBstBoosts {
	atk: number;
	def: number;
	spa: number;
	spd: number;
	spe: number;
}

export interface ImpulseStackedItem {
	id: string;
	count: number;
}

export const IMPULSE_VALID_STACKED_ITEMS = [
	'silkscarf', 'blackbelt', 'sharpbeak', 'poisonbarb', 'softsand', 'hardstone',
	'silverpowder', 'spelltag', 'metalcoat', 'charcoal', 'mysticwater', 'miracleseed',
	'magnet', 'twistedspoon', 'nevermeltice', 'dragonfang', 'blackglasses', 'fairyfeather',
];

const IMPULSE_VALID_STATUSES = ['psn', 'tox', 'brn', 'par', 'slp', 'frz'];

export const ImpulseSimMod = new class ImpulseSimMod {
	hasPackedMiscData(set: PokemonSet) {
		return (set.hp !== undefined && set.hp !== 100) || !!set.status || !!set.bstBoosts ||
			!!set.hpMultiplier || !!set.stackedItem;
	}

	packMiscFields(set: PokemonSet) {
		let buf = '';
		if (set.bstBoosts) {
			buf += `,${set.bstBoosts.atk}:${set.bstBoosts.def}:${set.bstBoosts.spa}:${set.bstBoosts.spd}:${set.bstBoosts.spe}`;
		} else {
			buf += `,`;
		}
		buf += `,${set.hpMultiplier || ''}`;
		if (set.stackedItem) {
			buf += `,${set.stackedItem.id}:${set.stackedItem.count}`;
		} else {
			buf += `,`;
		}
		return buf;
	}

	unpackMiscFields(set: PokemonSet, misc: string[]) {
		if (misc[8]) {
			const bstParts = misc[8].split(':');
			set.bstBoosts = {
				atk: Number(bstParts[0]),
				def: Number(bstParts[1]),
				spa: Number(bstParts[2]),
				spd: Number(bstParts[3]),
				spe: Number(bstParts[4]),
			};
		}
		if (misc[9]) {
			set.hpMultiplier = Number(misc[9]);
		}
		if (misc[10]) {
			const stackParts = misc[10].split(':');
			set.stackedItem = { id: stackParts[0], count: Number(stackParts[1]) };
		}
	}

	exportSetLines(set: PokemonSet) {
		let out = '';
		if (set.hp !== undefined && set.hp !== 100) {
			out += `HP: ${set.hp}%  \n`;
		}
		if (set.status) {
			out += `Status: ${set.status}  \n`;
		}
		if (set.bstBoosts) {
			out += `BST: ${set.bstBoosts.atk}, ${set.bstBoosts.def}, ${set.bstBoosts.spa}, ${set.bstBoosts.spd}, ${set.bstBoosts.spe}  \n`;
		}
		if (set.hpMultiplier) {
			out += `HPX: ${set.hpMultiplier}  \n`;
		}
		if (set.stackedItem) {
			out += `Stacked Item: ${Dex.items.get(set.stackedItem.id).name} x${set.stackedItem.count}  \n`;
		}
		return out;
	}

	parseExportedTeamLine(line: string, set: PokemonSet, aggressive?: boolean) {
		if (line.startsWith('HP: ')) {
			line = line.slice(4).replace('%', '');
			set.hp = parseInt(line);
			return true;
		}
		if (line.startsWith('Status: ')) {
			line = line.slice(8).trim();
			set.status = aggressive ? toID(line) : line;
			return true;
		}
		if (line.startsWith('BST: ')) {
			line = line.slice(5).trim();
			const bstParts = line.split(',');
			set.bstBoosts = {
				atk: parseInt(bstParts[0]),
				def: parseInt(bstParts[1]),
				spa: parseInt(bstParts[2]),
				spd: parseInt(bstParts[3]),
				spe: parseInt(bstParts[4]),
			};
			return true;
		}
		if (line.startsWith('HPX: ')) {
			line = line.slice(5).trim();
			set.hpMultiplier = parseInt(line);
			return true;
		}
		if (line.startsWith('Stacked Item: ')) {
			line = line.slice(14).trim();
			const match = /(.+) x(\d+)/.exec(line);
			if (match) {
				set.stackedItem = { id: toID(match[1]), count: parseInt(match[2]) };
			}
			return true;
		}
		return false;
	}

	parseNicknameTags(set: PokemonSet) {
		if (!set.name) return;

		const hpMatch = /\[H:\s*(\d+)\s*\]/i.exec(set.name);
		if (hpMatch) {
			set.hp = parseInt(hpMatch[1]);
			set.name = set.name.replace(hpMatch[0], '').trim();
		}

		const statusMatch = /\[S:\s*([a-z]+)\s*\]/i.exec(set.name);
		if (statusMatch) {
			set.status = statusMatch[1].toLowerCase();
			set.name = set.name.replace(statusMatch[0], '').trim();
		}

		const bstMatch = /\[BST:\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\]/i.exec(set.name);
		if (bstMatch) {
			set.bstBoosts = {
				atk: parseInt(bstMatch[1]),
				def: parseInt(bstMatch[2]),
				spa: parseInt(bstMatch[3]),
				spd: parseInt(bstMatch[4]),
				spe: parseInt(bstMatch[5]),
			};
			set.name = set.name.replace(bstMatch[0], '').trim();
		}

		const hpxMatch = /\[HPX:\s*(\d+)\s*\]/i.exec(set.name);
		if (hpxMatch) {
			set.hpMultiplier = Math.max(1, parseInt(hpxMatch[1]));
			set.name = set.name.replace(hpxMatch[0], '').trim();
		}

		const stackMatch = /\[STACK:\s*([a-zA-Z0-9]+)\s*:\s*(\d+)\s*\]/i.exec(set.name);
		if (stackMatch) {
			set.stackedItem = {
				id: stackMatch[1].toLowerCase(),
				count: parseInt(stackMatch[2]),
			};
			set.name = set.name.replace(stackMatch[0], '').trim();
		}
	}

	validateSet(set: PokemonSet, name: string, dex: ModdedDex) {
		const problems: string[] = [];
		if (set.hp !== undefined) {
			if (isNaN(set.hp) || set.hp < 0 || set.hp > 100) {
				problems.push(`${name} has an invalid starting HP percentage (${set.hp}%). It must be between 0 and 100.`);
			}
		}
		if (set.status) {
			const status = dex.conditions.get(set.status);
			if (!status.exists || !IMPULSE_VALID_STATUSES.includes(status.id)) {
				problems.push(`${name} has an invalid starting status condition (${set.status}).`);
			} else {
				set.status = status.name;
			}
		}
		if (set.stackedItem) {
			const stacked = set.stackedItem;
			if (!IMPULSE_VALID_STACKED_ITEMS.includes(stacked.id)) {
				problems.push(`${name} has an invalid Stacked Item ("${stacked.id}"). It must be a valid Type-Boosting item.`);
			}
			if (stacked.count < 1 || stacked.count > 99) {
				problems.push(`${name}'s Stacked Item count must be between 1 and 99.`);
			}
		}
		return problems;
	}

	applyInitialHpAndStatus(pokemon: Pokemon) {
		if (pokemon.set.hp !== undefined) {
			if (pokemon.set.hp <= 0) {
				pokemon.hp = 0;
				pokemon.fainted = true;
			} else {
				pokemon.hp = Math.max(1, Math.floor(pokemon.maxhp * (pokemon.set.hp / 100)));
			}
		} else {
			pokemon.hp = pokemon.maxhp;
		}

		if (pokemon.set.status && !pokemon.fainted) {
			const startingStatus = pokemon.battle.dex.conditions.get(pokemon.set.status);
			if (startingStatus.exists) {
				pokemon.status = startingStatus.id;
				pokemon.statusState = pokemon.battle.initEffectState({ id: startingStatus.id, target: pokemon });
				if (pokemon.status === 'slp') {
					pokemon.statusState.time = pokemon.battle.random(2, 5);
				} else if (pokemon.status === 'tox') {
					pokemon.statusState.stage = 0;
				}
			}
		}
	}

	getStackedItem(set: PokemonSet) {
		if (!set.stackedItem) return undefined;
		return {
			id: set.stackedItem.id as ID,
			count: set.stackedItem.count,
		};
	}

	modifyBaseStats(baseStats: StatsTable, set: PokemonSet) {
		const bstBoosts = set.bstBoosts;
		if (!bstBoosts) return baseStats;
		return {
			hp: baseStats.hp,
			atk: Math.max(1, Math.floor(baseStats.atk * (1 + (bstBoosts.atk / 100)))),
			def: Math.max(1, Math.floor(baseStats.def * (1 + (bstBoosts.def / 100)))),
			spa: Math.max(1, Math.floor(baseStats.spa * (1 + (bstBoosts.spa / 100)))),
			spd: Math.max(1, Math.floor(baseStats.spd * (1 + (bstBoosts.spd / 100)))),
			spe: Math.max(1, Math.floor(baseStats.spe * (1 + (bstBoosts.spe / 100)))),
		};
	}

	modifyMaxHp(hp: number, set: PokemonSet) {
		if (!set.hpMultiplier) return hp;
		return Math.floor(hp * set.hpMultiplier);
	}
};
