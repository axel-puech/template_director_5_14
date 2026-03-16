//@input SceneObject subSceneParent
//@input bool useFrontBack = true;

var director = null;

script.createEvent("OnStartEvent").bind(OnStart);;

function OnStart(){ 
    director = new global.Director(script, script.subSceneParent, script.useFrontBack, OnSceneEnded);
}

//global.touchSystem.touchBlocking = true
function OnSceneEnded (sceneName, params)
{
    switch(sceneName){
    case '0_INTRO':
        director.GoToScene("1_CARROUSEL", false, false)
    break;
    case '1_CARROUSEL':
        director.GoToScene("2_END", false, false)
    break;
    case '2_END':
        director.GoToScene("1_CARROUSEL", false, false)
    break;
    }
}

//script.subScene.CallEnd(null);