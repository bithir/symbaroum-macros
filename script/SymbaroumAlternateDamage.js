
if (canvas.tokens.controlled.length === 0)
  return ui.notifications.error("Please select a token first");

new Dialog({
  title: `Alternate Damage`,
  content: `
    <form>
    <div style="display:flex">
    <label style="min-width:15em" for="damagetype">Damage type:</label>
    <select id="vision-type" style="min-width:10em" name="damagetype">
    <option value="accurate">${game.i18n.localize("ATTRIBUTE.ACCURATE")}</option>
    <option value="cunning">${game.i18n.localize("ATTRIBUTE.CUNNING")}</option>
    <option value="discreet">${game.i18n.localize("ATTRIBUTE.DISCREET")}</option>
    <option value="persuasive">${game.i18n.localize("ATTRIBUTE.PERSUASIVE")}</option>
    <option value="quick">${game.i18n.localize("ATTRIBUTE.QUICK")}</option>
    <option value="resolute">${game.i18n.localize("ATTRIBUTE.RESOLUTE")}</option>
    <option value="strong">${game.i18n.localize("ATTRIBUTE.STRONG")}</option>
    <option value="vigilant">${game.i18n.localize("ATTRIBUTE.VIGILANT")}</option>    
    </select>
    </div>
    <div style="display:flex; margin-top:5px; margin-bottom:5px">
    <label style="min-width:15em" for="altdam">Damage:</label>
    <input style="max-width:10em" id="altdam" name="altdam" type="text">
    </div>
    </form>
    `,
  buttons: {
    yes: {
      icon: "<i class='fas fa-check'></i>",
      label: `Apply Damage`,
      callback: async (html)=> {
          await dealDamage(html.find("#vision-type")[0].value, html.find('#altdam')[0].value);
        }
    },
    no: {
      icon: "<i class='fas fa-times'></i>",
      label: `Cancel Damage`
    },
  },
  default: "yes",
}).render(true);

async function dealDamage(type, damage)
{
    for ( let token of canvas.tokens.controlled ) {
        let calcDam = parseInt(damage) * -1;
        if( isNaN(calcDam)) {
            console.log("Can't understand damage["+damage+"] - is this a number?");
            break;
        }
        let actor = token.actor;
        if( actor.data.data.attributes[type] === undefined || actor.data.data.attributes[type] === null) {
            console.log("This is not an attribute in Symbaroum");
            break;
        }
        let tot = actor.data.data.attributes[type].temporaryMod + calcDam;
        let modification = {        };
        setProperty(modification, `data.attributes.${type}.temporaryMod`, tot);        
        await actor.update(modification);
    }
}