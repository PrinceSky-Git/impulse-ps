/**
 * Custom Scripts for Impulse Mod
 * * Handles core engine overrides, specifically the additive
 * Stacked Item mechanic for Base Power modifications.
 */

export const Scripts: ModdedBattleScriptsData = {
	actions: {
		modifyBasePower(basePower: number, user: Pokemon, target: Pokemon, move: ActiveMove, desc?: boolean) {
			// 1. Run the engine's standard base power modifications first
			let bp = super.modifyBasePower(basePower, user, target, move, desc);

			// 2. Mapping of valid stacked item IDs to their boosted types
			const STACKED_ITEM_TYPES: { [id: string]: string } = {
				silkscarf: 'Normal',
				blackbelt: 'Fighting',
				sharpbeak: 'Flying',
				poisonbarb: 'Poison',
				softsand: 'Ground',
				hardstone: 'Rock',
				silverpowder: 'Bug',
				spelltag: 'Ghost',
				metalcoat: 'Steel',
				charcoal: 'Fire',
				mysticwater: 'Water',
				miracleseed: 'Grass',
				magnet: 'Electric',
				twistedspoon: 'Psychic',
				nevermeltice: 'Ice',
				dragonfang: 'Dragon',
				blackglasses: 'Dark',
				fairyfeather: 'Fairy',
			};

			// 3. Apply Custom Stacked Item Boosts
			const stackedItem = (user as any).stackedItem;
			
			if (stackedItem && move.type === STACKED_ITEM_TYPES[stackedItem.id]) {
				// Each stack is +20% additively. 
				// 1 stack = 1.2x, 2 stacks = 1.4x, 3 stacks = 1.6x, etc.
				const additiveBoost = 1 + (0.2 * stackedItem.count);
				
				// Apply the boost using Showdown's internal modifier math
				bp = this.battle.modify(bp, additiveBoost);
			}

			return bp;
		}
	}
};
