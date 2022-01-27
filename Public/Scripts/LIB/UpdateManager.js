// Lib Lens Atomic : Update Manager Module
// Version : 1.0.0
// Dependencies : None
// Authors : Gautier Jacquet


global.Update = function (_callback, _enabled, _priority)
{
    var _this = this;

    this.callback = _callback;
    this.priority = _priority !== undefined ? _priority : 0;
    this.enabled = _enabled !== undefined ? _enabled : true;
}


function UpdateManagerClass ()
{
    var _this = this;

    this._preUpdates = [];
    this._updates = [];
    this._interUpdates = [];
    this._lateUpdates = [];
    this._postUpdates = []; 


    this._updateEvent = script.createEvent("UpdateEvent");
    this._lateUpdateEvent = script.createEvent("LateUpdateEvent");


    this.AddPreUpdate = function (_update)
    {
        this._InternalAddUpdate(_this._preUpdates, _update);
    }

    this.AddUpdate = function (_update)
    {
        this._InternalAddUpdate(_this._updates, _update);
    }

    this.AddInterUpdate = function (_update)
    {
        this._InternalAddUpdate(_this._interUpdates, _update);
    }

    this.AddLateUpdate = function (_update)
    {
        this._InternalAddUpdate(_this._lateUpdates, _update);
    }

    this.AddPostUpdate = function (_update)
    {
        this._InternalAddUpdate(_this._postUpdates, _update);
    }


    this.RemovePreUpdate = function (_update)
    {
        this._InternalRemoveUpdate(_this._preUpdates, _update);
    }

    this.RemoveUpdate = function (_update)
    {
        this._InternalRemoveUpdate(_this._updates, _update);
    }

    this.RemoveInterUpdate = function (_update)
    {
        this._InternalRemoveUpdate(_this._interUpdates, _update);
    }

    this.RemoveLateUpdate = function (_update)
    {
        this._InternalRemoveUpdate(_this._lateUpdates, _update);
    }

    this.RemovePostUpdate = function (_update)
    {
        this._InternalRemoveUpdate(_this._postUpdates, _update);
    }


    this.ReorderPreUpdates = function ()
    {
        this._preUpdates.sort(this._SortUpdate);
    }

    this.ReorderUpdates = function ()
    {
        this._updates.sort(this._SortUpdate);
    }

    this.ReorderInterUpdates = function ()
    {
        this._interUpdates.sort(this._SortUpdate);
    }

    this.ReorderLateUpdates = function ()
    {
        this._lateUpdates.sort(this._SortUpdate);
    }

    this.ReorderPostUpdates = function ()
    {
        this._postUpdates.sort(this._SortUpdate);
    }


    this._SortUpdate = function (a, b)
    {
        a.priority - b.priority;
    }


    this._InternalAddUpdate = function (_array, _update)
    {
        if (_array.length == 0)
        {
            _array.push(_update);
        }
        else
        {
            for (var i = _array.length - 1; i > 0; --i)
            {
                if (_array[i].priority <= _update.priority)
                {
                    _array.splice(i, 0, _update);
                }
            }
        }
    }


    this._InternalRemoveUpdate = function (_array, _update)
    {
        if (_array.length == 0)
        {
            print("Warning : tried to remove an update but the array is empty !");
        }
        else
        {
            var i = _array.indexOf(_update);
            if (i >= 0)
            {
                _array.splice(i, 1);
            }
            else
            {
                print("Warning : tried to remove an update but it is not in the array !");
            }
        }
    }


    this._InternalUpdate = function ()
    {
        for (var i = 0; i < _this._preUpdates.length; ++i)
        {
            var update = _this._preUpdates[i];
            if (update.enabled)
            {
                update.callback();
            }
        }

        for (var i = 0; i < _this._updates.length; ++i)
        {
            var update = _this._updates[i];
            if (update.enabled)
            {
                update.callback();
            }
        }

        for (var i = 0; i < _this._interUpdates.length; ++i)
        {
            var update = _this._interUpdates[i];
            if (update.enabled)
            {
                update.callback();
            }
        }
    }


    this._InternalLateUpdate = function ()
    {
        for (var i = 0; i < _this._lateUpdates.length; ++i)
        {
            var update = _this._lateUpdates[i];
            if (update.enabled)
            {
                update.callback();
            }
        }

        for (var i = 0; i < _this._postUpdates.length; ++i)
        {
            var update = _this._postUpdates[i];
            if (update.enabled)
            {
                update.callback();
            }
        }
    }


    this._updateEvent.bind(_this._InternalUpdate);
    this._lateUpdateEvent.bind(_this._InternalLateUpdate);
}


global.UpdateManager = new UpdateManagerClass();