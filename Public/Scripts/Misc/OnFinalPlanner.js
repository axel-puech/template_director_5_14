////////////////////////
/////// INPUTS
////////////////////////
//@input SceneObject parent
//@input SceneObject finalPlanner

////////////////////////
/////// SUBSCENE
////////////////////////
script.api.subScene = new global.SubScene(script, script.parent);
script.api.subScene.OnStart = Setup;
script.api.subScene.OnStop = Clear;

////////////////////////
/////// VARIABLES
////////////////////////
var listenner = script.api.subScene.CreateListener("CallFinalPlanner", OnAction, OnSetup);

////////////////////////
/////// FUNCTIONS
////////////////////////
function Setup(){};

function Clear(){};

function OnSetup (){
    print('OnSetup')
};

function OnAction () {
    print("OnAction");
};