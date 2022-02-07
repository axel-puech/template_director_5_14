// -----JS CODE-----
//@input SceneObject parent
//@input Asset.ObjectPrefab box

script.api.subScene = new global.SubScene(script, script.parent);

script.api.subScene.SetUpdate(Update);

var obj = script.box.instantiate(script.parent);
var done = false;

script.api.subScene.OnStart = function(){};
script.api.subScene.SetLateUpdate(function(){print("SubScene LateUpdate");if (getTime() > 1 && !done) {obj.destroy(); done = true; obj = null;}});

function Update ()
{
    // print("SubScene Update !");
}


var delayedEvent = script.createEvent("DelayedCallbackEvent");
delayedEvent.bind(function(){script.api.subScene.SetLateUpdate(null);})
delayedEvent.reset(2);