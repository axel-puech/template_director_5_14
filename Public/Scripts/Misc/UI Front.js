// INPUTS
//@input SceneObject parent

// SUBSCENE
script.api.subScene = new global.SubScene(script, script.parent);
script.api.subScene.OnStart = Start
script.api.subScene.OnLateStart = LateStart
script.api.subScene.OnStop = Stop


// EVENTS
//var onTappedEvent = script.api.subScene.CreateEvent('TapEvent', OnTap);


// FUNCTIONS //
function Start () {
    
}

function LateStart () {
    //print('late start')
}

function Stop () {
    Clear()
}

function Clear (){
    //print('clear')
   
}

function Update (){
}

function OnTap () {
    //print('tap')
}