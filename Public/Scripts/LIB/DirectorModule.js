// Lib Lens Atomic : Director Module
// Version : 1.2.2
// Authors : Gautier Jacquet


global.Director = function (_script, _subSceneParent, _useFrontBack, _onSceneEndFunction)
{
    //#region private vars
    var _this = this;
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

    this._camBackEvent.bind(function(){_this.OnCamBack();});
    this._camFrontEvent.bind(function(){_this.OnCamFront();});
    //#endregion

    //#region public events
    this.OnSceneEnded = _onSceneEndFunction;
    this.OnCamFront = function (){};
    this.OnCamBack = function (){};
    //#endregion

    //#region private events
    if (this._useFrontBack)
    {
        this.OnCamFront = function(){this.GoToScene(this._scenesFrontNames[0], true);};
        this.OnCamBack = function(){this.GoToScene(this._scenesBackNames[0], true);};
    }
    //#endregion

    //#region public functions
    this.GetActiveScene = function(){return this._scenesAll[this._activeScene];};

    this.GetScene = function (sceneName)
    {
        return this._scenesAll[sceneName];
    }

    //TODO add delay
    this.GoToScene = function (name, instantShow, instantHide)
    {
        if (instantHide)
        {
            for (var i = 0; i < this._subScenes.length; ++i)
            {
                var sub = this._subScenes[i];
                if (sub.IsVisible() && sub.IsHiding())
                {
                    sub.HideInstant();
                }
            }
        }

        var subScenesOld = undefined;
        var subScenesNew = this._scenesAll[name].GetSubScenes();
        if(this._activeScene !== null)
        {
            subScenesOld = this._scenesAll[this._activeScene].GetSubScenes();
            this._scenesAll[this._activeScene].Stop(instantHide, subScenesNew);
        }
        this._activeScene = name;
        this._scenesAll[this._activeScene].Start(instantShow, subScenesOld);
    }
    //#endregion


    //#region private functions
    this.HideAllInstant = function ()
    {
        for (var i = 0; i < this._sceneNames.length; ++i)
        {
            this._scenesAll[this._sceneNames[i]].Stop(true);
        }

        for (var i = 0; i < this._subScenes.length; ++i)
        {
            if (this._subScenes[i].IsActive())
            {
                print("Warning : La sous scène " + this._subScenes[i].GetName() + " n'est présente dans aucune scène !");
                this._subScenes[i].Stop();
            }
        }
    }


    this.AddScene = function (sceneName, sceneScript, isCommon, isFront)
    {
        this._scenesAll[sceneName] = sceneScript.api.scene;
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
        sceneScript.api.scene.SetDirector(this);
    }


    this.GetParents = function ()
    {
        var childCount = this._sceneObj.getChildrenCount();
        for (var i = 0; i < childCount; ++i)
        {
            var obj = this._sceneObj.getChild(i);
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

    this.Setup = function ()
    {
        this.GetParents();
        var childCount = 0;
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

        childCount = this._subSceneParent.getChildrenCount();
        for (var i = 0; i < childCount; ++i)
        {
            var obj = this._subSceneParent.getChild(i);
            this._subScenes.push(obj.getComponent("Component.ScriptComponent").api.subScene);
        }
    }
    //#endregion
    this.Setup();
    this.HideAllInstant();

    if (!this._useFrontBack)
    {
        this.GoToScene(this._scenesCommonNames[0], true);
    }
}


global.Scene = function (_script, _subScenesScript)
{
    //#region private vars
    this._director = null;
    this._script = _script;
    this._name = this._script.getSceneObject().name;
    this._subScenes = [];
    this._active = true;
    //#endregion
    
    //#region public events
    this.OnStart = function(){};
    this.OnLateStart = function(){};
    this.OnStop = function(){};
    this.OnLateStop = function(){};
    //#endregion

    //#region public functions
    this.IsActive = function(){return this._active;};
    this.GetName = function(){return this._name;};
    this.GetSubScenes = function(){return this._subScenes;};
    this.SetDirector = function(director){this._director = director;};
    this.GetDirector = function(){return this._director};

    this.Start = function (showInstant, oldScenes)
    {
        this._active = true;
        this.OnStart();

        for (var i = 0; i < this._subScenes.length; ++i)
        {
            this._subScenes[i].SetSceneScript(this._script);
            if (oldScenes === undefined || oldScenes.indexOf(this._subScenes[i]) === -1)
            {
                this._subScenes[i].Start(showInstant);
            }
            this._subScenes[i].ChangeScene();
        }

        this.OnLateStart();
    }

    this.Stop = function (hideInstant, newScenes)
    {
        this._active = false;
        this.OnStop();

        for (var i = 0; i < this._subScenes.length; ++i)
        {
            if (newScenes === undefined || newScenes.indexOf(this._subScenes[i]) === -1)
            {
                this._subScenes[i].Stop(hideInstant);
            }
        }

        this.OnLateStop();
    }

    this.SceneEnded = function (params)
    {
        this._director.OnSceneEnded(this._name, params);
    }
    //#endregion

    //#region private functions
    this.Setup = function ()
    {
        for (var i = 0; i < _subScenesScript.length; ++i)
        {
            this._subScenes.push(_subScenesScript[i].api.subScene);
        }
    }
    //#endregion

    this.Setup();
}


global.SubScene = function (_script, _parent, _show, _hide, _showInstant, _hideInstant)
{
    //#region private vars
    this._script = _script;
    this._sceneScript = null;
    this._name = this._script.getSceneObject().name;
    this._parent = _parent;
    this._active = true;
    this._hiding = false;
    //#endregion

    //#region public events
    this.Show = _show !== undefined ? _show :
                            function(){this._parent.enabled = true;};
    this.Hide = _hide !== undefined ? _hide :
                            function(){this._parent.enabled = false;};
    this.ShowInstant = _showInstant !== undefined ? _showInstant :
                            function(){this._parent.enabled = true;};
    this.HideInstant = _hideInstant !== undefined ? _hideInstant :
                            function(){this._parent.enabled = false;};

    this.OnStart = function(){};
    this.OnSceneChanged = function(){};
    this.OnStop = function(){};
    //#endregion

    //#region public functions
    this.IsActive = function(){return this._active;};
    this.IsVisible = function(){return this._parent.enabled;};
    this.IsHiding = function(){return this._hiding;};
    this.GetName = function(){return this._name;};
    this.GetParent = function(){return this._parent;};
    this.GetSceneScript = function(){return this._sceneScript;};
    this.SetSceneScript = function(sceneScript){this._sceneScript = sceneScript;};

    this.ChangeScene = function ()
    {
        this.OnSceneChanged();
    }

    this.Start = function (showInstant)
    {
        if (!this._active)
        {
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
                    print("WARNING : ShowInstant for subscene " + this.GetName() + " was called but is undefined or null");
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
                    print("WARNING : Show for subscene " + this.GetName() + " was called but is undefined or null");
                    this._parent.enabled = true;
                }
            }
            this._active = true;
        }
    }

    this.Stop = function (hideInstant)
    {
        if (this._active)
        {
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
                    print("WARNING : HideInstant for subscene " + this.GetName() + " was called but is undefined or null");
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
                    print("WARNING : Hide for subscene " + this.GetName() + " was called but is undefined or null");
                    this._parent.enabled = false;
                }
            }
            this._active = false;
        }
    }
    //#endregion
}