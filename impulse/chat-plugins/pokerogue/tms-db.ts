import { type ShopItem } from './items';

export const TMS_DB: Record<string, ShopItem> = {
	// ==========================================
	// COMMON TIER (Weight: 40) - Utility, setup, and low/mid-power moves
	// ==========================================
	tm_swords_dance: {
		name: "TM Swords Dance", icon: "TM Normal", type: "tm", category: "TMs",
		desc: "Sharply raises the user's Attack stat.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_thunder_wave: {
		name: "TM Thunder Wave", icon: "TM Electric", type: "tm", category: "TMs",
		desc: "A weak jolt of electricity that paralyzes the target.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_light_screen: {
		name: "TM Light Screen", icon: "TM Psychic", type: "tm", category: "TMs",
		desc: "Reduces damage from special attacks for five turns.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_reflect: {
		name: "TM Reflect", icon: "TM Psychic", type: "tm", category: "TMs",
		desc: "Reduces damage from physical attacks for five turns.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_substitute: {
		name: "TM Substitute", icon: "TM Normal", type: "tm", category: "TMs",
		desc: "Creates a decoy using 1/4 of the user's maximum HP.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_protect: {
		name: "TM Protect", icon: "TM Normal", type: "tm", category: "TMs",
		desc: "Protects the user from all attacks this turn.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_rain_dance: {
		name: "TM Rain Dance", icon: "TM Water", type: "tm", category: "TMs",
		desc: "Summons rain for five turns, boosting Water moves.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_sunny_day: {
		name: "TM Sunny Day", icon: "TM Fire", type: "tm", category: "TMs",
		desc: "Intensifies the sun for five turns, boosting Fire moves.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_will_o_wisp: {
		name: "TM Will-O-Wisp", icon: "TM Fire", type: "tm", category: "TMs",
		desc: "Shoots a sinister flame to inflict a burn.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_taunt: {
		name: "TM Taunt", icon: "TM Dark", type: "tm", category: "TMs",
		desc: "Forces the target to use only attacking moves for three turns.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_trick_room: {
		name: "TM Trick Room", icon: "TM Psychic", type: "tm", category: "TMs",
		desc: "Slower Pokémon move first for five turns.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_stealth_rock: {
		name: "TM Stealth Rock", icon: "TM Rock", type: "tm", category: "TMs",
		desc: "Lays pointed stones that hurt switching-in foes.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_spikes: {
		name: "TM Spikes", icon: "TM Ground", type: "tm", category: "TMs",
		desc: "Lays a trap of spikes that hurt grounded foes switching in.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_toxic_spikes: {
		name: "TM Toxic Spikes", icon: "TM Poison", type: "tm", category: "TMs",
		desc: "Lays poison spikes to poison grounded foes switching in.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_defog: {
		name: "TM Defog", icon: "TM Flying", type: "tm", category: "TMs",
		desc: "Clears hazards and lowers target's evasion.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_roost: {
		name: "TM Roost", icon: "TM Flying", type: "tm", category: "TMs",
		desc: "Heals up to 50% of maximum HP.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_tailwind: {
		name: "TM Tailwind", icon: "TM Flying", type: "tm", category: "TMs",
		desc: "Doubles the Speed of your team for four turns.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_bulk_up: {
		name: "TM Bulk Up", icon: "TM Fighting", type: "tm", category: "TMs",
		desc: "Raises the user's Attack and Defense stats.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_agility: {
		name: "TM Agility", icon: "TM Psychic", type: "tm", category: "TMs",
		desc: "Sharply raises the user's Speed stat.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_dragon_dance: {
		name: "TM Dragon Dance", icon: "TM Dragon", type: "tm", category: "TMs",
		desc: "Raises the user's Attack and Speed stats.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_sandstorm: {
		name: "TM Sandstorm", icon: "TM Rock", type: "tm", category: "TMs",
		desc: "Summons a sandstorm for five turns.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_snowscape: {
		name: "TM Snowscape", icon: "TM Ice", type: "tm", category: "TMs",
		desc: "Summons snow for five turns, boosting Ice types' Defense.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_endure: {
		name: "TM Endure", icon: "TM Normal", type: "tm", category: "TMs",
		desc: "Endures any attack with at least 1 HP.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_rest: {
		name: "TM Rest", icon: "TM Psychic", type: "tm", category: "TMs",
		desc: "The user sleeps for 2 turns to fully heal.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_sleep_talk: {
		name: "TM Sleep Talk", icon: "TM Normal", type: "tm", category: "TMs",
		desc: "Uses a random known move while asleep.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_baton_pass: {
		name: "TM Baton Pass", icon: "TM Normal", type: "tm", category: "TMs",
		desc: "Switches out, passing stat changes to the replacement.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_trailblaze: {
		name: "TM Trailblaze", icon: "TM Grass", type: "tm", category: "TMs",
		desc: "An attack that also raises the user's Speed.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_pounce: {
		name: "TM Pounce", icon: "TM Bug", type: "tm", category: "TMs",
		desc: "An attack that lowers the target's Speed.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_chilling_water: {
		name: "TM Chilling Water", icon: "TM Water", type: "tm", category: "TMs",
		desc: "An attack that lowers the target's Attack.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_facade: {
		name: "TM Facade", icon: "TM Normal", type: "tm", category: "TMs",
		desc: "Power doubles if the user is poisoned, burned, or paralyzed.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_swift: {
		name: "TM Swift", icon: "TM Normal", type: "tm", category: "TMs",
		desc: "Fires star-shaped rays that never miss.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_icy_wind: {
		name: "TM Icy Wind", icon: "TM Ice", type: "tm", category: "TMs",
		desc: "Attacks with cold air. Lowers opposing Pokémon's Speed.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_mud_shot: {
		name: "TM Mud Shot", icon: "TM Ground", type: "tm", category: "TMs",
		desc: "Hurls mud at the target. Lowers the target's Speed.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_rock_tomb: {
		name: "TM Rock Tomb", icon: "TM Rock", type: "tm", category: "TMs",
		desc: "Hurls boulders at the target. Lowers the target's Speed.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_low_sweep: {
		name: "TM Low Sweep", icon: "TM Fighting", type: "tm", category: "TMs",
		desc: "Attacks the target's legs. Lowers the target's Speed.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_snarl: {
		name: "TM Snarl", icon: "TM Dark", type: "tm", category: "TMs",
		desc: "Yells to lower the opposing Pokémon's Sp. Atk.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_electroweb: {
		name: "TM Electroweb", icon: "TM Electric", type: "tm", category: "TMs",
		desc: "Traps foes in an electric net. Lowers their Speed.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_bulldoze: {
		name: "TM Bulldoze", icon: "TM Ground", type: "tm", category: "TMs",
		desc: "Stomps the ground to attack. Lowers Speed of hit targets.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_magical_leaf: {
		name: "TM Magical Leaf", icon: "TM Grass", type: "tm", category: "TMs",
		desc: "Scatters curious leaves that never miss.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},
	tm_air_cutter: {
		name: "TM Air Cutter", icon: "TM Flying", type: "tm", category: "TMs",
		desc: "Launches razor wind. High critical-hit ratio.",
		moneyMultiplier: 0.5, tier: "Common", weight: 40, minWeight: 40, maxWeight: 40
	},

	// ==========================================
	// GREAT TIER (Weight: 20) - Mid/High power STABs and strong utility
	// ==========================================
	tm_toxic: {
		name: "TM Toxic", icon: "TM Poison", type: "tm", category: "TMs",
		desc: "Badly poisons the target. Poison damage worsens every turn.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_calm_mind: {
		name: "TM Calm Mind", icon: "TM Psychic", type: "tm", category: "TMs",
		desc: "Raises the user's Sp. Atk and Sp. Def stats.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_iron_defense: {
		name: "TM Iron Defense", icon: "TM Steel", type: "tm", category: "TMs",
		desc: "Sharply raises the user's Defense stat.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_u_turn: {
		name: "TM U-turn", icon: "TM Bug", type: "tm", category: "TMs",
		desc: "After attacking, the user switches out.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_volt_switch: {
		name: "TM Volt Switch", icon: "TM Electric", type: "tm", category: "TMs",
		desc: "After attacking, the user switches out.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_flip_turn: {
		name: "TM Flip Turn", icon: "TM Water", type: "tm", category: "TMs",
		desc: "After attacking, the user switches out.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_brick_break: {
		name: "TM Brick Break", icon: "TM Fighting", type: "tm", category: "TMs",
		desc: "Destroys barriers like Light Screen and Reflect.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_drain_punch: {
		name: "TM Drain Punch", icon: "TM Fighting", type: "tm", category: "TMs",
		desc: "Restores HP equal to half the damage dealt.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_energy_ball: {
		name: "TM Energy Ball", icon: "TM Grass", type: "tm", category: "TMs",
		desc: "May lower the target's Sp. Def stat.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_shadow_claw: {
		name: "TM Shadow Claw", icon: "TM Ghost", type: "tm", category: "TMs",
		desc: "High critical-hit ratio.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_iron_head: {
		name: "TM Iron Head", icon: "TM Steel", type: "tm", category: "TMs",
		desc: "May make the target flinch.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_scald: {
		name: "TM Scald", icon: "TM Water", type: "tm", category: "TMs",
		desc: "Shoots boiling water. May burn the target.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_poison_jab: {
		name: "TM Poison Jab", icon: "TM Poison", type: "tm", category: "TMs",
		desc: "May poison the target.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_x_scissor: {
		name: "TM X-Scissor", icon: "TM Bug", type: "tm", category: "TMs",
		desc: "Slashes the target with scythes or claws.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_zen_headbutt: {
		name: "TM Zen Headbutt", icon: "TM Psychic", type: "tm", category: "TMs",
		desc: "May make the target flinch.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_seed_bomb: {
		name: "TM Seed Bomb", icon: "TM Grass", type: "tm", category: "TMs",
		desc: "Slams a barrage of hard-shelled seeds from above.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_dragon_claw: {
		name: "TM Dragon Claw", icon: "TM Dragon", type: "tm", category: "TMs",
		desc: "Slashes the target with huge, sharp claws.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_crunch: {
		name: "TM Crunch", icon: "TM Dark", type: "tm", category: "TMs",
		desc: "May lower the target's Defense stat.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_play_rough: {
		name: "TM Play Rough", icon: "TM Fairy", type: "tm", category: "TMs",
		desc: "May lower the target's Attack stat.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_liquidation: {
		name: "TM Liquidation", icon: "TM Water", type: "tm", category: "TMs",
		desc: "May lower the target's Defense stat.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_rock_slide: {
		name: "TM Rock Slide", icon: "TM Rock", type: "tm", category: "TMs",
		desc: "May make opposing Pokémon flinch.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_body_press: {
		name: "TM Body Press", icon: "TM Fighting", type: "tm", category: "TMs",
		desc: "Damage is calculated using the user's Defense stat.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_dazzling_gleam: {
		name: "TM Dazzling Gleam", icon: "TM Fairy", type: "tm", category: "TMs",
		desc: "Damages opposing Pokémon by emitting a powerful flash.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_flash_cannon: {
		name: "TM Flash Cannon", icon: "TM Steel", type: "tm", category: "TMs",
		desc: "May lower the target's Sp. Def stat.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_sludge_bomb: {
		name: "TM Sludge Bomb", icon: "TM Poison", type: "tm", category: "TMs",
		desc: "May poison the target.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_thunderbolt: {
		name: "TM Thunderbolt", icon: "TM Electric", type: "tm", category: "TMs",
		desc: "May paralyze the target.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_ice_beam: {
		name: "TM Ice Beam", icon: "TM Ice", type: "tm", category: "TMs",
		desc: "May freeze the target.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_flamethrower: {
		name: "TM Flamethrower", icon: "TM Fire", type: "tm", category: "TMs",
		desc: "May burn the target.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_psychic: {
		name: "TM Psychic", icon: "TM Psychic", type: "tm", category: "TMs",
		desc: "May lower the target's Sp. Def stat.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_surf: {
		name: "TM Surf", icon: "TM Water", type: "tm", category: "TMs",
		desc: "Attacks everything around it.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_dark_pulse: {
		name: "TM Dark Pulse", icon: "TM Dark", type: "tm", category: "TMs",
		desc: "May make the target flinch.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_earth_power: {
		name: "TM Earth Power", icon: "TM Ground", type: "tm", category: "TMs",
		desc: "May lower the target's Sp. Def stat.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_bug_buzz: {
		name: "TM Bug Buzz", icon: "TM Bug", type: "tm", category: "TMs",
		desc: "May lower the target's Sp. Def stat.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_aura_sphere: {
		name: "TM Aura Sphere", icon: "TM Fighting", type: "tm", category: "TMs",
		desc: "This attack never misses.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_giga_drain: {
		name: "TM Giga Drain", icon: "TM Grass", type: "tm", category: "TMs",
		desc: "Restores HP equal to half the damage dealt.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_leech_life: {
		name: "TM Leech Life", icon: "TM Bug", type: "tm", category: "TMs",
		desc: "Restores HP equal to half the damage dealt.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_wild_charge: {
		name: "TM Wild Charge", icon: "TM Electric", type: "tm", category: "TMs",
		desc: "The user takes recoil damage.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_waterfall: {
		name: "TM Waterfall", icon: "TM Water", type: "tm", category: "TMs",
		desc: "May make the target flinch.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_acrobatics: {
		name: "TM Acrobatics", icon: "TM Flying", type: "tm", category: "TMs",
		desc: "Damage doubles if the user holds no item.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},
	tm_knock_off: {
		name: "TM Knock Off", icon: "TM Dark", type: "tm", category: "TMs",
		desc: "Removes target's item. Does more damage if target holds an item.",
		moneyMultiplier: 1.0, tier: "Great", weight: 20, minWeight: 20, maxWeight: 20
	},

	// ==========================================
	// ULTRA TIER (Weight: 10) - Nukes and signature coverage
	// ==========================================
	tm_hydro_pump: {
		name: "TM Hydro Pump", icon: "TM Water", type: "tm", category: "TMs",
		desc: "A powerful watery blast.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_fire_blast: {
		name: "TM Fire Blast", icon: "TM Fire", type: "tm", category: "TMs",
		desc: "A powerful fiery blast. May burn the target.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_thunder: {
		name: "TM Thunder", icon: "TM Electric", type: "tm", category: "TMs",
		desc: "A massive lightning bolt. May paralyze the target.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_blizzard: {
		name: "TM Blizzard", icon: "TM Ice", type: "tm", category: "TMs",
		desc: "A howling blizzard. May freeze the target.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_focus_blast: {
		name: "TM Focus Blast", icon: "TM Fighting", type: "tm", category: "TMs",
		desc: "A high-powered fighting attack. May lower Sp. Def.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_stone_edge: {
		name: "TM Stone Edge", icon: "TM Rock", type: "tm", category: "TMs",
		desc: "High critical-hit ratio.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_earthquake: {
		name: "TM Earthquake", icon: "TM Ground", type: "tm", category: "TMs",
		desc: "A powerful earthquake that damages all surrounding Pokémon.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_shadow_ball: {
		name: "TM Shadow Ball", icon: "TM Ghost", type: "tm", category: "TMs",
		desc: "Hurls a shadowy blob. May lower Sp. Def.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_close_combat: {
		name: "TM Close Combat", icon: "TM Fighting", type: "tm", category: "TMs",
		desc: "High power, but lowers the user's Defense and Sp. Def.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_brave_bird: {
		name: "TM Brave Bird", icon: "TM Flying", type: "tm", category: "TMs",
		desc: "High power. The user takes serious recoil damage.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_flare_blitz: {
		name: "TM Flare Blitz", icon: "TM Fire", type: "tm", category: "TMs",
		desc: "High power. The user takes recoil. May burn the target.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_wood_hammer: {
		name: "TM Wood Hammer", icon: "TM Grass", type: "tm", category: "TMs",
		desc: "High power. The user takes serious recoil damage.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_power_whip: {
		name: "TM Power Whip", icon: "TM Grass", type: "tm", category: "TMs",
		desc: "The user violently whirls vines or tentacles to attack.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_leaf_storm: {
		name: "TM Leaf Storm", icon: "TM Grass", type: "tm", category: "TMs",
		desc: "High power, but harshly lowers the user's Sp. Atk.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_draco_meteor: {
		name: "TM Draco Meteor", icon: "TM Dragon", type: "tm", category: "TMs",
		desc: "High power, but harshly lowers the user's Sp. Atk.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_overheat: {
		name: "TM Overheat", icon: "TM Fire", type: "tm", category: "TMs",
		desc: "High power, but harshly lowers the user's Sp. Atk.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_megahorn: {
		name: "TM Megahorn", icon: "TM Bug", type: "tm", category: "TMs",
		desc: "Using its tough horn, the user rams into the target.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_outrage: {
		name: "TM Outrage", icon: "TM Dragon", type: "tm", category: "TMs",
		desc: "Rampages for 2-3 turns, then becomes confused.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_gunk_shot: {
		name: "TM Gunk Shot", icon: "TM Poison", type: "tm", category: "TMs",
		desc: "Shoots filthy garbage. May poison the target.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_hurricane: {
		name: "TM Hurricane", icon: "TM Flying", type: "tm", category: "TMs",
		desc: "Wraps the foe in a fierce wind. May confuse the target.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_meteor_mash: {
		name: "TM Meteor Mash", icon: "TM Steel", type: "tm", category: "TMs",
		desc: "Punches with a meteor's force. May raise the user's Attack.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_poltergeist: {
		name: "TM Poltergeist", icon: "TM Ghost", type: "tm", category: "TMs",
		desc: "Attacks the target by controlling its held item.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_triple_axel: {
		name: "TM Triple Axel", icon: "TM Ice", type: "tm", category: "TMs",
		desc: "A three-kick attack that gains power with each hit.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_expanding_force: {
		name: "TM Expanding Force", icon: "TM Psychic", type: "tm", category: "TMs",
		desc: "Power increases on Psychic Terrain.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_meteor_beam: {
		name: "TM Meteor Beam", icon: "TM Rock", type: "tm", category: "TMs",
		desc: "Raises Sp. Atk on turn 1, hits turn 2.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_scorching_sands: {
		name: "TM Scorching Sands", icon: "TM Ground", type: "tm", category: "TMs",
		desc: "Throws scorching sand. May burn the target.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_high_horsepower: {
		name: "TM High Horsepower", icon: "TM Ground", type: "tm", category: "TMs",
		desc: "Fiercely attacks the target using its entire body.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_supercell_slam: {
		name: "TM Supercell Slam", icon: "TM Electric", type: "tm", category: "TMs",
		desc: "Takes damage if the attack misses.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_hard_press: {
		name: "TM Hard Press", icon: "TM Steel", type: "tm", category: "TMs",
		desc: "Does more damage the more HP the target has.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_alluring_voice: {
		name: "TM Alluring Voice", icon: "TM Fairy", type: "tm", category: "TMs",
		desc: "Confuses the target if its stats were boosted this turn.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_temper_flare: {
		name: "TM Temper Flare", icon: "TM Fire", type: "tm", category: "TMs",
		desc: "Power doubles if the user's previous move failed.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_psychic_noise: {
		name: "TM Psychic Noise", icon: "TM Psychic", type: "tm", category: "TMs",
		desc: "Prevents the target from recovering HP for two turns.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_tera_blast: {
		name: "TM Tera Blast", icon: "TM Normal", type: "tm", category: "TMs",
		desc: "Changes type when the user Terastallizes.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_double_edge: {
		name: "TM Double-Edge", icon: "TM Normal", type: "tm", category: "TMs",
		desc: "A reckless tackle that damages the user.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_sludge_wave: {
		name: "TM Sludge Wave", icon: "TM Poison", type: "tm", category: "TMs",
		desc: "Strikes everything around it. May poison.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_boomburst: {
		name: "TM Boomburst", icon: "TM Normal", type: "tm", category: "TMs",
		desc: "Attacks everything around it with a terrible, destructive sound.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_hyper_voice: {
		name: "TM Hyper Voice", icon: "TM Normal", type: "tm", category: "TMs",
		desc: "Lets loose a horribly echoing shout.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_ice_spinner: {
		name: "TM Ice Spinner", icon: "TM Ice", type: "tm", category: "TMs",
		desc: "Destroys active terrain.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_steel_beam: {
		name: "TM Steel Beam", icon: "TM Steel", type: "tm", category: "TMs",
		desc: "The user takes damage equal to half its maximum HP.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	},
	tm_foul_play: {
		name: "TM Foul Play", icon: "TM Dark", type: "tm", category: "TMs",
		desc: "Uses the target's Attack stat to calculate damage.",
		moneyMultiplier: 2.0, tier: "Ultra", weight: 10, minWeight: 10, maxWeight: 10
	}
};