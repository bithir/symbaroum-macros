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
            if(e.actor.data.type === "player") {
                if(game.user.isGM || e.actor.owner)
                    actorslist.push(e.actor);
            }
        });
    } else {     
        let gameacts = game.actors.filter(e => { if( (game.user.isGM || e.owner) && e.data.type === "player") { return e; } });
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
    <div style="flex-basis: auto;flex-direction: row;display: flex;">
                <div style="width:10em;min-width:10em;"><label for="experience" style="width:10em;min-width:10em">Experience</label></div><div><input type="text" name="experience" value="1" style="width:5em"></div>
    </div>
    <br/>
    </div>`;
    let x = new Dialog({
        title: "Add experience",
        content : dialog_content,
        buttons : 
        {
            Ok :{ label : `Ok`, callback : async (html) => {             
                                            let tmp = html.find("input[name='selection']").get().filter(v => { if(v.checked) return true; }).map(e => { return e.value});
                                            let exp = parseInt(html.find("input[name='experience'")[0].value);
                                            if(isNaN(exp) || tmp.length == 0) {
                                                ui.notifications.error("Need a valid number of experience, either positive or negative");
                                                return;
                                            }
                                            addExperience(tmp,exp);
                                        }
                },
            Cancel : {label : `Cancel`}
        }
    });
    
    x.options.width = 200;
    x.position.width = 300;
    
    x.render(true);
})();

function addExperience(actorids, exp)
{
    let actorNames = "";
    let updates = actorids.map(a => {
        let aexp = game.actors.get(a);
    
        actorNames = actorNames + "<li>" + aexp.name;

        return {
            _id: a,
            "data.experience.total": aexp.data.data.experience.total + exp
        };
    });
    
    Actor.update(updates);
    let chatOptions = {
        rollMode: game.settings.get('core', 'rollMode'),        
        content: `<h2>Experience change</h2> 
                    The following actors:<ul> ${actorNames}</ul> were awarded ${exp} experience`
    };
    ChatMessage.create(chatOptions);
    // ui.notifications.info(`Added ${exp} experience to checked (${actorNames}) characters`);
}