import { type ShopItem, type ItemRarityTier } from './items';

// TM Factory & Configurations

const TM_CONFIGS = {
	Common: { mult: 0.5, weight: 40 },
	Great: { mult: 1.0, weight: 20 },
	Ultra: { mult: 2.0, weight: 10 },
};

function buildTM(name: string, typeName: string, desc: string, tier: ItemRarityTier): ShopItem {
	const cfg = TM_CONFIGS[tier as keyof typeof TM_CONFIGS];
	return {
		name, icon: `TM ${typeName}`, type: "tm", category: "TMs", desc,
		moneyMultiplier: cfg.mult, tier,
		weight: cfg.weight, minWeight: cfg.weight, maxWeight: cfg.weight,
	};
}

export const TMS_DB: Record<string, ShopItem> = {};

// COMMON TIER (Weight: 40) - Utility, setup, and low/mid-power moves

const COMMON_TMS: [string, string, string, string][] = [
	['tm_swords_dance', "TM Swords Dance", "Normal", "Sharply raises the user's Attack stat."],
	['tm_thunder_wave', "TM Thunder Wave", "Electric", "A weak jolt of electricity that paralyzes the target."],
	['tm_light_screen', "TM Light Screen", "Psychic", "Reduces damage from special attacks for five turns."],
	['tm_reflect', "TM Reflect", "Psychic", "Reduces damage from physical attacks for five turns."],
	['tm_substitute', "TM Substitute", "Normal", "Creates a decoy using 1/4 of the user's maximum HP."],
	['tm_protect', "TM Protect", "Normal", "Protects the user from all attacks this turn."],
	['tm_rain_dance', "TM Rain Dance", "Water", "Summons rain for five turns, boosting Water moves."],
	['tm_sunny_day', "TM Sunny Day", "Fire", "Intensifies the sun for five turns, boosting Fire moves."],
	['tm_will_o_wisp', "TM Will-O-Wisp", "Fire", "Shoots a sinister flame to inflict a burn."],
	['tm_taunt', "TM Taunt", "Dark", "Forces the target to use only attacking moves for three turns."],
	['tm_trick_room', "TM Trick Room", "Psychic", "Slower Pokémon move first for five turns."],
	['tm_stealth_rock', "TM Stealth Rock", "Rock", "Lays pointed stones that hurt switching-in foes."],
	['tm_spikes', "TM Spikes", "Ground", "Lays a trap of spikes that hurt grounded foes switching in."],
	['tm_toxic_spikes', "TM Toxic Spikes", "Poison", "Lays poison spikes to poison grounded foes switching in."],
	['tm_defog', "TM Defog", "Flying", "Clears hazards and lowers target's evasion."],
	['tm_roost', "TM Roost", "Flying", "Heals up to 50% of maximum HP."],
	['tm_tailwind', "TM Tailwind", "Flying", "Doubles the Speed of your team for four turns."],
	['tm_bulk_up', "TM Bulk Up", "Fighting", "Raises the user's Attack and Defense stats."],
	['tm_agility', "TM Agility", "Psychic", "Sharply raises the user's Speed stat."],
	['tm_dragon_dance', "TM Dragon Dance", "Dragon", "Raises the user's Attack and Speed stats."],
	['tm_sandstorm', "TM Sandstorm", "Rock", "Summons a sandstorm for five turns."],
	['tm_snowscape', "TM Snowscape", "Ice", "Summons snow for five turns, boosting Ice types' Defense."],
	['tm_endure', "TM Endure", "Normal", "Endures any attack with at least 1 HP."],
	['tm_rest', "TM Rest", "Psychic", "The user sleeps for 2 turns to fully heal."],
	['tm_sleep_talk', "TM Sleep Talk", "Normal", "Uses a random known move while asleep."],
	['tm_baton_pass', "TM Baton Pass", "Normal", "Switches out, passing stat changes to the replacement."],
	['tm_trailblaze', "TM Trailblaze", "Grass", "An attack that also raises the user's Speed."],
	['tm_pounce', "TM Pounce", "Bug", "An attack that lowers the target's Speed."],
	['tm_chilling_water', "TM Chilling Water", "Water", "An attack that lowers the target's Attack."],
	['tm_facade', "TM Facade", "Normal", "Power doubles if the user is poisoned, burned, or paralyzed."],
	['tm_swift', "TM Swift", "Normal", "Fires star-shaped rays that never miss."],
	['tm_icy_wind', "TM Icy Wind", "Ice", "Attacks with cold air. Lowers opposing Pokémon's Speed."],
	['tm_mud_shot', "TM Mud Shot", "Ground", "Hurls mud at the target. Lowers the target's Speed."],
	['tm_rock_tomb', "TM Rock Tomb", "Rock", "Hurls boulders at the target. Lowers the target's Speed."],
	['tm_low_sweep', "TM Low Sweep", "Fighting", "Attacks the target's legs. Lowers the target's Speed."],
	['tm_snarl', "TM Snarl", "Dark", "Yells to lower the opposing Pokémon's Sp. Atk."],
	['tm_electroweb', "TM Electroweb", "Electric", "Traps foes in an electric net. Lowers their Speed."],
	['tm_bulldoze', "TM Bulldoze", "Ground", "Stomps the ground to attack. Lowers Speed of hit targets."],
	['tm_magical_leaf', "TM Magical Leaf", "Grass", "Scatters curious leaves that never miss."],
	['tm_air_cutter', "TM Air Cutter", "Flying", "Launches razor wind. High critical-hit ratio."],
];

COMMON_TMS.forEach(([id, name, type, desc]) => {
	TMS_DB[id] = buildTM(name, type, desc, "Common");
});

// GREAT TIER (Weight: 20) - Mid/High power STABs and strong utility

const GREAT_TMS: [string, string, string, string][] = [
	['tm_toxic', "TM Toxic", "Poison", "Badly poisons the target. Poison damage worsens every turn."],
	['tm_calm_mind', "TM Calm Mind", "Psychic", "Raises the user's Sp. Atk and Sp. Def stats."],
	['tm_iron_defense', "TM Iron Defense", "Steel", "Sharply raises the user's Defense stat."],
	['tm_u_turn', "TM U-turn", "Bug", "After attacking, the user switches out."],
	['tm_volt_switch', "TM Volt Switch", "Electric", "After attacking, the user switches out."],
	['tm_flip_turn', "TM Flip Turn", "Water", "After attacking, the user switches out."],
	['tm_brick_break', "TM Brick Break", "Fighting", "Destroys barriers like Light Screen and Reflect."],
	['tm_drain_punch', "TM Drain Punch", "Fighting", "Restores HP equal to half the damage dealt."],
	['tm_energy_ball', "TM Energy Ball", "Grass", "May lower the target's Sp. Def stat."],
	['tm_shadow_claw', "TM Shadow Claw", "Ghost", "High critical-hit ratio."],
	['tm_iron_head', "TM Iron Head", "Steel", "May make the target flinch."],
	['tm_scald', "TM Scald", "Water", "Shoots boiling water. May burn the target."],
	['tm_poison_jab', "TM Poison Jab", "Poison", "May poison the target."],
	['tm_x_scissor', "TM X-Scissor", "Bug", "Slashes the target with scythes or claws."],
	['tm_zen_headbutt', "TM Zen Headbutt", "Psychic", "May make the target flinch."],
	['tm_seed_bomb', "TM Seed Bomb", "Grass", "Slams a barrage of hard-shelled seeds from above."],
	['tm_dragon_claw', "TM Dragon Claw", "Dragon", "Slashes the target with huge, sharp claws."],
	['tm_crunch', "TM Crunch", "Dark", "May lower the target's Defense stat."],
	['tm_play_rough', "TM Play Rough", "Fairy", "May lower the target's Attack stat."],
	['tm_liquidation', "TM Liquidation", "Water", "May lower the target's Defense stat."],
	['tm_rock_slide', "TM Rock Slide", "Rock", "May make opposing Pokémon flinch."],
	['tm_body_press', "TM Body Press", "Fighting", "Damage is calculated using the user's Defense stat."],
	['tm_dazzling_gleam', "TM Dazzling Gleam", "Fairy", "Damages opposing Pokémon by emitting a powerful flash."],
	['tm_flash_cannon', "TM Flash Cannon", "Steel", "May lower the target's Sp. Def stat."],
	['tm_sludge_bomb', "TM Sludge Bomb", "Poison", "May poison the target."],
	['tm_thunderbolt', "TM Thunderbolt", "Electric", "May paralyze the target."],
	['tm_ice_beam', "TM Ice Beam", "Ice", "May freeze the target."],
	['tm_flamethrower', "TM Flamethrower", "Fire", "May burn the target."],
	['tm_psychic', "TM Psychic", "Psychic", "May lower the target's Sp. Def stat."],
	['tm_surf', "TM Surf", "Water", "Attacks everything around it."],
	['tm_dark_pulse', "TM Dark Pulse", "Dark", "May make the target flinch."],
	['tm_earth_power', "TM Earth Power", "Ground", "May lower the target's Sp. Def stat."],
	['tm_bug_buzz', "TM Bug Buzz", "Bug", "May lower the target's Sp. Def stat."],
	['tm_aura_sphere', "TM Aura Sphere", "Fighting", "This attack never misses."],
	['tm_giga_drain', "TM Giga Drain", "Grass", "Restores HP equal to half the damage dealt."],
	['tm_leech_life', "TM Leech Life", "Bug", "Restores HP equal to half the damage dealt."],
	['tm_wild_charge', "TM Wild Charge", "Electric", "The user takes recoil damage."],
	['tm_waterfall', "TM Waterfall", "Water", "May make the target flinch."],
	['tm_acrobatics', "TM Acrobatics", "Flying", "Damage doubles if the user holds no item."],
	['tm_knock_off', "TM Knock Off", "Dark", "Removes target's item. Does more damage if target holds an item."],
];

GREAT_TMS.forEach(([id, name, type, desc]) => {
	TMS_DB[id] = buildTM(name, type, desc, "Great");
});

// ULTRA TIER (Weight: 10) - Nukes and signature coverage

const ULTRA_TMS: [string, string, string, string][] = [
	['tm_hydro_pump', "TM Hydro Pump", "Water", "A powerful watery blast."],
	['tm_fire_blast', "TM Fire Blast", "Fire", "A powerful fiery blast. May burn the target."],
	['tm_thunder', "TM Thunder", "Electric", "A massive lightning bolt. May paralyze the target."],
	['tm_blizzard', "TM Blizzard", "Ice", "A howling blizzard. May freeze the target."],
	['tm_focus_blast', "TM Focus Blast", "Fighting", "A high-powered fighting attack. May lower Sp. Def."],
	['tm_stone_edge', "TM Stone Edge", "Rock", "High critical-hit ratio."],
	['tm_earthquake', "TM Earthquake", "Ground", "A powerful earthquake that damages all surrounding Pokémon."],
	['tm_shadow_ball', "TM Shadow Ball", "Ghost", "Hurls a shadowy blob. May lower Sp. Def."],
	['tm_close_combat', "TM Close Combat", "Fighting", "High power, but lowers the user's Defense and Sp. Def."],
	['tm_brave_bird', "TM Brave Bird", "Flying", "High power. The user takes serious recoil damage."],
	['tm_flare_blitz', "TM Flare Blitz", "Fire", "High power. The user takes recoil. May burn the target."],
	['tm_wood_hammer', "TM Wood Hammer", "Grass", "High power. The user takes serious recoil damage."],
	['tm_power_whip', "TM Power Whip", "Grass", "The user violently whirls vines or tentacles to attack."],
	['tm_leaf_storm', "TM Leaf Storm", "Grass", "High power, but harshly lowers the user's Sp. Atk."],
	['tm_draco_meteor', "TM Draco Meteor", "Dragon", "High power, but harshly lowers the user's Sp. Atk."],
	['tm_overheat', "TM Overheat", "Fire", "High power, but harshly lowers the user's Sp. Atk."],
	['tm_megahorn', "TM Megahorn", "Bug", "Using its tough horn, the user rams into the target."],
	['tm_outrage', "TM Outrage", "Dragon", "Rampages for 2-3 turns, then becomes confused."],
	['tm_gunk_shot', "TM Gunk Shot", "Poison", "Shoots filthy garbage. May poison the target."],
	['tm_hurricane', "TM Hurricane", "Flying", "Wraps the foe in a fierce wind. May confuse the target."],
	['tm_meteor_mash', "TM Meteor Mash", "Steel", "Punches with a meteor's force. May raise the user's Attack."],
	['tm_poltergeist', "TM Poltergeist", "Ghost", "Attacks the target by controlling its held item."],
	['tm_triple_axel', "TM Triple Axel", "Ice", "A three-kick attack that gains power with each hit."],
	['tm_expanding_force', "TM Expanding Force", "Psychic", "Power increases on Psychic Terrain."],
	['tm_meteor_beam', "TM Meteor Beam", "Rock", "Raises Sp. Atk on turn 1, hits turn 2."],
	['tm_scorching_sands', "TM Scorching Sands", "Ground", "Throws scorching sand. May burn the target."],
	['tm_high_horsepower', "TM High Horsepower", "Ground", "Fiercely attacks the target using its entire body."],
	['tm_supercell_slam', "TM Supercell Slam", "Electric", "Takes damage if the attack misses."],
	['tm_hard_press', "TM Hard Press", "Steel", "Does more damage the more HP the target has."],
	['tm_alluring_voice', "TM Alluring Voice", "Fairy", "Confuses the target if its stats were boosted this turn."],
	['tm_temper_flare', "TM Temper Flare", "Fire", "Power doubles if the user's previous move failed."],
	['tm_psychic_noise', "TM Psychic Noise", "Psychic", "Prevents the target from recovering HP for two turns."],
	['tm_tera_blast', "TM Tera Blast", "Normal", "Changes type when the user Terastallizes."],
	['tm_double_edge', "TM Double-Edge", "Normal", "A reckless tackle that damages the user."],
	['tm_sludge_wave', "TM Sludge Wave", "Poison", "Strikes everything around it. May poison."],
	['tm_boomburst', "TM Boomburst", "Normal", "Attacks everything around it with a terrible, destructive sound."],
	['tm_hyper_voice', "TM Hyper Voice", "Normal", "Lets loose a horribly echoing shout."],
	['tm_ice_spinner', "TM Ice Spinner", "Ice", "Destroys active terrain."],
	['tm_steel_beam', "TM Steel Beam", "Steel", "The user takes damage equal to half its maximum HP."],
	['tm_foul_play', "TM Foul Play", "Dark", "Uses the target's Attack stat to calculate damage."],
];

ULTRA_TMS.forEach(([id, name, type, desc]) => {
	TMS_DB[id] = buildTM(name, type, desc, "Ultra");
});
