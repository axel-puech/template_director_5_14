// -----JS CODE-----
//@input SceneObject box

var tr = script.box.getTransform();

var frameCount = 0;


var anim = new global.Animation(script.getSceneObject(), 1, AnimUpdate, RepeatMode.PingPong, UpdateType.PostUpdate, 1000);
anim.Start(-1);

function AnimUpdate (ratio)
{
    print(script.box.name + " count : " + frameCount);
    // print(tr.getSceneObject().name + " count 2 : " + frameCount);
    tr.setLocalPosition(new vec3(0, ratio * 5, 0));
    print("Update Anim " + frameCount);
}


function UpdateFrameCounter ()
{
    print("-------------------------------- " + frameCount);
    frameCount++;
    // print(script.getSceneObject().name);
}


function UpdateFramePrint ()
{
    print("FrameCount : " + frameCount);
}


function Update1 ()
{
    print("Update 1 !");
}


function Update2 ()
{
    if (frameCount == 10)
    {
        print("Call Reorder");
        update2.ChangePriority(-10);
    }
    if (frameCount == 15)
    {
        update2.ChangeType(UpdateType.PostUpdate);
    }
    if (frameCount == 20)
    {
        print("Remove Called !");
        update2.Remove();
    }
    print("Update 2 !");
}


function Update3 ()
{
    print("Update 3 !");
}


var updateFramePrint = new global.Update(script.getSceneObject(), UpdateType.PreUpdate, UpdateFramePrint);
updateFramePrint.Add();

var updateFrameCounter = new global.Update(script.getSceneObject(), UpdateType.PostUpdate, UpdateFrameCounter);
updateFrameCounter.Add();

var update1 = new global.Update(script.getSceneObject(), UpdateType.InterUpdate, Update1);
update1.Add();

var update2 = new global.Update(script.getSceneObject(), UpdateType.InterUpdate, Update2);
update2.Add();

var update3 = new global.Update(script.getSceneObject(), UpdateType.InterUpdate, Update3);
update3.Add();