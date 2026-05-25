import { Utils } from '../../../lib';
import { nameColor } from '../customization/custom-color';
import { type PokemonEntry, type PokeRogueState } from './types';
import { MODE_CONFIGS, MODE_REGISTRY } from './config';
import { SHOP_ITEMS } from './items';
import { globalStats, getUserData } from './state';
import { expForLevel, getLevelUpMoves } from './pokemon';
import { getRerollCost, getItemPrice } from './items';

const PAGE_REFRESH_SECONDS = 20;

const TYPE_COLORS: Record<string, string> = {
	Normal: '9fa19f', Fire: 'e62829', Water: '2980ef', Grass: '3fa129', Electric: 'fac000',
	Ice: '3dcef3', Fighting: 'ff8000', Poison: '9141cb', Ground: '915121', Flying: '81b9ef',
	Psychic: 'ef4179', Bug: '91a119', Rock: 'afa981', Ghost: '704170', Dragon: '5060e1',
	Dark: '624d4e', Steel: '60a1b8', Fairy: 'ef70ef',
};

const BALL_MAP: Record<string, { srcSuffix: string, alt: string }> = {
	masterball: { srcSuffix: 'i1.png', alt: 'Master Ball' },
	ultraball: { srcSuffix: 'i2.png', alt: 'Ultra Ball' },
	greatball: { srcSuffix: 'i3.png', alt: 'Great Ball' },
	pokeball: { srcSuffix: 'i4.png', alt: 'Poké Ball' },
};

const SPRITE_ID_OVERRIDES: { [id: string]: string } = {
	floetteeternal: 'floette',
	eternatuseternamax: 'eternatus',
	bloodmoonursaluna: 'ursaluna',
	ursalunabloodmoon: 'ursaluna',
};

const MINT_SPRITE_BASE = 'https://raw.githubusercontent.com/PrinceSky-Git/pokemon-showdown/master/impulse/chat-plugins/pokerogue/sprites/mints/';
const MINT_ICON_MAP: Record<string, string> = {
	'Atk Mint': 'Lonely-Mint.png',
	'Def Mint': 'Bold-Mint.png',
	'SpAtk Mint': 'Modest-Mind.png',
	'SpDef Mint': 'Calm-Mint.png',
	'Spe Mint': 'Timid-Mint.png',
	'Neutral Mint': 'Serious-Mint.png',
};

const TM_SPRITE_BASE = 'https://raw.githubusercontent.com/PrinceSky-Git/pokemon-showdown/master/impulse/chat-plugins/pokerogue/sprites/tms/';
const TM_ICON_MAP: Record<string, string> = {
	'TM Normal': 'normal-tm.png',
	'TM Fire': 'fire-tm.png',
	'TM Water': 'water-tm.png',
	'TM Grass': 'grass-tm.png',
	'TM Electric': 'eletric-tm.png',
	'TM Ice': 'ice-tm.png',
	'TM Fighting': 'fighting-tm.png',
	'TM Poison': 'poison-tm.png',
	'TM Ground': 'ground-tm.png',
	'TM Flying': 'flying-tm.png',
	'TM Psychic': 'psychic-tm.png',
	'TM Bug': 'bug-tm.png',
	'TM Rock': 'rock-tm.png',
	'TM Ghost': 'ghost-tm.png',
	'TM Dragon': 'dragon-tm.png',
	'TM Dark': 'dark-tm.png',
	'TM Steel': 'steel-tm.png',
	'TM Fairy': 'fairy-tm.png',
};

interface DialogConfig {
	title: string;
	spriteUrl?: string;
	dialog?: string;
	borderColor?: string;
	actionsHtml: string;
}

export function refreshGamePage(user: User): void {
	for (const conn of user.connections) {
		if (conn.openPages?.has('pokerogue')) {
			Chat.parse(`/join view-pokerogue`, null, user, conn);
		}
	}
}

function itemURLFormat(item: string): string {
	return item.replaceAll(/[^a-zA-Z0-9\s-]+/g, '').toLowerCase().replaceAll(' ', '-');
}

function typeColor(type: string): string {
	return TYPE_COLORS[type] ?? '68a090';
}

function getContrastColor(hex: string): string {
	const r = parseInt(hex.slice(0, 2), 16);
	const g = parseInt(hex.slice(2, 4), 16);
	const b = parseInt(hex.slice(4, 6), 16);
	const luma = 0.299 * r + 0.587 * g + 0.114 * b;
	return luma > 130 ? '333333' : 'ffffff';
}

function getExpPercentage(mon: PokemonEntry): number {
	if (mon.level >= 9999) return 100;
	const expType = mon.expType ?? 'Medium Fast';
	const expAtCurrent = expForLevel(mon.level, expType);
	const expAtNext = expForLevel(mon.level + 1, expType);
	const range = expAtNext - expAtCurrent;
	return range > 0 ? Math.max(0, Math.min(100, Math.round(((mon.exp - expAtCurrent) / range) * 100))) : 0;
}

function getSprite(species: string, size = 80, shiny = false, className = 'pr-mon-img'): string {
	const id = toID(species);
	const sp = Dex.species.get(id);
	const name = sp.name || species;
	const altName = Utils.escapeHTML(name);
	const rawId = (sp.exists ? (sp.spriteid || id) : id);
	const spriteId = SPRITE_ID_OVERRIDES[id] || SPRITE_ID_OVERRIDES[rawId] || rawId;
	const dir = shiny ? 'home-centered-shiny' : 'home-centered';
	const fallbackDir = shiny ? 'gen5-shiny' : 'gen5';
	const src = `https://play.pokemonshowdown.com/sprites/${dir}/${spriteId}.png`;
	const fallback = `https://play.pokemonshowdown.com/sprites/${fallbackDir}/${spriteId}.png`;
	const onerror = ` onerror="this.onerror=function(){this.style.display='none'};this.src='${fallback}'"`;
	return `<img src="${src}"${onerror} width="${size}" height="${size}" alt="${altName} sprite" class="${className}" style="width:${size}px;height:${size}px" />`;
}

function getShopItemIcon(icon: string, size = 20): string {
	const mintFile = MINT_ICON_MAP[icon];
	if (mintFile) {
		return `<img src="${Utils.escapeHTML(MINT_SPRITE_BASE + mintFile)}" width="${size}" height="${size}" class="pr-shop-icon">`;
	}
	const tmFile = TM_ICON_MAP[icon];
	if (tmFile) {
		return `<img src="${Utils.escapeHTML(TM_SPRITE_BASE + tmFile)}" width="${size}" height="${size}" class="pr-shop-icon">`;
	}
	const url = `https://www.smogon.com/forums/media/minisprites/${itemURLFormat(icon)}.png`;
	return `<img src="${Utils.escapeHTML(url)}" width="${size}" height="${size}" class="pr-shop-icon">`;
}

function getPokeballInfo(speciesId: string, ball?: string): { src: string, alt: string } {
	const BASE = 'https://raw.githubusercontent.com/smogon/sprites/master/src/minisprites/items/';
	if (ball && BALL_MAP[ball]) {
		return { src: BASE + BALL_MAP[ball].srcSuffix, alt: BALL_MAP[ball].alt };
	}
	const sp = Dex.species.get(toID(speciesId));
	if (sp.exists) {
		const bs = sp.baseStats ?? { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
		const bst = bs.hp + bs.atk + bs.def + bs.spa + bs.spd + bs.spe;
		if (bst >= 580) return { src: `${BASE}i2.png`, alt: 'Ultra Ball' };
		if (bst >= 480) return { src: `${BASE}i3.png`, alt: 'Great Ball' };
	}
	return { src: `${BASE}i4.png`, alt: 'Poké Ball' };
}

function getSpriteWithBall(species: string, size = 80, ball?: string, shiny = false): string {
	const ballInfo = getPokeballInfo(species, ball);
	return `<div class="pr-sprite-wrap" style="width:${size}px;height:${size}px;flex-shrink:0;margin:0 auto;">` +
		getSprite(species, size, shiny) +
		`<img src="${ballInfo.src}" alt="${Utils.escapeHTML(ballInfo.alt)}" class="pr-pokeball-overlay" />` +
		`</div>`;
}

function renderTypeBadge(types: string[], large = false): string {
	return types.map(t => {
		const color = typeColor(t);
		const textColor = getContrastColor(color);
		return `<span class="pr-type" style="background:#${color};color:#${textColor};font-size:${large ? '10px' : '9px'}">${t}</span>`;
	}).join('&nbsp;');
}

function renderBaseStatsInline(bs: Record<string, number>): string {
	let buf = '';
	for (const [stat, val] of Object.entries(bs)) {
		buf += `<span>${stat.toUpperCase()} <b>${val}</b></span>`;
	}
	return buf;
}

function renderProgressBarInner(pct: number, fillColorClass = 'pr-bar-fill', extraFillStyle = ''): string {
	return `<div class="pr-bar-track"><div class="${fillColorClass}" style="width:${pct}%;${extraFillStyle}"></div></div>`;
}

function renderBtn(cmd: string | null, label: string, className = 'pr-btn', style = '', disabled = false): string {
	let buf = `<button`;
	if (cmd) buf += ` name="send" value="${cmd}"`;
	if (className) buf += ` class="${className}"`;
	if (style) buf += ` style="${style}"`;
	if (disabled) buf += ` disabled`;
	buf += `>${label}</button>`;
	return buf;
}

function renderChoiceRow(spriteHtml: string, flexHtml: string, actionBtnHtml: string, extraStyle = ''): string {
	return `<div class="pr-choice-row" ${extraStyle ? `style="${extraStyle}"` : ''}>${spriteHtml}<div style="flex:1;min-width:0">${flexHtml}</div>${actionBtnHtml}</div>`;
}

function renderCard(content: string, borderColor: string, extraStyle = ''): string {
	return `<div class="pr-card" style="width: 150px; padding: 12px; text-align:center; border: 2px solid ${borderColor}; border-radius: 8px; background: rgba(0,0,0,0.5); box-shadow: 0 0 8px ${borderColor}40; ${extraStyle}">${content}</div>`;
}

function renderCharacterDialogView(config: DialogConfig): string {
	const border = config.borderColor || '#8ab4f8';
	let buf = `<div style="text-align:center; padding: 40px 10px;">`;
	buf += `<div style="font-size:16px; font-weight:bold; margin-bottom: 6px;">${Utils.escapeHTML(config.title)}</div>`;
	if (config.spriteUrl) {
		buf += `<div style="margin-bottom: 8px;">`;
		buf += `<img src="${Utils.escapeHTML(config.spriteUrl)}" alt="${Utils.escapeHTML(config.title)}" style="width: 96px; height: 96px; display: inline-block;">`;
		buf += `</div>`;
	}
	if (config.dialog) {
		buf += `<div style="background: rgba(0,0,0,0.3); padding: 10px 16px; border-radius: 8px; font-style: italic; max-width: 300px; margin: 0 auto 16px auto; border-left: 4px solid ${border}; font-size: 12px; line-height: 1.4; display: block;">`;
		buf += `"${Utils.escapeHTML(config.dialog)}"`;
		buf += `</div>`;
	}
	buf += `<div>${config.actionsHtml}</div>`;
	buf += `</div>`;
	return buf;
}

function renderNotification(state: PokeRogueState): string {
	if (!state.notification) return '';
	return `<div class="pr-notification">` +
		`<div class="pr-notif-text">${state.notification}</div>` +
		`</div>`;
}

function renderStatBar(state: PokeRogueState, cols2 = false): string {
	const floorStat = cols2 ? '' : `<div class="pr-stat"><div class="pr-stat-label">Floor</div><div class="pr-stat-val">${state.floor}</div></div>`;
	return `<div class="pr-statbar${cols2 ? ' cols2' : ''}">` + floorStat +
		`<div class="pr-stat"><div class="pr-stat-label">Money</div><div class="pr-stat-val">$${state.money ?? 0}</div></div>` +
		`<div class="pr-stat"><div class="pr-stat-label">Record</div><div class="pr-stat-val">Floor ${state.highestFloor ?? 1}</div></div>` +
		`</div>`;
}

function renderHeader(view: string, hasGameOver: boolean): string {
	const titles: Record<string, string> = {
		main: 'PokéRogue', top: 'Ladder',
		resetconfirm: 'Reset run', trainer: 'Encounter!', welcome: 'Welcome',
		victory: 'Victory', stats: 'Pokémon Summary', save: 'Save Game', load: 'Load Game', draft: 'Reward Draft',
	};

	let buf = `<div class="pr-header"><h2>${titles[view] ?? 'PokéRogue'}</h2>`;

	if (view === 'main' && !hasGameOver) {
		buf += `<div style="display:flex;gap:8px;margin-left:auto">`;
		buf += `${renderBtn('/pokerogue view save', 'Save', 'pr-btn', 'font-size:11px;padding:5px 10px')}`;
		buf += `&nbsp;&nbsp;`;
		buf += `${renderBtn('/pokerogue view load', 'Load', 'pr-btn', 'font-size:11px;padding:5px 10px')}`;
		buf += `&nbsp;&nbsp;`;
		buf += `${renderBtn('/pokerogue view top', 'Ladder', 'pr-btn', 'font-size:11px;padding:5px 10px')}`;
		buf += `&nbsp;&nbsp;`;
		buf += `${renderBtn('/pokerogue view resetconfirm', 'Reset', 'pr-btn danger', 'font-size:11px;padding:5px 10px')}`;
		buf += `</div>`;
	} else if (view !== 'main' && view !== 'trainer' && view !== 'welcome' && !hasGameOver) {
		buf += renderBtn('/pokerogue view main', '← Back', 'pr-btn', 'font-size:11px;padding:5px 10px');
	}
	return buf + `</div>`;
}

function renderMoveList(moves: string[]): string {
	if (!moves.length) return '';
	const pills = moves.map(m => {
		const dexMove = Dex.moves.get(m);
		const moveName = dexMove.name || m;
		const moveType = dexMove.type || 'Normal';
		const color = typeColor(moveType);
		const textColor = getContrastColor(color);
		return `<span class="pr-move-pill" style="background:#${color};color:#${textColor}">${Utils.escapeHTML(moveName)}</span>`;
	}).join('');
	return `<div class="pr-move-list">${pills}</div>`;
}

function renderHpBar(mon: PokemonEntry): string {
	const hpPct = mon.currentHp ?? 100;
	const color = hpPct > 50 ? '#4caf50' : hpPct > 25 ? '#ff9800' : '#f44336';
	return `<div class="pr-bar-row">` +
		renderProgressBarInner(hpPct, 'pr-bar-fill', `background:${color}`) +
		`<span class="pr-bar-label">${hpPct}% HP</span>` +
		`</div>`;
}

function renderTeamTableRow(mon: PokemonEntry, actionButton?: string, genNumber = 9, statsButton?: string): string {
	const spData = Dex.species.get(toID(mon.species));
	const expNeeded = mon.level < 9999 ? expForLevel(mon.level + 1) - mon.exp : 0;

	const abilities = spData.abilities as Record<string, string>;
	const abilityId = mon.ability || abilities['0'] || '';
	const ability = abilityId ? (Dex.abilities.get(abilityId).name || abilityId) : '';
	let nature = mon.nature;
	if (!nature) {
		const natures = Dex.natures.all().map(n => n.name);
		const natIdx = spData.id.length % natures.length;
		nature = natures[natIdx] ?? 'Hardy';
	}

	const bs = spData.baseStats ?? { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
	const moves: string[] = mon.moves?.length ? mon.moves : getLevelUpMoves(toID(mon.species), mon.level, genNumber);

	let buf = `<tr class="pr-team-row">`;

	buf += `<td class="pr-td-icon" style="vertical-align:top;padding-top:10px">`;
	buf += getSpriteWithBall(mon.species, 44, mon.ball, mon.shiny);
	if (statsButton) buf += statsButton;
	buf += `</td>`;

	buf += `<td class="pr-td-team-main">`;

	buf += `<div class="pr-td-name" style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">`;
	buf += `${spData.name} &nbsp;&nbsp;&nbsp;<span class="pr-mon-lv">Lv. ${mon.level}</span></div>`;
	buf += `<div class="pr-types">${renderTypeBadge(spData.types ?? [])}</div>`;

	if (mon.heldItem) {
		const dexHeld = Dex.items.get(mon.heldItem);
		buf += `<div class="pr-item-tag">${Utils.escapeHTML(dexHeld.name || mon.heldItem)}</div>`;
	}

	if (mon.status) {
		buf += `<div style="font-size:9px;color:#ff9800;font-weight:500;margin-top:2px">${mon.status.toUpperCase()}</div>`;
	}

	if (nature) buf += `<div class="pr-ct-ability" style="margin-top:4px">Nature: <b>${Utils.escapeHTML(nature)}</b></div>`;
	if (ability) buf += `<div class="pr-ct-ability" style="margin-top:4px">Ability: <b>${Utils.escapeHTML(ability)}</b></div>`;

	buf += `<div class="pr-ct-stats" style="margin-top:4px">${renderBaseStatsInline(bs)}</div>`;

	if (moves.length) buf += renderMoveList(moves);

	const expPct = getExpPercentage(mon);
	buf += `<div class="pr-bars" style="margin-top:6px">${renderHpBar(mon)}<div class="pr-bar-row">`;
	buf += renderProgressBarInner(expPct, 'pr-expbar-fill');
	if (mon.level < 9999) {
		buf += `<span class="pr-bar-label" style="min-width:36px;font-size:8px">${expNeeded} to Lv</span>`;
	}
	buf += `</div></div></td>`;

	if (actionButton !== undefined) {
		buf += `<td class="pr-td-action" style="vertical-align:top;padding-top:10px">${actionButton}</td>`;
	}

	buf += `</tr>`;
	return buf;
}

function renderDraftView(state: PokeRogueState): string {
	const currentMoney = state.money || 0;
	const rerollCost = getRerollCost(state.floor, state.rerollCount || 0);
	const canReroll = currentMoney >= rerollCost;

	const tierColors: Record<string, string> = {
		'Common': '#b0b0b0',
		'Great': '#3b82f6', // Blue
		'Ultra': '#eab308', // Yellow
		'Rogue': '#ef4444', // Red
		'Master': '#a855f7', // Purple
	};

	let buf = `<div style="text-align:center; padding: 10px;">`;
	buf += `<h2 style="color:#fac000; margin-bottom: 4px;">Wave Cleared!</h2>`;
	buf += `<div style="font-size:14px; font-weight:bold; margin-bottom: 16px;">Current Money: <span style="color:#4caf50">$${currentMoney}</span></div>`;

	// --- Reward Draft Table ---
	buf += `<div class="pr-section-title" style="text-align:left;">Reward Draft</div>`;
	buf += `<div class="pr-table-container" style="margin-bottom: 16px;"><table class="pr-table" style="width:100%; border-collapse:collapse; font-size:11px; line-height:1.2;">`;
	buf += `<tbody>`;

	for (let i = 0; i < (state.pendingRewardDraft?.length || 0); i++) {
		const itemKey = state.pendingRewardDraft![i];
		const item = SHOP_ITEMS[itemKey];
		const rowColor = tierColors[item.tier] || '#b0b0b0';

		buf += `<tr style="border-bottom:1px solid rgba(150,150,150,0.1);">`;
		buf += `<td class="pr-td-icon" style="padding:4px; width:18px;">${getShopItemIcon(item.icon, 16)}</td>`;
		buf += `<td class="pr-td-name" style="padding:4px; font-weight:bold; color:${rowColor}; white-space:nowrap;">${Utils.escapeHTML(item.name)}</td>`;
		buf += `<td class="pr-td-desc" style="padding:4px; font-size:10px; text-align:left;">${Utils.escapeHTML(item.desc)}</td>`;
		buf += `<td class="pr-td-action" style="padding:4px; text-align:right;">`;
		buf += renderBtn(`/pokerogue draft ${i + 1}`, 'Take', 'pr-pick-btn', 'padding:2px 6px; font-size:10px; min-width:45px;');
		buf += `</td></tr>`;
	}

	buf += `</tbody></table></div>`;

	// --- Reroll & Skip Actions ---
	buf += `<div style="text-align:center; margin-bottom:20px;">`;
	buf += renderBtn(canReroll ? '/pokerogue reroll' : null, `Reroll ($${rerollCost})`, `pr-btn ${canReroll ? 'primary' : ''}`, 'font-size:11px;padding:5px 10px', !canReroll);
	buf += `&nbsp;&nbsp;`;
	buf += renderBtn('/pokerogue draft skip', 'Skip', 'pr-btn primary', 'font-size:11px;padding:5px 10px');
	buf += `</div>`;

	// --- Rotational Shop Table ---
	buf += `<div class="pr-section-title" style="text-align:left;">Shop</div>`;
	buf += `<div class="pr-table-container"><table class="pr-table" style="width:100%; border-collapse:collapse; font-size:11px; line-height:1.2;">`;
	buf += `<tbody>`;

	const shopItems = Object.entries(SHOP_ITEMS)
		.filter(([, item]) => item.isShopItem && state.floor >= (item.minFloor || 1))
		.sort((a, b) => (a[1].minFloor || 1) - (b[1].minFloor || 1));

	for (const [key, item] of shopItems) {
		const price = getItemPrice(state.floor, item.moneyMultiplier);
		const canBuy = currentMoney >= price;

		buf += `<tr style="border-bottom:1px solid rgba(150,150,150,0.1);">`;
		buf += `<td class="pr-td-icon" style="padding:4px; width:18px;">${getShopItemIcon(item.icon, 16)}</td>`;
		buf += `<td class="pr-td-name" style="padding:4px; font-weight:500; white-space:nowrap;">${Utils.escapeHTML(item.name)}</td>`;
		buf += `<td class="pr-td-desc" style="padding:4px; font-size:10px; text-align:left;">${Utils.escapeHTML(item.desc)}</td>`;
		buf += `<td class="pr-td-cost" style="padding:4px; white-space:nowrap; color:#fac000;">$${price}</td>`;
		buf += `<td class="pr-td-action" style="padding:4px; text-align:right;">`;
		buf += renderBtn(canBuy ? `/pokerogue buyshop ${key}` : null, canBuy ? 'Buy' : 'Need $', 'pr-shop-buy', 'padding:2px 6px; font-size:10px; min-width:45px;', !canBuy);
		buf += `</td></tr>`;
	}

	buf += `</tbody></table></div></div>`;
	return buf;
}

function renderPendingChoice(state: PokeRogueState): string {
	let buf = `<h2 class="pr-choice-heading">Choose your starter!</h2><div class="pr-choice-grid">`;
	const natures = Dex.natures.all().map(n => n.name);

	for (let i = 0; i < state.pendingChoice!.length; i++) {
		const sp = Dex.species.get(toID(state.pendingChoice![i]));
		const bs = sp.baseStats ?? { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
		const abilities = sp.abilities ?? {};
		const ability = (abilities as unknown as Record<string, string>)['0'] || 'Unknown';
		const hash = ((state.floor ?? 1) * 37) + (i * 13) + sp.id.length;
		const nature = natures[hash % natures.length] ?? 'Hardy';
		const genNumber = MODE_CONFIGS[state.gameMode]?.generation || 9;
		const displayMoves = getLevelUpMoves(sp.id, 5, genNumber);

		let flexHtml = `<div class="pr-ct-name" style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">${sp.name}</div>`;
		flexHtml += `<div class="pr-types">${renderTypeBadge(sp.types ?? [])}</div><div class="pr-ct-stats">${renderBaseStatsInline(bs)}</div>`;
		flexHtml += `<div class="pr-ct-ability" style="margin-top:2px">Nature: <b>${Utils.escapeHTML(nature)}</b></div>`;
		flexHtml += `<div class="pr-ct-ability" style="margin-top:2px">Ability: <b>${Utils.escapeHTML(ability)}</b></div>`;
		if (displayMoves.length) flexHtml += renderMoveList(displayMoves);

		buf += renderChoiceRow(getSpriteWithBall(sp.id, 52), flexHtml, renderBtn(`/pokerogue choose ${i + 1}`, 'Pick', 'pr-pick-btn'));
	}

	return buf + `</div>`;
}

function renderStarterSelectionView(state: PokeRogueState, user: User): string {
	const pending = state.pendingChoice || [];
	const userData = getUserData(user.id);
	const unlockedCount = Object.keys(userData.starters || {}).length;
	const search = ((state as any).starterSearch || '').toLowerCase().trim();

	const filtered = search.length > 0 ?
		pending.filter(sid => {
			const sp = Dex.species.get(toID(sid));
			const saved = userData.starters[toID(sid)];

			if (search === 'shiny') return !!saved?.shiny;

			const types = (sp.types ?? []).map(t => t.toLowerCase());
			if (types.includes(search)) return true;

			return sp.name.toLowerCase().includes(search) || toID(sid).includes(search);
		}) :
		pending;

	let buf = `<h2 class="pr-choice-heading">Choose your starter!</h2>`;
	buf += `<div style="text-align:center;font-size:11px;margin:-6px 0 12px">`;
	buf += `Unlocked starters: <b>${unlockedCount}</b>`;
	buf += `</div>`;

	buf += `<form data-submitsend="/pokerogue startersearch {data}" style="text-align:center;margin-bottom:12px">`;
	buf += `<input name="data" value="${Utils.escapeHTML(search)}" placeholder="Name, type, or 'shiny'..." ` +
		`style="padding:5px 10px;border-radius:6px;border:1px solid rgba(150,150,150,0.4);background:rgba(0,0,0,0.2);color:inherit;font-size:12px;width:180px;" />`;
	buf += `&nbsp;&nbsp;<button type="submit" class="pr-btn" style="font-size:11px;padding:5px 10px;">Search</button>`;
	if (search) {
		buf += `&nbsp;&nbsp;` + renderBtn('/pokerogue startersearch', 'Clear', 'pr-btn', 'font-size:11px;padding:5px 10px');
	}
	buf += `</form>`;

	if (filtered.length === 0) {
		buf += `<div style="text-align:center;padding:16px;color:#888;">No Pokémon found for "<b>${Utils.escapeHTML(search)}</b>".</div>`;
		return buf;
	}

	buf += `<table style="width:100%;border-collapse:collapse;table-layout:fixed;"><tbody>`;

	const COLS = 4;
	for (let i = 0; i < filtered.length; i += COLS) {
		buf += `<tr>`;
		for (let j = i; j < i + COLS; j++) {
			buf += `<td style="width:25%;text-align:center;padding:4px 2px;vertical-align:top;">`;
			if (j < filtered.length) {
				const sid = toID(filtered[j]);
				const sp = Dex.species.get(sid);
				if (sp.exists) {
					const saved = userData.starters[sid];
					const isShiny = !!saved?.shiny;
					const originalIndex = pending.indexOf(filtered[j]);
					buf += `<div style="font-size:9px;margin:2px 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">`;
					buf += Utils.escapeHTML(sp.name);
					if (isShiny) buf += ` <span style="color:#fda085">★</span>`;
					buf += `</div>`;
					buf += getSprite(sp.id, 40, isShiny);
					buf += `<button name="send" value="/pokerogue choose ${originalIndex + 1}" class="pr-btn" style="width:90%;padding:2px 0;font-size:10px;">Select</button>`;
				}
			}
			buf += `</td>`;
		}
		buf += `</tr>`;
	}

	buf += `</tbody></table>`;
	return buf;
}

function renderPendingSwap(state: PokeRogueState): string {
	const sp = Dex.species.get(toID(state.pendingSwap!.species));
	let buf = `<h2 class="pr-choice-heading">Team is full!</h2><div style="text-align:center;margin-bottom:10px">`;
	buf += `${getSpriteWithBall(sp.id, 64, state.pendingSwap!.ball)}<div style="font-size:12px;color:#aaa;margin-top:6px"><b>Lv. ${state.pendingSwap!.level} ${sp.name}</b> wants to join. Replace a Pokémon:</div></div><div class="pr-choice-grid">`;

	for (let i = 0; i < state.team.length; i++) {
		const mon = state.team[i];
		const spName = Dex.species.get(toID(mon.species)).name;
		const flexHtml = `<span style="font-size:12px;font-weight:500">${spName}</span> <span style="font-size:10px;color:#888">Lv. ${mon.level}</span>`;
		buf += renderChoiceRow(getSpriteWithBall(mon.species, 40, mon.ball), flexHtml, renderBtn(`/pokerogue resolve swapmon ${i + 1}`, 'Replace', 'pr-pick-btn'), 'cursor:pointer');
	}

	buf += renderBtn('/pokerogue resolve swapmon skip', `Release ${sp.name}`, 'pr-btn', 'width:100%;padding:8px;margin-top:2px') + `</div>`;
	return buf;
}

function renderPendingMoves(state: PokeRogueState): string {
	const pending = state.pendingMoves![0];
	const mon = state.team[pending.pokemonIndex];
	const sp = Dex.species.get(toID(mon.species));
	const newMove = Dex.moves.get(pending.move);
	const newMoveColor = '#' + typeColor(newMove.type || 'Normal');
	const newMoveCatIcon = newMove.category === 'Physical' ? '⚔' : newMove.category === 'Special' ? '◆' : '●';
	const newMoveMaxPp = Math.floor((newMove.pp || 5) * (8 / 5));

	let buf = `<h2 class="pr-choice-heading">New move!</h2>`;
	buf += `<div style="text-align:center;margin-bottom:10px">${getSpriteWithBall(sp.id, 60, mon.ball)}`;
	buf += `<div style="font-size:12px;color:#aaa;margin-top:6px"><b>${sp.name}</b> wants to learn:</div></div>`;

	buf += `<div class="pr-sv-move" style="border-left:3px solid ${newMoveColor};margin-bottom:14px;background:rgba(138,180,248,0.08)">`;
	buf += `<div class="pr-sv-move-top">`;
	buf += `<b class="pr-sv-move-name" style="color:#c4a8ff">${Utils.escapeHTML(newMove.name)}</b>`;
	buf += `<span class="pr-type" style="background:${newMoveColor};color:#fff;font-size:9px">${newMove.type}</span>`;
	buf += `</div>`;
	buf += `<div class="pr-sv-move-meta">${newMoveCatIcon} ${newMove.category} &nbsp;·&nbsp; Pwr: <b>${newMove.basePower || '—'}</b> &nbsp;·&nbsp; Acc: <b>${newMove.accuracy === true ? '—' : (newMove.accuracy || '—')}</b> &nbsp;·&nbsp; Pri: <b>${newMove.priority > 0 ? `+${newMove.priority}` : newMove.priority}</b> &nbsp;·&nbsp; PP: <b>${newMoveMaxPp}</b></div>`;
	if (newMove.shortDesc || newMove.desc) buf += `<div class="pr-sv-subdesc" style="margin-top:3px">${Utils.escapeHTML(newMove.shortDesc || newMove.desc)}</div>`;
	buf += `</div>`;

	buf += `<div style="font-size:11px;color:#aaa;margin-bottom:6px">Choose a move to forget:</div>`;

	for (let i = 0; i < mon.moves.length; i++) {
		const oldMove = Dex.moves.get(mon.moves[i]);
		const maxPp = Math.floor((oldMove.pp || 5) * (8 / 5));
		const curPp = maxPp;
		const mColor = '#' + typeColor(oldMove.type || 'Normal');
		const catIcon = oldMove.category === 'Physical' ? '⚔' : oldMove.category === 'Special' ? '◆' : '●';
		const moveDesc = oldMove.shortDesc || oldMove.desc || '';

		buf += `<div style="display:flex;align-items:stretch;gap:6px;margin-bottom:6px">`;
		buf += `<div class="pr-sv-move" style="border-left:3px solid ${mColor};flex:1;margin-bottom:0">`;
		buf += `<div class="pr-sv-move-top">`;
		buf += `<b class="pr-sv-move-name">${Utils.escapeHTML(oldMove.name)}</b>`;
		buf += `<span class="pr-type" style="background:${mColor};color:#fff;font-size:9px">${oldMove.type}</span>`;
		buf += `</div>`;
		buf += `<div class="pr-sv-move-meta">${catIcon} ${oldMove.category} &nbsp;·&nbsp; Pwr: <b>${oldMove.basePower || '—'}</b> &nbsp;·&nbsp; Acc: <b>${oldMove.accuracy === true ? '—' : (oldMove.accuracy || '—')}</b> &nbsp;·&nbsp; Pri: <b>${oldMove.priority > 0 ? `+${oldMove.priority}` : oldMove.priority}</b> &nbsp;·&nbsp; PP: <b>${curPp}/${maxPp}</b></div>`;
		if (moveDesc) buf += `<div class="pr-sv-subdesc" style="margin-top:3px">${Utils.escapeHTML(moveDesc)}</div>`;
		buf += `</div>`;
		buf += `<div style="display:flex;gap:8px;margin-left:auto">`;
		buf += renderBtn(`/pokerogue resolve learnmove ${i + 1}`, 'Forget', 'pr-pick-btn');
		buf += `</div>`;
		buf += `</div>`;
	}

	buf += renderBtn('/pokerogue resolve learnmove skip', 'Keep old moves', 'pr-btn', 'width:100%;padding:8px;margin-top:2px');
	return buf;
}

function renderItemOptions(state: PokeRogueState): string {
	let buf = `<h2 class="pr-choice-heading">Choose an item!</h2><div class="pr-choice-grid">`;
	for (const itemName of state.itemOptions!) {
		const dexItem = Dex.items.get(itemName);
		const flexHtml = `<div style="display:flex;align-items:center;gap:8px">${getShopItemIcon(itemURLFormat(itemName), 24)}<span style="font-size:13px;font-weight:500">${Utils.escapeHTML(dexItem.name || itemName)}</span></div>`;
		buf += renderChoiceRow('', flexHtml, renderBtn(`/pokerogue resolve pickitem ${toID(itemName)}`, 'Pick', 'pr-pick-btn'), 'justify-content:space-between');
	}
	buf += renderBtn('/pokerogue resolve pickitem skip', 'Skip', 'pr-btn', 'width:100%;padding:8px;margin-top:2px') + `</div>`;
	return buf;
}

function renderGiveItem(state: PokeRogueState): string {
	const dexItem = Dex.items.get(state.pendingItemName);
	const pendingItemId = toID(state.pendingItemName);

	let actionVerb = 'Give';
	if (state.pendingItemIsEvo) actionVerb = 'Evolve';
	if (state.pendingItemIsMega) actionVerb = 'Mega Evolve';

	let buf = `<h2 class="pr-choice-heading">${actionVerb} ${Utils.escapeHTML(dexItem.name || state.pendingItemName!)}?</h2>`;
	buf += `<div style="font-size:12px;color:#aaa;margin-bottom:8px">Choose a Pokémon:</div><div class="pr-choice-grid">`;

	for (let i = 0; i < state.team.length; i++) {
		const mon = state.team[i];
		const dexSpecies = Dex.species.get(toID(mon.species));
		const spName = dexSpecies.name;

		let isCompatible = true;
		let reason = '';

		if (state.pendingItemIsEvo) {
			isCompatible = false;
			const evoList = dexSpecies.evos;

			if (evoList) {
				for (const newEvo of evoList) {
					const evoData = Dex.species.get(newEvo);
					const evoItemId = toID(evoData.evoItem);

					const isUseItemEvolution = evoData.evoType === 'useItem' && evoItemId === pendingItemId;
					const isHeldTradeEvolution = evoData.evoType === 'trade' && evoItemId === pendingItemId;
					const isPlainTradeEvolution = evoData.evoType === 'trade' && !evoItemId && pendingItemId === 'linkingcord';

					if (isUseItemEvolution || isHeldTradeEvolution || isPlainTradeEvolution) {
						isCompatible = true;
						break;
					}
				}
			}
			if (!isCompatible) reason = 'Incompatible';
		} else if (state.pendingItemIsMega) {
			isCompatible = false;
			if (dexItem.megaEvolves && toID(dexItem.megaEvolves) === toID(mon.species)) {
				isCompatible = true;
			}
			if (!isCompatible) reason = 'Incompatible';
		}

		let flexHtml = `<span style="font-size:12px;font-weight:500">${spName}</span> <span style="font-size:10px;color:#888">Lv. ${mon.level}${reason ? ` <span style="color:#f87171">(${reason})</span>` : ''}</span>`;

		if (mon.heldItem) flexHtml += `<div style="font-size:9px;color:#8ab4f8">Holds: ${Utils.escapeHTML(Dex.items.get(mon.heldItem).name || mon.heldItem)}</div>`;

		if ((state.pendingItemIsEvo || state.pendingItemIsMega) && isCompatible) {
			flexHtml += `<div style="font-size:10px;color:#4caf50;font-weight:bold;margin-top:2px;letter-spacing:0.5px;">ABLE!</div>`;
		}

		const btnHtml = isCompatible ? renderBtn(`/pokerogue resolve giveitem ${i + 1}`, actionVerb, 'pr-pick-btn') : '';

		buf += renderChoiceRow(getSpriteWithBall(mon.species, 40, mon.ball), flexHtml, btnHtml, isCompatible ? '' : 'opacity:.4;filter:grayscale(80%);');
	}

	buf += renderBtn('/pokerogue resolve giveitem skip', 'Cancel <small style="color:#888">(refund)</small>', 'pr-btn', 'width:100%;padding:8px;margin-top:2px') + `</div>`;
	return buf;
}

function renderConsumable(state: PokeRogueState): string {
	const activeShop = MODE_REGISTRY[state.gameMode]?.shop || SHOP_ITEMS;
	const consumableItem = activeShop[state.purchasedItem!];
	const consumableType = state.pendingConsumableType!;

	let buf = `<h2 class="pr-choice-heading">Use ${Utils.escapeHTML(consumableItem?.name ?? state.purchasedItem!)}?</h2>`;
	buf += `<div style="font-size:12px;color:#aaa;margin-bottom:8px">Choose a Pokémon:</div><div class="pr-choice-grid">`;

	for (let i = 0; i < state.team.length; i++) {
		const mon = state.team[i];
		const hp = mon.currentHp ?? 100;
		let disabled = false, reason = '';

		switch (consumableType) {
		case 'healHP':
			disabled = hp >= 100 || hp <= 0;
			reason = hp <= 0 ? 'fainted' : hp >= 100 ? 'full HP' : '';
			break;
		case 'revive':
			disabled = hp > 0;
			reason = hp > 0 ? 'not fainted' : '';
			break;
		case 'cureStatus':
			disabled = !mon.status || hp <= 0;
			reason = hp <= 0 ? 'fainted' : !mon.status ? 'no status' : '';
			break;
		case 'vitamin':
			const evStat = (consumableItem)?.evStat as string | undefined;
			if (!evStat) { disabled = true; reason = 'invalid'; break; }
			if (!mon.evs) mon.evs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 } as any;
			const totalEvs = Object.values(mon.evs as Record<string, number>).reduce((a, b) => a + b, 0);
			const statEv = (mon.evs as any)[evStat] ?? 0;
			disabled = hp <= 0 || totalEvs >= 508 || statEv >= 252;
			reason = hp <= 0 ? 'fainted' : totalEvs >= 508 ? 'EVs full' : statEv >= 252 ? `${evStat} maxed` : '';
			break;
		case 'tm': {
			const moveId = state.purchasedItem!.includes('_') ?
				state.purchasedItem!.substring(state.purchasedItem!.indexOf('_') + 1).replace(/[^a-z0-9]/g, '') :
				toID(consumableItem!.name.replace(/^TM\d+\s*/i, ''));

			const moveData = Dex.moves.get(moveId);
			if (!moveData.exists) { disabled = true; reason = 'invalid TM'; break; }
			if (hp <= 0) { disabled = true; reason = 'fainted'; break; }
			if (mon.moves.includes(moveData.id)) { disabled = true; reason = 'already knows'; break; }

			let canLearn = false;
			let spData = Dex.species.get(mon.species);

			while (spData && !canLearn) {
				const learnsetData = Dex.species.getLearnsetData(spData.id)?.learnset;
				if (learnsetData?.[moveData.id]) canLearn = true;

				if (spData.prevo) {
					spData = Dex.species.get(spData.prevo);
				} else if (spData.baseSpecies && toID(spData.baseSpecies) !== spData.id) {
					spData = Dex.species.get(spData.baseSpecies);
				} else {
					break;
				}
			}

			if (!canLearn) { disabled = true; reason = 'incompatible'; }
			break;
		}
		case 'mint': {
			if (hp <= 0) { disabled = true; reason = 'fainted'; break; }
			break;
		}
		case 'rareCandy': {
			if (hp <= 0) { disabled = true; reason = 'fainted'; break; }
			break;
		}
		}

		let flexHtml = `<span style="font-size:12px;font-weight:500">${Dex.species.get(toID(mon.species)).name}</span> <span style="font-size:10px;color:#888">Lv. ${mon.level}${reason ? ` (${reason})` : ''}</span>`;
		if (mon.status) flexHtml += `<div style="font-size:9px;color:#ff9800">${mon.status.toUpperCase()}</div>`;
		if (hp < 100 && hp > 0) flexHtml += `<div style="font-size:9px;color:#aaa">${hp}% HP</div>`;

		if (consumableType === 'vitamin' && mon.evs) {
			const evStat = (consumableItem)?.evStat as string;
			const statLabel: Record<string, string> = { hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe' };
			const totalEvs = Object.values(mon.evs as Record<string, number>).reduce((a, b) => a + b, 0);
			flexHtml += `<div style="font-size:9px;">${statLabel[evStat] ?? evStat} EVs: ${(mon.evs as any)[evStat] ?? 0}/252 &nbsp;·&nbsp; Total: ${totalEvs}/508</div>`;
		}

		if ((consumableType === 'tm' || consumableType === 'mint') && !disabled) {
			flexHtml += `<div style="font-size:9px;color:#8ab4f8">Compatible!</div>`;
		}

		const btnHtml = disabled ? '' : renderBtn(`/pokerogue resolve useshopitem ${i + 1}`, 'Use', 'pr-pick-btn');
		buf += renderChoiceRow(getSpriteWithBall(mon.species, 40, mon.ball), flexHtml, btnHtml, disabled ? 'opacity:.45' : '');
	}

	buf += renderBtn('/pokerogue resolve useshopitem skip', 'Cancel', 'pr-btn', 'width:100%;padding:8px;margin-top:2px') + `</div>`;
	return buf;
}

function renderMoveMon(state: PokeRogueState): string {
	const fromIdx = state.pendingMoveSlot!;
	const mon = state.team[fromIdx];
	const spName = Dex.species.get(toID(mon.species)).name;

	let buf = `<h2 class="pr-choice-heading">Move ${spName}?</h2>`;
	buf += `<div style="font-size:12px;color:#aaa;margin-bottom:8px">Choose a slot to swap with:</div><div class="pr-choice-grid">`;

	for (let i = 0; i < state.team.length; i++) {
		const targetMon = state.team[i];
		const disabled = i === fromIdx;
		const targetSpName = Dex.species.get(toID(targetMon.species)).name;
		const flexHtml = `<span style="font-size:12px;font-weight:500">${targetSpName}</span> <span style="font-size:10px;color:#888">Lv. ${targetMon.level}</span>`;
		const btnHtml = disabled ? '' : renderBtn(`/pokerogue movemon confirm ${i + 1}`, 'Swap', 'pr-pick-btn');
		buf += renderChoiceRow(getSpriteWithBall(targetMon.species, 40, targetMon.ball), flexHtml, btnHtml, disabled ? 'opacity:.45' : '');
	}

	buf += renderBtn('/pokerogue movemon cancel', 'Cancel', 'pr-btn', 'width:100%;padding:8px;margin-top:2px');
	return buf + `</div>`;
}

function renderReleaseMon(state: PokeRogueState): string {
	const mon = state.team[state.pendingReleaseSlot!];
	const spName = Dex.species.get(toID(mon.species)).name;

	let buf = `<h2 class="pr-choice-heading" style="color:#ef4444">Release ${spName}?</h2>`;
	buf += `<div style="text-align:center;margin-bottom:10px">${getSpriteWithBall(mon.species, 64, mon.ball)}`;
	buf += `<div style="font-size:12px;color:#aaa;margin-top:6px">Are you sure you want to release <b>Lv. ${mon.level} ${spName}</b>?<br>This action cannot be undone!</div>`;

	if (mon.heldItem) {
		const itemName = Dex.items.get(mon.heldItem).name;
		buf += `<div style="font-size:11px;color:#ff9800;margin-top:6px;font-weight:500;">Warning: It is holding ${Utils.escapeHTML(itemName)} which will be permanently lost!</div>`;
	}

	buf += `</div><center>`;
	buf += renderBtn('/pokerogue releasemon confirm', 'Yes, release it', 'pr-btn danger', 'padding:10px 20px') + `&nbsp;&nbsp;&nbsp;`;
	buf += renderBtn('/pokerogue releasemon cancel', 'Cancel', 'pr-btn', 'padding:10px 20px') + `</center>`;

	return buf;
}

function renderTrainerIntroView(state: PokeRogueState): string {
	const trainerName = state.pendingTrainer!;
	const lookupKey = state.pendingTrainerKey || state.floor.toString();
	const modeData = MODE_REGISTRY[state.gameMode] || MODE_REGISTRY['classic'];
	const trainerData = modeData.trainers?.[lookupKey]?.[trainerName];

	return renderCharacterDialogView({
		title: trainerName,
		spriteUrl: trainerData?.spriteUrl,
		dialog: trainerData?.dialog,
		actionsHtml: renderBtn('/pokerogue battle', 'Start Battle', 'pr-btn primary', 'font-size:11px;padding:5px 10px'),
	});
}

function renderWelcomeView(): string {
	const MODE_LABELS: Record<string, string> = {
		classic: 'Classic',
		random: 'Random',
		endless: 'Endless',
		gen1: 'Gen 1',
	};

	let actionsHtml = '';
	for (const mode of Object.keys(MODE_CONFIGS)) {
		const label = MODE_LABELS[mode] || mode.charAt(0).toUpperCase() + mode.slice(1);
		actionsHtml += renderBtn(`/pokerogue newgame ${mode}`, label, 'pr-btn primary', 'font-size:11px;padding:5px 10px') + `&nbsp;&nbsp;`;
	}

	return renderCharacterDialogView({
		title: 'Drunk Professor Oak',
		spriteUrl: 'https://play.pokemonshowdown.com/sprites/trainers/oak.png',
		dialog: 'PokèRogue is currently in Beta. Features may change, bugs may occur, and balancing updates will happen frequently. Your feedback helps shape the future of the game!',
		actionsHtml,
	});
}

function renderVictoryView(state: PokeRogueState): string {
	const config = MODE_CONFIGS[state.gameMode] || MODE_CONFIGS['classic'];
	const vc = config.victoryConfig ?? {};

	const name = vc.name ?? 'Professor Oak';
	const spriteUrl = vc.spriteUrl ?? 'https://play.pokemonshowdown.com/sprites/trainers/oak.png';
	const dialog = vc.dialog ?? `Congratulations! You've completed the run and cleared Floor ${state.lastRunFloor ?? config.maxFloor}! Your journey was truly remarkable. The Pokémon world thanks you!`;

	return renderCharacterDialogView({
		title: name,
		spriteUrl,
		dialog,
		borderColor: '#fac000',
		actionsHtml: renderBtn('/pokerogue view welcome', 'Continue', 'pr-btn primary', 'font-size:11px;padding:5px 10px'),
	});
}

// ============================================================================
// View-Model Builders
// ============================================================================

interface StatsViewModel {
	mon: PokemonEntry;
	spData: any;
	showAbilityArrows: boolean;
	showNatureArrows: boolean;
	natureName: string;
	naturePlus: string | null;
	natureMinus: string | null;
	abilityName: string;
	abilityDesc: string;
	bs: Record<string, number>;
	ivs: Record<string, number>;
	evs: Record<string, number>;
	stats: Record<string, number>;
	maxStats: Record<string, number>;
	totalEvs: number;
	hpPct: number;
	hpColor: string;
	dateStr: string;
	heldItem: any | null;
	genderHtml: string;
	statusHtml: string;
	statKeys: string[];
	statLabels: Record<string, string>;
	statColors: Record<string, string>;
	tabNames: string[];
	prevTab: number;
	nextTab: number;
	teamNav: { isMe: boolean, slot: number, name: string }[];
}

function buildStatsViewModel(state: PokeRogueState, user: User, slot: number, activeTab: number): StatsViewModel {
	const mon = state.team[slot];
	const spData = Dex.species.get(toID(mon.species));

	let showAbilityArrows = false;
	let showNatureArrows = false;

	if (state.isConfiguringStarter && slot === 0) {
		const userData = getUserData(user.id);
		let baseSpecies = toID(mon.species);
		while (true) {
			const sp = Dex.species.get(baseSpecies);
			if (!sp.prevo) break;
			baseSpecies = toID(sp.prevo);
		}
		const starterData = userData.starters[baseSpecies];
		if (starterData) {
			if ((starterData.unlockedAbilities?.length || 0) > 1) showAbilityArrows = true;
			if ((starterData.unlockedNatures?.length || 0) > 1) showNatureArrows = true;
		}
	}

	const natureName = mon.nature || 'Hardy';
	const nature = Dex.natures.get(natureName) ?? Dex.natures.get('Hardy');
	const naturePlus = nature?.plus ?? null;
	const natureMinus = nature?.minus ?? null;

	const abilities = spData.abilities as Record<string, string>;
	const rawAbility = mon.ability || abilities['0'] || '';
	const abilityDex = rawAbility ? Dex.abilities.get(rawAbility) : null;
	const abilityName = abilityDex?.name || rawAbility || 'Unknown';
	const abilityDesc = abilityDex?.shortDesc || abilityDex?.desc || '';

	const bs = spData.baseStats ?? { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
	const ivs = mon.ivs || { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
	const evs = mon.evs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
	const statKeys = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
	const statLabels: Record<string, string> = { hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SPA', spd: 'SPD', spe: 'SPE' };
	const statColors: Record<string, string> = { hp: '#FF5959', atk: '#F5AC78', def: '#FAE078', spa: '#9DB7F5', spd: '#A7DB8D', spe: '#FA92B2' };

	const stats: Record<string, number> = {};
	for (const stat of statKeys) {
		if (stat === 'hp') {
			stats.hp = Math.floor((2 * bs.hp + ivs.hp + Math.floor((evs as any)[stat] / 4)) * mon.level / 100) + mon.level + 10;
		} else {
			let val = Math.floor((2 * bs[stat] + ivs[stat] + Math.floor((evs as any)[stat] / 4)) * mon.level / 100) + 5;
			if (naturePlus === stat) val = Math.floor(val * 1.1);
			if (natureMinus === stat) val = Math.floor(val * 0.9);
			stats[stat] = val;
		}
	}
	if (spData.id === 'shedinja') stats.hp = 1;

	const maxStatLevel = MODE_CONFIGS[state.gameMode]?.maxLevel ?? 200;
	const maxStats: Record<string, number> = {};
	for (const stat of statKeys) {
		if (stat === 'hp') {
			maxStats.hp = spData.id === 'shedinja' ? 1 : Math.floor((2 * bs.hp + 31 + Math.floor(252 / 4)) * maxStatLevel / 100) + maxStatLevel + 10;
		} else {
			maxStats[stat] = Math.floor((Math.floor((2 * bs[stat] + 31 + Math.floor(252 / 4)) * maxStatLevel / 100) + 5) * 1.1);
		}
	}

	const hpPct = mon.currentHp ?? 100;
	const hpColor = hpPct > 50 ? '#4caf50' : hpPct > 25 ? '#ff9800' : '#f44336';
	const dateStr = mon.metDate ? new Date(mon.metDate).toLocaleDateString() : 'Unknown';
	const heldItem = mon.heldItem ? Dex.items.get(mon.heldItem) : null;
	
	let genderHtml = '';
	if (mon.gender === 'M') genderHtml = `<span style="color:#4f8ef7">♂</span>`;
	else if (mon.gender === 'F') genderHtml = `<span style="color:#f74f8e">♀</span>`;

	const statusColors: Record<string, string> = { brn: '#e8603c', psn: '#b563ce', tox: '#b563ce', par: '#d4b800', slp: '#7a7a7a', frz: '#6aaed6' };
	let statusHtml = '';
	if (mon.status) {
		const sc = statusColors[mon.status] || '#888';
		statusHtml = `<span style="font-size:9px;font-weight:700;background:${sc};color:#fff;padding:1px 5px;border-radius:3px;margin-left:3px">${mon.status.toUpperCase()}</span>`;
	}

	const tabNames = ['Info', 'Stats', 'Moves'];
	const prevTab = (activeTab - 1 + tabNames.length) % tabNames.length;
	const nextTab = (activeTab + 1) % tabNames.length;

	const teamNav = state.team.map((m, i) => ({
		isMe: i === slot,
		slot: i,
		name: Dex.species.get(toID(m.species)).name
	}));

	const totalEvs = Object.values(evs as Record<string, number>).reduce((a, b) => a + b, 0);

	return {
		mon, spData, showAbilityArrows, showNatureArrows, natureName, naturePlus, natureMinus,
		abilityName, abilityDesc, bs, ivs, evs: evs as any, stats, maxStats, totalEvs, hpPct, hpColor,
		dateStr, heldItem, genderHtml, statusHtml, statKeys, statLabels, statColors,
		tabNames, prevTab, nextTab, teamNav
	};
}

function renderStatsView(state: PokeRogueState, user: User): string {
	const slot = (state as any).pendingStatsSlot;
	const activeTab: number = (state as any).statsTab ?? 0;
	if (slot === undefined || slot < 0 || slot >= state.team.length) {
		return `<div class="pr-warning-box">Error loading stats.</div>`;
	}

	const vm = buildStatsViewModel(state, user, slot, activeTab);

	let buf = `<div class="pr-sv-wrap">`;
	
	buf += `<div class="pr-sv-header">`;
	buf += `<div class="pr-sv-sprite-col">${getSprite(vm.mon.species, 80, vm.mon.shiny, 'pr-sv-sprite')}</div>&nbsp;&nbsp;`;
	buf += `<div class="pr-sv-info-col">`;
	buf += `<div class="pr-sv-name">${Utils.escapeHTML(vm.spData.name)} ${vm.genderHtml}${vm.mon.shiny ? ' <span class="pr-sv-shiny">★</span>' : ''}&nbsp;&nbsp;<span class="pr-level-badge">Lv.${vm.mon.level}</span></div>`;
	buf += `<div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:4px;">${renderTypeBadge(vm.spData.types ?? [])}</div>`;
	buf += `<div class="pr-sv-hp-row">`;
	buf += `<span class="pr-sv-hp-label">HP</span>`;
	buf += `<div class="pr-bar-track" style="flex:1"><div class="pr-bar-fill" style="width:${vm.hpPct}%;background:${vm.hpColor}"></div></div>`;
	buf += `<span class="pr-sv-hp-pct" style="color:${vm.hpColor}">${vm.hpPct}%</span>`;
	if (vm.statusHtml) buf += vm.statusHtml;
	buf += `</div></div></div>`;

	buf += `<div class="pr-sv-nav">`;
	buf += renderBtn(`/pokerogue statstab prev`, '&#9664;', 'pr-sv-arrow');
	for (let i = 0; i < vm.tabNames.length; i++) {
		buf += renderBtn(i === activeTab ? null : `/pokerogue statstab ${i}`, vm.tabNames[i], `pr-sv-dot${i === activeTab ? ' active' : ''}`);
	}
	buf += renderBtn(`/pokerogue statstab next`, '&#9654;', 'pr-sv-arrow');
	buf += `</div>`;

	buf += `<div class="pr-sv-tab">`;

	if (activeTab === 0) {
		buf += `<div class="pr-sv-row"><span class="pr-sv-row-label">Ability</span><div class="pr-sv-row-val">`;
		if (vm.showAbilityArrows) {
			buf += `<b>${Utils.escapeHTML(vm.abilityName)}</b>&nbsp;&nbsp;&nbsp;${renderBtn('/pokerogue cyclestarter ability next', 'Change', 'pr-btn', 'font-size:8px;padding:3px 6px')}`;
		} else {
			buf += `<b>${Utils.escapeHTML(vm.abilityName)}</b>`;
		}
		if (vm.abilityDesc) buf += `<div class="pr-sv-subdesc">${Utils.escapeHTML(vm.abilityDesc)}</div>`;
		buf += `</div></div>`;

		let natureSuffix = `<span class="pr-sv-subdesc"></span>`;
		if (vm.naturePlus && vm.natureMinus) {
			natureSuffix = ` <span style="color:#16a34a;font-size:10px;font-weight:600">▲${vm.statLabels[vm.naturePlus]}</span> <span style="color:#dc2626;font-size:10px;font-weight:600">▼${vm.statLabels[vm.natureMinus]}</span>`;
		}
		buf += `<div class="pr-sv-row"><span class="pr-sv-row-label">Nature</span><div class="pr-sv-row-val">`;
		if (vm.showNatureArrows) {
			buf += `<b>${Utils.escapeHTML(vm.natureName)}</b>&nbsp;&nbsp;${natureSuffix}&nbsp;&nbsp;&nbsp;${renderBtn('/pokerogue cyclestarter nature next', 'Change', 'pr-btn', 'font-size:8px;padding:3px 6px')}`;
		} else {
			buf += `<b>${Utils.escapeHTML(vm.natureName)}</b>&nbsp;&nbsp;${natureSuffix}`;
		}
		buf += `</div></div>`;

		buf += `<div class="pr-sv-row"><span class="pr-sv-row-label">Item</span><div class="pr-sv-row-val">`;
		if (vm.heldItem) {
			buf += `<div style="display:flex; justify-content:space-between; align-items:center;"><div>${getShopItemIcon(vm.heldItem.name, 14)} <b>${Utils.escapeHTML(vm.heldItem.name)}</b>`;
			if (vm.heldItem.shortDesc) buf += `<div class="pr-sv-subdesc">${Utils.escapeHTML(vm.heldItem.shortDesc)}</div>`;
			buf += `</div>${renderBtn(`/pokerogue unequip ${slot + 1}`, 'Take Item', 'pr-shop-buy', 'padding:5px 10px; font-size:11px; margin-left: 10px; white-space:nowrap;')}</div>`;
		} else {
			buf += `<span style="color:#aaa">None</span>`;
		}
		buf += `</div></div>`;

		if (vm.mon.teraType) {
			buf += `<div class="pr-sv-row"><span class="pr-sv-row-label">Tera</span><div class="pr-sv-row-val">${renderTypeBadge([vm.mon.teraType])}</div></div>`;
		}

		buf += `<div class="pr-sv-divider"></div>`;

		const memo: [string, string][] = [
			['OT', Utils.escapeHTML(vm.mon.originalTrainer || 'Unknown')],
			['ID No.', vm.mon.otId || '??????'],
			['Met at', Utils.escapeHTML(vm.mon.metLocation || 'Unknown')],
			['Met Lv.', String(vm.mon.metLevel ?? '?')],
			['Date', vm.dateStr],
			['Ball', Utils.escapeHTML(vm.mon.ball ? vm.mon.ball.replace('ball', ' Ball').replace(/^./, c => c.toUpperCase()) : 'Poké Ball')],
		];
		for (const [label, val] of memo) {
			buf += `<div class="pr-sv-row"><span class="pr-sv-row-label">${label}</span><div class="pr-sv-row-val">${val}</div></div>`;
		}
	}

	if (activeTab === 1) {
		buf += `<div class="pr-sv-stat-row" style="font-size:9px;color:#888;margin-bottom:4px;font-weight:600"><span class="pr-sv-stat-label"></span><div class="pr-sv-bar-wrap"></div><span class="pr-sv-stat-val">Stat</span><span class="pr-sv-stat-iv">IV</span><span class="pr-sv-stat-iv">EV</span></div>`;

		for (const stat of vm.statKeys) {
			const iv = vm.ivs[stat] ?? 31;
			const ev = vm.evs[stat] ?? 0;
			const actual = vm.stats[stat] ?? 0;
			const barPct = Math.min(100, Math.round((actual / (vm.maxStats[stat] || 1)) * 100));
			const isPlus = vm.naturePlus === stat;
			const isMinus = vm.natureMinus === stat;
			const valStyle = isPlus ? 'color:#16a34a;font-weight:700' : isMinus ? 'color:#dc2626;font-weight:700' : '';
			const evStyle = ev > 0 ? 'color:#c4a8ff;font-weight:600' : 'color:#555';

			buf += `<div class="pr-sv-stat-row"><span class="pr-sv-stat-label">${vm.statLabels[stat]}</span>`;
			buf += `<div class="pr-sv-bar-wrap"><div class="pr-sv-bar" style="width:${barPct}%;background:${vm.statColors[stat]}"></div></div>`;
			buf += `<span class="pr-sv-stat-val"${valStyle ? ` style="${valStyle}"` : ''}>${actual}</span>`;
			buf += `<span class="pr-sv-stat-iv" title="IV: ${iv}/31">${iv}</span>`;
			buf += `<span class="pr-sv-stat-iv" style="${evStyle}" title="EV: ${ev}/252">${ev}</span></div>`;
		}

		buf += `<div class="pr-sv-bst">EVs <b style="color:#c4a8ff">${vm.totalEvs}</b><span style="color:#555">/508</span></div>`;
	}

	if (activeTab === 2) {
		const moves = vm.mon.moves || [];
		for (let i = 0; i < 4; i++) {
			if (i < moves.length) {
				const move = Dex.moves.get(moves[i]);
				const maxPp = Math.floor((move.pp || 5) * (8 / 5));
				const mColor = '#' + typeColor(move.type);
				const catIcon = move.category === 'Physical' ? '⚔' : move.category === 'Special' ? '◆' : '●';
				const moveDesc = move.shortDesc || move.desc || '';

				buf += `<div class="pr-sv-move" style="border-left:3px solid ${mColor}"><div class="pr-sv-move-top">`;
				buf += `<b class="pr-sv-move-name">${Utils.escapeHTML(move.name)}</b><span class="pr-type" style="background:${mColor};color:#fff;font-size:9px">${move.type}</span></div>`;
				buf += `<div class="pr-sv-move-meta">${catIcon} ${move.category} &nbsp;·&nbsp; Pwr: <b>${move.basePower || '—'}</b> &nbsp;·&nbsp; Acc: <b>${move.accuracy === true ? '—' : (move.accuracy || '—')}</b> &nbsp;·&nbsp; Pri: <b>${move.priority > 0 ? `+${move.priority}` : move.priority}</b> &nbsp;·&nbsp; PP: <b>${maxPp}/${maxPp}</b></div>`;
				if (moveDesc) buf += `<div class="pr-sv-subdesc" style="margin-top:3px">${Utils.escapeHTML(moveDesc)}</div>`;
				buf += `</div>`;
			} else {
				buf += `<div class="pr-sv-move pr-sv-move-empty">— empty —</div>`;
			}
		}
	}

	buf += `</div>`;

	if (vm.teamNav.length > 1 && !state.isConfiguringStarter) {
		buf += `<div class="pr-sv-team-nav">`;
		for (const nav of vm.teamNav) {
			if (nav.isMe) {
				buf += `<span class="pr-sv-team-pip active" title="${Utils.escapeHTML(nav.name)}"></span>`;
			} else {
				buf += `<button name="send" value="/pokerogue view stats ${nav.slot}" class="pr-sv-team-btn" title="${Utils.escapeHTML(nav.name)}"><span class="pr-sv-team-pip"></span></button>`;
			}
		}
		buf += `</div>`;
	}

	buf += `</div>`;

	if (state.isConfiguringStarter) {
		buf += `<div style="text-align:center;margin-bottom:8px">${renderBtn('/pokerogue confirmstarter', 'Choose & Start', 'pr-btn primary', 'font-size:16px;padding:5px 10px')}</div>`;
	}

	return buf;
}

function renderMainView(state: PokeRogueState, user: User): string {
	if (state.battleRoomId) {
		return `<div style="text-align:center;padding:18px 0;color:#fac000;font-weight:500">Battle in progress!</div>`;
	}

	let buf = renderStatBar(state);

	buf += `<div style="text-align:center;margin-bottom:8px">`;
	
	// Conditionally render "Return to Draft" if a draft is pending
	if (state.pendingRewardDraft?.length) {
		buf += renderBtn('/pokerogue view draft', 'Return to Draft', 'pr-btn primary', 'font-size:11px;padding:5px 10px');
	} else {
		buf += renderBtn('/pokerogue prebattle', 'Start battle', 'pr-btn primary', 'font-size:11px;padding:5px 10px');
	}
	
	buf += `</div>`;

	buf += `<div class="pr-section-title">Your team</div>`;
	buf += `<div class="pr-table-container"><table class="pr-table">`;
	buf += `<thead><tr><th colspan="2">Pokémon</th><th style="text-align:right">Action</th></tr></thead><tbody>`;

	const genNumber = MODE_CONFIGS[state.gameMode]?.generation || 9;

	for (let i = 0; i < state.team.length; i++) {
		const mon = state.team[i];

		const btnStyle = "display:block;width:100%;margin-bottom:4px;box-sizing:border-box;";
		let actionBtn = renderBtn(`/pokerogue movemon ${i + 1}`, 'Move', 'pr-shop-buy', btnStyle);

		if (state.team.length > 1) {
			actionBtn += renderBtn(`/pokerogue releasemon ${i + 1}`, 'Release', 'pr-shop-buy', "display:block;width:100%;box-sizing:border-box;");
		}

		const statsBtnStyle = "display:block;width:100%;margin-top:8px;box-sizing:border-box;text-align:center;padding:3px 0;";
		let statsBtn = renderBtn(`/pokerogue view stats ${i}`, 'Stats', 'pr-shop-buy', statsBtnStyle);

		if (mon.heldItem && state.team.length > 1) {
			statsBtn += `<details><summary class="pr-btn pr-shop-buy" style="${statsBtnStyle}list-style:none;cursor:pointer;">Transfer Item</summary><div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;">`;
			for (let j = 0; j < state.team.length; j++) {
				if (i !== j) statsBtn += renderBtn(`/pokerogue transferitem ${i + 1} ${j + 1}`, `${j + 1}`, 'pr-shop-buy', 'flex:1;padding:2px 0;font-size:10px;');
			}
			statsBtn += `</div></details>`;
		}

		buf += renderTeamTableRow(mon, actionBtn, genNumber, statsBtn);
	}

	buf += `</tbody></table></div>`;
	return buf;
}

function renderTopView(): string {
	const entries = Object.entries(globalStats)
		.filter(([, s]) => (s.highestFloor ?? 0) > 0)
		.sort((a, b) => (b[1].highestFloor ?? 0) - (a[1].highestFloor ?? 0))
		.slice(0, 100);

	if (!entries.length) return `<div style="text-align:center;padding:16px;color:#888;font-size:13px">No records yet!</div>`;

	let buf = `<div class="pr-section-title">Ladder</div><div style="overflow-x:auto;-webkit-overflow-scrolling:touch;width:100%;display:block;"><table class="pr-table" style="min-width:520px;border-collapse:collapse;">`;
	buf += `<thead><tr><th>Rank</th><th>Player</th><th>Floor</th><th>Team</th></tr></thead><tbody>`;

	entries.forEach(([userid, s], i) => {
		const displayTeam = s.recordTeam?.length ? s.recordTeam : s.team;
		const teamSprites = (displayTeam ?? []).slice(0, 6).map((m: PokemonEntry) => getSprite(m.species, 28)).join('');
		buf += `<tr><td class="pr-td-desc" style="font-weight:500;white-space:nowrap;">#${i + 1}</td><td class="pr-td-name" style="white-space:nowrap;">${nameColor(s.displayName || userid, true, false)}</td>`;
		buf += `<td class="pr-td-desc" style="white-space:nowrap;">Floor ${s.highestFloor}</td><td style="white-space:nowrap;"><div class="pr-lb-team">${teamSprites}</div></td></tr>`;
	});

	return buf + `</tbody></table></div>`;
}

function renderResetConfirmView(state: PokeRogueState): string {
	let buf = `<div style="text-align:center;padding:20px 12px">`;
	buf += `<div style="font-size:17px;font-weight:500;color:#f87171;margin-bottom:8px">Reset run?</div>`;
	buf += `<div style="color:#aaa;font-size:12px;margin-bottom:18px">This will permanently end your current run on Floor <b>${state.floor}</b>.</div>`;
	buf += `<center>${renderBtn('/pokerogue quit', 'Yes, reset run', 'pr-btn danger', 'padding:8px 18px')}</center></div>`;
	return buf;
}

function renderGameOverView(state: PokeRogueState): string {
	return `<div class="pr-gameover"><div class="pr-go-title">Game over</div>` +
		`<div class="pr-go-sub">Your run ended on Floor <b>${state.lastRunFloor || 1}</b>.</div>` +
		renderBtn('/pokerogue view welcome', 'Start new run', 'pr-newrun-btn') + `</div>`;
}

function renderSlotsView(user: User, action: 'save' | 'load'): string {
	const userData = getUserData(user.id);

	let buf = `<div class="pr-section-title">${action === 'save' ? 'Save Game' : 'Load Game'}</div>`;
	buf += `<div style="text-align:center;color:#aaa;font-size:12px;margin-bottom:14px;">`;
	buf += action === 'save' ?
		`Choose a slot to save your current progress.` :
		`Choose a saved game to load. This will overwrite your current active run. <b style="color:#f87171">Loading a save slot permanently removes it.</b>`;
	buf += `</div>`;

	buf += `<div class="pr-table-container"><table class="pr-table" style="width:100%;border-collapse:collapse;">`;
	buf += `<thead><tr>`;
	buf += `<th style="padding:4px 6px;text-align:left;">Slot</th>`;
	buf += `<th style="padding:4px 6px;text-align:left;">Mode</th>`;
	buf += `<th style="padding:4px 6px;text-align:left;">Floor</th>`;
	buf += `<th style="padding:4px 6px;text-align:left;">Team</th>`;
	buf += `<th style="padding:4px 6px;text-align:right;">Action</th>`;
	buf += `</tr></thead><tbody>`;

	for (let i = 1; i <= 3; i++) {
		const slotData = userData.saveSlots?.[i];
		const mode = slotData ?
			slotData.gameMode.charAt(0).toUpperCase() + slotData.gameMode.slice(1) :
			'—';

		buf += `<tr style="border-bottom:1px solid rgba(150,150,150,0.1);">`;

		buf += `<td class="pr-td-name" style="padding:6px;font-weight:500;white-space:nowrap;">Slot ${i}</td>`;

		if (slotData) {
			buf += `<td class="pr-td-desc" style="padding:6px;white-space:nowrap;">${mode}</td>`;
			buf += `<td class="pr-td-desc" style="padding:6px;white-space:nowrap;">Floor ${slotData.floor}</td>`;
			buf += `<td style="padding:6px;"><div class="pr-lb-team">`;
			for (const mon of slotData.team || []) {
				buf += getSprite(mon.species, 28);
			}
			buf += `</div></td>`;
			buf += `<td class="pr-td-action" style="padding:6px;text-align:right;">`;
			if (action === 'save') {
				buf += renderBtn(`/pokerogue saveslot ${i}`, 'Save Here', 'pr-shop-buy', 'padding:3px 8px;font-size:11px;');
			} else {
				buf += renderBtn(`/pokerogue loadslot ${i}`, 'Load', 'pr-shop-buy', 'padding:3px 8px;font-size:11px;');
			}
			buf += `</td>`;
		} else {
			buf += `<td class="pr-td-desc" style="padding:6px;color:#555;font-style:italic;" colspan="3">Empty</td>`;
			buf += `<td class="pr-td-action" style="padding:6px;text-align:right;">`;
			if (action === 'save') {
				buf += renderBtn(`/pokerogue saveslot ${i}`, 'Save Here', 'pr-shop-buy', 'padding:3px 8px;font-size:11px;');
			} else {
				buf += renderBtn(null, 'Empty', 'pr-shop-buy', 'padding:3px 8px;font-size:11px;opacity:0.4;', true);
			}
			buf += `</td>`;
		}

		buf += `</tr>`;
	}

	buf += `</tbody></table></div>`;
	return buf;
}

export function renderGamePage(state: PokeRogueState, user: User): string {
	const view = (state as any).view || 'main';

	let buf = (state.battleRoomId || state.notification) ? `<meta http-equiv="refresh" content="${PAGE_REFRESH_SECONDS}">` : '';

	buf += `<div class="pr" style="min-height:100vh;padding-bottom:20px">`;

	if (state.gameOver && view !== 'welcome') return buf + renderHeader('main', true) + `<div style="padding:0 14px 14px">${renderNotification(state)}${renderGameOverView(state)}</div></div>`;
	if (view === 'resetconfirm') return buf + renderHeader('resetconfirm', false) + `<div style="padding:0 14px 14px">${renderNotification(state)}${renderResetConfirmView(state)}</div></div>`;
	if (view === 'top') return buf + renderHeader('top', false) + `<div style="padding:0 14px 14px">${renderNotification(state)}${renderTopView()}</div></div>`;
	if (view === 'welcome') return buf + renderHeader(view, false) + `<div style="padding:0 14px 14px">${renderNotification(state)}${renderWelcomeView()}</div></div>`;
	if (view === 'starterselect') return buf + renderHeader('main', false) + `<div style="padding:0 14px 14px">${renderNotification(state)}${renderStarterSelectionView(state, user)}</div></div>`;
	if (view === 'stats' && (state as any).pendingStatsSlot !== undefined) return buf + renderHeader('stats', false) + `<div style="padding:0 14px 14px">${renderNotification(state)}${renderStatsView(state, user)}</div></div>`;
	if (view === 'save') return buf + renderHeader('save', false) + `<div style="padding:0 14px 14px">${renderNotification(state)}${renderSlotsView(user, 'save')}</div></div>`;
	if (view === 'load') return buf + renderHeader('load', false) + `<div style="padding:0 14px 14px">${renderNotification(state)}${renderSlotsView(user, 'load')}</div></div>`;

	let displayView = view;
	if (view === 'draft' && (state.pendingChoice?.length || state.pendingSwap || state.pendingMoves?.length || state.itemOptions?.length || state.pendingItemName || state.pendingConsumableType || state.pendingMoveSlot !== undefined || state.pendingReleaseSlot !== undefined)) {
		displayView = 'main';
	}
	if (state.gameWon) displayView = 'victory';

	buf += renderHeader(displayView, false) + `<div style="padding:0 14px 14px">${renderNotification(state)}`;

	if (state.pendingChoice?.length) return buf + renderPendingChoice(state) + `</div></div>`;
	if (state.pendingSwap) return buf + renderPendingSwap(state) + `</div></div>`;
	if (state.pendingMoves?.length) return buf + renderPendingMoves(state) + `</div></div>`;
	if (state.itemOptions?.length) return buf + renderItemOptions(state) + `</div></div>`;
	if (state.pendingItemName) return buf + renderGiveItem(state) + `</div></div>`;
	if (state.pendingConsumableType && state.purchasedItem) return buf + renderConsumable(state) + `</div></div>`;
	if (view === 'trainer' && state.pendingTrainer) return buf + renderTrainerIntroView(state) + `</div></div>`;
	if (state.pendingMoveSlot !== undefined) return buf + renderMoveMon(state) + `</div></div>`;
	if (state.pendingReleaseSlot !== undefined) return buf + renderReleaseMon(state) + `</div></div>`;
	if (state.gameWon) return buf + renderVictoryView(state) + `</div></div>`;

	if (view === 'draft') return buf + renderDraftView(state) + `</div></div>`;

	return buf + renderMainView(state, user) + `</div></div>`;
}
