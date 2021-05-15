/** 
 * Macro can be used by either selecting tokens on-screen or, if no tokens are selected, choosing which player characters (default all)
 * 
 */
 (()=>{
    let defaultCheck = "unchecked"; // set to unchecked
    let actorslist = [];

    if(canvas.tokens.controlled.length > 0) {
        // If no actor selected
        // Time to get busy
        canvas.tokens.controlled.map(e => { 
            if(e.actor.data.type === "player") {
                actorslist.push(e.actor);
            }
        });
        if(actorslist.length > 0 ) { actorslist = [actorslist[0]]; }
        defaultCheck = "checked";
        // check if there are tokens on the map, if so, use their actors
        // if there are no controlled tokens on the map, select all players in the actor catalogue
    } else {     
        let gameacts = game.actors.filter(e => { if(e.data.type === "player") { return e; } });
        Array.prototype.push.apply(actorslist, gameacts);
    }


    console.log(actorslist);

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
                <div style="width:10em;min-width:10em;"><label for="artifactrr" style="width:10em;min-width:10em">Experience</label></div><div><input type="radio" id="artifactrr" value="artifactrr" name="costType" style="width:5em"></div>
    </div>
    <div style="flex-basis: auto;flex-direction: row;display: flex;">
                <div style="width:10em;min-width:10em;"><label for="permanent" style="width:10em;min-width:10em">Corruption</label></div><div><input type="radio" id="permanent" value="permanent" name="costType" style="width:5em"></div>
    </div>
    <br/>
    </div>`;
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

                                            payCost(tmp,costType);
                                        }
                },
            Cancel : {label : `Cancel`}
        }
    });
    
    x.options.width = 200;
    x.position.width = 300;
    
    x.render(true);
})();

function payCost(actorids, costType)
{
    let actorName = "";
    let updates = actorids.map(a => {
        let aexp = game.actors.get(a);
        actorName = aexp.name;
        return {
            _id: a,
            "data.experience.artifactrr": aexp.data.data.experience.artifactrr + ( costType.includes("artifactrr")? 1:0),
            "data.health.corruption.permanent": aexp.data.data.health.corruption.permanent + ( costType.includes("permanent")? 1:0)
        };
    });
    console.log(updates);
    Actor.update(updates);
    ui.notifications.info(`Re-roll for ${actorName} paid using ${costType.includes("artifactrr")?"experience":"corruption"}`);
}