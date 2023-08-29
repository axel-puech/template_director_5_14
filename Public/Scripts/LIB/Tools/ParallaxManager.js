// Lib Lens Atomic : ParallaxManager Module
// Version : 1.0.0
// Authors : Gautier Jacquet

// Doc : https://www.notion.so/atomicdigitaldesign/Parallax-Manager-867d7a8721614eacb5b575bfd97e88f8


class ParallaxManager
{
    constructor (_script, _offsetX_YFactor)
    {
        //#region public properties
        this.offsetX_YFactor = _offsetX_YFactor;
        //#endregion

        //#region private properties
        const _this = this;
        this._script = _script;
        this._subs = [];

        this._deviceTracking = this._script.getSceneObject().createComponent("Component.DeviceTracking");
        this._deviceTracking.requestDeviceTrackingMode(DeviceTrackingMode.Rotation);

        this._rotTr = this._script.getSceneObject().getTransform();

        this._updateEvent = this._script.createEvent("UpdateEvent");
        this._updateEvent.bind(() => {_this.Update()});
        this._updateEvent.enabled = false;
        //#endregion
    }
   


    //#region private Methods
    Update ()
    {
        var offsetX = new vec3(this._rotTr.forward.x, this._rotTr.forward.y * this.offsetX_YFactor, this._rotTr.forward.z).normalize().cross(vec3.up()).z;
        var offsetY = this._rotTr.forward.y;

        for (var i = 0; i < this._subs.length; ++i)
        {
            this._subs[i](offsetX, offsetY);
        }
    }
    //#endregion


    //#region public Methods
    Subscribe (_update)
    {
        this._subs.push(_update);
        this._updateEvent.enabled = true;
    }


    Unsubscribe (_update)
    {
        var i = this._subs.indexOf(_update);
        if (i < 0)
        {
            print("Error : Parallax Unsubscribe called but the function wasn't found !")
        }
        this._subs.splice(i, 1);

        if (this._subs.length <= 0)
        {
            this._updateEvent.enabled = false;
        }
    }
    //#endregion
}

global.parallaxManager = new ParallaxManager(script, script.offsetX_YFactor);