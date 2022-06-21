(()=>{
let defaultCheck = "checked"; // set to unchecked
let actorslist = [];
let consumables = ["food", "water", "arrows", "torches"];

if(canvas.tokens.controlled.length > 0) {
    // If no actor selected
    // Time to get busy
    canvas.tokens.controlled.map(e => { 
            if(game.user.isGM || e.actor.owner) {
                    actorslist.push(e.actor);
            }
    });
    // check if there are tokens on the map, if so, use their actors
    // if there are no controlled tokens on the map, select all players in the actor catalogue
} else {     
    let gameacts = game.actors.filter(e => { if( (game.user.isGM || e.owner) && e.hasPlayerOwner ) { return e; } });
    Array.prototype.push.apply(actorslist, gameacts);
}
if(actorslist.length === 0) {
    ui.notifications.info(`No actor available for you to do consumables test`);
    return;
} else if(actorslist.length === 1) {
    defaultCheck = "checked";
}
let allActors = "";
actorslist.forEach(t => {
    allActors = allActors.concat(`<div style="flex-basis: auto;flex-direction: row;display: flex;">
            <div style="width:10em;min-width:10em;"><label for="${t.data._id}">${t.data.name}</label> </div>
            <div><input id="${t.data._id}" type="checkbox" name="selection" value="${t.data._id}" ${defaultCheck}="${defaultCheck}"></div>
        </div>`);
});


let allConsumables = "";
consumables.forEach(t => {
    allConsumables = allConsumables.concat(`<label for="${t}">${t}</label> <input id='${t}' type="checkbox" name="consumable" value="${t}"><br/>`);
});

let dialog_content = `  
<div class="form-group">
<h2>Select player(s)</h2>
${allActors}
<br />
<div style="flex-basis: auto;flex-direction: row;display: flex;">
<div style="width:10em;min-width:10em;"><label for="attribute" style="min-width:10em">Consumable</label> </div>
<div style="width:10em;min-width:10em;">${allConsumables}</div>
</div><br/>
</div>`;
let x = new Dialog({
    content : dialog_content,
    buttons : 
    {
    Ok : { label : `Ok`, callback : async (html)=> {
            let actors = html.find("input[name='selection']").get().filter(v => { if(v.checked) return true; }).map(e => { return e.value});
            let consumables = html.find("input[name='consumable']").get().filter(v => { if(v.checked) return true; }).map(e => { return e.value});
            rollConsumable(actors, consumables);
        }
    },
    Cancel : {label : `Cancel`}
    }
});

x.options.width = 200;
x.position.width = 300;

x.render(true);
})();

async function rollConsumable(actorids, consumables)
{
    let updates = actorids.map(a =>  {
        let aexp = game.actors.get(a);
        consumables.map(async c => {
            await aexp.sheet.rollConsumable(c);
        })
    });
}