// Lib Lens Atomic : AudioManager
// Version : 2.1.0
// Dependencies : None
// Authors : Gautier Jacquet

// Doc : https://www.notion.so/atomicdigitaldesign/Audio-Manager-69eb5c159176478a9692a31d3ed56492

//@input SceneObject audioParent



class AudioManagerClass
{
    constructor ()
    {
        //#region private vars
        this._obj = script.getSceneObject();
        this._audioComps = [];
        this._audioSystems = [];
        //#endregion

        //#region setup
        this.GetAudios(script.audioParent);
        //#endregion
    }


    //#region public functions
    CreateAudioSystem (_name, _maxInstance, _audioTracks)
    {
        const _audioComp = this.GetAudioComp(_name);
        if (_audioComp !== null)
        {
            for (let i = 0; i < this._audioSystems.length; ++i)
            {
                if (this._audioSystems[i].GetName() === _name)
                {
                    print(`Warning : AudioSystem already existing with the name ${_name} ! Returning it instead of a new one.`);
                    return this._audioSystems[i];
                }
            }
        
            const system = new AudioSystem (this._obj, _name, _audioComp, _maxInstance, _audioTracks);
            this._audioSystems.push(system);
        
            return system;
        }
        else
        {
            print(`Warning : AudioComponent with name ${_name} was not found !`);
        }
    }
    
    
    DeleteAudioSystem (_name)
    {
        for (let i = 0; i < this._audioSystems.length; ++i)
        {
            if (this._audioSystems[i].GetName() === _name)
            {
                this._audioSystems.splice(i, 1);
                return;
            }
        }
    
        print(`Warning : AudioSystem with the name ${_name} wasn't found when delete was called !`);
    }
    
    
    GetAudioSystem (_name)
    {
        for (let i = 0; i < this._audioSystems.length; ++i)
        {
            if (this._audioSystems[i].GetName() === _name)
            {
                return this._audioSystems[i];
            }
        }
    
        print(`Warning : AudioSystem with the name ${_name} wasn't found when delete was called !`);
        return null;
    }
    
    
    PlayAudioByName (_name, _loops, _parent, _callback)
    {
        const system = this.GetAudioSystem(_name);
    
        if (system !== null)
        {
            return system.PlayAudio(_loops, _parent, _callback);
        }
        else
        {
            print(`Warning : AudioSystem with the name ${_name} was called but not found !`);
            return null;
        }
    }
    //#endregion


    //#region private functions
    GetAudioComp (name)
    {
        for (let i = 0; i < this._audioComps.length; ++i)
        {
            if (this._audioComps[i].getSceneObject().name === name)
            {
                return this._audioComps[i];
            }
        }
        
        return null;
    }


    GetAudios (parent)
    {
        const childCount = parent.getChildrenCount();
        for (let i = 0; i < childCount; ++i)
        {
            const obj = parent.getChild(i);
            const audio = obj.getComponent("Component.AudioComponent");
            if (audio !== undefined && audio !== null)
            {
                this._audioComps.push(audio);
            }
            this.GetAudios(obj);
        }
    }
    //#endregion
}


class AudioSystem
{
    constructor (_obj, _name, _audioComp, _maxInstance, _audioTracks)
    {
        //#region private vars
        const _this = this;
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
        this.GetNextTrackIndex = (index) => Math.floor(MathUtils.randomRange(0, _this._audioTracks.length))
        //#endregion

        this.Setup();
    }
    
    //#region public functions
    GetName (){return this._name;};

    
    PlayAudio (_loops, _parent, _callback)
    {
        const i = this.GetInactiveAudioIndex();

        if (i >= 0)
        {
            const audio = this._audioControls[i];
            this._currentTrack = this.GetNextTrackIndex(this._currentTrack);
            audio.PlayAudio(this._audioComponentRef, this._audioTracks[this._currentTrack], _loops, _parent, _callback);
            return audio;
        }
        else
        {
            if (_callback !== undefined)
            {
                _callback();
            }
            print(`Warning : AudioSystem ${this._name} PlayAudio called but there is no audioComponent available !`);
            return null;
        }
    }


    StopAudios (fade)
    {
        for (let i = 0; i < this._audioControls.length; ++i)
        {
            this._audioControls[i].StopAudio(fade);
        }
    }


    UpdateAudioSettings ()
    {
        //Skipping the first audioComponent as it is the audioCompRef
        for (let i = 1; i < this._audioControls.length; ++i)
        {
            this._audioControls[i].UpdateSettings(this._audioComponentRef);
        }
    }


    SetAudioFades (_fadeInTime, _fadeOutTime)
    {
        this._audioComponentRef.fadeInTime = _fadeInTime;
        this._audioComponentRef.fadeOutTime = _fadeOutTime;
    }
    //#endregion


    //#region private functions
    GetInactiveAudioIndex ()
    {
        let i = 0;
        while (i < this._audioControls.length)
        {
            i++;
            if (!this._audioControls[this._currentAudio].IsActive())
            {
                return(this._currentAudio);
            }
            else
            {
                this._currentAudio++;
                if (this._currentAudio >= this._audioControls.length)
                {
                    this._currentAudio = 0;
                }
            }
        }
        return -1;
    }


    Setup ()
    {
        for (let i = 0; i < this._maxInstance; ++i)
        {
            const audio = this._obj.copySceneObject(this._audioComponentRef.getSceneObject());
            audio.getComponent("Component.AudioComponent").audioTrack = this._audioComponentRef.audioTrack;
            this._audioControls.push(new AudioControl(audio.getComponent("Component.AudioComponent")));
        }

        //On doit décaler la copie des settings d'une frame,
        //la copie ne prenant pas correctement les paramètres du component et n'est pas encore prêt.
        let event = script.createEvent("UpdateEvent");
        event.bind(() => {
            this.UpdateAudioSettings();
            event.enabled = false;
            event = null;})
    }
    //#endregion
}


//TODO, voir pour mieux gérer les sons continus mais contrôlés (gestion des changements de sous scènes)
class AudioControl
{
    constructor (_audioComp)
    {
        //#region private vars
        this._audioComp = _audioComp;
        this._audioObj = _audioComp.getSceneObject();
        //#endregion
    }


    //#region public functions
    IsActive () {return (this._audioComp.isPlaying() || this._audioComp.isPaused())}


    PlayAudio (_audioCompRef, _audioTrack, _loops, _parent, _callback)
    {
        if (!this.IsActive())
        {
            this._audioComp.audioTrack = _audioTrack;
            this.UpdateSettings(_audioCompRef);
            this._audioObj.setParent(_parent !== undefined ? _parent : null);
            this._audioComp.play(_loops !== undefined ? _loops : 1);
            if (_callback !== undefined)
            {
                this._audioComp.setOnFinish(audioComp => {audioComp.setOnFinish(() => {}); this._audioObj.setParent(null); _callback();});
            }
            else
            {
                this._audioComp.setOnFinish(audioComp => {audioComp.setOnFinish(() => {}); this._audioObj.setParent(null);});
            }
        }
    }


    SetVolume (_volume)
    {
        if (this.IsActive())
        {
            this._audioComp.volume = _volume;
        }
    }


    StopAudio (fade)
    {
        if (this.IsActive())
        {
            this._audioComp.stop(fade);
        }
    }


    UpdateSettings (_audioComp)
    {
        this._audioComp.fadeInTime = _audioComp.fadeInTime;
        this._audioComp.fadeOutTime = _audioComp.fadeOutTime;
        this._audioComp.mixToSnap = _audioComp.mixToSnap;
        this._audioComp.recordingVolume = _audioComp.recordingVolume;
        this._audioComp.spatialAudio.enabled = _audioComp.spatialAudio.enabled;
        this._audioComp.spatialAudio.distanceEffect.enabled = _audioComp.spatialAudio.distanceEffect.enabled;
        this._audioComp.spatialAudio.distanceEffect.type = _audioComp.spatialAudio.distanceEffect.type;
        this._audioComp.spatialAudio.distanceEffect.maxDistance = _audioComp.spatialAudio.distanceEffect.maxDistance;
        this._audioComp.spatialAudio.distanceEffect.minDistance = _audioComp.spatialAudio.distanceEffect.minDistance;
        this._audioComp.spatialAudio.directivityEffect.enabled = _audioComp.spatialAudio.directivityEffect.enabled;
        this._audioComp.spatialAudio.directivityEffect.shapeFactor = _audioComp.spatialAudio.directivityEffect.shapeFactor;
        this._audioComp.spatialAudio.directivityEffect.shapeDecay = _audioComp.spatialAudio.directivityEffect.shapeDecay;
        this._audioComp.spatialAudio.positionEffect.enabled = _audioComp.spatialAudio.positionEffect.enabled;
        this._audioComp.volume = _audioComp.volume;
    }
    //#endregion
}



global.AudioManager = new AudioManagerClass();