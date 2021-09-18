if (canvas.tokens.controlled.length === 0)
    return ui.notifications.error("Please select a token first");

let targetTokens = Array.from(game.user.targets);
if( targetTokens.length === 0) 
    return ui.notifications.error("You have no target selected");

let playerAttr = "cunning";
let targetAttr = "strong";

let player = canvas.tokens.controlled[0].actor;
let target = targetTokens[0].actor;

console.log(player);
console.log(target);


let targetValue = player.data.data.attributes[playerAttr].total - (target.data.data.attributes[targetAttr].total - 10);

let attributeRoll = new Roll("1d20");
await attributeRoll.roll();
let chatOptions = {
    type: foundry.CONST.CHAT_MESSAGE_TYPES.ROLL,
    speaker: {
        actor: player._id
    },
    roll: attributeRoll,
    rollMode: game.settings.get("core", "rollMode")
};

if( attributeRoll.total > targetValue) {
    chatOptions["content"] = `<h1>Poison fail</h1>${player.name} failed to poison ${target.name}`;
} else {
    let poisonDice = new Roll("2d4");
    await poisonDice.roll();

    chatOptions["content"]=`<h1>Poison success</h1>${player.name} successfully poisoned ${target.name} for ${poisonDice.total} turns`;
}

ChatMessage.create(chatOptions);
