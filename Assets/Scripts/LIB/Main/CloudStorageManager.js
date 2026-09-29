/**
 * Charge une ressource depuis le Cloud Storage de Lens Studio et l'applique à
 * un composant de la scène.
 *
 * PRÉREQUIS
 * - Être connecté à Lens Studio avec un compte ayant accès à l'organisation.
 * - Importer chaque ressource avec « Upload Remote Asset ».
 *
 * CONFIGURATION
 * - `idAsset` : identifiant unique utilisé pour déclencher ce téléchargement.
 * - `fallbackAsset` : ressource locale facultative, utilisée si le
 *   téléchargement échoue. Elle doit être du même type que la ressource distante.
 * - `action` : traitement appliqué après le téléchargement :
 *   - Instantiate Prefab : instancie le prefab sous `prefabParent` ;
 *   - Set Audio Track : assigne la piste à `myAudioComponent` ;
 *   - Set Texture : assigne la texture à `texturePropertyName` sur le matériau ;
 *   - Set Mesh : assigne le mesh à `myRenderMeshVisual` ;
 *   - Set ML Model : assigne le modèle à `myMLComponent`.
 *
 * UTILISATION
 * Le caller doit envoyer l'identifiant de la ressource via l'événement
 * `loadingAssetEvent` :
 *
 * const cloudAssetCaller = script.subScene.CreateCaller("loadingAssetEvent", null);
 * cloudAssetCaller.Call("assetId");
 *
 * Lorsque l'identifiant reçu correspond à `idAsset`, le téléchargement démarre.
 * Une instance de cette sous-scène doit être configurée pour chaque ressource.
 */


//@input SceneObject parent
//@ui {"widget":"label", "label":"<b>References:</b>"}
//@input Asset.RemoteReferenceAsset referenceAsset
//@input Asset fallbackAsset
//@ui {"widget":"separator"}
//@ui {"widget":"label", "label":"<b>On Downloaded Action</b>"}
//@input int action = -1 {"widget":"combobox", "values":[{"label":"None", "value":-1}, {"label":"Instantiate Prefab", "value":0}, {"label":"Set Audio Track", "value":1}, {"label":"Set Texture", "value":2}, {"label":"Set Mesh", "value":3}, {"label":"Set ML Model", "value":4}]}

//@input SceneObject prefabParent {"showIf":"action", "showIfValue" : "0"}
//@input Component.AudioComponent myAudioComponent  {"label" : "Audio", "showIf":"action", "showIfValue" : "1"}
//@input Component.Image myMaterialMeshVisual {"label" : "Mesh Visual", "showIf":"action", "showIfValue" : "2"}
//@input Asset.Material myMaterial  {"label" : "Material", "showIf":"action", "showIfValue" : "2"}
//@input string texturePropertyName  {"label" : "Property", "showIf":"action", "showIfValue" : "2"}
//@input Component.RenderMeshVisual myRenderMeshVisual {"label" : "Mesh Visual", "showIf":"action", "showIfValue" : "3"}
//@input Component.MLComponent myMLComponent {"label" : "ML Component", "showIf":"action", "showIfValue" : "4"}

//@ui {"widget":"separator"}
//@ui {"widget":"label", "label":"<b>Download Listener Event</b>"}
//@input string idAsset {"label" : "Asset Id to download"}




//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//

var referenceAsset = script.referenceAsset;
var fallbackAsset = script.fallbackAsset;
var myRemoteReferenceAsset = script.myRemoteReferenceAsset;
var action = script.action;

// _______ On action parameters ______//
var myAudioComponent = script.myAudioComponent;
var prefabParent = script.prefabParent;
var myMaterialMeshVisual = script.myMaterialMeshVisual;
var myMaterial = script.myMaterial;
var texturePropertyName = script.texturePropertyName;
var myMLComponent = script.myMLComponent;
var myRenderMeshVisual = script.myRenderMeshVisual;
// _______ listener ______//

var listenerName = script.listenerName;

var instantiatedSo;

//________Caller________//
//________Listener________//

const LoadingCloudAssetListener = script.subScene.CreateListener("loadingAssetEvent", LoadingAsset);
//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {}
function OnLateStart() {}
function Update() {}
function Stop() {}
//___________________________Functions__________________________//

function LoadingAsset(id) {
  if (id === script.idAsset) {
    print("loading this asset");
    downloadAsset();
  }
}

function downloadAsset() {
  referenceAsset.downloadAsset(onDownloaded, onFailed);
}

function onDownloaded(asset) {
  switch (action) {
    case 0:
      //instantiate prefab
      if (!asset.isOfType("Asset.ObjectPrefab")) {
        print("Asset type is not Object Prefab and can not be instantiated");
        return;
      }
      if (instantiatedSo) {
        instantiatedSo.destroy();
      }
      instantiatedSo = asset.instantiate(prefabParent || null);
      break;

    case 1:
      if (!asset.isOfType("Asset.AudioTrackAsset")) {
        print("Asset type is not AudioTrack Asset and can not be played in AudioComponent");
        return;
      }
      if (!myAudioComponent) {
        print("Audio Component is not set");
        return;
      }
      myAudioComponent.audioTrack = asset;
      break;

    case 2:
      if (!asset.isOfType("Asset.Texture")) {
        print("Asset type is not a Texture Asset and can not be used in Materials");
        return;
      }
      if (myMaterial) {
        myMaterial.mainPass[texturePropertyName] = asset;
      }
      if (myMaterialMeshVisual && myMaterialMeshVisual.mainPass) {
        myMaterialMeshVisual.mainPass[texturePropertyName] = asset;
      }
      break;

    case 3:
      if (!asset.isOfType("Asset.RenderMesh")) {
        print("Asset type is not a Render Mesh and can not be used in Render Mesh Visual");
        return;
      } else if (!myRenderMeshVisual) {
        print("Render Mesh Visual is not set");
        return;
      }
      myRenderMeshVisual.mesh = asset;
      break;
    case 4:
      if (!asset.isOfType("Asset.MLAsset")) {
        print("Asset type is not an ML Asset and can not be used in ML Components");
        return;
      } else if (!myMLComponent) {
        print("ML Component is not set");
        return;
      }
      myMLComponent.model = asset;
      break;
  }
}

/**
 * in download failed - use fallback asset if provided
 */
function onFailed() {
  if (fallbackAsset) {
    onDownloaded(fallbackAsset);
  }
}

//___________________________Animations_________________________//
