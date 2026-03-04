//@input SceneObject parent
//input SceneObject image3DExample
//@input SceneObject imageExample
//input SceneObject textExample
//input Asset.Texture[] textureExample
//input Component.AudioComponent soundExample
//input Asset.Texture videoExample
//input Component.VFXComponent particuleExample
//@input float durationFade = 1.0

//ui {"widget":"separator"}
//ui {"widget":"label", "label":"FLOAT PARAMETERS "}
//ui {"widget":"separator"}
//input float speed = 1.0 {"widget":"slider", "min":0, "max":1, "step":0.01}
//input float amplitude = 1.0 {"widget":"slider", "min":0, "max":1, "step":0.01}
//ui {"widget":"separator"}
//ui {"widget":"label", "label":"PARALLAX SETTINGS"}
//ui {"widget":"separator"}
//input float strenghtX
//input float strenghtY
//input float parallaxStrenghtGrassX
//input float parallaxRangeX
//input float parallaxRangeY

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//
//________Caller________//
//const outroCaller = script.subScene.CreateCaller("outroDone");
//exemple : outroCaller.Call()
//________Listener________//
//const outroListener = script.subScene.CreateListener("outroStart", OnOutroStart);
//________DelayEvent________//
//var DelayedFuncExampleEvent = script.subScene.CreateEvent("DelayedCallbackEvent", DelayedFuncExample);
//DelayedFuncExampleEvent.event.reset(1)
//global.varGlobalExample=0;

//script.soundExample.play(1);

//var randomInt = Math.floor(Math.random() * 4);//0-3

//script.particuleExample.asset.properties["KillParti"] = 1 // 1->Kill 0->Alive

//var TodayScript=new Date();
//var TodayScript=new Date(2025, 6, 2, 1); //8 juin
//var sceneObjectsArray = [];

//_________________________Director functions_____________________//
function Start() {}
function OnLateStart() {}
function Update() {}
function Stop() {}
//___________________________Buttons__________________________//
/*
script.imageExample.getComponent("Component.InteractionComponent").onTouchStart.add(function() {
print("Tap_Example")
script.imageExample.getComponent("Component.InteractionComponent").enabled = false;
});*/

//___________________________Functions__________________________//

function PlayVideoOnce()
{
    print("Video play once");
    var videoCTRL = script.Video.control;
    global.PlayVideo(videoCTRL,1)
}

function SwapImageTexture()
{
    script.imageExample.getComponent("Component.Image").mainPass.baseTex=script.textureExample;
}

//________Parallax_Example________//

//TO PUT IN THE LATESTART -> StartParallax()
function StartParallax(){
    print("Starting Parallax");
    global.parallaxManager.Subscribe(UpdateParallax);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

//var screenTransform2D=script.image2D.getComponent("Component.ScreenTransform")
//var initVecPos2D= screenTransform2D.anchors.getCenter();

//var transform3D=script.image3D.getTransform()
//var initVecPos3D = script.image3D.getTransform().getWorldPosition()

function UpdateParallax(offsetX)
{
    //Object2D To Parallax -> script.image2D

    let posX2D = (initVecPos2D.x + offsetX) * -script.strenghtX
    let posY2D = (initVecPos2D.y + offsetY)* -script.strenghtY
    var screenTransform = script.image2D.getComponent("Component.ScreenTransform")
    var currentPos2D = screenTransform.anchors.getCenter();
    screenTransform.anchors.setCenter(new vec2(posX2D, currentPos2D.y));
    
    //Object3D To Parallax -> script.image2D

    let posX3D = (initVecPos3D.x + offsetX) * -script.strenghtX;
    let clampX = clamp(posX3D, -script.parallaxRangeX, script.parallaxRangeX);

    let posY3D = (initVecPos3D.y + offsetY) * script.strenghtY;
    let clampY = clamp(posY3D, -script.parallaxRangeY, script.parallaxRangeY);

    var posObject3D = script.image2D.getTransform().getWorldPosition();
    // print("posObject : " + posObject);
    transform3D.setWorldPosition(new vec3(clampX, clampY, posObject3D.z));
}

//___________________________Animations_________________________//
//_________________Example_Base_________________//
//FadeExampleanim.Start(1)
//FadeExampleanim.JumpTo(0)
//FadeExampleanim.GoTo(0)
//FadeExampleanim.Reset()

//RepeatMode.PingPong : 0->1 & 1->0
//RepeatMode.Loop : 0->1 & 0->1
//RepeatMode.None: 0->1
/*
FadeExampleanim.AddTimeCodeEvent(0.4, function(){  
    ///0.4sec After Animation Start/// 
})
FadeExampleanim.OnStart=function()
{ ///When Animation Start/// 
}

FadeExampleanim.OnEnd=function()
{ ///When Animation End/// 
}*/
//_________________Fade_________________//

const FadeExampleanim = new Animation(script.getSceneObject(), script.durationFade, FadeExample);
FadeExampleanim.Easing=QuadraticInOut;

function FadeExample(ratio)
{
    //FADE IMAGE :
    script.imageExample.getComponent("Component.Image").mainPass.baseColor=new vec4(1, 1, 1, ratio);
    //FADE TEXT :
    script.textExample.getComponent("Component.Text").textFill.color=new vec4(1, 1, 1, ratio);
}

//_________________Scale_________________//

const ScaleExampleAnim = new Animation(script.getSceneObject(), 0.5, ScaleExample,RepeatMode.PingPong);
ScaleExampleAnim.Easing=ElasticIn;

function ScaleExample(ratio)
{    
    script.imageExample.getComponent("Component.Image").getTransform().setLocalScale(new vec3(1, 1, 1).uniformScale((ratio*0.15)+1));
}  

//_________________Float_________________//
//var screenTransformFloat2D=script.imageExample.getComponent("Component.ScreenTransform")
//var baseCenter=screenTransformFloat2D.anchors.getCenter()

const Float2Danim = new Animation(script.getSceneObject(), 1/script.speed, Float2D,RepeatMode.PingPong);
Float2Danim.Easing=QuadraticInOut;

function Float2D(ratio)
{
    var offsetX = script.amplitude*(ratio-0.5); // oscillation en X
    var offsetY = script.amplitude*(ratio-0.5); // oscillation en Y

    var centerUpdate = baseCenter.add(new vec2(offsetX,offsetY)); // Adding Offset
    var result = vec2.lerp(centerUpdate, baseCenter, 0.5); // Lerping Result
    screenTransformFloat2D.anchors.setCenter(result); // Set Result to Target
} 

//var transform = script.image3DExample.getTransform();
//var basePos = transform.getLocalPosition();

const Float3Danim = new Animation(script.getSceneObject(), 1 / script.speed, Float3D, RepeatMode.PingPong);
Float3Danim.Easing = QuadraticInOut;

function Float3D(ratio) {
    // ratio varie entre 0 et 1
    var offsetX = script.amplitude * (ratio - 0.5); // oscillation en X
    var offsetY = script.amplitude * (ratio - 0.5); // oscillation en Y
    var offsetZ= 0;

    var centerUpdate = basePos.add(new vec3(offsetX, offsetY, offsetZ)); // ajout de l’offset
    var result = vec3.lerp(centerUpdate, basePos, 0.5); // Lerping Result
    transform.setLocalPosition(result); // Set Result to Target
}
//_________________Rotate_________________//

//var transform = script.image3DExample.getTransform();
//var baseRot = transform.getLocalRotation(); // quat de base

const Float3DRotAnim = new Animation(script.getSceneObject(), 1 / script.speed, Float3DRot, RepeatMode.PingPong);
Float3DRotAnim.Easing = QuadraticInOut;

function Float3DRot(ratio) {
    // Oscillation autour de l’axe Y entre -amplitude/2 et +amplitude/2
    var angleDeg = script.amplitude * (ratio - 0.5);
    var angleRad = degToRad(angleDeg);

    // rotation offset autour de l’axe souhaité (ici Y)
    var offsetRot = quat.angleAxis(angleRad, vec3.up());

    var targetRot = offsetRot.multiply(baseRot);
    var result = quat.slerp(baseRot, targetRot, 0.5); // slerp pour les quats

    transform.setLocalRotation(result);
}


//__________________________Classes_____________________________//
class ClassExample {
    constructor(obj, id){
        this._obj = obj;
        this._id = id
        this._transform = this._obj.getComponent("Component.ScreenTransform")
        this._image = this._obj.getComponent("Component.Image")

        this._anims = {
            fade : null
        }
        this.initAnimations()
    }

    initAnimations(){
        this._anims.fade = new Animation(script.getSceneObject(), 0.5, (ratio)=>{
            this._image.mainPass.baseColor = new vec4(1,1,1,ratio)
        })

    }

    cloneMat(){
        let cloneMat = this._mat.clone()
        this._image.clearMaterials()
        this._image.addMaterial(cloneMat)
    }

    setTexture(tex){
        this._image.mainPass.baseTex = tex
    }

    Reset(){
        this._anims.fade.Reset()
    }
}
function Instantiation()
{
    var exampleElem=new ClassExample(script.imageExample,0) // SceneObject,Id
    sceneObjectsArray.push(exampleElem)
    sceneObjectsArray[0]._anims.fade.Start(1)
}

