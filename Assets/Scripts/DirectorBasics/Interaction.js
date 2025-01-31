//@input SceneObject parent
//@input Component.Image[] tableaux
//@input Component.Image[] text
//@input Component.InteractionComponent MainTap
//@input int easing {"widget":"combobox","values":[{"label":"Linear","value":0},{"label":"QuadraticIn","value":1},{"label":"QuadraticOut","value":2},{"label":"QuadraticInOut","value":3},{"label":"CubicIn","value":4},{"label":"CubicOut","value":5},{"label":"CubicInOut","value":6},{"label":"QuarticIn","value":7},{"label":"QuarticOut","value":8},{"label":"QuarticInOut","value":9},{"label":"QuinticIn","value":10},{"label":"QuinticOut","value":11},{"label":"QuinticInOut","value":12},{"label":"SinusoidalIn","value":13},{"label":"SinusoidalOut","value":14},{"label":"SinusoidalInOut","value":15},{"label":"ExponentialIn","value":16},{"label":"ExponentialOut","value":17},{"label":"ExponentialInOut","value":18},{"label":"CircularIn","value":19},{"label":"CircularOut","value":20},{"label":"CircularInOut","value":21},{"label":"ElasticIn","value":22},{"label":"ElasticOut","value":23},{"label":"ElasticInOut","value":24},{"label":"BackIn","value":25},{"label":"BackOut","value":26},{"label":"BackInOut","value":27},{"label":"BounceIn","value":28},{"label":"BounceOut","value":29},{"label":"BounceInOut","value":30}]}

script.api.subScene = new global.SubScene(script, script.parent);
script.api.subScene.OnLateStart = LateStart;
script.api.subScene.OnStop = Stop;

//VARIABLES
let murCaller = script.api.subScene.CreateCaller("mur")
let tabListener = script.api.subScene.CreateListener("tab", OnTab);

function LateStart() {
    script.MainTap.enabled = false;
    
    for (let i = 0; i < script.tableaux.length; i++) {
        script.tableaux[i].mainPass.baseColor = new vec4(1, 1, 1, 0); 
        script.text[i].mainPass.baseColor = new vec4(1, 1, 1, 0); 
    }
    SetupMainTapInteraction();
}

function Stop(){
    script.MainTap.enabled = false;
}

function SetupMainTapInteraction() {
    script.MainTap.onTap.add(function() {
        if (script.MainTap.enabled) {
            script.MainTap.enabled = false;
            murCaller.Call();
            print("Main Tap desactivé");
            fadeTabOut.GoTo(1);
        }
    });
}

function OnTab(){
    delayFadeTab.event.reset(0.5)
    script.MainTap.enabled = true;
}

const delayFadeTab = script.api.subScene.CreateEvent("DelayedCallbackEvent", () => {
    fadeTab.GoTo(1)
});


// ANIMATIONS
const fadeTab = new Animation(script.getSceneObject(), 1, UpdateFadeTab);
fadeTab.Easing = global.GetEasing(script.easing);

const fadeTabOut = new Animation(script.getSceneObject(), 1, UpdateFadeTabOut);
fadeTab.Easing = global.GetEasing(script.easing);

function UpdateFadeTab(ratio) {
    script.tableaux[global.numTab].mainPass.baseColor = new vec4(1, 1, 1, ratio);
    script.text[global.numTab].mainPass.baseColor = new vec4(1, 1, 1, ratio);
}

function UpdateFadeTabOut(ratio) {
    script.tableaux[global.numTab].mainPass.baseColor = new vec4(1, 1, 1, 1 - ratio);
    script.text[global.numTab].mainPass.baseColor = new vec4(1, 1, 1, 1 - ratio);
}