// Lib Lens Atomic : AudioManager
// Version : 2.0.0
// Dependencies : None
// Authors : Gautier Jacquet

// Doc : https://www.notion.so/atomicdigitaldesign/Audio-Manager-69eb5c159176478a9692a31d3ed56492

//@input SceneObject audioParent


global.AudioManager = new AudioManagerClass();


function AudioManagerClass ()
{
    //#region private vars
    var _obj = script.getSceneObject();
    var _audioComps = [];
    var _audioSystems = [];
    //#endregion


    //#region public functions
    this.CreateAudioSystem = function (_name, _maxInstance, _audioTracks)
    {
        var _audioComp = this.GetAudioComp(_name);
        if (_audioComp !== null)
        {
            for (var i = 0; i < _audioSystems.length; ++i)
            {
                if (_audioSystems[i].GetName() === _name)
                {
                    print("Warning : AudioSystem already existing with the name " + _name + " ! Returning it instead of a new one.");
                    return _audioSystems[i];
                }
            }
        
            var system = new AudioSystem (_obj, _name, _audioComp, _maxInstance, _audioTracks);
            _audioSystems.push(system);
        
            return system;
        }
        else
        {
            print("Warning : AudioComponent with name " + _name + " was not found !");
        }
    }
    
    
    this.DeleteAudioSystem = function (_name)
    {
        for (var i = 0; i < _audioSystems.length; ++i)
        {
            if (_audioSystems[i].GetName() === _name)
            {
                _audioSystems.splice(i, 1);
                return;
            }
        }
    
        print("Warning : AudioSystem with the name " + _name + " wasn't found when delete was called !");
    }
    
    
    this.GetAudioSystem = function (_name)
    {
        for (var i = 0; i < _audioSystems.length; ++i)
        {
            if (_audioSystems[i].GetName() === _name)
            {
                return _audioSystems[i];
            }
        }
    
        print("Warning : AudioSystem with the name " + _name + " wasn't found when delete was called !");
        return null;
    }
    
    
    this.PlayAudioByName = function (_name, _loops, _parent, _callback)
    {
        var system = this.GetAudioSystem(_name);
    
        if (system !== null)
        {
            return system.PlayAudio(_loops, _parent, _callback);
        }
        else
        {
            print("Warning : AudioSystem with the name " + _name + " was called but not found !");
            return null;
        }
    }
    //#endregion


    //#region private functions
    this.GetAudioComp = function (name)
    {
        for (var i = 0; i < _audioComps.length; ++i)
        {
            if (_audioComps[i].getSceneObject().name === name)
            {
                return _audioComps[i];
            }
        }
        
        return null;
    }


    this.GetAudios = function (parent)
    {
        childCount = parent.getChildrenCount();
        for (var i = 0; i < childCount; ++i)
        {
            var obj = parent.getChild(i);
            var audio = obj.getComponent("Component.AudioComponent");
            if (audio !== undefined && audio !== null)
            {
                _audioComps.push(audio);
            }
            this.GetAudios(obj);
        }
    }
    //#endregion

    //#region setup
    this.GetAudios(script.audioParent);
    //#endregion
}


function AudioSystem (_obj, _name, _audioComp, _maxInstance, _audioTracks)
{
    //#region private vars
    var _this = this;
    this._obj = _obj;
    this._name = _name;
    this._maxInstance = _maxInstance !== undefined ? _maxInstance : 1;
    this._audioTracks = _audioTracks !== undefined ? _audioTracks : [_audioComp.audioTrack];
    this._currentTrack = -1;
    this._audioComponentRef = _audioComp;
    this._audioControls = [];
    this._currentAudio = 0;
    //#endregion


    //#region public events
    this.GetNextTrackIndex = function(index)
    {
        return Math.floor(MathUtils.randomRange(0, _this._audioTracks.length));
    }
    //#endregion


    //#region public functions
    this.GetName = function (){return this._name;};

    
    this.PlayAudio = function (_loops, _parent, _callback)
    {
        var i = _this.GetInactiveAudioIndex();

        if (i >= 0)
        {
            var audio = _this._audioControls[i];
            _this._currentTrack = _this.GetNextTrackIndex(_this._currentTrack);
            audio.PlayAudio(_this._audioComponentRef, this._audioTracks[_this._currentTrack], _loops, _parent, _callback);
            return audio;
        }
        else
        {
            if (_callback !== undefined)
            {
                _callback();
            }
            print("Warning : AudioSystem " + _this._name + " PlayAudio called but there is no audioComponent available !");
            return null;
        }
    }


    this.StopAudios = function (fade)
    {
        for (var i = 0; i < _this._audioControls.length; ++i)
        {
            _this._audioControls[i].StopAudio(fade);
        }
    }


    this.UpdateAudioSettings = function ()
    {
        //Skipping the first audioComponent as it is the audioCompRef
        for (var i = 1; i < _this._audioControls.length; ++i)
        {
            _this._audioControls[i].UpdateSettings(_this._audioComponentRef);
        }
    }


    this.SetAudioFades = function (_fadeInTime, _fadeOutTime)
    {
        _this._audioComponentRef.fadeInTime = _fadeInTime;
        _this._audioComponentRef.fadeOutTime = _fadeOutTime;
    }
    //#endregion


    //#region private functions
    this.GetInactiveAudioIndex = function ()
    {
        var i = 0;
        while (i < _this._audioControls.length)
        {
            i++;
            if (!_this._audioControls[_this._currentAudio].IsActive())
            {
                return(_this._currentAudio);
            }
            else
            {
                _this._currentAudio++;
                if (_this._currentAudio >= _this._audioControls.length)
                {
                    _this._currentAudio = 0;
                }
            }
        }
        return -1;
    }


    this.Setup = function ()
    {
        for (var i = 0; i < _this._maxInstance; ++i)
        {
            var audio = _obj.copySceneObject(_audioComp.getSceneObject());
            audio.getComponent("Component.AudioComponent").audioTrack = _this._audioComponentRef.audioTrack;
            _this._audioControls.push(new AudioControl(audio.getComponent("Component.AudioComponent")));
        }

        //On doit décaler la copie des settings d'une frame,
        //la copie ne prenant pas correctement les paramètres du component et n'est pas encore prêt.
        var event = script.createEvent("UpdateEvent");
        event.bind(function(){
            _this.UpdateAudioSettings();
            event.enabled = false;
            event = null;})
    }
    //#endregion


    this.Setup();
}


//TODO, voir pour mieux gérer les sons continus mais contrôlés (gestion des changements de sous scènes)
function AudioControl (_audioComp)
{
    //#region private vars
    var _this = this;
    this._audioComp = _audioComp;
    this._audioObj = _audioComp.getSceneObject();
    //#endregion


    //#region public functions
    this.IsActive = function ()
    {
        return _this._audioComp.isPlaying() || _this._audioComp.isPaused();
    }


    this.PlayAudio = function (_audioCompRef, _audioTrack, _loops, _parent, _callback)
    {
        if (!_this.IsActive())
        {
            _this._audioComp.audioTrack = _audioTrack;
            _this.UpdateSettings(_audioCompRef);
            _this._audioObj.setParent(_parent !== undefined ? _parent : null);
            _this._audioComp.play(_loops !== undefined ? _loops : 1);
            if (_callback !== undefined)
            {
                _this._audioComp.setOnFinish(function(audioComp){audioComp.setOnFinish(function(){}); _this._audioObj.setParent(null); _callback();});
            }
            else
            {
                _this._audioComp.setOnFinish(function(audioComp){audioComp.setOnFinish(function(){}); _this._audioObj.setParent(null);});
            }
        }
    }


    this.SetVolume = function (_volume)
    {
        if (_this.IsActive())
        {
            _this._audioComp.volume = _volume;
        }
    }


    this.StopAudio = function (fade)
    {
        if (_this.IsActive())
        {
            _this._audioComp.stop(fade);
        }
    }


    this.UpdateSettings = function (_audioComp)
    {
        _this._audioComp.fadeInTime = _audioComp.fadeInTime;
        _this._audioComp.fadeOutTime = _audioComp.fadeOutTime;
        _this._audioComp.mixToSnap = _audioComp.mixToSnap;
        _this._audioComp.recordingVolume = _audioComp.recordingVolume;
        _this._audioComp.spatialAudio.enabled = _audioComp.spatialAudio.enabled;
        _this._audioComp.spatialAudio.distanceEffect.enabled = _audioComp.spatialAudio.distanceEffect.enabled;
        _this._audioComp.spatialAudio.distanceEffect.type = _audioComp.spatialAudio.distanceEffect.type;
        _this._audioComp.spatialAudio.distanceEffect.maxDistance = _audioComp.spatialAudio.distanceEffect.maxDistance;
        _this._audioComp.spatialAudio.distanceEffect.minDistance = _audioComp.spatialAudio.distanceEffect.minDistance;
        _this._audioComp.spatialAudio.directivityEffect.enabled = _audioComp.spatialAudio.directivityEffect.enabled;
        _this._audioComp.spatialAudio.directivityEffect.shapeFactor = _audioComp.spatialAudio.directivityEffect.shapeFactor;
        _this._audioComp.spatialAudio.directivityEffect.shapeDecay = _audioComp.spatialAudio.directivityEffect.shapeDecay;
        _this._audioComp.spatialAudio.positionEffect.enabled = _audioComp.spatialAudio.positionEffect.enabled;
        _this._audioComp.volume = _audioComp.volume;
    }
    //#endregion
}