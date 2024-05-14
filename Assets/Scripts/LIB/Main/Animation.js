// Lib Lens Atomic : Animation Module
// Version : 2.2.0
// Dependencies : Update Manager Module
// Authors : Gautier Jacquet, Guillaume Bertrand

// Doc : https://www.notion.so/atomicdigitaldesign/Animation-Module-2f30ec117cae45e192fe1367effac6ee


// Enum to set the repeat rules
global.RepeatMode = {None : 0, Loop : 1, PingPong : 2}

// Enum to set the timecode mode
global.TimeCodeMode = {Ratio : 0, FixedTime : 1}

// Function TimecodeEvent, defined by a timeCode, the callback method
global.TimeCodeEvent = class
{
    constructor (_timeCode, _callback)
    {
        //#region public vars
        this.timeCode = _timeCode;
        //#endregion
        
        //#region private vars
        this.callback = _callback;    
        //#endregion
    }
}

// Function Animation, defined by a duration, an update method and a repeatMode
global.Animation = class
{
    constructor (_obj, _duration, _update, _repeatMode, _updateType, _order)
    {
        //#region public vars
        this.duration = _duration;
        this.durationDown = _duration;
        this.repeatMode = _repeatMode !== undefined ? _repeatMode : RepeatMode.None;
        //#endregion

        //#region private vars
        const _this = this;
        this._ratio = 0;
        this._clampedRatio = 0;
        this._targetRatio = 1;
        this._goingUp = true;
        this._repeatCount = 0;
        this._paused = false;
        this._arrayTimeCodeEvent = [];
        this._indexTimeCode;
        this._updateType = _updateType !== undefined ? _updateType : UpdateType.InterUpdate;
        this._order = _order !== undefined ? _order : 100;

        this._updateEvent = new global.Update(_obj, this._updateType, () => {_this._InternalUpdate();}, false, this._order);
        this._updateEvent.Add();
        //#endregion

        //#region public events
        this.Update = _update;
        this.Easing = r => r;

        this.OnEnd = r => {};
        this.OnStart = r => {};
        this.OnLoop = r => {};
        //#endregion
    }
    

    //#region public functions
    IsPlaying (){return this._updateEvent.enabled;};
    IsPaused (){return this._paused;};
    IsGoingUp (){return this._goingUp;};
    GetRatio (){return this._clampedRatio;};
    GetRepeatCount (){return this._repeatCount;};

    Start (repeats = 0, offset = 0)
    {
        this._ratio = offset;
        this._clampedRatio = Math.min(Math.max(this._ratio, 0), 1);
        this._targetRatio = 1;
        this._repeatCount = repeats;
        this._goingUp = true;
        this._updateEvent.enabled = true;
        this._paused = false;
        this._ResetIndexTimeCode();
        this.OnStart(this._clampedRatio);
    }

    Reset ()
    {
        this._ratio = 0;
        this._clampedRatio = 0;
        this._indexTimeCode = 0;
        this._targetRatio = 1;
        this._repeatCount = 0;
        this._goingUp = true;
        this.Update(this.Easing(this._clampedRatio));
        this._updateEvent.enabled = false;
        this._paused = false;
    }

    Pause ()
    {
        this._paused = true;
        this._updateEvent.enabled = false;
    }

    Resume ()
    {
        if (this._paused)
        {
            this._paused = false;
            this._updateEvent.enabled = true;
        }
        else
        {
            print("Animation : Resume called but the animation wasn't paused first !");
        }
    }

    GoTo (target)
    {
        this._repeatCount = 0;
        this._targetRatio = Math.min(Math.max(target, 0), 1);
        this._goingUp = this._ratio <= this._targetRatio;
        this._ResetIndexTimeCode();

        if (!this._updateEvent.enabled)
        {
            this.OnStart(this._ratio);
            this._updateEvent.enabled = true;
        }
    }

    JumpTo (target)
    {
        this._ratio = Math.min(Math.max(target, 0), 1);
        this._clampedRatio = this._ratio;
        this._ResetIndexTimeCode();
        
        this.Update(this.Easing(this._clampedRatio));
        this._updateEvent.enabled = false;
    }
            
    AddTimeCodeEvent (_timeCode, _callback, _timeCodeType)
    {
        if(_timeCodeType === TimeCodeMode.FixedTime)
        {
            _timeCode = _timeCode/this.duration;
        }

        let ind = -1;
        for (let i = 0; i < this._arrayTimeCodeEvent.length; ++i)
        {
            if (this._arrayTimeCodeEvent[i].timeCode > _timeCode)
            {
                ind = i;
                break;
            }
        }
        if (ind === -1)
        {
            this._arrayTimeCodeEvent.push(
                new TimeCodeEvent(_timeCode, _callback));
        }
        else
        {
            this._arrayTimeCodeEvent.splice(ind, 0, new TimeCodeEvent(_timeCode, _callback));
        }
        if (this._clampedRatio > _timeCode && this._goingUp)
        {
           this._indexTimeCode = Math.min(this._arrayTimeCodeEvent.length,
                this._indexTimeCode + 1);
        }
        else if (this.clampedRatio < _timeCode && !this._goingUp)
        {
           this._indexTimeCode = Math.max(this._indexTimeCode - 1, -1);         
        }
    }
    
    ChangeUpdateType (_type)
    {
        this._updateEvent.ChangeType(_type);
    }

    ChangeUpdateOrder (_order)
    {
        this._updateEvent.ChangeUpdateOrder(_order);
    }
    //#endregion


    //#region private functions
    _InternalUpdate ()
    {
        let ended = false;
        let looped = false;
        if (this._goingUp)
        {
            this._ratio += getDeltaTime() / this.duration;
            this._clampedRatio = Math.min(Math.max(this._ratio, 0), 1);
            while (this._indexTimeCode < this._arrayTimeCodeEvent.length && 
                this._clampedRatio >= this._arrayTimeCodeEvent[this._indexTimeCode].timeCode)
            {
                this._arrayTimeCodeEvent[this._indexTimeCode].callback();
                this._indexTimeCode = this._indexTimeCode + 1;
            }
        }
        else
        {
            this._ratio -= getDeltaTime() / this.durationDown;
            this._clampedRatio = Math.min(Math.max(this._ratio, 0), 1); 
            while (this._indexTimeCode > -1 && 
                this._clampedRatio <= this._arrayTimeCodeEvent[this._indexTimeCode].timeCode)
            {
                this._arrayTimeCodeEvent[this._indexTimeCode].callback();
                this._indexTimeCode = this._indexTimeCode - 1;
            }
        }

        do
        {
            if (this._goingUp)
            {
                if (this._ratio >= this._targetRatio)
                {
                    if (this.repeatMode === RepeatMode.None || this._repeatCount === 0 || this._targetRatio < 1)
                    {
                        this._ratio = this._targetRatio;
                        this._clampedRatio = Math.min(Math.max(this._ratio, 0), 1); 
                        this._updateEvent.enabled = false;
                        ended = true;
                    }
                    else
                    {
                        if (this.repeatMode === RepeatMode.Loop)
                        {
                            this._ratio = this._ratio - 1;
                            this._clampedRatio = Math.min(Math.max(this._ratio, 0), 1);
                            this._indexTimeCode = 0;
                        }
                        else if (this.repeatMode === RepeatMode.PingPong)
                        {
                            this._goingUp = false;
                            this._ratio = 2 - this._ratio; // for 1 - (ratio - 1), 1 being the anim end, (ratio - 1) being the overstep
                            this._clampedRatio = Math.min(Math.max(this._ratio, 0), 1);
                            this._targetRatio = 0;
                            this._indexTimeCode = this._arrayTimeCodeEvent.length-1;
                        }
                        
                        if (this._repeatCount > 0)
                        {
                            this._repeatCount--;
                        }
                        
                        looped = true;
                    }
                }
            }
            else
            {
                if (this._ratio <= this._targetRatio)
                {
                    if (this.repeatMode === RepeatMode.None || this._repeatCount === 0 || this._targetRatio > 0)
                    {
                        this._ratio = this._targetRatio;
                        this._clampedRatio = Math.min(Math.max(this._ratio, 0), 1);
                        this._updateEvent.enabled = false;
                        ended = true;
                    }
                    else
                    {
                        if (this.repeatMode === RepeatMode.Loop)
                        {
                            this._ratio = 1 + this._ratio; // ratio is negative, it is the inverse of the overstep, adding 1 makes it go from the other side.
                            this._clampedRatio = Math.min(Math.max(this._ratio, 0), 1);
                            this._indexTimeCode = this._arrayTimeCodeEvent.length-1;
                        }
                        else if (this.repeatMode === RepeatMode.PingPong)
                        {
                            this._goingUp = true;
                            this._ratio = -this._ratio;
                            this._clampedRatio = Math.min(Math.max(this._ratio, 0), 1);
                            this._targetRatio = 1;
                            this._indexTimeCode = 0;
                        }

                        if (this._repeatCount > 0)
                        {
                            this._repeatCount--;
                        }

                        looped = true;
                    }
                }
            }
        }
        while (Math.abs(this._ratio) > 1)

        this.Update(this.Easing(this._clampedRatio));
        if (ended)
        {
            this.OnEnd(this._clampedRatio);
        }
        else if (looped)
        {
            this.OnLoop(this._clampedRatio);
        }
    }
    
    _ResetIndexTimeCode ()
    {
        let ind = -1;
        for (let i = 0; i < this._arrayTimeCodeEvent.length; i++)
        {
            if (this._arrayTimeCodeEvent[i].timeCode > this._clampedRatio)
            {
                ind = i;
                break;
            }
        }
        if (ind === -1)
        {
            this._indexTimeCode = this._arrayTimeCodeEvent.length;
        }
        else
        {
            this._indexTimeCode = ind;
        }
        if (!this._goingUp)
        {
            this._indexTimeCode = this._indexTimeCode - 1;
        }
    }
    //#endregion
};


// Function AnimationGroup, defined by an array of animations, a speed factor and a repeatMode
global.AnimationGroup = class
{
    constructor (_obj, _animations, _speedFactor, _repeatMode)
    {
        //#region public vars
        this.speedFactor = _speedFactor;
        //#endregion


        //#region private vars
        const _this = this;

        this._animations = _animations;
        this._animCount = this._animations.length;
        this._ratioRemap = [];
        this._currentAnim = 0;

        this._anim = new Animation(_obj, 1, ratio => {_this._InternalUpdate(ratio);}, _repeatMode);
        //#endregion


        //#region public events
        this.Easing = r => r

        this.OnEnd = r => {};
        this.OnStart = r => {};
        this.OnLoop = r => {};
        //#endregion


        //#region private events
        this._anim.OnEnd = r => {_this._UpdateAllAnims(r); _this.OnEnd(r);};
        this._anim.OnStart = r => {_this.OnStart(r);};
        this._anim.OnLoop = r => {_this._UpdateAllAnims(r); _this.OnLoop(r);};
        //#endregion

        // Call to force the duration to be correct when initializing
        this.UpdateDuration();
    }
    
    //#region public functions
    IsPlaying (){return this._anim.IsPlaying()};
    IsPaused (){return this._anim.IsPaused();};
    IsGoingUp (){return this._anim.IsGoingUp();};
    GetRatio (){return this._anim.GetRatio();};
    GetRepeatCount (){return this._anim.GetRepeatCount();};

    UpdateDuration ()
    {
        let durationTotal = 0;
        for (let i = 0; i < this._animCount; ++i)
        {
            durationTotal += this._animations[i].duration;
        }

        let durationAcc = 0;
        this._ratioRemap = [];
        
        for (let i = 0; i < this._animCount; ++i)
        {
            durationAcc += this._animations[i].duration;
            this._ratioRemap.push(durationAcc / durationTotal);
        }

        this._anim.duration = durationTotal / this.speedFactor;
    }

    Start (repeats = 0) {
        this._anim.Start(repeats, 0);
    }

    Reset ()
    {
        this._anim.Reset();
    }

    Pause ()
    {
        this._anim.Pause();
    }

    Resume ()
    {
        this._anim.Resume();
    }

    GoTo (target)
    {
        this._anim.GoTo(target);
    }

    JumpTo (target)
    {
        this._anim.JumpTo(target);
        this._UpdateAllAnims(target);
    }
    //#endregion


    //#region private functions
    _InternalUpdate (ratio)
    {
        if (this._anim.IsGoingUp())
        {
            if (ratio >= 1)
            {
                this._animations[this._currentAnim].JumpTo(1);
            }
            else
            {
                let ratioStart = this._currentAnim > 0 ? this._ratioRemap[this._currentAnim - 1] : 0
                let ratioEnd = this._ratioRemap[this._currentAnim];
                let ratioCurrent = (ratio - ratioStart) / (ratioEnd - ratioStart);
                let clampedRatio = Math.min(Math.max(ratioCurrent, 0), 1);

                if (ratioCurrent > 1)
                {

                    do
                    {
                        this._animations[this._currentAnim].JumpTo(1);
                        this._currentAnim++;

                        ratioStart = this._currentAnim > 0 ? this._ratioRemap[this._currentAnim - 1] : 0
                        ratioEnd = this._ratioRemap[this._currentAnim];
                        ratioCurrent = (ratio - ratioStart) / (ratioEnd - ratioStart);
                        clampedRatio = Math.min(Math.max(ratioCurrent, 0), 1);
                        
                        this._animations[this._currentAnim].JumpTo(clampedRatio);
                    } while (ratioCurrent > 1)
                }
                else
                {
                    this._animations[this._currentAnim].JumpTo(clampedRatio);
                }
            }
        }
        else
        {
            if (ratio <= 0)
            {
                this._animations[this._currentAnim].JumpTo(0);
            }
            else
            {
                let ratioStart = this._currentAnim > 0 ? this._ratioRemap[this._currentAnim - 1] : 0
                let ratioEnd = this._ratioRemap[this._currentAnim];
                let ratioCurrent = (ratio - ratioStart) / (ratioEnd - ratioStart);
                let clampedRatio = Math.min(Math.max(ratioCurrent, 0), 1);
                
                if (ratioCurrent < 0)
                {
                    do
                    {
                        this._animations[this._currentAnim].JumpTo(0);
                        this._currentAnim--;

                        ratioStart = this._currentAnim > 0 ? this._ratioRemap[this._currentAnim - 1] : 0
                        ratioEnd = this._ratioRemap[this._currentAnim];
                        ratioCurrent = (ratio - ratioStart) / (ratioEnd - ratioStart);
                        clampedRatio = Math.min(Math.max(ratioCurrent, 0), 1);
                        
                        this._animations[this._currentAnim].JumpTo(clampedRatio);
                    } while (ratioCurrent < 0)
                }
                else
                {
                    this._animations[this._currentAnim].JumpTo(clampedRatio);
                }
            }
        }
    }

    _UpdateAllAnims (ratio)
    {
        if (this._anim.IsGoingUp())
        {
            for (let i = this._animCount - 1; i >=0 ;--i)
            {
                let ratioStart = i > 0 ? this._ratioRemap[i - 1] : 0
                let ratioEnd = this._ratioRemap[i];
                let ratioCurrent = (ratio - ratioStart) / (ratioEnd - ratioStart);
                
                this._animations[i].JumpTo(Math.min(Math.max(ratioCurrent, 0), 1));
    
                if (ratioCurrent >= 0 && ratioCurrent <= 1)
                {
                    this._currentAnim = i;
                }
            }
        }
        else
        {
            for (let i = 0; i < this._animCount; ++i)
            {
                let ratioStart = i > 0 ? this._ratioRemap[i - 1] : 0
                let ratioEnd = this._ratioRemap[i];
                let ratioCurrent = (ratio - ratioStart) / (ratioEnd - ratioStart);
                
                this._animations[i].JumpTo(Math.min(Math.max(ratioCurrent, 0), 1));

                if (ratioCurrent >= 0 && ratioCurrent <= 1)
                {
                    this._currentAnim = i;
                }
            }
        }
    }
    //#endregion
}