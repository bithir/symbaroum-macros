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
                actorslist.push(e.actor);
            }
        });
        // check if there are tokens on the map, if so, use their actors
        // if there are no controlled tokens on the map, select all players in the actor catalogue
    } else {     
        console.log(`Select from actors`);
        let gameacts = game.actors.filter(e => { if(e.data.type === "player") { return e; } });
        Array.prototype.push.apply(actorslist, gameacts);
    }


    console.log(actorslist);

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
                <div style="width:10em;min-width:10em;"><label for="experience" style="width:10em;min-width:10em">Experience</label></div><div><input type="text" name="experience" style="width:5em"></div>
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
    let updates = actorids.map(a => {
        let aexp = game.actors.get(a);
        console.log(aexp);

        return {
            _id: a,
            "data.experience.total": aexp.data.data.experience.total + exp
        };
    });
    console.log(updates);
    Actor.update(updates);
    ui.notifications.info(`Added ${exp} experience to checked characters`);
}