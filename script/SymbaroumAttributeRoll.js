
(()=>{

    if(!actor) 
    {
        ui.notifications.error(game.i18n.localize("ERROR.NO_TOKEN_SELECTED"));
    } else {    
        let keys = Object.keys(actor.data.data.attributes);
        let allKeys = "";
        keys.forEach(t => {
            allKeys = allKeys.concat(`<option value="${t}">${game.i18n.localize(actor.data.data.attributes[t].label)}`);
        });

        let dialog_content = `  
        <div class="form-group">
        <label for="attribute" style="min-width:10em">${game.i18n.localize("DIALOG.ATTRIBUTE")}</label>
        <select id="attribute" name="category">${allKeys}
        </select>
        </div>`;

        let x = new Dialog({
            content : dialog_content,
            alternatives: keys,
            buttons : 
            {
            Ok : { label : `Ok`, callback : async (html)=> await rollAttribute(actor, html.find('#attribute')[0].value)},
            Cancel : {label : `Cancel`}
            }
        });
        
        x.options.width = 200;
        x.position.width = 300;
        
        x.render(true);

    }
})();

async function rollAttribute(actor, attribute)
{
    // console.log(actor);
    actor.rollAttribute(attribute, null, null);
}
