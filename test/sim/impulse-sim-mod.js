'use strict';

const assert = require('assert').strict;
const common = require('../common');
const { Teams } = require('../../dist/sim/teams');
const { TeamValidator } = require('../../dist/sim/team-validator');

describe('Impulse Sim Mod', () => {
	let battle;

	afterEach(() => {
		if (battle) battle.destroy();
		battle = null;
	});

	it('should preserve all custom fields through team format round trips', () => {
		const set = {
			name: 'Raid Boss',
			species: 'Snorlax',
			item: 'Figy Berry',
			ability: 'Gluttony',
			moves: ['Curse', 'Body Slam', 'Earthquake', 'Rest'],
			nature: 'Impish',
			gender: '',
			evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0 },
			ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
			level: 100,
			hp: 50,
			status: 'brn',
			bstBoosts: { atk: 50, def: 50, spa: 0, spd: 0, spe: 0 },
			hpMultiplier: 10,
			stackedItem: { id: 'blackbelt', count: 4 },
		};

		const packed = Teams.pack([set]);
		const unpacked = Teams.unpack(packed)[0];
		assert.equal(unpacked.hp, set.hp);
		assert.equal(unpacked.status, set.status);
		assert.deepEqual(unpacked.bstBoosts, set.bstBoosts);
		assert.equal(unpacked.hpMultiplier, set.hpMultiplier);
		assert.deepEqual(unpacked.stackedItem, set.stackedItem);

		const imported = Teams.import(Teams.export([set]))[0];
		assert.equal(imported.hp, set.hp);
		assert.equal(imported.status, set.status);
		assert.deepEqual(imported.bstBoosts, set.bstBoosts);
		assert.equal(imported.hpMultiplier, set.hpMultiplier);
		assert.deepEqual(imported.stackedItem, set.stackedItem);
	});

	it('should preserve HPX and stacked items when they are the only custom packed fields', () => {
		const set = {
			name: 'Machamp',
			species: 'Machamp',
			item: 'Leftovers',
			ability: 'No Guard',
			moves: ['Dynamic Punch'],
			nature: 'Adamant',
			gender: '',
			evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 4, spe: 0 },
			ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
			level: 100,
			hpMultiplier: 5,
			stackedItem: { id: 'blackbelt', count: 4 },
		};

		const unpacked = Teams.unpack(Teams.pack([set]))[0];
		assert.equal(unpacked.hpMultiplier, set.hpMultiplier);
		assert.deepEqual(unpacked.stackedItem, set.stackedItem);
	});

	it('should parse and validate nickname tags', () => {
		const team = Teams.import(`Raid Boss [H:50] [S:brn] [BST: 50,50,0,0,0] [HPX: 10] [STACK: blackbelt:4] (Snorlax) @ Figy Berry
Ability: Gluttony
EVs: 252 HP / 252 Def / 4 SpD
Impish Nature
- Curse
- Body Slam
- Earthquake
- Rest`);
		const problems = new TeamValidator('gen9ou').validateTeam(team);
		assert.equal(problems, null);
		assert.equal(team[0].name, 'Raid Boss');
		assert.equal(team[0].hp, 50);
		assert.equal(team[0].status, 'brn');
		assert.deepEqual(team[0].bstBoosts, { atk: 50, def: 50, spa: 0, spd: 0, spe: 0 });
		assert.equal(team[0].hpMultiplier, 10);
		assert.deepEqual(team[0].stackedItem, { id: 'blackbelt', count: 4 });
	});

	it('should apply custom HP, status, HPX, and stacked items in battle', () => {
		battle = common.createBattle([[
			{
				species: 'Snorlax', ability: 'immunity', moves: ['sleeptalk'],
				hp: 25, status: 'brn', hpMultiplier: 3,
				stackedItem: { id: 'blackbelt', count: 4 },
			},
		], [
			{ species: 'Wobbuffet', moves: ['sleeptalk'] },
		]]);
		const snorlax = battle.p1.active[0];
		assert.equal(snorlax.status, 'brn');
		assert.equal(snorlax.hp, Math.floor(snorlax.maxhp * 0.25));
		assert(snorlax.maxhp > 1000);
		assert.deepEqual(snorlax.stackedItem, { id: 'blackbelt', count: 4 });
	});

	it('should apply custom BST boosts in battle without changing base HP', () => {
		battle = common.createBattle({ gameType: 'doubles' }, [[
			{ species: 'Machamp', ability: 'noguard', moves: ['sleeptalk'], bstBoosts: { atk: 50, def: 0, spa: 0, spd: 0, spe: 0 } },
			{ species: 'Machamp', ability: 'noguard', moves: ['sleeptalk'] },
		], [
			{ species: 'Wobbuffet', moves: ['sleeptalk'] },
			{ species: 'Wobbuffet', moves: ['sleeptalk'] },
		]]);
		const boosted = battle.p1.active[0];
		const normal = battle.p1.active[1];
		assert(boosted.getStat('atk') > normal.getStat('atk'));
		assert.equal(boosted.maxhp, normal.maxhp);
	});
});
