/**
 * To use this macro, paste monster data from a pdf, for the starter set or haunted wastes:
 * including the name of the monster, to the end of the "Tactics" section
 * 
 * If you use qpdfviewer - press 4 returns after the name
 * 
 * 
 * 
 *  
 * Make sure you have all abilities, traits and powers in the "Items" in Foundry.
 * 
 */

// THIS IS WHAT YOU NEED
const countnl = (str) => {
    const re = /[\n\r]/g
    return ((str || '').match(re) || []).length
}

const countother = (pattern, str) => {
    const re = pattern
    return ((str || '').match(re) || []).length
}

const extractData = function(inputData, inputPattern) {
    let tmp = inputData.match(inputPattern);
    if( tmp != null && tmp.length >= 2) {
        // successful match
        return tmp[1];
    }
    return "nomatch";
};



(()=>{
    let dialog_content = `  
    <div class="form-group">
      <label for="npctext">Paste NPC data</label>
      <textarea style="width:10em" name="npctext" type="textarea" col=15></textarea>
    </div>`;
  
    let x = new Dialog({
      content : dialog_content,
      buttons : 
      {
        Ok : { label : `Ok`, callback : async (html)=> await extractAllData(html.find('[name=npctext]')[0].value)},
        Cancel : {label : `Cancel`}
      }
    });
  
    x.options.width = 200;
    x.position.width = 200;
  
    x.render(true);
  
})();

async function extractSpecialItems(actorItems, type, abilitilist, abilityPattern)
{
    let message = "";
    if( abilitilist !== null) {
        await abilitilist.forEach(async element => { 
            let tmpdata = element.trim().match(abilityPattern);
            if(tmpdata !== null ) {
                console.log("tmpdata = "+tmpdata);
            }
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
                        higherLevel = true;
                        setProperty(ability, "data.novice.isActive",true);                        
                    }
                    abilityAction = getProperty(ability, "data.novice.action");
                    if( abilityAction === "") {
                        setProperty(ability, "data.novice.action", "A");
                    }
                    if( !higherLevel ) {
                        message += `Could not establish level for ${ability.name} - change manually <br/>`;
                    }
                    // console.log("Final ability "+JSON.stringify(ability));
                    console.log("Added ability "+ability.name)
                    actorItems.push(ability);
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

async function extractAllData(npcData)
{
    let additionalInfo = "";

    // Count new lines
    if( countnl(npcData) > 3 ) {
        npcData = npcData.replace(/[\r|\n]/, " NLMARKER ");
    } else {
        // Find text after name - not sure this is doable - hack it for now?
        // Recommendation is to "have 4 linebreaks after name"

    }
    expectedData = npcData.replace(/[\r|\n]/g, " ");
    expectedData = expectedData.replace(/−/g, "-");
    expectedData = expectedData.replace(/Integrated /g,""); 
    expectedData = expectedData.replace(/Abilities /g,""); 
    // Hack
    expectedData = expectedData.replace(/Traits [-]/g,"Traits "); 
    expectedData = expectedData.replace(/( )?[-] /g,"");
    
    console.log(expectedData);    

    let namePattern = /^(.+?) (Race|Manner|NLMARKER)/;
    let newValues = {
        name: extractData(expectedData,namePattern),
        type: "monster",
        folder: null,
        sort: 12000,
        data: {},
        token: {},
        items: [],
        flags: {}        
    }

    let mannerPattern = /resistance “(.*)”/;
    setProperty(newValues, "data.bio.manner",extractData(expectedData,mannerPattern));

    let racePattern = /NLMARKER (.*), .* resistance/;
    setProperty(newValues, "data.bio.race",extractData(expectedData,racePattern));

    let myMatches = [];
    // console.log("My count other is "+countother(/ACC CUN DIS PER QUI RES STR VIG/g,expectedData));
    if( countother(/ACC CUN DIS PER QUI RES STR VIG/g,expectedData) == 1 ) {
        // do it this way
        myMatches = expectedData.match(/ACC CUN DIS PER QUI RES STR VIG ([-+]?[0-9]+) ([-+]?[0-9]+) ([-+]?[0-9]+) ([-+]?[0-9]+) ([-+]?[0-9]+) ([-+]?[0-9]+) ([-+]?[0-9]+) ([-+]?[0-9]+)/);
        
    } else {         
        // do it the other way
        myMatches = expectedData.match(/ACC ([-+]?[0-9]+) CUN ([-+]?[0-9]+) DIS ([-+]?[0-9]+) PER ([-+]?[0-9]+) QUI ([-+]?[0-9]+) RES ([-+]?[0-9]+) STR ([-+]?[0-9]+) VIG ([-+]?[0-9]+)/);
    }
    if(myMatches.length === 9 ) {
        setProperty(newValues, "data.attributes.accurate.value", 10 - parseInt(myMatches[1]) );
        setProperty(newValues, "data.attributes.cunning.value", 10 - parseInt(myMatches[2]) );    
        setProperty(newValues, "data.attributes.discreet.value", 10 - parseInt(myMatches[3]) );    
        setProperty(newValues, "data.attributes.persuasive.value", 10 - parseInt(myMatches[4]) );    
        setProperty(newValues, "data.attributes.quick.value", 10 - parseInt(myMatches[5]) );    
        setProperty(newValues, "data.attributes.resolute.value", 10 - parseInt(myMatches[6]) );    
        setProperty(newValues, "data.attributes.strong.value", 10 - parseInt(myMatches[7]) );    
        setProperty(newValues, "data.attributes.vigilant.value", 10 - parseInt(myMatches[8]) );    
    } else {
        additionalInfo += "Could not find the attributes<br/>";
    }
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

    let abilitiesPattern = /Traits (.*) Equipment /;
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
    additionalInfo += await extractSpecialItems(actorItems, "trait", abilitilist, abilityPattern);

    // console.log("actorItems:"+JSON.stringify(actorItems));

    let updateObj = await actor.createEmbeddedDocuments("Item", actorItems);
    // console.log("updateObj "+JSON.stringify(updateObj));


    let healMe = {_id:actor.id};
    setProperty(healMe, "data.health.toughness.value", getProperty(actor, "data.data.health.toughness.max") );
    await Actor.updateDocuments([healMe]);

    let message = `Created ${actor.name}<br/>${additionalInfo}`;
    ChatMessage.create({
        speaker: ChatMessage.getSpeaker({alias: "NPC Importer Macro"}),
        whisper: [game.user],
        content: message
    });

}