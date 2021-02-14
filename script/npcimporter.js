(()=>{
    let dialog_content = `  
    <div class="form-group">
      <label for="npctext">Pase NPC data</label>
      <input name="npctext" type="text">
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

async function extractAllData(npcData)
{

    let extractData = function(inputData, inputPattern) {
        let tmp = inputData.match(inputPattern);
        if( tmp != null && tmp.length == 2) {
            // successful match
            return tmp[1];
        }
        return "nomatch";
    };
    // npcData = "Spring Elf Race Elf Resistance Weak Traits Long-lived Accurate 10 (0), Cunning 10 (0), Discreet 15 (−5), Persuasive 9 (+1), Quick 13 (−3), Resolute 7 (+3), Strong 5 (+5), Vigilant 11 (−1) Abilities None Weapons Dagger 3 (short), Bow 4 Accurate Armor None Defense −3 Toughness 10 Pain Threshold 3 Equipment Nothing of value Shadow Bright green, like the leaves on a baby birch (corruption: 0) Tactics: The spring elves keep their distance and attack the enemy with their bows, or else try to lure victim into varying kinds of traps or ambushes.";
    // npcData = "Necromage Race Spirit Resistance Challenging Traits Alternative damage (III), Spirit form (III), Terrify (II) Accurate 10 (0), Cunning 9 (+1), Discreet 11 (−1), Persuasive 5 (+5), Quick 13 (−3), Resolute 15 (−5), Strong 7 (+3), Vigilant 10 (0) Abilities Mystical power (Bend will, adept) Weapons Wraith claws 5, ignores armor, Accurate damages Resolute Armor None, only mystical powers and magical weapons are harmful, only with half damage Defense −3 Toughness 10 Pain Threshold — Equipment None Shadow Dark gray, like thunderclouds in a cold night sky (thoroughly corrupt) Tactics: The necromage calls on its victims by bending their will, follows up by making them terrified and finishes them off with its claws when they are helpless.";
    npcData = "Primal Blight Beast Race Abomination Resistance Mighty Traits Acidic Blood (III), Armored (III), Corrupting Attack (III), Natural Weapon (III), Regeneration (III), Robust (III) Discreet 5 (+5), Quick 11 (−1), Cunning 9 (+1), Strong 18 (−8), Accurate 13 (−3), Vigilant 10 (0), Resolute 10 (0), Persuasive 7 (+3) Abilities Berserker (master), Exceptionally Strong (master), Iron Fist (master), Natural Warrior (master) Weapons Claws 20 (long), or two attacks Strong against the same target with damage 18 and 14, +1D8 in tem- porary corruption. Armor Blight Hardened Flesh 10, regen- erates 4 Toughness/turn Defense +3 Toughness 18 Pain Threshold 9 Shadow The deepest black, a light-con- suming stain on the midnight sky (thoroughly corrupt) Tactics: None. Its hatred towards all things living drives it to act without tactical concern – all that matters is destruction.";
    // npcData = "Cryptwalker Race Spirit Resistance Strong Traits Gravely cold (III), Manifestation (III), Spirit form (III) Accurate 5 (+5), Cunning 10 (0), Discreet 7 (+3), Persuasive 10 (0), Quick 11 (−1), Resolute 13 (−3), Strong 15 (−5), Vigilant 9 (+1) Abilities Iron Fist (master), Twin Attack (master) Weapons 2 swords 7/6 (balanced), two Strong attacks against the same target Armor None, only mystical powers and magical weapons are harmful, only with half damage Defense −3 (two weapons) Toughness 15 Pain Threshold — Equipment Two wraith blades (quality: Balanced) Shadow Like a clear night sky, with faint light that does nothing but make the dark seem blacker (thoroughly corrupt) Tactics: The cryptwalker assumes that the ene- my will have a hard time damaging it, until proven otherwise. Either way it uses its gravely cold power to paralyze enemies, then finishes them off with the swords.";
    expectedData = npcData.replace("- ","");

    let namePattern = /^(.+) Race/;
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

    let racePattern = /Race (.*) Resistance/;
    setProperty(newValues, "data.bio.race",extractData(expectedData,racePattern));

    let attributePattern = /Accurate ([0-9]+)/;
    console.log("Accurate["+extractData(expectedData,attributePattern)+"]");
    setProperty(newValues, "data.attributes.accurate.value", parseInt(extractData(expectedData,attributePattern)));
    attributePattern = /Cunning ([0-9]+)/;
    console.log("Cunning["+extractData(expectedData,attributePattern)+"]");
    setProperty(newValues, "data.attributes.cunning.value", parseInt(extractData(expectedData,attributePattern)));    
    attributePattern = /Discreet ([0-9]+)/;
    console.log("Discreet["+extractData(expectedData,attributePattern)+"]");
    setProperty(newValues, "data.attributes.discreet.value", parseInt(extractData(expectedData,attributePattern)));
    attributePattern = /Persuasive ([0-9]+)/;
    console.log("Persuasive["+extractData(expectedData,attributePattern)+"]");
    setProperty(newValues, "data.attributes.persuasive.value", parseInt(extractData(expectedData,attributePattern)));
    attributePattern = /Quick ([0-9]+).+\)/;
    console.log("Quick["+extractData(expectedData,attributePattern)+"]");
    setProperty(newValues, "data.attributes.quick.value", parseInt(extractData(expectedData,attributePattern)));
    attributePattern = /Resolute ([0-9]+)/;
    console.log("Resolute["+extractData(expectedData,attributePattern)+"]");
    setProperty(newValues, "data.attributes.resolute.value", parseInt(extractData(expectedData,attributePattern)));
    attributePattern = /Strong ([0-9]+)/;
    console.log("Strong["+extractData(expectedData,attributePattern)+"]");
    setProperty(newValues, "data.attributes.strong.value", parseInt(extractData(expectedData,attributePattern)));
    attributePattern = /Vigilant ([0-9]+)/;
    console.log("Vigilant["+extractData(expectedData,attributePattern)+"]");
    setProperty(newValues, "data.attributes.vigilant.value", parseInt(extractData(expectedData,attributePattern)));

    let shadowPattern = /Shadow (.*) \(/;
    console.log("Shadow["+extractData(expectedData,shadowPattern)+"]");    
    setProperty(newValues, "data.bio.shadow", extractData(expectedData,shadowPattern));
    
    // If nomatch == thouroughly corrupt
    let corruptionPattern = /\(corruption: ([0-9]+)\)/;
    console.log("Permanent Corruption["+extractData(expectedData,corruptionPattern)+"]");   
    let corr = extractData(expectedData,corruptionPattern);
    if( corr !== null && corr !== "nomatch" ) {
        setProperty(newValues, "data.health.corruption.permanent", parseInt(extractData(expectedData,corruptionPattern))); 
    }
    
    let tacticsPattern = / Tactics: (.*)/;
    console.log("Tactics["+extractData(expectedData,tacticsPattern)+"]");
    setProperty(newValues, "data.bio.tactics", extractData(expectedData,tacticsPattern));

    let actor = await Actor.create(newValues);

    let traitsPattern = /Traits (.+) Accurate [0-9]/;
    console.log("Traits["+extractData(expectedData,traitsPattern)+"]");


    let abilitiesPattern = /Abilities (.*) Weapons /;
    let singleAbilityPattern = /([^\)]+)\),?/g;
    let allAbilities = extractData(expectedData,abilitiesPattern);
    let abilitilist = allAbilities.match(singleAbilityPattern);
    if( abilitilist !== null) {
        let abilityPattern = /([^\(]+)\((.+)\)/;
        let actorAbilities = [];
        await abilitilist.forEach(async element => { 
            let tmpdata = element.trim().match(abilityPattern);
            if( tmpdata != null && tmpdata.length == 3)
            {
                let higherLevel = false;
                console.log("abilityname["+tmpdata[1].trim()+"]");
                console.log("abilitylevel["+tmpdata[2]+"]");
                let ability = game.items.filter(element => element.name === tmpdata[1].trim());
                if(ability.length > 0 )
                {
                    ability = duplicate(ability[0].data);

                    if(tmpdata[2] === "master") {                    
                        higherLevel = true;
                        setProperty(ability, "data.master.isActive",true);                        
                    }                
                    if(tmpdata[2] === "adept" || higherLevel) {                
                        higherLevel = true;
                        setProperty(ability, "data.adept.isActive",true);                        
                    }    
                    if(tmpdata[2] === "novice" || higherLevel) {                              
                        setProperty(ability, "data.novice.isActive",true);                        
                    }
                    // console.log("Final ability "+JSON.stringify(ability));
                    actorAbilities.push(ability);
                }

            }
            else 
            {
                console.log("element["+element+"] not found - add manually");           
            }
        });
        let updateObj = await actor.createOwnedItem(actorAbilities);
        console.log("updateObj "+JSON.stringify(updateObj));
    }
}