// INPUTS
//@input SceneObject parent
//@input SceneObject menuFestival
//@input SceneObject festivalTexts
//@input SceneObject worldCupTexts
//@input SceneObject attractionTexts
//@input SceneObject exhibitionTexts

//@input Component.InteractionComponent festivalButtonInteraction
//@input Component.InteractionComponent worldCupButtonInteraction
//@input Component.InteractionComponent attractionButtonInteraction
//@input Component.InteractionComponent exhbitionButtonInteraction


// SUBSCENE //
script.api.subScene = new global.SubScene(script, script.parent);
script.api.subScene.OnStart = Start
script.api.subScene.OnLateStart = LateStart
script.api.subScene.OnStop = Stop


// VARIABLES //
var categoryVisited = 1
var allCategoryVisited = false
var festivalVisited = false;
var worldCupVisited = false;
var attractionVisited = false;
var exhibitionVisited = false;

var callFinalPlanner = script.api.subScene.CreateCaller("CallFinalPlanner", false)



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
    //print("update")
}

function changeTexts (item) {
    // Desactive all texts
    script.festivalTexts.enabled = false
    script.worldCupTexts.enabled = false
    script.attractionTexts.enabled = false
    script.exhibitionTexts.enabled = false
    
    // Active text
    switch (item) {
      case "festival":
        script.festivalTexts.enabled = true
        break;
      case "worldCup":
        script.worldCupTexts.enabled = true
        break;
      case "attraction":
        script.attractionTexts.enabled = true
        break;
      case "exhibition":
        script.exhibitionTexts.enabled = true
        break;
    }
    print("categoryVisited : "+ categoryVisited)
    
    if (categoryVisited >= 4 && !allCategoryVisited) {
        allCategoryVisited = true;
        callFinalPlanner.Call(true);
        print('fini')
    }
}

// Subscribe to the onTap event
script.festivalButtonInteraction.onTap.add(function(tapEventArgs){
    changeTexts("festival")
});

script.worldCupButtonInteraction.onTap.add(function(tapEventArgs){
    if (!worldCupVisited) {
        worldCupVisited = true;
        categoryVisited++
    }
    changeTexts("worldCup")
});

script.attractionButtonInteraction.onTap.add(function(tapEventArgs){
    if (!attractionVisited) {
        attractionVisited = true;
        categoryVisited++
    }
    changeTexts("attraction")
});

script.exhbitionButtonInteraction.onTap.add(function(tapEventArgs){
    if (!exhibitionVisited) {
        exhibitionVisited = true;
        categoryVisited++
    }
    changeTexts("exhibition")
});
