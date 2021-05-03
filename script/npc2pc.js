// Make it a PC
(()=>{
    let dialog_content = `  
    <div class="form-group">
        Type the exact name of the NPC - ensure the NPC has a unique name among all your actors.  The named NPC will be made into a player.
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
    let myNpcActor = game.actors.getName(npcname);
    console.log(myNpcActor);
    if( myNpcActor === null) {
        ui.notifications.error(`Could not find actor with name ${npcname}. Try again`);
        return;
    }
    let update = { 
        _id : myNpcActor._id,
        type : "player"
    };
    if( myNpcActor.data.type !== "monster") {
        ui.notifications.error(`Actor with name ${npcname} is not an NPC.`);
        return;        
    }
    await myNpcActor.update(update);
    ui.notifications.info(`Actor with name ${npcname} is now a PC.`);
}