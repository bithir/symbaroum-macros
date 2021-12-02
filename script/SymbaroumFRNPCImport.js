/**
 * To use this macro, paste monster or player JSON data from symbaroum.fr
 * 
 * Make sure you have all abilities, traits and powers in the "Items" in Foundry.
 * 
 */

(()=>{
    let dialog_content = `  
    <div class="form-group">
    <label for="npctext">Paste NPC json data</label>
    <input name="npctext" type="text">
    </div>`;

    let x = new Dialog({
        content : dialog_content,
        buttons : 
        {
            Ok : { label : `Ok`, callback : async (html)=> await extractAllData(html.find('[name=npctext]')[0].value.replace(/[\r|\n]/g, ""))},
            Cancel : {label : `Cancel`}
        }
    });
    x.options.width = 200;
    x.position.width = 200;
    x.render(true);
})();

async function extractAllData(json)
{
    // json = '{"nom":"Example for Bithir","agi":"15","forc":"13","pre":"11","vol":"10","vig":"10","dis":"9","ast":"7","per":"5","ini":"","typ":"Big Monster","def":"15","end":"13","sd":"7","sc":"5","cp":"0","deg":"Sword 1d8","arm":"Light Armor 1d4","notes":"Notes bout the character","tactics":"Attack first, think last","shadow":"Green with golden slashes","equipment":"My equipment","regles":"","lang":"en","epingles":["Acrobatics"],"epinglesn":["Bodyguard"],"epinglesa":["Berserker"],"epinglesm":["Iron fist"]}';
    let symbfrJSON = null;
    try {
        symbfrJSON = JSON.parse(json);
    } catch (err)
    {
        ui.notification.error(err);
        return;
    }
    console.log(symbfrJSON);
    let newValues = {
        name: symbfrJSON.nom,
        type: "monster",
        folder: null,
        sort: 12000,
        data: {},
        token: {},
        items: [],
        flags: {}        
    }

    setProperty(newValues, "data.bio.manner","");

    setProperty(newValues, "data.bio.race", symbfrJSON.typ);

    setProperty(newValues, "data.attributes.accurate.value", parseInt(symbfrJSON.pre));
    setProperty(newValues, "data.attributes.cunning.value", parseInt(symbfrJSON.ast));    
    setProperty(newValues, "data.attributes.discreet.value", parseInt(symbfrJSON.dis));
    setProperty(newValues, "data.attributes.persuasive.value", parseInt(symbfrJSON.per));
    setProperty(newValues, "data.attributes.quick.value", parseInt(symbfrJSON.agi));
    setProperty(newValues, "data.attributes.resolute.value", parseInt(symbfrJSON.vol));
    setProperty(newValues, "data.attributes.strong.value", parseInt(symbfrJSON.forc));
    setProperty(newValues, "data.attributes.vigilant.value", parseInt(symbfrJSON.vig));
    setProperty(newValues, "data.bio.shadow", symbfrJSON.shadow);
    setProperty(newValues, "data.health.corruption.permanent", parseInt(symbfrJSON.cp)); 
    setProperty(newValues, "data.bio.tactics", symbfrJSON.tactics);
    setProperty(newValues, "data.bio.background", symbfrJSON.notes);

    
    let actor = await Actor.create(newValues);
    console.log(actor);
    let additionalInfo = "";
    let items = [];
    additionalInfo += addPowers(symbfrJSON.epingles, items, 3);
    additionalInfo += addPowers(symbfrJSON.epinglesm, items, 3);
    additionalInfo += addPowers(symbfrJSON.epinglesn, items, 1);
    additionalInfo += addPowers(symbfrJSON.epinglesa, items, 2);
    // additionalInfo += addItems(symbfrJSON.equipment); - Just text
    additionalInfo += addItems(symbfrJSON.deg, items);
    additionalInfo += addItems(symbfrJSON.arm, items);

    let updateObj = await actor.createEmbeddedDocuments("Item", items);

    let healMe = {_id:actor.id};
    setProperty(healMe, "data.health.toughness.value", getProperty(actor, "data.data.health.toughness.max") );
    await Actor.updateDocuments([healMe]);

    let message = `Created ${actor.name}<br/>${additionalInfo}`;
    ChatMessage.create({
        speaker: ChatMessage.getSpeaker({alias: "SymbFR Importer Macro"}),
        whisper: [game.user],
        content: message
    });


    actor.sheet.render(true);
}

function addPowers(powernames, items, level) {
    let info = "";
    for(let i = 0; i < powernames.length; i++) {
        let powers = game.items.filter(element => element.name.trim().toLowerCase() === powernames[i].trim().toLowerCase() && element.data.isPower);
        if(powers.length > 1) {
            info += `Found more than one powers of ${powernames[i]}<br>`;
        }    
        for(let j = 0; j < powers.length; j++) {
            let power = duplicate(powers[j].data);
            console.log("Power",powers[j]);
            if(powers[j].data.hasLevels) {
                if(level > 2)
                    setProperty(power, "data.master.isActive",true);
                if(level > 1)
                    setProperty(power, "data.adept.isActive",true);
                setProperty(power, "data.novice.isActive",true);
            }
            items.push(power);
        }
    }
    return info;
}

function addItems(itemName, items) {
    let info = "";
    itemName = itemName.replace(/([0-9]+d[0-9]+)/g,'').trim();
    if( itemName == "") {
        return;
    }
    let foundItems = game.items.filter(element => element.name.trim().toLowerCase() === itemName.toLowerCase() && !element.data.isPower);    
    if(foundItems.length > 1) {
        info += `Found more than one item of ${itemName}`;
    }
    for(let i = 0; i < foundItems.length; i++) {
        let item = duplicate(foundItems[i].data);
        items.push(item);
    }
    return info;
}
