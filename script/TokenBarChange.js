/* This will set every token in scene to always display their
 * token bars and nameplate, and sets the first bar to represent 
 * HP and removes the second token bar.
*/

// NONE - no information is displayed 
// CONTROL - displayed when the token is controlled 
// OWNER_HOVER - displayed when hovered by a GM or a user who owns the actor 
// HOVER - displayed when hovered by any user 
// OWNER - always displayed for a GM or for a user who owns the actor 
// ALWAYS - always displayed for everyone
let tokens =  canvas.tokens.controlled.map( token => {
   return { _id: token.id,
         "bar2.attribute": "",
         "displayName": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
         "displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS
   }
});
if( tokens && tokens.length > 0) {   
   canvas.scene.updateEmbeddedDocuments("Token", tokens);
}