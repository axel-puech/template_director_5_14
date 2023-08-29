// Lib Lens Atomic : TextToTexture Module
// Version : 1.0.0
// Authors : Gautier Jacquet


const uniqueLayer = LayerSet.makeUnique();

const rt = createRenderTarget(script.rtResolution);
const cam = createCameraMRT(rt);
const camComp = cam.getComponent("Component.Camera");
const region = createScreenRegion(cam);
const text = createTextObject(region);
const textComp = text.getComponent("Component.Text");

const textRequests = [];
let textRequestCurrent = null;


const lateUpdateEvent = script.createEvent("LateUpdateEvent");
lateUpdateEvent.enabled = false;
lateUpdateEvent.bind(LateUpdate);



global.TextConfig = function (_text, _resolution, _font, _sizeToFit, _size, _verticalAlignment, _horizontalAlignment, _verticalOverflow, _horizontalOverflow, _letterSpacing)
{
    this.text = _text;
    this.resolution = _resolution;
    this.font = _font !== undefined ? _font : null;
    this.sizeToFit = _sizeToFit !== undefined ? _sizeToFit : false;
    this.size = _size !== undefined ? _size : 48;
    this.verticalAlignment = _verticalAlignment !== undefined ? _verticalAlignment : VerticalAlignment.Center;
    this.horizontalAlignment = _horizontalAlignment !== undefined ? _horizontalAlignment : HorizontalAlignment.Center;
    this.verticalOverflow = _verticalOverflow !== undefined ? _verticalOverflow : VerticalOverflow.Overflow;
    this.horizontalOverflow = _horizontalOverflow !== undefined ? _horizontalOverflow : HorizontalOverflow.Wrap;
    this.letterSpacing = _letterSpacing !== undefined ? _letterSpacing : 0;
}


class TextRequest
{
    constructor (_callBack, _textConfig)
    {
        this.callBack = _callBack;
        this.textConfig = _textConfig;
    }
};


global.RequestTextTexture = (_callback, _textConfig) => {
    textRequests.push(new TextRequest(_callback, _textConfig));
    lateUpdateEvent.enabled = true;
    cam.enabled = true;
}


function LateUpdate()
{
    if (rt !== null && rt.control.getLoadStatus() === LoadStatus.Loaded)
    {
        if (textRequestCurrent !== null)
        {
            const tex = rt.copyFrame();
            textRequestCurrent.callBack(tex);

            if (textRequests.length === 0)
            {
                textRequestCurrent = null;
                lateUpdateEvent.enabled = false;
                cam.enabled = false;
            }
        }
    
        if (textRequests.length > 0)
        {
            textRequestCurrent = textRequests.shift();
            SetText(textRequestCurrent.textConfig);
        }
    }
}


function SetText (_config)
{
    textComp.text = _config.text;
    rt.control.resolution = _config.resolution;
    camComp.aspect = rt.control.getAspect();
    textComp.font = _config.font;
    textComp.sizeToFit = _config.sizeToFit;
    textComp.verticalAlignment = _config.verticalAlignment;
    textComp.horizontalAlignment = _config.horizontalAlignment;
    textComp.verticalOverflow = _config.verticalOverflow;
    textComp.horizontalOverflow = _config.horizontalOverflow;
    textComp.letterSpacing = _config.letterSpacing;
}


function createRenderTarget (resolution)
{
    const _rt = global.scene.createRenderTargetTexture();
    _rt.control.useScreenResolution = false;
    _rt.control.resolution = new vec2(4,4);
    _rt.control.clearColorEnabled = true;
    _rt.control.clearDepthEnabled = false;
    _rt.control.fxaa = false;
    _rt.control.msaa = false;
    _rt.control.inputTexture = null;
    _rt.control.clearColor = new vec4(1,1,1,0);
    
    return _rt;
}


function createCameraMRT (_rt)
{
    const _camObj = global.scene.createSceneObject("");
    const _camComp = _camObj.createComponent("Component.Camera");
    _camComp.enabled = true;
    _camComp.renderLayer = uniqueLayer;
    _camComp.renderTarget = _rt;
    _camComp.renderOrder = -100;
    _camComp.enableClearColor = false;
    _camComp.type = Camera.Type.Orthographic;
    _camComp.devicePropertyUsage = Camera.DeviceProperty.None;
    _camComp.aspect = _rt.control.getAspect();
    _camComp.size = 10;
    _camComp.near = 1;
    _camComp.far = 100;

    return _camObj;
}


function createScreenRegion (_parent)
{
    const _regionObj = global.scene.createSceneObject("");
    _regionObj.setParent(_parent);
    const _screenTr = _regionObj.createComponent("Component.ScreenTransform");
    const _screenRegion = _regionObj.createComponent("Component.ScreenRegionComponent");
    _screenRegion.region = ScreenRegionType.FullFrame;
    
    return _regionObj;
}


function createTextObject (_parent)
{
    const _obj = global.scene.createSceneObject("");
    _obj.setParent(_parent);
    _obj.layer = uniqueLayer;

    const _textComp = _obj.createComponent("Component.Text");
    const _screenTr = _obj.createComponent("Component.ScreenTransform");
    _textComp.text = "Hello";
    _screenTr.position = new vec3(0,0,-10);
    _screenTr.anchors.setCenter(new vec2(0,0));
    _screenTr.anchors.setSize(new vec2(2,2));
    _screenTr.offsets.setCenter(new vec2(0,0));
    _screenTr.offsets.setSize(new vec2(0,0));
    _textComp.colorMask = new vec4b(true, true, true, true);
    _textComp.setRenderOrder(1000);

    return _obj;
}