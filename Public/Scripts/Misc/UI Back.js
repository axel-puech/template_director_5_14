// INPUTS
//@input SceneObject parent

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
    //print('clear')
   
}

function Update(){
}