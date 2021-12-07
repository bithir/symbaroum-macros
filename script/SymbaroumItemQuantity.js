(()=>{
let actorName = 'Bithir'; // Change here to 'actor name' for the actor name, if you want to hard code the actor
let itemName = 'Normal Arrow'; // Change ehre to 'item name' for the item to increase/decrease
let itemCount = -1; // change to number you want to increase (> 0) or decrease (negtive value)

updateQuantity(actorName, itemName, itemCount);
})();

async function updateQuantity(actorName, itemName, itemCount)
{
    let actor = game.actors.getName(actorName);
    let item = actor.items.filter(e => { if(e.data.name == itemName) 
        return e;
    });
    if(item.length == 0) {
        // Notify
        return;
    }
    let itemUpdate = {_id: item[0].id};
    setProperty(itemUpdate, "data.number", item[0].data.data.number + itemCount);
    game.symbaroum.log(itemUpdate);

    await actor.updateEmbeddedDocuments("Item", [itemUpdate] );    
}