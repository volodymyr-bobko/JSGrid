(function ($) {

    $.widget("jsg.event_buffer", {
        version: "1.0.0",
        options: { delay: 500 },

        _create: function () {
            this._value = null;
            this._isWaiting = false;
            this._timer = null;
        },

        updateValue: function(newValue) {
            if (this._value != newValue) {
                this._value = newValue;
                if (!this._isWaiting)
                    this.startWaiting();
            }
        },

        startWaiting: function () {
            this._isWaiting = true;
            var oldValue = this._value;
            var me = this;
            this._timer = window.setTimeout(function () {
                me._timer = null;
                if (oldValue == me._value) {
                    me._isWaiting = false;
                    me._trigger("changed", null, { value: me._value });                    
                }
                else {
                    me.startWaiting();
                }
            }, this.options.delay);
        },

        _destroy: function () {
            if(this._timer != null)
                clearTimeout(this._timer);
        }
    });

})(jQuery); 
