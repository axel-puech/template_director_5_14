// INPUTS
//@input SceneObject parent
//@input Component.InteractionComponent startButtonInteraction
//@input SceneObject background
//@input SceneObject introElement
//@input SceneObject inGameElement
//@input Asset.Texture backgroundTextureInGame

script.api.subScene = new global.SubScene(script, script.parent);
script.api.subScene.OnStart = Start
script.api.subScene.OnLateStart = LateStart
script.api.subScene.OnStop = Stop


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
    script.inGameElement.enabled = false
    //print('clear')
   
}

function Update(){
}


// Subscribe to the onTap event
var onTapEvent = script.startButtonInteraction.onTap.add(function(tapEventArgs){
    print("onTap!"); 
    
    script.background.getComponent("Component.MaterialMeshVisual").mainPass.baseTex = script.backgroundTextureInGame;
    script.introElement.enabled = false    
    script.inGameElement.enabled = true
});
