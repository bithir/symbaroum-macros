/** 
 * Macro can be used by either selecting tokens on-screen or, if no tokens are selected, choosing which player characters (default all)
 * 
 */
 (()=>{
    let defaultCheck = "checked"; // set to unchecked
    let actorslist = [];

    if(canvas.tokens.controlled.length > 0) {
        // If no actor selected
        // Time to get busy
        canvas.tokens.controlled.map(e => { 
            if(e.actor.data.type === "player" && e.hasPlayerOwner) {
                if(game.user.isGM || e.actor.owner)
                    actorslist.push(e.actor);
            }
        });
        if(actorslist.length > 0 ) 
        {
            actorslist = [actorslist[0]];
        }
    } else {     
        let gameacts = game.actors.filter(e => { if( (game.user.isGM || e.owner) && e.data.type === "player" && e.hasPlayerOwner) { return e; } });
        Array.prototype.push.apply(actorslist, gameacts);
    }

    let allKeys = "";
    actorslist.forEach(t => {
        allKeys = allKeys.concat(`<div style="flex-basis: auto;flex-direction: row;display: flex;">
                <div style="width:10em;min-width:10em;"><label for="${t.data._id}">${t.data.name}</label> </div>
                <div><input id="${t.data._id}" type="checkbox" name="selection" value="${t.data._id}" ${defaultCheck}="${defaultCheck}"></div>
            </div>`);
    });

    let dialog_content = `  
    <div class="form-group">
    <h2>Select player(s)</h2>
    ${allKeys}
    <br />
    </div>`;
    let x = new Dialog({
        title: "Reset Corruption",
        content : dialog_content,
        buttons : 
        {
            Ok :{ label : `Ok`, callback : async (html) => {             
                                            let tmp = html.find("input[name='selection']").get().filter(v => { if(v.checked) return true; }).map(e => { return e.value});                                            
                                            if(tmp.length == 0) {
                                                ui.notifications.error("Need a valid number of players");
                                                return;
                                            }
                                            resetCorruption(tmp);
                                        }
                },
            Cancel : {label : `Cancel`}
        }
    });
    
    x.options.width = 200;
    x.position.width = 300;
    
    x.render(true);
})();

function resetCorruption(actorids)
{
    let actorNames = "";
    let updates = actorids.map(a => {
        let aexp = game.actors.get(a);
    
        actorNames = actorNames + "<li>" + aexp.name;

        return {
            _id: a,
            "data.health.corruption.temporary": 0
        };
    });
    
    Actor.updateDocuments(updates);
    let chatOptions = {
        rollMode: game.settings.get('core', 'rollMode'),        
        content: `<h2>Temporary corruption was washed away</h2> 
                    The following actors:<ul> ${actorNames}</ul> is now at zero temporary corruption`
    };
    ChatMessage.create(chatOptions);
    // ui.notifications.info(`Added ${exp} experience to checked (${actorNames}) characters`);
}