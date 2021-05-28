// Make it a PC
(()=>{
    let dialog_content = `  
    <div class="form-group">
        Type the exact name of the player/npc - ensure the Player/NPC has a unique name among all your actors.  <br/> A NPC will be made into a player. A player will be made into an NPC.<br/>
      <label for="npctext">NPC name</label>
      <input name="npctext" type="text">
    </div>`;
  
    let x = new Dialog({
      content : dialog_content,
      buttons : 
      {
        Ok : { label : `Ok`, callback : async (html)=> await change2PC(html.find('[name=npctext]')[0].value.replace(/[\r|\n]/g, ""))},
        Cancel : {label : `Cancel`}
      }
    });
  
    x.options.width = 200;
    x.position.width = 200;
  
    x.render(true);
  
})();

async function change2PC(npcname)
{
    let myActor = game.actors.getName(npcname);
    console.log(myActor);
    if( myActor === null) {
        ui.notifications.error(`Could not find actor with name ${npcname}. Try again`);
        return;
    }
    let update = { 
        type : myActor.type === "player" ? "monster":"player"
    };
    await myActor.update(update);
    ui.notifications.info(`Actor with name ${npcname} is now a ${update.type}.`);
}