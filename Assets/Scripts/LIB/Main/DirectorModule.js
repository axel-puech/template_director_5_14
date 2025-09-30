// Lib Lens Atomic : Director Module
// Version : 3.4.0
// Dependencies : Update Manager Module, Audio Manager Module
// Authors : Gautier Jacquet

// Doc : https://www.notion.so/atomicdigitaldesign/Director-Module-3f898a08c75e4baea1b8a7006400acfe


class DirectorEvent 
{
    constructor (_script, _type, _callback)
    {
        //#region private vars
        this._script = _script;
        this._type = _type;
        this.callback = _callback;
        //#endregion

        //#region public vars
        this.event = null;
        //#endregion
    }

    //#region public functions
    AddEvent ()
    {
        if (this.event === null)
        {
            this.event = this._script.createEvent(this._type);
            this.event.bind(this.callback);
        }
    }

    RemoveEvent ()
    {
        if (this.event !== null)
        {
            this._script.removeEvent(this.event);
            this.event = null;
        }
    }
    //#endregion
}


class DirectorListener 
{
    constructor (_id, _callback, _setupCallback)
    {
        //#region private vars
        this._id = _id;
        //#endregion
    
        //#region public vars
        this.callback = _callback;
        this.setupCallback = _setupCallback !== undefined ? _setupCallback : () => {};
        //#endregion
    }
    
    //#region public functions
    GetId ()
    {
        return this._id;
    }
    //#endregion
}


class DirectorCaller
{
    constructor (_id, _defaultParams)
    {
        //#region private vars
        this._id = _id;
        this._dispatcher = null;
        this._params = _defaultParams;
        //#endregion
    }

    //#region public functions
    Call (params)
    {
        if (this._dispatcher !== null)
        {
            this._dispatcher.Call(params);
        }
        this._params = params;
    }

    Setup ()
    {
        if (this._dispatcher !== null)
        {
            this._dispatcher.Setup(this._params);
        }
    }

    GetId ()
    {
        return this._id;
    }
    
    GetParams ()
    {
        return this._params;
    }

    SetDispatcher (_dispatcher)
    {
        this._dispatcher = _dispatcher;
    }
    //#endregion
}


class SceneCallDispatcher 
{
    constructor (_caller)
    {
        //#region private var
        this._callers = [_caller];
        this._id = _caller.GetId();
        this._listeners = [];
        this._params = _caller.GetParams();
        //#endregion

        for (let i = 0; i < this._callers.length; ++i)
        {
            this._callers[i].SetDispatcher(this);
        }
    }

    //#region public functions
    GetId ()
    {
        return this._id;
    }


    GetParams ()
    {
        return this._params;
    }

    Call (params)
    {
        for (let i = 0; i < this._listeners.length; ++i)
        {
            this._listeners[i].callback(params,this._params);
        }
        
        this._params = params;
    }

    Setup (params)
    {
        for (let i = 0; i < this._listeners.length; ++i)
        {
            if (this._listeners[i].setupCallback !== null)
            {
                this._listeners[i].setupCallback(params);
            }
        }
    }

    AddCaller (_caller)
    {
        const i = this._callers.indexOf(_caller);
        if (i === -1)
        {
            this._callers.push(_caller);
            this._params = _caller.GetParams();
            _caller.SetDispatcher(this);
        }
    }

    AddListener (_listener, _setup)
    {
        const i = this._listeners.indexOf(_listener);
        if (i === -1)
        {
            this._listeners.push(_listener);
            if (_setup && _listener.setupCallback !== null)
            {
                _listener.setupCallback(this.GetParams());
            }
        }
    }

    RemoveCaller (_caller)
    {
        const i = this._callers.indexOf(_caller);
        if (i >= 0)
        {
            this._callers.splice(i, 1);
        }
        return this._callers.length;
    }

    RemoveListener (_listener)
    {
        const i = this._listeners.indexOf(_listener);
        if (i >= 0)
        {
            this._listeners.splice(i, 1);
        }
    }

    Destroy ()
    {
        for (let i = 0; i < this._callers.length; ++i)
        {
            this._callers[i].SetDispatcher(null);
        }
    }
    //#endregion
}


global.Director = class
{
    constructor (_script, _subSceneParent, _useFrontBack, _onSceneEndFunction)
    {
        //#region private vars
        this._sceneNames = [];
        this._scenesAll = [];
        this._scenesCommonNames = [];
        this._scenesFrontNames = [];
        this._scenesBackNames = [];
        this._activeScene = null;
        this._script = _script;
        this._sceneObj = this._script.getSceneObject();
        this._useFrontBack = _useFrontBack;
        this._frontParent = null;
        this._backParent = null;
        this._commonParent = null;

        this._subSceneParent = _subSceneParent;
        this._subScenes = [];

        this._camBackEvent = this._script.createEvent("CameraBackEvent");
        this._camFrontEvent = this._script.createEvent("CameraFrontEvent");

        this._camBackEvent.bind(() => {this.OnCamBack();});
        this._camFrontEvent.bind(() => {this.OnCamFront();});
        //#endregion

        //#region public events
        this.OnSceneEnded = _onSceneEndFunction;
        this.OnCamFront = () => {};
        this.OnCamBack = () => {};
        //#endregion

        //#region private events
        if (this._useFrontBack)
        {
            this.OnCamFront = function(){this.GoToScene(this._scenesFrontNames[0], true, true);};
            this.OnCamBack = function(){this.GoToScene(this._scenesBackNames[0], true, true);};
        }
        //#endregion

        
        this.Setup();
        this.HideAllInstant();

        if (!this._useFrontBack)
        {
            this.GoToScene(this._scenesCommonNames[0], true);
        }
    }

    //#region public functions
    GetActiveScene ()
    {
        return this._scenesAll[this._activeScene];
    }

    GetScene (sceneName)
    {
        return this._scenesAll[sceneName];
    }


    GoToScene (name, instantShow, instantHide, forceRestart)
    {
        if (instantHide)
        {
            for (let i = 0; i < this._subScenes.length; ++i)
            {
                const sub = this._subScenes[i];
                if (sub.IsVisible() && sub.IsHiding())
                {
                    sub.HideInstant();
                }
            }
        }

        let subScenesOld = undefined;
        const subScenesNew = this._scenesAll[name].GetSubScenes();
        if(this._activeScene !== null)
        {
            subScenesOld = this._scenesAll[this._activeScene].GetSubScenes();
            this._scenesAll[this._activeScene].Stop(instantHide, subScenesNew, forceRestart);
        }
        this._activeScene = name;
        this._scenesAll[this._activeScene].Start(instantShow, subScenesOld, forceRestart);
    }
    //#endregion


    //#region private functions
    HideAllInstant ()
    {
        for (var i = 0; i < this._sceneNames.length; ++i)
        {
            this._scenesAll[this._sceneNames[i]].Stop(true);
        }

        for (var i = 0; i < this._subScenes.length; ++i)
        {
            if (this._subScenes[i].IsActive())
            {
                print(`Warning : La sous scène ${this._subScenes[i].GetName()} n'est présente dans aucune scène !`);
                this._subScenes[i].Stop();
            }
        }
    }


    AddScene (sceneName, sceneScript, isCommon, isFront) {
        this._scenesAll[sceneName] = sceneScript.scene;
        this._sceneNames.push(sceneName);
        if (isCommon)
        {
            this._scenesCommonNames.push(sceneName)
        }
        else if (this._useFrontBack && isFront)
        {
            this._scenesFrontNames.push(sceneName)
        }
        else if (this._useFrontBack)
        {
            this._scenesBackNames.push(sceneName)
        }
        sceneScript.scene.SetDirector(this);
    }


    GetParents ()
    {
        const childCount = this._sceneObj.getChildrenCount();
        for (let i = 0; i < childCount; ++i)
        {
            const obj = this._sceneObj.getChild(i);
            if (obj.name.toUpperCase() == "FRONT")
            {
                this._frontParent = obj;
            }
            else if (obj.name.toUpperCase() == "BACK")
            {
                this._backParent = obj;
            }
            else if (obj.name.toUpperCase() == "COMMON")
            {
                this._commonParent = obj;
            }
        }
    }

    Setup ()
    {
        this.GetParents();
        let childCount = 0;
        if (this._useFrontBack)
        {
            if (this._frontParent !== null)
            {
                childCount = this._frontParent.getChildrenCount();
                for (var i = 0; i < childCount; ++i)
                {
                    var obj = this._frontParent.getChild(i);
                    this.AddScene(obj.name, obj.getComponent("Component.ScriptComponent"), false, true);
                }
            }

            if (this._backParent !== null)
            {
                childCount = this._backParent.getChildrenCount();
                for (var i = 0; i < childCount; ++i)
                {
                    var obj = this._backParent.getChild(i);
                    this.AddScene(obj.name, obj.getComponent("Component.ScriptComponent"), false, false);
                }
            }
        }
        else if (this._commonParent !== null)
        {
            childCount = this._commonParent.getChildrenCount();
            for (var i = 0; i < childCount; ++i)
            {
                var obj = this._commonParent.getChild(i);
                this.AddScene(obj.name, obj.getComponent("Component.ScriptComponent"), true, false);
            }
        }

        this.GetSubScenes(this._subSceneParent);
    }

    GetSubScenes (parent)
    {
        const childCount = parent.getChildrenCount();
        for (let i = 0; i < childCount; ++i)
        {
            const obj = parent.getChild(i);
            const script = obj.getComponent("Component.ScriptComponent");
            if (script !== undefined && script !== null)
            {
                const subScene = script.subScene;
                if (subScene !== undefined && subScene !== null)
                {
                    this._subScenes.push(subScene);
                }
            }
            this.GetSubScenes(obj);
        }
    }
    //#endregion
}


global.Scene = class
{
    constructor (_script, _subScenesScript)
    {
        //#region private vars
        this._director = null;
        this._script = _script;
        this._name = this._script.getSceneObject().name;
        this._subScenes = [];
        this._active = true;
        this._initialized = false;
        this._update = new global.Update(_script.getSceneObject(), UpdateType.Update, () => {this._Update()});;
        this._lateUpdate = new global.Update(_script.getSceneObject(), UpdateType.LateUpdate, () => {this._LateUpdate()});
        this._events = [];
        this._callers = [];
        this._listeners = [];
        this._activationCount = 0;
        this._sceneDispatchers = [];
        this._audioSystems = [];
        this._fadeAudioOnStop = true;
        //#endregion

        //#region public events
        this.OnStart = () => {};
        this.OnLateStart = () => {};
        this.OnStop = () => {};
        this.OnLateStop = () => {};
        //#endregion

        //#region private events
        this._Update = null;
        this._LateUpdate = null;
        //#endregion
        
        for (let i = 0; i < _subScenesScript.length; ++i)
        {
            this._subScenes.push(_subScenesScript[i].subScene);
        }
    }
    

    //#region public functions
    IsActive (){return this._active;};
    IsInitialized (){return this._initialized;};
    GetName (){return this._name;};
    GetSubScenes (){return this._subScenes;};
    SetDirector (director){this._director = director;};
    GetDirector (){return this._director};
    GetActivationCount (){return this._activationCount;};

    Start (showInstant, oldScenes, forceRestart)
    {
        this._initialized = true;
        this._active = true;
        this._activationCount++;
        this.OnStart();
        this.SetCallers();

        for (var i = 0; i < this._subScenes.length; ++i)
        {
            this._subScenes[i].SetSceneScript(this._script);
            if (forceRestart || oldScenes === undefined || !oldScenes.includes(this._subScenes[i]))
            {
                this._subScenes[i].Start(showInstant);
            }
            this._subScenes[i].SetCallers();
        }

        
        this.SetListeners();

        for (var i = 0; i < this._subScenes.length; ++i)
        {
            const setup = forceRestart || oldScenes === undefined || !oldScenes.includes(this._subScenes[i]);
            this._subScenes[i].SetListeners(setup);
        }

        if (this._Update && !this._update.IsAdded())
        {
            this._update.Add();
        }
        if (this._LateUpdate && !this._lateUpdate.IsAdded())
        {
            this._lateUpdate.Add();
        }

        for (var i = 0; i < this._events.length; ++i)
        {
            this._events[i].AddEvent();
        }

        this.OnLateStart();

        for (var i = 0; i < this._subScenes.length; ++i)
        {
            if (forceRestart || oldScenes === undefined || !oldScenes.includes(this._subScenes[i]))
            {
                this._subScenes[i].LateStart();
            }
            this._subScenes[i].ChangeScene();
        }
    }

    Stop (hideInstant, newScenes, forceRestart)
    {
        if (this._initialized)
        {
            if (this._Update && this._update.IsAdded())
            {
                this._update.Remove();
            }
            if (this._LateUpdate && this._lateUpdate.IsAdded())
            {
                this._lateUpdate.Remove();
            }

            for (var i = 0; i < this._events.length; ++i)
            {
                this._events[i].RemoveEvent();
            }
        }

        for (var i = 0; i < this._sceneDispatchers.length; ++i)
        {
            this._sceneDispatchers[i].Destroy();
        }
        this._sceneDispatchers = [];

        this._active = false;
        this.OnStop();
        
        for (var i = 0; i < this._subScenes.length; ++i)
        {
            if (forceRestart || newScenes === undefined || !newScenes.includes(this._subScenes[i]))
            {
                this._subScenes[i].Stop(hideInstant);
            }
        }

        this.OnLateStop();
    }

    SceneEnded (params)
    {
        this._director.OnSceneEnded(this._name, params);
    }

    SetUpdate (_function)
    {
        this._Update = _function;
        if (_function && this._active && this._initialized && !this._update.IsAdded())
        {
            this._update.Add();
        }
        else if (!_function && this._update.IsAdded())
        {
            this._update.Remove();
        }
    }

    SetLateUpdate (_function)
    {
        this._LateUpdate = _function;
        if (_function && this._active && this._initialized && !this._lateUpdate.IsAdded())
        {
            this._lateUpdate.Add();
        }
        else if (!_function && this._lateUpdate.IsAdded())
        {
            this._lateUpdate.Remove();
        }
    }

    ChangeUpdateOrder (_order)
    {
        this._update.ChangeOrder(_order);
    }

    ChangeLateUpdateOrder (_order)
    {
        this._lateUpdate.ChangeOrder(_order);
    }

    SetEnableUpdate (_enabled)
    {
        this._update.enabled = _enabled;
    }

    SetEnableLateUpdate (_enabled)
    {
        this._lateUpdate.enabled = _enabled;
    }

    CreateEvent (_type, _callback)
    {
        const event = new DirectorEvent(this._script, _type, _callback);

        if (this._active && this._initialized)
        {
            event.AddEvent();
        }

        this._events.push(event);

        return event;
    }

    DeleteEvent (_event)
    {
        if (this._active && this._initialized)
        {
            _event.RemoveEvent();
        }

        const i = this._events.indexOf(_event);
        if (i >= 0)
        {
            this._events.splice(i, 1);
        }
    }

    AddCallerToDispatcher (_caller)
    {
        let dispatcher = null;
        for (let i = 0; i < this._sceneDispatchers.length; ++i)
        {
            if (this._sceneDispatchers[i].GetId() === _caller.GetId())
            {
                dispatcher = this._sceneDispatchers[i];
                break;
            }
        }

        if (dispatcher === null)
        {
            dispatcher = new SceneCallDispatcher(_caller);
            this._sceneDispatchers.push(dispatcher);
        }
        else
        {
            dispatcher.AddCaller(_caller);
        }
    }

    RemoveCallerFromDispatcher (_caller)
    {
        let id = -1;
        for (var i = 0; i < this._sceneDispatchers.length; ++i)
        {
            if (this._sceneDispatchers[i].GetId() === _caller.GetId())
            {
                id = i;
                break;
            }
        }
        
        if (id >= 0)
        {
            if (this._sceneDispatchers[i].RemoveCaller(_caller) <= 0) // Retourne la taille du tableau des callers restant, on supprime le dispatcher si la liste est vide.
            {
                this._sceneDispatchers.splice(i, 1);
            }
        }
        else
        {
            print(`Warning : Le dispatcher pour le caller ${_caller.GetId()} n'existe pas, il ne peut donc pas être supprimé !`);
        }
    }

    AddDirectorListener (_listener, _setup)
    {
        let id = -1;
        for (let i = 0; i < this._sceneDispatchers.length; ++i)
        {
            if (this._sceneDispatchers[i].GetId() === _listener.GetId())
            {
                id = i;
                break;
            }
        }
        
        if (id >= 0)
        {
            this._sceneDispatchers[id].AddListener(_listener, _setup);
        }
        else if (_listener.GetId() !== "SceneEnded")
        {
            print(`Warning : Un listener pour ${_listener.GetId()} doit être ajouté mais aucun caller n'a cet ID !`);
        }
    }

    RemoveDirectorListener (_listener)
    {
        let id = -1;
        for (let i = 0; i < this._sceneDispatchers.length; ++i)
        {
            if (this._sceneDispatchers[i].GetId() === _listener.GetId())
            {
                id = i;
                break;
            }
        }
        
        if (id >= 0)
        {
            this._sceneDispatchers[id].RemoveListener(_listener);
        }
        else
        {
            print(`Warning : Un listener pour ${_listener.GetId()} doit être supprimé mais n'existe pas dans la liste !`);
        }
    }

    CreateCaller (_id, _defaultParams)
    {
        const caller = new DirectorCaller (_id, _defaultParams);
        this._callers.push(caller);

        if (this._active && this._initialized)
        {
            this.AddCallerToDispatcher(caller);
        }

        return caller;
    }

    DeleteCaller (_caller)
    {
        if (this._active && this._initialized)
        {
            this.RemoveCallerFromDispatcher(_caller);
        }

        const i = this._callers.indexOf(_caller);
        if (i >= 0)
        {
            this._callers.splice(i, 1);
        }
    }

    CreateListener (_id, _callback, _setupCallback)
    {
        const listener = new DirectorListener (_id, _callback, _setupCallback);
        this._listeners.push(listener);

        if (this._active && this._initialized)
        {
            this.AddDirectorListener(listener, true);
        }

        return listener;
    }

    DeleteListener (_listener)
    {
        if (this._active && this._initialized)
        {
            this.RemoveListener(_listener);
        }

        const i = this._listeners.indexOf(_listener);
        if (i >= 0)
        {
            this._listeners.splice(i, 1);
        }
    }

    SetCallers ()
    {
        for (let i = 0; i < this._callers.length; ++i)
        {
            this.AddCallerToDispatcher(this._callers[i]);
        }
    }

    SetListeners (_setup)
    {
        for (let i = 0; i < this._listeners.length; ++i)
        {
            this.AddDirectorListener(this._listeners[i], _setup);
        }
    }

    CreateAudioSystem (_name, _maxInstance, _audioTracks)
    {
        const audioSystem = global.AudioManager.CreateAudioSystem(_name, _maxInstance, _audioTracks);
        if (audioSystem !== null)
        {
            this._audioSystems.push(audioSystem);
            return audioSystem;
        }
        else
        {
            print(`AudioSystem with name ${_name} was not added to the subScene ${this._name} !`);
            return null;
        }
    }

    SetAudioFadeOnStop (_fade)
    {
        this._fadeAudioOnStop = _fade;
    }
    //#endregion
}


global.SubScene = class
{
    constructor (_script, _parent, _show, _hide, _showInstant, _hideInstant)
    {
        //#region private vars
        this._script = _script;
        this._sceneScript = null;
        this._name = this._script.getSceneObject().name;
        this._parent = _parent;
        this._active = true;
        this._initialized = false;
        this._hiding = false;
        this._update = new global.Update(_script.getSceneObject(), UpdateType.Update, () => {this._Update()});
        this._lateUpdate = new global.Update(_script.getSceneObject(), UpdateType.LateUpdate, () => {this._LateUpdate()});
        this._events = [];
        this._callers = [];
        this._listeners = [];
        this._activationCount = 0;
        this._audioSystems = [];
        this._fadeAudioOnStop = true;
        //#endregion

        //#region public events
        this.Show = _show !== undefined ? _show :
                                () => {this._parent.enabled = true;};
        this.Hide = _hide !== undefined ? _hide :
                                () => {this._parent.enabled = false;};
        this.ShowInstant = _showInstant !== undefined ? _showInstant :
                                () => {this._parent.enabled = true;};
        this.HideInstant = _hideInstant !== undefined ? _hideInstant :
                                () => {this._parent.enabled = false;};

        this.OnStart = () => {};
        this.OnLateStart = () => {};
        this.OnSceneChanged = () => {};
        this.OnStop = () => {};
        //#endregion

        //#region private events
        this._Update = null;
        this._LateUpdate = null;
        //#endregion
    }
    

    //#region public functions
    IsActive (){return this._active;};
    IsInitialized (){return this._initialized;};
    IsVisible (){return this._parent.enabled;};
    IsHiding (){return this._hiding;};
    GetActivationCount (){return this._activationCount;};
    GetName (){return this._name;};
    GetParent (){return this._parent;};
    GetSceneScript (){return this._sceneScript;};
    SetSceneScript (sceneScript){this._sceneScript = sceneScript;};

    CallEnd (_params)
    {
        this.GetSceneScript().scene.SceneEnded(_params);
    }

    ChangeScene ()
    {
        this.OnSceneChanged();
    }

    Start (showInstant)
    {
        this._initialized = true;
        this._activationCount++;
        if (!this._active)
        {
            this._active = true;
            this._hiding = false;
            if (this.OnStart !== null && this.OnStart !== undefined)
            {
                this.OnStart();
            }
            if (showInstant)
            {
                if (this.ShowInstant !== null && this.ShowInstant !== undefined)
                {
                    this.ShowInstant();
                }
                else
                {
                    print(`WARNING : ShowInstant for subscene ${this.GetName()} was called but is undefined or null`);
                    this._parent.enabled = true;
                }
            }
            else
            {
                if (this.Show !== null && this.Show !== undefined)
                {
                    this.Show();
                }
                else
                {
                    print(`WARNING : Show for subscene ${this.GetName()} was called but is undefined or null`);
                    this._parent.enabled = true;
                }
            }

            if (this._Update && !this._update.IsAdded())
            {
                this._update.Add();
            }
            if (this._LateUpdate && !this._lateUpdate.IsAdded())
            {
                this._lateUpdate.Add();
            }

            for (let i = 0; i < this._events.length; ++i)
            {
                this._events[i].AddEvent();
            }
        }
    }

    LateStart ()
    {
        if (this.OnLateStart !== null && this.OnLateStart !== undefined)
        {
            this.OnLateStart();
        }
    }

    Stop (hideInstant)
    {
        if (this._active)
        {
            if (this._initialized)
            {
                if (this._update.IsAdded())
                {
                    this._update.Remove();
                }
                if (this._lateUpdate.IsAdded())
                {
                    this._lateUpdate.Remove();
                }

                for (var i = 0; i < this._events.length; ++i)
                {
                    this._events[i].RemoveEvent();
                }
            }

            for (var i = 0; i < this._audioSystems.length; ++i)
            {
                this._audioSystems[i].StopAudios(this._fadeAudioOnStop);
            }

            this._hiding = true;
            if (this.OnStop !== null && this.OnStop !== undefined)
            {
                this.OnStop();
            }
            if (hideInstant)
            {
                if (this.HideInstant !== null && this.HideInstant !== undefined)
                {
                    this.HideInstant();
                }
                else
                {
                    print(`WARNING : HideInstant for subscene ${this.GetName()} was called but is undefined or null`);
                    this._parent.enabled = false;
                }
            }
            else
            {
                if (this.Hide !== null && this.Hide !== undefined)
                {
                    this.Hide();
                }
                else
                {
                    print(`WARNING : Hide for subscene ${this.GetName()} was called but is undefined or null`);
                    this._parent.enabled = false;
                }
            }
            this._active = false;
        }
    }

    SetUpdate (_function)
    {
        this._Update = _function;
        if (_function && this._active && this._initialized && !this._update.IsAdded())
        {
            this._update.Add();
        }
        else if (!_function && this._update.IsAdded())
        {
            this._update.Remove();
        }
    }

    SetLateUpdate (_function)
    {
        this._LateUpdate = _function;
        if (_function && this._active && this._initialized && !this._lateUpdate.IsAdded())
        {
            this._lateUpdate.Add();
        }
        else if (!_function && this._lateUpdate.IsAdded())
        {
            this._lateUpdate.Remove();
        }
    }

    ChangeUpdateOrder (_order)
    {
        this._update.ChangeOrder(_order);
    }

    ChangeLateUpdateOrder (_order)
    {
        this._lateUpdate.ChangeOrder(_order);
    }

    SetEnableUpdate (_enabled)
    {
        this._update.enabled = _enabled;
    }

    SetEnableLateUpdate (_enabled)
    {
        this._lateUpdate.enabled = _enabled;
    }

    CreateEvent (_type, _callback)
    {
        const event = new DirectorEvent(this._script, _type, _callback);

        if (this._active && this._initialized)
        {
            event.AddEvent();
        }

        this._events.push(event);

        return event;
    }

    DeleteEvent (_event)
    {
        if (this._active && this._initialized)
        {
            _event.RemoveEvent();
        }

        const i = this._events.indexOf(_event);
        if (i >= 0)
        {
            this._events.splice(i, 1);
        }
    }

    CreateCaller (_id, _defaultParams)
    {
        const caller = new DirectorCaller (_id, _defaultParams);
        this._callers.push(caller);

        if (this._active && this._initialized)
        {
            this._sceneScript.scene.AddCallerToDispatcher(caller);
        }

        return caller;
    }

    DeleteCaller (_caller)
    {
        if (this._active && this._initialized)
        {
            this._sceneScript.scene.RemoveCallerFromDispatcher(_caller);
        }

        const i = this._callers.indexOf(_caller);
        if (i >= 0)
        {
            this._callers.splice(i, 1);
        }
    }

    CreateListener (_id, _callback, _setupCallback)
    {
        const listener = new DirectorListener (_id, _callback, _setupCallback);
        this._listeners.push(listener);

        if (this._active && this._initialized)
        {
            this._sceneScript.scene.AddDirectorListener(listener, true);
        }

        return listener;
    }

    DeleteListener (_listener)
    {
        if (this._active && this._initialized)
        {
            this._sceneScript.scene.RemoveListener(_listener);
        }

        const i = this._listeners.indexOf(_listener);
        if (i >= 0)
        {
            this._listeners.splice(i, 1);
        }
    }

    SetCallers ()
    {
        for (let i = 0; i < this._callers.length; ++i)
        {
            this._sceneScript.scene.AddCallerToDispatcher(this._callers[i]);
        }
    }

    SetListeners (_setup)
    {
        for (let i = 0; i < this._listeners.length; ++i)
        {
            this._sceneScript.scene.AddDirectorListener(this._listeners[i], _setup);
        }
    }

    CreateAudioSystem (_name, _maxInstance, _audioTracks)
    {
        const audioSystem = global.AudioManager.CreateAudioSystem(_name, _maxInstance, _audioTracks);
        if (audioSystem !== null)
        {
            this._audioSystems.push(audioSystem);
            return audioSystem;
        }
        else
        {
            print(`AudioSystem with name ${_name} was not added to the subScene ${this._name} !`);
            return null;
        }
    }

    SetAudioFadeOnStop (_fade)
    {
        this._fadeAudioOnStop = _fade;
    }
    //#endregion
}