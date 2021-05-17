
(()=>{
    let defaultCheck = "unchecked"; // set to unchecked
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
        ui.notifications.info(`No actor available for you to do an attribute test`);
        return;
    } else if(actorslist.length === 1) {
        defaultCheck = "checked";
    }

    let allActors = "";
    actorslist.forEach(t => {
        allActors = allActors.concat(`<div style="flex-basis: auto;flex-direction: row;display: flex;">
                <div style="width:10em;min-width:10em;"><label for="${t.data._id}">${t.data.name}</label> </div>
                <div><input id="${t.data._id}" type="radio" name="selection" value="${t.data._id}" ${defaultCheck}="${defaultCheck}"></div>
            </div>`);
    });
    
    let keys = Object.keys(actorslist[0].data.data.attributes);
    let allKeys = "";
    keys.forEach(t => {
        allKeys = allKeys.concat(`<option value="${t}">${game.i18n.localize(actorslist[0].data.data.attributes[t].label)}`);
    });

    let dialog_content = `  
    <div class="form-group">
    <h2>Select player(s)</h2>
    ${allActors}
    <br />
    <div style="flex-basis: auto;flex-direction: row;display: flex;">
    <div style="width:10em;min-width:10em;"><label for="attribute" style="min-width:10em">${game.i18n.localize("DIALOG.ATTRIBUTE")}</label> </div>
    <div style="width:10em;min-width:10em;"><select id="attribute" name="category">${allKeys}</select></div>
    </div><br/>
    </div>`;

    let x = new Dialog({
        content : dialog_content,
        alternatives: keys,
        buttons : 
        {
        Ok : { label : `Ok`, callback : async (html)=> {
                let tmp = html.find("input[name='selection']").get().filter(v => { if(v.checked) return true; }).map(e => { return e.value});
                await rollAttribute(tmp, html.find('#attribute')[0].value);
            }
        },
        Cancel : {label : `Cancel`}
        }
    });
    
    x.options.width = 200;
    x.position.width = 300;
    
    x.render(true);
})();

async function rollAttribute(actorids, attribute)
{
    let updates = actorids.map(a => {
        let aexp = game.actors.get(a);
        aexp.rollAttribute(attribute, null, null);
    });
}
