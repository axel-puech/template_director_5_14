//@input SceneObject parent
//@input Component.MaterialMeshVisual[] tableauxMeshes
//@input Component.InteractionComponent[] interactionComponents
//@input int easing {"widget":"combobox","values":[{"label":"Linear","value":0},{"label":"QuadraticIn","value":1},{"label":"QuadraticOut","value":2},{"label":"QuadraticInOut","value":3},{"label":"CubicIn","value":4},{"label":"CubicOut","value":5},{"label":"CubicInOut","value":6},{"label":"QuarticIn","value":7},{"label":"QuarticOut","value":8},{"label":"QuarticInOut","value":9},{"label":"QuinticIn","value":10},{"label":"QuinticOut","value":11},{"label":"QuinticInOut","value":12},{"label":"SinusoidalIn","value":13},{"label":"SinusoidalOut","value":14},{"label":"SinusoidalInOut","value":15},{"label":"ExponentialIn","value":16},{"label":"ExponentialOut","value":17},{"label":"ExponentialInOut","value":18},{"label":"CircularIn","value":19},{"label":"CircularOut","value":20},{"label":"CircularInOut","value":21},{"label":"ElasticIn","value":22},{"label":"ElasticOut","value":23},{"label":"ElasticInOut","value":24},{"label":"BackIn","value":25},{"label":"BackOut","value":26},{"label":"BackInOut","value":27},{"label":"BounceIn","value":28},{"label":"BounceOut","value":29},{"label":"BounceInOut","value":30}]}


script.api.subScene = new global.SubScene(script, script.parent);
script.api.subScene.OnLateStart = LateStart;
script.api.subScene.OnStop = Stop;

//VARIABLES

global.numTab = 0;
let tabCaller = script.api.subScene.CreateCaller("tab")
let murListener = script.api.subScene.CreateListener("mur", OnMur);

function LateStart() {
    var delayedEvent = script.createEvent("DelayedCallbackEvent");
    delayedEvent.bind(function(eventData) {
        SetUpInteractionsEvent()
    });
    delayedEvent.reset(2.5);
}

function Stop() {
    ResetInteractions();
}

function SetUpInteractionsEvent() {
    const objectNames = [
        "Coquelicot", "Vague", "Nuit étoilée", "Pont",
        "Port", "Laitière", "Cri", "Fleurs"
    ];

    for (let i = 0; i < script.interactionComponents.length; i++) {
        let interaction = script.interactionComponents[i];
        interaction.onTap.add(function(tapEventArgs) {
            print(objectNames[i] || "Tableau " + (i + 1));
            
            // Fade out tous les tableaux
            global.numTab = i;
            tabCaller.Call();
            delayFadeTab.event.reset(0)
            
            // Désactiver toutes les interactions
            for (let k = 0; k < script.interactionComponents.length; k++) {
                script.interactionComponents[k].enabled = false;
            }
        });
    }
}

function ResetInteractions() {
    for (let i = 0; i < script.interactionComponents.length; i++) {
        script.interactionComponents[i].enabled = true;
        if (i < script.tableauxMeshes.length) {
            script.tableauxMeshes[i].mainPass.baseColor = new vec4(1, 1, 1, 1);
        }
    }
}

function OnMur(){
    ResetInteractions();
    fadeMur.GoTo(1);
}

const delayFadeTab = script.api.subScene.CreateEvent("DelayedCallbackEvent", () => {
    fadeTab.GoTo(1)
});

// ANIMATIONS
const fadeTab = new Animation(script.getSceneObject(), 1, UpdateFadeTab);
fadeTab.Easing = global.GetEasing(script.easing);

function UpdateFadeTab(ratio) {
    for (let j = 0; j < script.tableauxMeshes.length; j++) {
        script.tableauxMeshes[j].mainPass.baseColor = new vec4(1, 1, 1, 1-ratio);
    }
}

const fadeMur = new Animation(script.getSceneObject(), 1, UpdateFadeMur);
fadeTab.Easing = global.GetEasing(script.easing);

function UpdateFadeMur(ratio) {
    for (let j = 0; j < script.tableauxMeshes.length; j++) {
        script.tableauxMeshes[j].mainPass.baseColor = new vec4(1, 1, 1, ratio);
    }
}