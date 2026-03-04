//@input Component.Image[] listImages
//@input Component.RenderMeshVisual[] listRenders

let listStr = ["Example_1"]
function UpdateImages(str, id){
    global.Localization.LocalizeTexture(str, script.listImages[id].getSceneObject(), function(tex){
        script.listImages[id].mainPass.baseTex = tex
    });
}

function UpdateRender(str, id){
    global.Localization.LocalizeTexture(str, script.listRenders[id].getSceneObject(), function(tex){
        script.listRenders[id].mainPass.baseTex = tex
    });
}

//UpdateRender("WIN", 0)

for(let i = 0; i < listStr.length; i++){
    UpdateImages(listStr[i], i)
}
