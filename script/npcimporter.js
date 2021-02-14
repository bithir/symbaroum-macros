/**
 * To use this macro, paste monster data from a pdf, including the name of the monster, to the end of the "Tactics" section
 */

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
        Ok : { label : `Ok`, callback : async (html)=> await extractAllData(html.find('[name=npctext]')[0].value.replace(/[\r|\n]/g, ""))},
        Cancel : {label : `Cancel`}
      }
    });
  
    x.options.width = 200;
    x.position.width = 200;
  
    x.render(true);
  
})();

async function extractSpecialItems(actorItems, abilitilist, abilityPattern)
{
    if( abilitilist !== null) {

        await abilitilist.forEach(async element => { 
            let tmpdata = element.trim().match(abilityPattern);
            if( tmpdata != null && tmpdata.length == 3)
            {
                let higherLevel = false;
                let ability = game.items.filter(element => element.name.toLowerCase() === tmpdata[1].trim().toLowerCase());
                if(ability.length > 0 )
                {
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
                    actorItems.push(ability);
                }

            }
            else 
            {
                console.log("element["+element+"] not found - add manually");           
            }
        });
    }    
}

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
    // npcData = "Night Swarmers, swarm Manner Chattering, swirling Race Abomination Resistance Challenging Traits Corrupting Attack (II), Fleet- footed, Night Perception, Piercing Attack (II), Regeneration (III), Swarm (II), Wings (II) Accurate 11 (–1), Cunning 5 (+5), Discreet 10 (0), Persuasive 7 (+3), Quick 15 (–5), Resolute 9 (+1), Strong 13 (–3), Vigilant 10 (0) Abilities Natural Warrior (adept) Weapons Bite 0 (penetrating: 5), two Accurate attacks at the same target, 1D6 temporary corruption Armor Half damage according to Swarm II, regenerates 4 Toughness per turn except fire damage. Defense –5 Toughness 13 Pain Threshold 7 Shadow Flickering black, like swir- ling soot flakes in starlight (thoroughly corrupt) Tactics: The swarm has nothing in mind besides gorging until it is full, and it does not quit until the target is blight born or leaves its territory.";
    // npcData = "Spring Elf Race Elf Resistance Weak Traits Long-lived Accurate 10 (0), Cunning 10 (0), Discreet 15 (−5), Persuasive 9 (+1), Quick 13 (−3), Resolute 7 (+3), Strong 5 (+5), Vigilant 11 (−1) Abilities None Weapons Dagger 3 (short), Bow 4 Accurate Armor None Defense −3 Toughness 10 Pain Threshold 3 Equipment Nothing of value Shadow Bright green, like the leaves on a baby birch (corruption: 0) Tactics: The spring elves keep their distance and attack the enemy with their bows, or else try to lure victim into varying kinds of traps or ambushes.";
    // npcData = "Autumn Elf Race Elf Resistance Strong Traits Long-lived Accurate 9 (+1), Cunning 13 (−3), Discreet 10 (0), Persuasive 11 (−1), Quick 5 (+5), Resolute 15 (−5), Strong 7 (+3), Vigilant 10 (0) Abilities Loremaster (master), Medicus (master), Mystical Power (Bend Will, master), Mystical Power (Larvae Boil, master), Ritualist (master) Weapons Sword 4 Accurate Armor Woven Silk 2 (flexible) Defense +5 Toughness 10 Pain Threshold 4 Equipment 10 Herbal cures Shadow Yellow and red as the autumn leaves, with faint streaks of rusty brown (corruption: 2*) Tactics: Autumn elves lead their siblings from a dis- tance, supporting allies with their mystical powers.";
    // npcData = "Necromage Race Spirit Resistance Challenging Traits Alternative damage (III), Spirit form (III), Terrify (II) Accurate 10 (0), Cunning 9 (+1), Discreet 11 (−1), Persuasive 5 (+5), Quick 13 (−3), Resolute 15 (−5), Strong 7 (+3), Vigilant 10 (0) Abilities Mystical power (Bend will, adept) Weapons Wraith claws 5, ignores armor, Accurate damages Resolute Armor None, only mystical powers and magical weapons are harmful, only with half damage Defense −3 Toughness 10 Pain Threshold — Equipment None Shadow Dark gray, like thunderclouds in a cold night sky (thoroughly corrupt) Tactics: The necromage calls on its victims by bending their will, follows up by making them terrified and finishes them off with its claws when they are helpless.";
    // npcData = "Primal Blight Beast Race Abomination Resistance Mighty Traits Acidic Blood (III), Armored (III), Corrupting Attack (III), Natural Weapon (III), Regeneration (III), Robust (III) Discreet 5 (+5), Quick 11 (−1), Cunning 9 (+1), Strong 18 (−8), Accurate 13 (−3), Vigilant 10 (0), Resolute 10 (0), Persuasive 7 (+3) Abilities Berserker (master), Exceptionally Strong (master), Iron Fist (master), Natural Warrior (master) Weapons Claws 20 (long), or two attacks Strong against the same target with damage 18 and 14, +1D8 in tem- porary corruption. Armor Blight Hardened Flesh 10, regen- erates 4 Toughness/turn Defense +3 Toughness 18 Pain Threshold 9 Shadow The deepest black, a light-con- suming stain on the midnight sky (thoroughly corrupt) Tactics: None. Its hatred towards all things living drives it to act without tactical concern – all that matters is destruction.";
    // npcData = "Cryptwalker Race Spirit Resistance Strong Traits Gravely cold (III), Manifestation (III), Spirit form (III) Accurate 5 (+5), Cunning 10 (0), Discreet 7 (+3), Persuasive 10 (0), Quick 11 (−1), Resolute 13 (−3), Strong 15 (−5), Vigilant 9 (+1) Abilities Iron Fist (master), Twin Attack (master) Weapons 2 swords 7/6 (balanced), two Strong attacks against the same target Armor None, only mystical powers and magical weapons are harmful, only with half damage Defense −3 (two weapons) Toughness 15 Pain Threshold — Equipment Two wraith blades (quality: Balanced) Shadow Like a clear night sky, with faint light that does nothing but make the dark seem blacker (thoroughly corrupt) Tactics: The cryptwalker assumes that the ene- my will have a hard time damaging it, until proven otherwise. Either way it uses its gravely cold power to paralyze enemies, then finishes them off with the swords.";
    let expectedData = npcData.replaceAll("- ","");

    let namePattern = /^(.+?) [Race|Manner]+/;
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

    let abilitiesPattern = /Abilities (.*) Weapons /;
    let singleAbilityPattern = /([^,^\)]+?)\),?/g;
    let abilityPattern = /([^\(]+)\((.+)\)/;
    let allAbilities = extractData(expectedData,abilitiesPattern);
    let abilitilist = allAbilities.match(singleAbilityPattern);
    let actorItems = [];
    // Normal abilities
    // Medicus (master), 
    await extractSpecialItems(actorItems, abilitilist, abilityPattern);
    // Mystical Power
    let mysicalPowerPattern = /Mystical Power \(([^,]+), (.*)\)/
    // Mystical Power (Bend Will, master)
    await extractSpecialItems(actorItems, abilitilist, mysicalPowerPattern);

    let traitsPattern = /Traits (.+) Accurate [0-9]/;
    // console.log("Traits["+extractData(expectedData,traitsPattern)+"]");
    let traitstlist = extractData(expectedData,traitsPattern).match(singleAbilityPattern);
    console.log("traitslist ="+JSON.stringify(traitstlist));
    await extractSpecialItems(actorItems, traitstlist, abilityPattern);



    let updateObj = await actor.createOwnedItem(actorItems);
    // console.log("updateObj "+JSON.stringify(updateObj));
}