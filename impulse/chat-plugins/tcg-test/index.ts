import { FS } from '../../../lib';
import { TCGMatch, TCGCard, InGameCard } from './engine';

// Load Database
let baseSetData: TCGCard[] = [];
try {
    const rawData = FS('impulse/chat-plugins/tcg-test/base1.json').readIfExistsSync();
    if (rawData) {
        const parsed = JSON.parse(rawData);
        baseSetData = Array.isArray(parsed) ? parsed : (parsed.data || []);
    }
} catch (e) {
    console.error("Failed to load Base Set JSON:", e);
}

const activeMatches = new Map<string, TCGMatch>();

// --- UI Helper Functions ---
function renderSlot(card: InGameCard | null, context: 'hand' | 'active' | 'bench', targetSlot: number | 'active', isAi: boolean, match: TCGMatch): string {
    const isSelected = card && context === 'hand' && card.uid === match.player.selectedUid;
    const selectedCard = match.player.hand.find(c => c.uid === match.player.selectedUid);

    // Styling logic
    const borderStyle = isSelected ? `2px solid #007bff` : `1px solid #ccc`;
    const borderDashed = isSelected ? `2px dashed #007bff` : `1px dashed #888`;

    // 1. Rendering an Empty Field Slot
    if (!card) {
        let html = `<div style="width: 75px; height: 104px; border: ${borderDashed}; border-radius: 4px; display: inline-block; vertical-align: top; margin: 1px; text-align: center; color: #888; font-size: 10px; box-sizing: border-box; padding-top: 30px;">`;
        html += `Empty<br/>`;
        
        // Show "Place Here" if the user has a Basic Pokémon selected
        if (!isAi && selectedCard?.supertype === 'Pokémon' && selectedCard?.subtypes?.includes('Basic')) {
            html += `<button class="button" name="send" value="/tcg place ${targetSlot}" style="margin-top: 5px; font-size: 9px; padding: 2px;">Place Here</button>`;
        }
        
        html += `</div>`;
        return html;
    }

    // 2. Rendering an Occupied Card Slot
    let html = `<div style="width: 75px; display: inline-block; vertical-align: top; margin: 1px; text-align: center; font-size: 10px; border: ${borderStyle}; border-radius: 5px; padding-bottom: 2px;">`;
    html += `<img src="${card.images.small}" style="width: 100%; border-radius: 4px 4px 0 0;" alt="${card.name}" />`;
    
    if (card.currentDamage > 0) html += `<div style="color: white; background: red; font-weight: bold; border-radius: 3px; margin: 1px; font-size: 9px;">${card.currentDamage} DMG</div>`;
    if (card.attachedEnergy?.length > 0) html += `<div style="font-size: 9px; margin-top: 1px;">⚡: ${card.attachedEnergy.length}</div>`;

    // Hand Buttons: Select or Deselect
    if (context === 'hand' && !isAi) {
        if (isSelected) {
            html += `<button class="button" name="send" value="/tcg deselect" style="width: 90%; margin-top: 1px; font-size: 9px; padding: 2px 0; background: #ffe6e6;">Deselect</button>`;
        } else {
            html += `<button class="button" name="send" value="/tcg select ${card.uid}" style="width: 90%; margin-top: 1px; font-size: 9px; padding: 2px 0;">Select</button>`;
        }
    }

    // Field Buttons: Attach Energy or Attack
    if ((context === 'active' || context === 'bench') && !isAi) {
        if (selectedCard?.supertype === 'Energy') {
            html += `<button class="button" name="send" value="/tcg attach ${targetSlot}" style="width: 90%; margin-top: 1px; font-size: 9px; padding: 2px 0; background: #e6f7ff;">Attach Here</button>`;
        } else if (!selectedCard && context === 'active' && card.attacks) {
            // Only show attacks if NO card is currently selected from the hand
            card.attacks.forEach((atk, atkIndex) => {
                html += `<button class="button" name="send" value="/tcg attack ${atkIndex}" style="width: 90%; margin-top: 1px; font-size: 8px; padding: 2px 0; white-space: normal;">⚔️ ${atk.name}</button>`;
            });
        }
    }
    
    html += `</div>`;
    return html;
}

export const commands: Chat.ChatCommands = {
    tcg: {
        start(target, room, user) {
            if (!baseSetData.length) return this.errorReply("TCG Data not loaded on server.");
            if (activeMatches.has(user.id)) return this.errorReply("You already have a match. Use /join view-tcg-match");
            
            activeMatches.set(user.id, new TCGMatch(user.id, baseSetData));
            this.parse('/join view-tcg-match');
        },

        select(target, room, user) {
            const match = activeMatches.get(user.id);
            if (!match || match.turn !== 'player') return this.errorReply("Not your turn.");
            
            const uid = parseInt(target);
            match.player.selectedUid = isNaN(uid) ? null : uid;
            this.refreshPage('tcg-match');
        },

        deselect(target, room, user) {
            const match = activeMatches.get(user.id);
            if (match) match.player.selectedUid = null;
            this.refreshPage('tcg-match');
        },

        place(target, room, user) {
            const match = activeMatches.get(user.id);
            if (!match || match.turn !== 'player') return this.errorReply("Not your turn.");
            if (match.player.selectedUid === null) return this.errorReply("No card selected.");
            
            const slot = target === 'active' ? 'active' : parseInt(target);
            if (match.playBasicPokemon(true, match.player.selectedUid, slot)) {
                this.refreshPage('tcg-match');
            } else {
                this.errorReply("Cannot place card there.");
            }
        },

        attach(target, room, user) {
            const match = activeMatches.get(user.id);
            if (!match || match.turn !== 'player') return this.errorReply("Not your turn.");
            if (match.player.selectedUid === null) return this.errorReply("No card selected.");
            
            const slot = target === 'active' ? 'active' : parseInt(target);
            if (match.attachEnergy(true, match.player.selectedUid, slot)) {
                this.refreshPage('tcg-match');
            } else {
                this.errorReply("Cannot attach Energy there.");
            }
        },

        attack(target, room, user) {
            const match = activeMatches.get(user.id);
            if (!match || match.turn !== 'player') return this.errorReply("Not your turn.");
            
            const index = parseInt(target); 
            if (isNaN(index)) return this.errorReply("Invalid attack index.");

            if (match.attack(true, index)) {
                this.refreshPage('tcg-match');
            } else {
                this.errorReply("Could not use that attack.");
            }
        },

        endturn(target, room, user) {
            const match = activeMatches.get(user.id);
            if (!match || match.turn !== 'player') return this.errorReply("Not your turn or no active match.");

            match.player.selectedUid = null; // Clear selection
            match.turn = 'ai';
            match.executeAITurn();
            this.refreshPage('tcg-match');
        },

        quit(target, room, user) {
            if (activeMatches.has(user.id)) {
                activeMatches.delete(user.id);
                this.sendReply("You have exited the TCG table.");
                this.closePage('tcg-match');
            }
        }
    }
};

export const pages: Chat.PageTable = {
    tcg: {
        match(query, user, connection) {
            this.title = '[TCG] Table';
            const match = activeMatches.get(user.id);

            if (!match) {
                return this.setHTML(`<div class="pad"><h2>Pokémon TCG Simulator</h2><p>No active match.</p><button class="button" name="send" value="/tcg start">Start Match vs AI</button></div>`);
            }

            let html = `<div class="pad" style="max-width: 850px; margin: auto; font-size: 13px;">`;

            // --- AI Field (Flexbox Layout) ---
            html += `<div style="background: #e8e8e8; padding: 5px; border-radius: 6px; margin-bottom: 5px;">`;
            html += `<strong>AI Opponent</strong> (Hand: ${match.ai.hand.length} | Deck: ${match.ai.deck.length} | Prizes: ${match.ai.prizes.length})`;
            html += `<div style="display: flex; gap: 5px; margin-top: 3px;">`;
            html += `<div><strong>Active:</strong><br/>${renderSlot(match.ai.active, 'active', 'active', true, match)}</div>`;
            html += `<div style="flex-grow: 1; overflow-x: auto; white-space: nowrap;"><strong>Bench:</strong><br/>`;
            for (let i = 0; i < 5; i++) html += renderSlot(match.ai.bench[i], 'bench', i, true, match);
            html += `</div></div></div>`;

            html += `<hr style="margin: 5px 0;"/>`;

            // --- Player Field (Flexbox Layout) ---
            html += `<div style="background: #f0f8ff; padding: 5px; border-radius: 6px; margin-bottom: 5px;">`;
            html += `<strong>Your Field</strong> (Deck: ${match.player.deck.length} | Prizes: ${match.player.prizes.length})`;
            html += `<div style="display: flex; gap: 5px; margin-top: 3px;">`;
            html += `<div><strong>Active:</strong><br/>${renderSlot(match.player.active, 'active', 'active', false, match)}</div>`;
            html += `<div style="flex-grow: 1; overflow-x: auto; white-space: nowrap;"><strong>Bench:</strong><br/>`;
            for (let i = 0; i < 5; i++) html += renderSlot(match.player.bench[i], 'bench', i, false, match);
            html += `</div></div></div>`;

            // --- Player Hand ---
            html += `<strong>Your Hand</strong>`;
            html += `<div style="overflow-x: auto; white-space: nowrap; padding-bottom: 5px;">`;
            match.player.hand.forEach((card) => {
                html += renderSlot(card, 'hand', card.uid, false, match);
            });
            html += `</div>`;

            // --- Controls ---
            html += `<div style="padding: 5px; background: #fff; border-top: 1px solid #ccc;">`;
            if (match.turn === 'player') {
                html += `<button class="button" name="send" value="/tcg endturn" style="font-weight: bold; background: #c1e1c1;">End Turn</button> `;
            } else {
                html += `<em>Waiting for AI...</em> `;
            }
            html += `<button class="button" name="send" value="/tcg quit" style="color: red; float: right;">Quit Match</button>`;
            html += `</div>`;

            // --- Game Log (Compacted Height) ---
            html += `<div style="margin-top: 5px; background: #222; color: #fff; padding: 5px; height: 80px; overflow-y: scroll; border-radius: 5px; font-family: monospace; font-size: 11px;">`;
            match.logs.forEach(log => {
                html += `<div>> ${log}</div>`;
            });
            html += `</div>`;

            html += `</div>`;
            this.setHTML(html);
        }
    }
};
