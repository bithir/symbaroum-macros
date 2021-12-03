if (canvas.tokens.controlled.length === 0)
    return ui.notifications.error("Please select a token first");

let targetTokens = Array.from(game.user.targets);
if( targetTokens.length === 0) 
    return ui.notifications.error("You have no target selected");

let playerAttr = "cunning";
let targetAttr = "strong";

let playerToken = canvas.tokens.controlled[0];
let player = playerToken.actor;
let targetToken = targetTokens[0];
let target = targetToken.actor;

let targetValue = player.data.data.attributes[playerAttr].total - (target.data.data.attributes[targetAttr].total - 10);

let attributeRoll = new Roll("1d20");
await attributeRoll.evauluate({async:false});
let chatOptions = {
    type: foundry.CONST.CHAT_MESSAGE_TYPES.ROLL,
    speaker: {
        actor: player._id
    },
    roll: attributeRoll,
    rollMode: game.settings.get("core", "rollMode")
};

if( attributeRoll.total > targetValue) {
    chatOptions["content"] = `<h1>Poison fail</h1><div style="min-height:60px; background-size:50px 60px; background-image:url(${playerToken.data.img}); background-repeat:no-repeat"></div>${player.name} failed to poison <div style="min-height:60px; background-size:50px 60px; background-image:url(${targetToken.data.img}); background-repeat:no-repeat"></div> ${target.name}`;
} else {
    let poisonDice = new Roll("2d4");
    poisonDice.evauluate({async:false});

    chatOptions["content"]=`<h1>Poison success</h1><div style="min-height:60px; background-size:50px 60px; background-image:url(${playerToken.data.img}); background-repeat:no-repeat"></div> ${player.name} successfully poisoned <div style="min-height:60px; background-size:50px 60px; background-image:url(${targetToken.data.img}); background-repeat:no-repeat"></div>${target.name} for ${poisonDice.total} turns`;
}

ChatMessage.create(chatOptions);