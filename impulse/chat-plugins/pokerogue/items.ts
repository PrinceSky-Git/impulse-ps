import { SHOP_DB } from './shopdb';
import { type PokemonEntry, type PokeRogueState, type ModeConfig } from './types';

const ROGUELIKE_DATA_PATH = 'impulse/chat-plugins/pokerogue';

export type ItemType =
	| 'pokeball' |
	'healHP' |
	'key' |
	'revive' |
	'cureStatus' |
	'itemPack' |
	'item' |
	'evolveItem' |
	'vitamin' |
	'tm';

export type ItemRarityTier = 'Common' | 'Great' | 'Ultra' | 'Rogue' | 'Master';

export interface ShopItem {
	name: string;
	icon: string;
	type: ItemType;
	category: string;
	desc: string;

	moneyMultiplier: number;
	tier: ItemRarityTier;
	weight?: number;

	isShopItem?: boolean;
	minFloor?: number;

	healAmount?: number;
	healPercent?: number;
	curesStatus?: boolean;
	reviveAmount?: number;
	isMax?: boolean;
	evStat?: string;
}

export const SHOP_ITEMS: Record<string, ShopItem> = SHOP_DB;

export function genItem(quantity: number, extraArg?: PokemonSet[] | string): string[] {
	let all = Dex.items.all().filter(s => (s.isGem || s.itemUser || s.zMove) || !s.isNonstandard);
	all = all.filter(i => {
		if (i.itemUser) {
			if (typeof extraArg === 'string') {
				const dexSpecies = Dex.species.get(extraArg);
				let validSpecies = [dexSpecies.name];
				if (dexSpecies.otherFormes) validSpecies = validSpecies.concat(dexSpecies.otherFormes);
				return i.itemUser.some(v => validSpecies.includes(v));
			} else if (extraArg?.length) {
				return extraArg.some(poke => {
					const dexSpecies = Dex.species.get(poke.species);
					let validSpecies = [dexSpecies.name];
					if (dexSpecies.otherFormes) validSpecies = validSpecies.concat(dexSpecies.otherFormes);
					return i.itemUser?.some(v => validSpecies.includes(v));
				});
			}
		} else {
			if (i.zMove) return true;
			return Object.keys(i).some(k => typeof (i as any)[k] === 'function');
		}
		return false;
	});

	for (let i = all.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[all[i], all[j]] = [all[j], all[i]];
	}

	const items: string[] = [];
	while (items.length < quantity) {
		const plausibleItem = all.shift();
		if (plausibleItem) {
			items.push(plausibleItem.name);
		} else {
			break;
		}
	}
	return items;
}

export function calculatePartyLuck(team: PokemonEntry[]): number {
	let luck = 0;
	for (const mon of team) {
		if (mon.shiny) luck += 2;
	}
	return luck;
}

export function rollRarity(luck: number): ItemRarityTier {
	const tiers: ItemRarityTier[] = ['Common', 'Great', 'Ultra', 'Rogue', 'Master'];
	const weights = [7500, 1904, 469, 117, 10];
	const totalWeight = weights.reduce((acc, val) => acc + val, 0);
	let roll = Math.random() * totalWeight;
	let currentTier = 0;

	for (let i = 0; i < weights.length; i++) {
		roll -= weights[i];
		if (roll <= 0) {
			currentTier = i;
			break;
		}
	}

	while (currentTier < tiers.length - 1) {
		if (Math.floor(Math.random() * 64) < luck) {
			currentTier++;
		} else {
			break;
		}
	}

	return tiers[currentTier];
}

export function generateDraftOptions(state: PokeRogueState, config?: ModeConfig): string[] {
	const luck = calculatePartyLuck(state.team);
	const draft: string[] = [];
	
	const partySpecies = new Set(state.team.map(m => toID(m.species)));

	const needsHeal = state.team.some(m => (m.currentHp ?? 100) > 0 && (m.currentHp ?? 100) < 100);
	const needsRevive = state.team.some(m => (m.currentHp ?? 100) <= 0);
	const needsCure = state.team.some(m => m.status);

	const baseCount = config?.economy?.draftChoicesCount ?? 3;
	const maxCount = config?.economy?.maxDraftChoicesCount ?? Math.max(4, baseCount);

	let extraOptions = 0;
	for (let i = 0; i < luck; i++) {
		if (Math.random() < 0.25) extraOptions++;
	}

	const draftCount = Math.min(maxCount, baseCount + extraOptions);
	const pickedKeys = new Set<string>();
	
	// Track how many TMs have been rolled in this draft
	let tmsInDraft = 0;

	for (let i = 0; i < draftCount; i++) {
		const targetTier = rollRarity(luck);
		
		const validItems = Object.entries(SHOP_ITEMS).filter(([key, item]) => {
			if (pickedKeys.has(key)) return false;
			if (item.tier !== targetTier) return false;
			
			if (item.type === 'healHP' && !needsHeal) return false;
			if (item.type === 'revive' && !needsRevive) return false;
			if (item.type === 'cureStatus' && !needsCure) return false;
			if (key === 'sacredash' && !needsRevive) return false;

			if (item.type === 'evolveItem') {
				let hasCompatibleTarget = false;
				for (const species of partySpecies) {
					const evos = Dex.species.get(species).evos;
					if (!evos) continue;
					
					for (const evoTarget of evos) {
						const evoData = Dex.species.get(evoTarget);
						if (toID(evoData.evoItem) === key || (key === 'linkingcord' && evoData.evoType === 'trade')) {
							hasCompatibleTarget = true;
							break;
						}
					}
					if (hasCompatibleTarget) break;
				}
				if (!hasCompatibleTarget) return false;
			}
			
			if (item.type === 'tm') {
				// Prevent more than 1 TM from appearing in the draft choices
				if (tmsInDraft >= 1) return false;

				let anyoneCanLearn = false;
				const moveId = key.includes('_') ? 
					key.substring(key.indexOf('_') + 1).replace(/[^a-z0-9]/g, '') : 
					toID(item.name.replace(/^TM\d+\s*/i, ''));
				const moveData = Dex.moves.get(moveId);
				
				if (moveData.exists) {
					for (const mon of state.team) {
						if (mon.moves.includes(moveData.id)) continue;
						
						let canLearn = false;
						let spData = Dex.species.get(mon.species);
						
						while (spData && !canLearn) {
							const learnsetData = Dex.species.getLearnsetData(spData.id)?.learnset;
							if (learnsetData && learnsetData[moveData.id]) canLearn = true;
							
							if (spData.prevo) {
								spData = Dex.species.get(spData.prevo);
							} else if (spData.baseSpecies && toID(spData.baseSpecies) !== spData.id) {
								spData = Dex.species.get(spData.baseSpecies);
							} else {
								break;
							}
						}
						
						if (canLearn) {
							anyoneCanLearn = true;
							break;
						}
					}
				}
				if (!anyoneCanLearn) return false;
			}
			
			return true;
		});
		
		if (validItems.length === 0) {
			const anyUnpicked = Object.entries(SHOP_ITEMS).filter(([key]) => !pickedKeys.has(key));
			const randomFallback = anyUnpicked[Math.floor(Math.random() * anyUnpicked.length)];
			if (randomFallback) {
				draft.push(randomFallback[0]);
				pickedKeys.add(randomFallback[0]);
				if (randomFallback[1].type === 'tm') tmsInDraft++;
			}
		} else {
			const randomValid = validItems[Math.floor(Math.random() * validItems.length)];
			draft.push(randomValid[0]);
			pickedKeys.add(randomValid[0]);
			if (randomValid[1].type === 'tm') tmsInDraft++;
		}
	}
	return draft;
}
