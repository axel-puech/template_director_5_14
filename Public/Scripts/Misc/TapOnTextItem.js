// INPUTS
//@input SceneObject textItem
//@input Component.InteractionComponent textItemInteraction

//@input SceneObject itemOff
//@input SceneObject itemOn


// SUBSCENE //
script.api.subScene = new global.SubScene(script, script.parent);
script.api.subScene.OnStart = Start
script.api.subScene.OnLateStart = LateStart
script.api.subScene.OnStop = Stop

// VARIABLES //
var itemActive = false
var executed = false;


// FUNCTIONS //
function Start() {
    
}

function LateStart() {
    //print('oue')
}

function Stop() {
    Clear()
}

function Clear(){
    //print('clear')
}

function Update(){
}


// Subscribe to the onTap event
script.textItemInteraction.onTap.add(function(tapEventArgs){
    print('item active : '+ itemActive)
    itemActive = !itemActive
    
    if (itemActive) {
        //script.background.getComponent("Component.MaterialMeshVisual").mainPass.baseTex = script.backgroundTextureInGame;
    } else {
        
    }
    
    
    //script.festivalTexts.enabled = false
});

