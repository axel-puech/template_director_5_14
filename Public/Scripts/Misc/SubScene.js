// -----JS CODE-----
//@input SceneObject parent
//@input Asset.ObjectPrefab box

script.api.subScene = new global.SubScene(script, script.parent);

script.api.subScene.Update = Update;

var obj = script.box.instantiate(script.parent);
var done = false;

script.api.subScene.OnStart = function(){};
script.api.subScene.LateUpdate = function(){if (getTime() > 1 && !done) {obj.destroy(); done = true; obj = null;}};

function Update ()
{
    print("SubScene Update !");
}