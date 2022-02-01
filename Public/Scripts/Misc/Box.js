// -----JS CODE-----
//@input SceneObject box

var tr = script.box.getTransform();

var frameCount = 0;


// var anim = new global.Animation(script, 1, AnimUpdate, RepeatMode.PingPong);
// anim.Start(-1);

// function AnimUpdate (ratio)
// {
//     // print(script.box.name + " count : " + frameCount);
//     // print(tr.getSceneObject().name + " count 2 : " + frameCount);
//     tr.setLocalPosition(new vec3(0, ratio * 5, 0));
//     // print("Update Anim")
// }


function UpdateFrameCounter ()
{
    print("FrameCount : " + frameCount);
    frameCount++;
}


function Update1 ()
{
    print("Update 1 !");
}


function Update2 ()
{
    if (frameCount == 15)
    {
        update2.priority = -10;
        print("Swapity Swap !!!");
        global.UpdateManager.ReorderInterUpdates();

        print(update1.priority + "  " + update2.priority + "  " + update3.priority);
    }
    print("Update 2 !");
}


function Update3 ()
{
    print("Update 3 !");
}


var updateFrameCounter = new global.Update(script, UpdateFrameCounter);
global.UpdateManager.AddPreUpdate(updateFrameCounter);

var update1 = new global.Update(script, Update1);
global.UpdateManager.AddInterUpdate(update1);

var update2 = new global.Update(script, Update2);
global.UpdateManager.AddInterUpdate(update2);

var update3 = new global.Update(script, Update3);
global.UpdateManager.AddInterUpdate(update3);