/**
 * To use this macro, paste monster data from a pdf, for the core book:
 * including the name of the monster, to the end of the "Tactics" section
 * 
 * For the monster codex, manually type in the name, then copy from Manners to end of tactics and paste.
 * Warning: the tilted character sheet can cause issues, depending on your pdf viewer, you might need to do those manually.
 * 
 * WARNING: If you have multiple items that matches the name of abilities, traits and mystical powers, they might be found instead.
 *  
 * Make sure you have all abilities, traits and powers in the "Items" in Foundry.
 * 
 */

(()=>{
    let dialog_content = `  
    <div class="symbaroum dialog">
        <div style="width:100%; text-align:center">
            <h3><a href="https://freeleaguepublishing.com/en/store/?product_id=7092032045205" target="_blank">Symbaroum Core Book</a> Character Importer</h3>
        </div>
        <div class="advantage">
            <label for="isplayer">Player</label>
            <span class="lblfavour"><input type="checkbox" id="isplayer" name="isplayer"></span>
        </div>
        <div class="advantage">
            <label for="npctext">Paste PDF data</label>
            <input name="npctext" type="text">
        </div>
    </div>`;

    let x = new Dialog({
        content : dialog_content,
        buttons : 
        {
            Ok : { label : `Ok`, callback : async (html)=> await extractAllData(html.find('[name=npctext]')[0].value.replace(/[\r|\n]/g, ""), html.find("#isplayer")[0].checked)},
            Cancel : {label : `Cancel`}
        }
    });

    x.options.width = 400;
    x.position.width = 400;

    x.render(true);

})();

async function extractSpecialItems(actorItems, type, abilitilist, abilityPattern)
{
    let message = "";
    if( abilitilist !== null) {
        await abilitilist.forEach(async element => { 
            let tmpdata = element.trim().match(abilityPattern);
            // console.log("tmpdata = "+tmpdata);
            if( tmpdata != null && tmpdata.length == 3)
            {
                let higherLevel = false;
                let ability = game.items.filter(element => element.name.trim().toLowerCase() === tmpdata[1].trim().toLowerCase() && element.type === type);                
                if(ability.length > 0 )
                {
                    // console.log("ability="+JSON.stringify(ability));

                    ability = duplicate(ability[0].data);
                    let abilityAction = "";

                    // Master ability
                    if(tmpdata[2] === "master" || tmpdata[2] === "III") {                    
                        higherLevel = true;
                        setProperty(ability, "data.master.isActive",true);                                            
                    }                
                    abilityAction = getProperty(ability, "data.master.action");
                    if( abilityAction === "") {
                        setProperty(ability, "data.master.action", "A");
                    }
                    // Adept ability
                    if(tmpdata[2] === "adept" || tmpdata[2] === "II" || higherLevel) {                
                        higherLevel = true;
                        setProperty(ability, "data.adept.isActive",true);                        

                    }    
                    abilityAction = getProperty(ability, "data.adept.action");
                    if( abilityAction === "") {
                        setProperty(ability, "data.adept.action", "A");
                    }
                    // Novice ability
                    if(tmpdata[2] === "novice" || tmpdata[2] === "I" || higherLevel) {                              
                        setProperty(ability, "data.novice.isActive",true);                        
                    }
                    abilityAction = getProperty(ability, "data.novice.action");
                    if( abilityAction === "") {
                        setProperty(ability, "data.novice.action", "A");
                    }
                    // console.log("Final ability "+JSON.stringify(ability));
                    console.log("Added ability "+ability.name)
                    actorItems.push(ability);
                }
                else if( type !== "mysticalPower" && type !== "ability" )
                {
                    message += `${element} not added as ${type} - add manually if needed <br/>`;
                }
            }
            else if( element.trim() !== "")
            {
                // message += `${element} not added - not found under Items - add manually <br/>`;
                console.log("element["+element+"] not found - add manually");           
            }
        });

    }    
    return message;    
}

async function extractAllData(npcData, player)
{
    let additionalInfo = "";

    let extractData = function(inputData, inputPattern) {
        let tmp = inputData.match(inputPattern);
        if( tmp != null && tmp.length >= 2) {
            // successful match
            return tmp[1];
        }
        return "nomatch";
    };
    let expectedData = npcData.replace(/- /g,"");

    let namePattern = /^(.+?) (Race|Manner)/;
    let newValues = {
        name: extractData(expectedData,namePattern),
        type: player ? "player": "monster",
        folder: null,
        sort: 12000,
        data: {},
        token: {},
        items: [],
        flags: {}        
    }

    let mannerPattern = /Manner (.*) Race /;
    setProperty(newValues, "data.bio.manner",extractData(expectedData,mannerPattern));

    let racePattern = /Race (.*) Resistance/;
    setProperty(newValues, "data.bio.race",extractData(expectedData,racePattern));

    let attributePattern = /Accurate ([0-9]+)/;
    // console.log("Accurate["+extractData(expectedData,attributePattern)+"]");
    setProperty(newValues, "data.attributes.accurate.value", parseInt(extractData(expectedData,attributePattern)));
    attributePattern = /Cunning ([0-9]+)/;
    // console.log("Cunning["+extractData(expectedData,attributePattern)+"]");
    setProperty(newValues, "data.attributes.cunning.value", parseInt(extractData(expectedData,attributePattern)));    
    attributePattern = /Discreet ([0-9]+)/;
    // console.log("Discreet["+extractData(expectedData,attributePattern)+"]");
    setProperty(newValues, "data.attributes.discreet.value", parseInt(extractData(expectedData,attributePattern)));
    attributePattern = /Persuasive ([0-9]+)/;
    // console.log("Persuasive["+extractData(expectedData,attributePattern)+"]");
    setProperty(newValues, "data.attributes.persuasive.value", parseInt(extractData(expectedData,attributePattern)));
    attributePattern = /Quick ([0-9]+).+\)/;
    // console.log("Quick["+extractData(expectedData,attributePattern)+"]");
    setProperty(newValues, "data.attributes.quick.value", parseInt(extractData(expectedData,attributePattern)));
    attributePattern = /Resolute ([0-9]+)/;
    // console.log("Resolute["+extractData(expectedData,attributePattern)+"]");
    setProperty(newValues, "data.attributes.resolute.value", parseInt(extractData(expectedData,attributePattern)));
    attributePattern = /Strong ([0-9]+)/;
    // console.log("Strong["+extractData(expectedData,attributePattern)+"]");
    setProperty(newValues, "data.attributes.strong.value", parseInt(extractData(expectedData,attributePattern)));
    attributePattern = /Vigilant ([0-9]+)/;
    // console.log("Vigilant["+extractData(expectedData,attributePattern)+"]");
    setProperty(newValues, "data.attributes.vigilant.value", parseInt(extractData(expectedData,attributePattern)));

    let shadowPattern = /Shadow (.*) \(/;
    // console.log("Shadow["+extractData(expectedData,shadowPattern)+"]");    
    setProperty(newValues, "data.bio.shadow", extractData(expectedData,shadowPattern));
    
    // If nomatch == thouroughly corrupt
    let corruptionPattern = /\(corruption: ([0-9]+).?\)/;
    // console.log("Permanent Corruption["+extractData(expectedData,corruptionPattern)+"]");   
    let corr = extractData(expectedData,corruptionPattern);
    if( corr !== null && corr !== "nomatch" ) {
        setProperty(newValues, "data.health.corruption.permanent", parseInt(extractData(expectedData,corruptionPattern))); 
    }
    
    let tacticsPattern = / Tactics: (.*)/;
    // console.log("Tactics["+extractData(expectedData,tacticsPattern)+"]");
    setProperty(newValues, "data.bio.tactics", extractData(expectedData,tacticsPattern));

    let actor = await Actor.create(newValues);

    let abilitiesPattern = /Abilities (.+?) Weapons /;
    let singleAbilityPattern = /([^,^\)]+?\))?/g;
    let abilityPattern = / ?([^\(]+)\((.+)\)/;
    let allAbilities = extractData(expectedData,abilitiesPattern);
    console.log("allAbilities:"+allAbilities);
    let abilitilist = allAbilities.match(singleAbilityPattern);
    let actorItems = [];
    console.log("abilitylist:"+abilitilist);

    // Normal abilities
    // Medicus (master), 
    additionalInfo += await extractSpecialItems(actorItems, "ability", abilitilist, abilityPattern);
    additionalInfo += await extractSpecialItems(actorItems, "mysticalPower", abilitilist, abilityPattern);
    // Mystical Power
    // let mysticalPowerPattern = /Mystical [Pp]ower \(([^,]+), ([^\)]*)\)/g;
    let singleMysticalPowerPattern = /Mystical [Pp]ower \(([^\)]*)\)/g;
    abilitilist = allAbilities.match(singleMysticalPowerPattern);
    let mysticalPowerPattern = /\(([^,]+), (.*)\)/
    console.log("abilitylist[mp]:"+JSON.stringify(abilitilist));
    // Mystical Power (Bend Will, master)
    additionalInfo += await extractSpecialItems(actorItems, "mysticalPower", abilitilist, mysticalPowerPattern);

    let traitsPattern = /Traits (.+) Accurate [0-9]/;
    console.log("Traits["+extractData(expectedData,traitsPattern)+"]");
    let traitstlist = extractData(expectedData,traitsPattern).match(singleAbilityPattern);
    // console.log("traitslist ="+JSON.stringify(traitstlist));
    additionalInfo += await extractSpecialItems(actorItems, "trait", traitstlist, abilityPattern);

    // console.log("actorItems:"+JSON.stringify(actorItems));

    let updateObj = await actor.createEmbeddedDocuments("Item", actorItems);
    // console.log("updateObj "+JSON.stringify(updateObj));


    let healMe = {_id:actor.id};
    setProperty(healMe, "data.health.toughness.value", getProperty(actor, "data.data.health.toughness.max") );
    await Actor.updateDocuments([healMe]);

    let message = `Created ${actor.name}<br/>${additionalInfo}`;
    ChatMessage.create({
        speaker: ChatMessage.getSpeaker({alias: "Character Importer Macro"}),
        whisper: [game.user],
        content: message
    });

    actor.sheet.render(true);
}