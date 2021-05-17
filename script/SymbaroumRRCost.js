/** 
 * Macro can be used by either selecting tokens on-screen or, if no tokens are selected, choosing which player characters (default all)
 * 
 */
 (()=>{
    let defaultCheck = "unchecked"; // set to unchecked
    let bithirsGame = false; // It is not a bithir world unless this is set
    let actorslist = [];

    if(canvas.tokens.controlled.length > 0) {
        // If no actor selected
        // Time to get busy
        canvas.tokens.controlled.map(e => { 
            if(e.actor.data.type === "player") {
                if(game.user.isGM || e.actor.owner)
                    actorslist.push(e.actor);
            }
        });
        if(actorslist.length > 0 ) { actorslist = [actorslist[0]]; }
        // check if there are tokens on the map, if so, use their actors
        // if there are no controlled tokens on the map, select all players in the actor catalogue
    } else {     
        let gameacts = game.actors.filter(e => { if( (game.user.isGM || e.owner) && e.data.type === "player") { return e; } });
        Array.prototype.push.apply(actorslist, gameacts);
    }
    

    if(actorslist.length === 0) {
        ui.notifications.info(`No actor available for you to apply re-roll cost`);
        return;
    } else if(actorslist.length === 1) {
        defaultCheck = "checked";
    }    

    let allKeys = "";
    actorslist.forEach(t => {
        allKeys = allKeys.concat(`<div style="flex-basis: auto;flex-direction: row;display: flex;">
                <div style="width:10em;min-width:10em;"><label for="${t.data._id}">${t.data.name}</label> </div>
                <div><input id="${t.data._id}" type="radio" name="selection" value="${t.data._id}" ${defaultCheck}="${defaultCheck}"></div>
            </div>`);
    });

    let dialog_content = `  
    <div class="form-group">
    <h2>Select player(s)</h2>
    ${allKeys}
    <br />
    <div>Select what was used for the re-roll</div>
    <div style="flex-basis: auto;flex-direction: row;display: flex;">
        <div style="width:10em;min-width:10em;"><label for="artifactrr">Experience</label> </div>
        <div><input type="radio" id="artifactrr" value="artifactrr" name="costType"></div>
    </div>
    <div style="flex-basis: auto;flex-direction: row;display: flex;">
        <div style="width:10em;min-width:10em;"><label for="permanent">Corruption (perm)</label></div>
        <div><input type="radio" id="permanent" value="permanent" name="costType"></div>
    </div>`;
    if(bithirsGame) {
        dialog_content = dialog_content + `<div style="flex-basis: auto;flex-direction: row;display: flex;">
        <div style="width:10em;min-width:10em;"><label for="permanent">Corruption (temp)</label></div>
        <div><input type="radio" id="temporary" value="temporary" name="costType"></div>
        </div>`;
    }
    dialog_content += `<br /></div>`;
    let x = new Dialog({
        title: "Take cost for re-roll",
        content : dialog_content,
        buttons : 
        {
            Ok :{ label : `Ok`, callback : async (html) => {             
                                            let tmp = html.find("input[name='selection']").get().filter(v => { if(v.checked) return true; }).map(e => { return e.value});
                                            let costType = html.find("input[name='costType']").get().filter(v => { if(v.checked) return true; }).map(e => { return e.value});
                                            console.log(tmp);
                                            console.log(costType);

                                            await payCost(tmp,costType);
                                        }
                },
            Cancel : {label : `Cancel`}
        }
    });
    
    x.options.width = 200;
    x.position.width = 300;
    
    x.render(true);
})();

async function payCost(actorids, costType)
{
    let actorName = "";
    let dice = new Roll("1d4").roll();

    let updates = actorids.map(a => {
        let aexp = game.actors.get(a);
        actorName = aexp.name;
        return {
            _id: a,
            "data.experience.artifactrr": aexp.data.data.experience.artifactrr + ( costType.includes("artifactrr")? 1:0),
            "data.health.corruption.permanent": aexp.data.data.health.corruption.permanent + ( costType.includes("permanent")? 1:0),
            "data.health.corruption.temporary": aexp.data.data.health.corruption.temporary + ( costType.includes("temporary")? dice.total:0)
        };
    });
    console.log(updates);
    await Actor.update(updates);
    // 
    if( costType.includes("temporary") ) {
        /** Only applicable for Bithir game */
        let chatOptions = {
            type: CHAT_MESSAGE_TYPES.ROLL,
            roll: dice,
            rollMode: game.settings.get("core", "rollMode"),
            content: `<h2>Re-roll for temp corruption</h2> 
                        Result was ${dice.total} temporary corruption`
         };
         ChatMessage.create(chatOptions);
            
    } else {
        ui.notifications.info(`You paid ${ costType.includes("artifactrr") ? "experience":"permanent corruption" } for a re-roll`);
    }
     
    
    // Post results
}