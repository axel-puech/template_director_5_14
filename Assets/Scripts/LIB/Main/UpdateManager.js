// Lib Lens Atomic : Update Manager Module
// Version : 1.1.0
// Dependencies : None
// Authors : Gautier Jacquet

// Doc : https://www.notion.so/atomicdigitaldesign/Update-Manager-8b3509ed00604b09a775c8d073222f1e


global.UpdateType = {PreUpdate : 0, Update : 10, InterUpdate : 20, LateUpdate : 30, PostUpdate : 40}

global.Update = class
{
    constructor (_obj, _type, _callback, _enabled, _order)
    {
        //#region public vars
        this.callback = _callback;
        this.enabled = _enabled !== undefined ? _enabled : true;
        this.obj = _obj;
        //#endregion

        //#region private vars
        this._added = false;
        this._order = _order !== undefined ? _order : 0;
        this._type = _type;
        //#endregion

        //#region public functions
        this.IsAdded = () => {return this._added;};
        this.GetOrder = () => {return this._order};
    }
    
    Add ()
    {
        if (!this._added)
        {
            let added = true;
            switch (this._type)
            {
                case UpdateType.PreUpdate:
                    UpdateManager.AddPreUpdate(this);
                    break;
                case UpdateType.Update:
                    UpdateManager.AddUpdate(this);
                    break;
                case UpdateType.InterUpdate:
                    UpdateManager.AddInterUpdate(this);
                    break;
                case UpdateType.LateUpdate:
                    UpdateManager.AddLateUpdate(this);
                    break;
                case UpdateType.PostUpdate:
                    UpdateManager.AddPostUpdate(this);
                    break;
                default:
                    print(`Warning : update wasn't added -> no valid type ! obj object is : ${this.obj.name}`);
                    added = false;
            }
            this._added = added;
        }
        else
        {
            print(`Warning : update wasn't added -> already added ! obj object is : ${this.obj.name}`);
        }
    }

    ChangeOrder (_order)
    {
        this._order = _order;

        if (this._added)
        {
            switch (this._type)
            {
                case UpdateType.PreUpdate:
                    UpdateManager.ReorderPreUpdates();
                    break;
                case UpdateType.Update:
                    UpdateManager.ReorderUpdates();
                    break;
                case UpdateType.InterUpdate:
                    UpdateManager.ReorderInterUpdates();
                    break;
                case UpdateType.LateUpdate:
                    UpdateManager.ReorderLateUpdates();
                    break;
                case UpdateType.PostUpdate:
                    UpdateManager.ReorderPostUpdates();
                    break;
                default:
            }
        }
    }

    ChangeType (_type)
    {
        if (this._added)
        {
            this.Remove();
            this._type = _type;
            this.Add();
        }
        else
        {
            this._type = _type;
        }
    }

    Remove ()
    {
        if (this._added)
        {
            switch (this._type)
            {
                case UpdateType.PreUpdate:
                    UpdateManager.RemovePreUpdate(this);
                    break;
                case UpdateType.Update:
                    UpdateManager.RemoveUpdate(this);
                    break;
                case UpdateType.InterUpdate:
                    UpdateManager.RemoveInterUpdate(this);
                    break;
                case UpdateType.LateUpdate:
                    UpdateManager.RemoveLateUpdate(this);
                    break;
                case UpdateType.PostUpdate:
                    UpdateManager.RemovePostUpdate(this);
                    break;
                default:
                    print(`Warning : update wasn't removed -> no valid type ! object is : ${this.obj.name}`);
            }
            this._added = false;
        }
        else
        {
            print(`Warning : update wasn't added -> not currently added ! object is : ${this.obj.name}`);
        }
    }
    //#endregion
}



class UpdateManagerClass
{
    constructor ()
    {
        //#region private vars
        const _this = this;

        this._preUpdates = [];
        this._updates = [];
        this._interUpdates = [];
        this._lateUpdates = [];
        this._postUpdates = []; 

        this._preUpdatesReorder = false;
        this._updatesReorder = false;
        this._interUpdatesReorder = false;
        this._lateUpdatesReorder = false;
        this._postUpdatesReorder = false;

        this._updateEvent = script.createEvent("UpdateEvent");
        this._lateUpdateEvent = script.createEvent("LateUpdateEvent");
        //#endregion

        //#region setup
        this._updateEvent.bind(_this._InternalUpdate.bind(this));
        this._lateUpdateEvent.bind(_this._InternalLateUpdate.bind(this));
        //#endregion
    }


    //#region public functions
    AddPreUpdate (_update)
    {
        this._InternalAddUpdate(this._preUpdates, _update);
    }

    AddUpdate (_update)
    {
        this._InternalAddUpdate(this._updates, _update);
    }

    AddInterUpdate (_update)
    {
        this._InternalAddUpdate(this._interUpdates, _update);
    }

    AddLateUpdate (_update)
    {
        this._InternalAddUpdate(this._lateUpdates, _update);
    }

    AddPostUpdate (_update)
    {
        this._InternalAddUpdate(this._postUpdates, _update);
    }


    RemovePreUpdate (_update)
    {
        this._InternalRemoveUpdate(this._preUpdates, _update);
    }

    RemoveUpdate (_update)
    {
        this._InternalRemoveUpdate(this._updates, _update);
    }

    RemoveInterUpdate (_update)
    {
        this._InternalRemoveUpdate(this._interUpdates, _update);
    }

    RemoveLateUpdate (_update)
    {
        this._InternalRemoveUpdate(this._lateUpdates, _update);
    }

    RemovePostUpdate (_update)
    {
        this._InternalRemoveUpdate(this._postUpdates, _update);
    }


    ReorderPreUpdates ()
    {
        this._preUpdatesReorder = true;
    }

    ReorderUpdates ()
    {
        this._updatesReorder = true;
    }

    ReorderInterUpdates ()
    {
        this._interUpdatesReorder = true;
    }

    ReorderLateUpdates ()
    {
        this._lateUpdatesReorder = true;
    }

    ReorderPostUpdates ()
    {
        this._postUpdatesReorder = true;
    }
    //#endregion


    //#region private functions
    static _SortUpdate (a, b)
    {
        return a.GetOrder() - b.GetOrder();
    }


    _InternalAddUpdate (_array, _update)
    {
        if (_array.length == 0)
        {
            _array.push(_update);
        }
        else
        {
            for (let i = _array.length - 1; i >= 0; i--)
            {
                if (_array[i] && _array[i].GetOrder() <= _update.GetOrder())
                {
                    _array.splice(i+1, 0, _update);
                    break;
                }
                else if (i == 0)
                {
                    _array.splice(i, 0, _update);
                }
            }
        }
    }


    _InternalRemoveUpdate (_array, _update)
    {
        if (_array.length == 0)
        {
            print("Warning : tried to remove an update but the array is empty !");
        }
        else
        {
            const i = _array.indexOf(_update);
            if (i >= 0)
            {
                _array[i] = null;
            }
            else
            {
                print("Warning : tried to remove an update but it is not in the array !");
            }
        }
    }


    _InternalUpdate ()
    {
        if (this._preUpdatesReorder)
        {
            this._preUpdates.sort(this._SortUpdate);
            this._preUpdatesReorder = false;
        }
        for (let i = 0; i < this._preUpdates.length; ++i)
        {
            const update = this._preUpdates[i];
            if (update && !isNull(update.obj))
            {
                if (update.enabled)
                {
                    update.callback();
                }
            }
            else
            {
                this._preUpdates.splice(i, 1);
                i--;
            }
        }

        if (this._updatesReorder)
        {
            this._updates.sort(this._SortUpdate);
            this._updatesReorder = false;
        }
        for (let i = 0; i < this._updates.length; ++i)
        {
            const update = this._updates[i];
            if (update && !isNull(update.obj))
            {
                if (update.enabled)
                {
                    update.callback();
                }
            }
            else
            {
                this._updates.splice(i, 1);
                i--;
            }
        }

        if (this._interUpdatesReorder)
        {
            this._interUpdates.sort(this._SortUpdate);
            this._interUpdatesReorder = false;
        }
        for (let i = 0; i < this._interUpdates.length; ++i)
        {
            const update = this._interUpdates[i];
            if (update && !isNull(update.obj))
            {
                if (update.enabled)
                {
                    update.callback();
                }
            }
            else
            {
                this._interUpdates.splice(i, 1);
                i--;
            }
        }
    }


    _InternalLateUpdate ()
    {
        if (this._lateUpdatesReorder)
        {
            this._lateUpdates.sort(this._SortUpdate);
            this._lateUpdatesReorder = false;
        }
        for (let i = 0; i < this._lateUpdates.length; ++i)
        {
            const update = this._lateUpdates[i];
            if (update && !isNull(update.obj))
            {
                if (update.enabled)
                {
                    update.callback();
                }
            }
            else
            {
                this._lateUpdates.splice(i, 1);
                i--;
            }
        }

        if (this._postUpdatesReorder)
        {
            this._postUpdates.sort(this._SortUpdate);
            this._postUpdatesReorder = false;
        }
        for (let i = 0; i < this._postUpdates.length; ++i)
        {
            const update = this._postUpdates[i];
            if (update && !isNull(update.obj))
            {
                if (update.enabled)
                {
                    update.callback();
                }
            }
            else
            {
                this._postUpdates.splice(i, 1);
                i--;
            }
        }
    }
    //#endregion
}


const UpdateManager = new UpdateManagerClass();