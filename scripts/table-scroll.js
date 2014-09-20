(function ($) {

    var CSS_UP = 'scrollUpImg';
    var CSS_UP_PRESSED = 'scrollUpImgPressed';
    var CSS_UP_DIS = 'scrollUpImgDis';
    var CSS_DOWN = 'scrollDownImg';
    var CSS_DOWN_PRESSED = 'scrollDownImgPressed';
    var CSS_DOWN_DIS = 'scrollDownImgDis';
    var CSS_SCROLL_BG = 'scrollBgElement';
    var CSS_MOVABLE_TOP = 'movableTop';
    var CSS_MOVABLE_TOP_HOVER = 'movableTopHover';
    var CSS_MOVABLE_TOP_PRESSED = 'movableTopPressed';
    var CSS_MOVABLE_BOTTOM = 'movableBottom';
    var CSS_MOVABLE_BOTTOM_HOVER = 'movableBottomHover';
    var CSS_MOVABLE_BOTTOM_PRESSED = 'movableBottomPressed';
    var CSS_MOVABLE_GRIP = 'movableGrip';
    var CSS_MOVABLE_GRIP_HOVER = 'movableGripHover';
    var CSS_MOVABLE_GRIP_PRESSED = 'movableGripPressed';
    var CSS_MOVABLE = 'movable';
    var CSS_MOVABLE_HOVER = 'movableHover';
    var CSS_MOVABLE_PRESSED = 'movablePressed';

    var DEF_SCROL_TIME_INTERVAL = 600;
    var DEF_SCROL_TIME_INTERVAL_DECREMENT = 300;
    var DEF_SCROL_TIME_MIN_INTERVAL = 100;

    var BUTTON_TYPE_UP = 'UP';
    var BUTTON_TYPE_DOWN = 'DOWN';
    var BUTTON_TYPE_MOVABLE = 'MOVABLE';

    var BUTTON_STATE_NORMAL = 'NORMAL';
    var BUTTON_STATE_PRESSED = 'PRESSED';
    var BUTTON_STATE_HOVER = 'HOVER';

    $.widget("jsg.table_scroll", {
        version: "1.0.0",
        options: { rowScrollableAreaStartsFrom: 1, bufferEvents: false, bufferEventsDelay: 200 },

        _create: function () {

            this.firstElementIndex = 0;
            this.populatedFirstElementIndex = null;
            this.parentControl = this.options.scrollContainer;

            // scroll parts
            this.tableElement = this.widget().get(0);
            this.mainDiv = null;
            this.movableDiv = null;
            this.upImage = null;
            this.downImage = null;
            this.movableDivTopImg = null;
            this.movableDivCenterImg = null;
            this.movableDivBottomImg = null;

            this.isDownButtonPress = false; //indicate if down button of scroll is pressed
            this.isUpButtonPress = false; //indicate if up button of scroll is pressed
            this.currentTimerId = null; //current timer id for up or down buttons
            this.mouseStartYPosition = -1; //indicate y position in scroll at mouse down. For move movable scroll part
            this.isInMotion = false; // indicate if movable puart of scroll is currently in motion
            this.comulativeScrollShift = 0; // comulative shift of movable part
            this.currentScrolableTimeInterval = DEF_SCROL_TIME_INTERVAL;

            this.widget().on("mousewheel", $.proxy(this._tableMouseWheel, this));
            this.widget().on("DOMMouseScroll", $.proxy(this._tableMouseWheel, this)); // Firefox

            this.widget().event_buffer({
                delay: this.options.bufferEventsDelay,
                changed: $.proxy(this._triggerScrollEvent, this)
            });

            this._buildScrollElements();
            this._addTouchSupport();
            this._onTableScroll();
        },

        getFirstElementIndex: function () {
            return this.firstElementIndex;
        },

        _setOption: function (name, value) {

            $.Widget.prototype._setOption.apply(this, arguments);

            if (name === 'numberOfElementsInDataSource') {
                this._ensureFirstElementIndex();
                this.update();
            }
        },

        _onTableScroll: function () {
            if (this.populatedFirstElementIndex != this.firstElementIndex) {

                if (this.options.bufferEvents)
                    this.widget().data("jsg-event_buffer").updateValue(this.firstElementIndex);
                else
                    this._triggerScrollEvent();

                this.populatedFirstElementIndex = this.firstElementIndex;
            }
        },

        _triggerScrollEvent: function () {
            this._trigger("scroll", null, {
                firstElementIndex: this.firstElementIndex,
                numberOfRowsInScrollableArea: this.options.numberOfRowsInScrollableArea,
                rowScrollableAreaStartsFrom: this.options.rowScrollableAreaStartsFrom
            });
        },

        _buildScrollElements: function () {
            //Main DIV

            this.mainDiv = $('<div class="' + CSS_SCROLL_BG + '" style="height: ' + this.parentControl.height() + 'px;">'
                                + '<div style="top: 0px; position: relative"></div>'
                                + '<div style="position: relative; bottom: 0px"></div>'
                                + '<div style="position: relative;">'
                                    + '<div style="position: relative; top: 0;"></div>'
                                    + '<div style="position: relative;"></div>'
                                    + '<div style="position: relative;"></div>'
                                + '</div>'
                            + '</div>');

            this.upImage = $(this.mainDiv.children()[0]);
            this.downImage = $(this.mainDiv.children()[1]);
            this.movableDiv = $(this.mainDiv.children()[2]);
            this.movableDivTopImg = $(this.movableDiv.children()[0]);
            this.movableDivCenterImg = $(this.movableDiv.children()[1]);
            this.movableDivBottomImg = $(this.movableDiv.children()[2]);

            var scrollMouseDown = $.proxy(this._scrollMouseDown, this);
            var scrollMouseUp = $.proxy(this._scrollMouseUp, this);
            var scrollMouseOut = $.proxy(this._scrollMouseOut, this);
            var mainDivMouseMove = $.proxy(this._mainDivMouseMove, this);
            var selectstart = $.proxy(this._selectstart, this);
            var imageMousOut = $.proxy(this._imageMousOut, this);
            var imageMousDown = $.proxy(this._imageMousDown, this);
            var imageMousUp = $.proxy(this._imageMousUp, this);
            var movableDivMouseOut = $.proxy(this._movableDivMouseOut, this);
            var movableDivMouseDown = $.proxy(this._movableDivMouseDown, this);
            var movableDivMouseUp = $.proxy(this._movableDivMouseUp, this);
            var movableDivMouseMove = $.proxy(this._movableDivMouseMove, this);

            this.mainDiv.on("mousedown", scrollMouseDown);
            this.mainDiv.on("mouseup", scrollMouseUp);
            this.mainDiv.on("mouseout", scrollMouseOut);
            this.mainDiv.on("mousemove", mainDivMouseMove);
            this.mainDiv.on("selectstart", selectstart);

            this.upImage.on("mouseout", imageMousOut);
            this.upImage.on("mousedown", imageMousDown);
            this.upImage.on("mouseup", imageMousUp);
            this.upImage.on("selectstart", selectstart);

            this.downImage.on("mouseout", imageMousOut);
            this.downImage.on("mousedown", imageMousDown);
            this.downImage.on("mouseup", imageMousUp);
            this.downImage.on("selectstart", selectstart);

            this.movableDiv.on("mouseout", movableDivMouseOut);
            this.movableDiv.on("mousedown", movableDivMouseDown);
            this.movableDiv.on("mouseup", movableDivMouseUp);
            this.movableDiv.on("mousemove", movableDivMouseMove);
            this.movableDiv.on("selectstart", selectstart);

            this._setButtonState(BUTTON_TYPE_UP, BUTTON_STATE_NORMAL);
            this._setButtonState(BUTTON_TYPE_DOWN, BUTTON_STATE_NORMAL);
            this._setButtonState(BUTTON_TYPE_MOVABLE, BUTTON_STATE_NORMAL);

            if (this.parentControl != null)
                this.mainDiv.appendTo(this.parentControl);

            this.update();
        },

        update: function () {

            this.mainDiv.hide();
            this.mainDiv.height(this.parentControl.height());
            this.mainDiv.show();

            if (this.parentControl.height() < (this.upImage.height() + this.downImage.height())) {
                this.downImage.hide();
                this.upImage.hide();
                this.movableDiv.hide();
                return;
            }
            else {
                this.downImage.show();
                this.upImage.show();
                this.movableDiv.show();
            }

            if (this._max() == 0) {
                this.movableDiv.hide();
            }
            else {
                this.movableDiv.show();

                // calculations
                var upDownHeight = this.upImage.height() + this.downImage.height();
                var numberOfScrollablElements = this.options.numberOfElementsInDataSource -
                    this.options.numberOfRowsInScrollableArea;

                var calculatedMovablePartHeight =
                    (this.options.numberOfRowsInScrollableArea / this.options.numberOfElementsInDataSource)
                        * (this.mainDiv.height() - upDownHeight);

                var scrollPartsHeight = this.movableDivTopImg.height() + this.movableDivCenterImg.height() + this.movableDivBottomImg.height();

                var minPossibleMovablePartHeight = scrollPartsHeight;
                var movablePartHeight = minPossibleMovablePartHeight > calculatedMovablePartHeight ? minPossibleMovablePartHeight : calculatedMovablePartHeight;
                var scrollAmplitude = this.mainDiv.height() - upDownHeight - movablePartHeight;
                var pixelsPerRow = scrollAmplitude / numberOfScrollablElements;
                var movablePartPadding = this.firstElementIndex * pixelsPerRow;

                // applying calculated values to scrollable parts
                this.movableDiv.css({ top: (movablePartPadding - this.upImage.height()) + 'px', height: movablePartHeight + 'px' });

                this.movableDivBottomImg.css({ top: ((movablePartHeight - scrollPartsHeight)) + 'px' });
                this.movableDivCenterImg.css({ top: (movablePartHeight / 2 - this.movableDivTopImg.height() - this.movableDivCenterImg.height() / 2) + 'px' });
            }

            this.downImage.css({ top: this.mainDiv.height() - 2 * this.downImage.height() });
        },

        scrollTo: function (rowIndex, raiseUpdate) {
            this.firstElementIndex = rowIndex;
            var res = this._ensureFirstElementIndex();
            this.update();
            if (raiseUpdate) {
                this._onTableScroll();
            }
            return res;
        },

        _max: function () {
            return this.options.numberOfElementsInDataSource > this.options.numberOfRowsInScrollableArea ?
                 this.options.numberOfElementsInDataSource - this.options.numberOfRowsInScrollableArea : 0;
        },

        _ensureFirstElementIndex: function () {
            if (this.firstElementIndex < 0) {
                this.firstElementIndex = 0;
                return false;
            }
            if (this.firstElementIndex > this._max()) {
                this.firstElementIndex = this._max();
                return false;
            }
            return true;
        },

        _tableMouseWheel: function (event) {

            if (this._max() == 0)
                return;

            var up = false;
            var down = false;
            var original = event.originalEvent;
            if (original.wheelDelta) {
                if (original.wheelDelta >= 120) {
                    up = true;
                }
                else {
                    if (original.wheelDelta <= -120) {
                        down = true;
                    }
                }
            }

            if (original.detail) {
                if (original.detail == -3)
                    up = true;
                else
                    if (original.detail == 3)
                        down = true;
            }

            var scrollSuccess = true;
            if (up)
                scrollSuccess = this.scrollTo(this.firstElementIndex - 1, true);
            if (down)
                scrollSuccess = this.scrollTo(this.firstElementIndex + 1, true);

            if (scrollSuccess) // scroll was not in terminal position
                event.preventDefault(); // prevent window scrolling
        },

        _movableDivMouseOut: function (event) {
            if (this._max() == 0)
                return;

            this._setButtonState(BUTTON_TYPE_MOVABLE, BUTTON_STATE_NORMAL);

            var element = event.toElement || event.currentTarget;

            if (element == this.mainDiv.get(0) && this.isInMotion == 1) {
                return;
            }
            if (element == this.movableDiv.get(0) ||
                element == this.movableDivTopImg.get(0) ||
                element == this.movableDivCenterImg.get(0) ||
                element == this.movableDivBottomImg.get(0)) {
                return;
            }
            if (this.isInMotion) {
                this._onTableScroll();
                this.isInMotion = false;
            }

        },

        _movableDivMouseDown: function (event) {
            if (this._max() == 0)
                return;
            this.isInMotion = true;
            this.mouseStartYPosition = event.clientY;
            event.stopImmediatePropagation();
            this._setButtonState(BUTTON_TYPE_MOVABLE, BUTTON_STATE_PRESSED);
        },

        _movableDivMouseUp: function (event) {
            if (this._max() == 0)
                return;
            this.isInMotion = false;
            this._onTableScroll(true);
            event.stopImmediatePropagation();
            this._setButtonState(BUTTON_TYPE_MOVABLE, BUTTON_STATE_HOVER);
        },

        _movableDivMouseMove: function (event) {
            if (this._max() == 0)
                return;

            if (this.isInMotion) {
                var dif = event.clientY - this.mouseStartYPosition;

                var delta = (dif * this.options.numberOfElementsInDataSource / (this.mainDiv.height() - (this.upImage.height() + this.downImage.height())));
                var intdelta = parseInt(delta);
                this.comulativeScrollShift += delta - intdelta;

                if (this.comulativeScrollShift > 1) {
                    this.comulativeScrollShift -= 1;
                    intdelta += 1;
                }
                if (this.comulativeScrollShift < -1) {
                    this.comulativeScrollShift += 1;
                    intdelta -= 1;
                }

                this.scrollTo(this.firstElementIndex + intdelta, false);
                this.mouseStartYPosition = event.clientY;
                this._setButtonState(BUTTON_TYPE_MOVABLE, BUTTON_STATE_PRESSED);
            }
            else {
                this._setButtonState(BUTTON_TYPE_MOVABLE, BUTTON_STATE_HOVER);
            }
            event.stopImmediatePropagation();
        },

        _mainDivMouseMove: function (event) {
            if (this._max() == 0)
                return;

            if (this.isInMotion)
                this._movableDivMouseMove(event);
        },

        _scrollMouseDown: function (event) {
            if (event.currentTarget != this.mainDiv.get(0))
                return;

            var yOffset = event.clientY + $(window).scrollTop() - this.mainDiv.offset().top;
            var upDownHeight = this.upImage.height() + this.downImage.height();

            var x = (yOffset - this.upImage.height()) * this.options.numberOfElementsInDataSource / (this.mainDiv.height() - upDownHeight);
            x = parseInt(x);

            this.scrollTo(x, false);
        },

        _scrollMouseUp: function () {
            this.isInMotion = false;
            this._onTableScroll();
        },

        _scrollMouseOut: function (event) {
            var to = event.toElement || event.currentTarget;
            var from = event.fromElement || event.relatedTarget;

            if (
                to != this.mainDiv.get(0) &&
                to != this.movableDiv.get(0) &&
                to != this.movableDivTopImg.get(0) &&
                to != this.movableDivCenterImg.get(0) &&
                to != this.movableDivBottomImg.get(0) &&
                from != this.movableDiv.get(0) &&
                from != this.movableDivTopImg.get(0) &&
                from != this.movableDivCenterImg.get(0) &&
                from != this.movableDivBottomImg.get(0)) {
                this.isInMotion = false;
                this._onTableScroll();
            }
        },

        _imageMousOut: function (event) {
            if (this._max() == 0)
                return;
            this._stopTimer();
            event.stopImmediatePropagation();
        },

        _imageMousDown: function (event) {
            if (this._max() == 0)
                return;

            var el = event.target;
           
            if (el == this.upImage.get(0)) {
                if (!this.scrollTo(this.firstElementIndex - 1, false))
                    this._stopTimer();

                this.isUpButtonPress = true;
                if (this.currentTimerId)
                    clearTimeout(this.currentTimerId);

                this.currentTimerId = setTimeout($.proxy(this._scrolTimer, this, true), this.currentScrolableTimeInterval);

                this._setButtonState(BUTTON_TYPE_UP, BUTTON_STATE_PRESSED);
            }
            if (el == this.downImage.get(0)) {
                if (!this.scrollTo(this.firstElementIndex + 1, false))
                    this._stopTimer();

                this.isDownButtonPress = true;
                if (this.currentTimerId)
                    clearTimeout(this.currentTimerId);

                this.currentTimerId = setTimeout($.proxy(this._scrolTimer, this, false), this.currentScrolableTimeInterval);

                this._setButtonState(BUTTON_TYPE_DOWN, BUTTON_STATE_PRESSED);
            }
            event.stopImmediatePropagation();
        },

        _imageMousUp: function (event) {
            if (this._max() == 0)
                return;
            this._stopTimer();
            event.stopImmediatePropagation();
        },

        _scrolTimer: function (upDown) { //true - up false - down
            if ((this.isUpButtonPress && upDown) || (this.isDownButtonPress && !upDown)) {
                var res;
                if (upDown)
                    res = this.scrollTo(this.firstElementIndex - 1, false);
                else
                    res = this.scrollTo(this.firstElementIndex + 1, false);

                if (!res)
                    this._stopTimer();

                this.currentScrolableTimeInterval -= DEF_SCROL_TIME_INTERVAL_DECREMENT;
                if (this.currentScrolableTimeInterval < DEF_SCROL_TIME_MIN_INTERVAL)
                    this.currentScrolableTimeInterval = DEF_SCROL_TIME_MIN_INTERVAL;

                if (this.currentTimerId)
                    clearTimeout(this.currentTimerId);
                this.currentTimerId = setTimeout($.proxy(this._scrolTimer, this, upDown), this.currentScrolableTimeInterval);
            }
        },

        _stopTimer: function () {
            this._onTableScroll();
            this.isUpButtonPress = false;
            this.isDownButtonPress = false;
            this._setButtonState(BUTTON_TYPE_UP, BUTTON_STATE_NORMAL);
            this._setButtonState(BUTTON_TYPE_DOWN, BUTTON_STATE_NORMAL);

            if (this.currentTimerId)
                clearTimeout(this.currentTimerId);
            this.currentScrolableTimeInterval = DEF_SCROL_TIME_INTERVAL;
        },

        _selectstart: function (event) {
            event.preventDefault();
            return false;
        },

        _setButtonState: function (type, state) {

            if (type == BUTTON_TYPE_UP) {
                this.upImage.removeClass(CSS_UP);
                this.upImage.removeClass(CSS_UP_DIS);
                this.upImage.removeClass(CSS_UP_PRESSED);

                if (state == BUTTON_STATE_NORMAL)
                    this.upImage.addClass(this._max() == 0 ? CSS_UP_DIS : CSS_UP);
                if (state == BUTTON_STATE_PRESSED)
                    this.upImage.addClass(this._max() == 0 ? CSS_UP_DIS : CSS_UP_PRESSED);
            }

            if (type == BUTTON_TYPE_DOWN) {
                this.downImage.removeClass(CSS_DOWN);
                this.downImage.removeClass(CSS_DOWN_DIS);
                this.downImage.removeClass(CSS_DOWN_PRESSED);

                if (state == BUTTON_STATE_NORMAL)
                    this.downImage.addClass(this._max() == 0 ? CSS_DOWN_DIS : CSS_DOWN);
                if (state == BUTTON_STATE_PRESSED)
                    this.downImage.addClass(this._max() == 0 ? CSS_DOWN_DIS : CSS_DOWN_PRESSED);
            }

            if (type == BUTTON_TYPE_MOVABLE) {

                if (this.movableDiv.data('styleState') == state)
                    return;

                this.movableDiv.data('styleState', state);

                this.movableDivTopImg.removeClass(CSS_MOVABLE_TOP);
                this.movableDivCenterImg.removeClass(CSS_MOVABLE_GRIP);
                this.movableDivBottomImg.removeClass(CSS_MOVABLE_BOTTOM);
                this.movableDivTopImg.removeClass(CSS_MOVABLE_TOP_HOVER);
                this.movableDivCenterImg.removeClass(CSS_MOVABLE_GRIP_HOVER);
                this.movableDivBottomImg.removeClass(CSS_MOVABLE_BOTTOM_HOVER);
                this.movableDivTopImg.removeClass(CSS_MOVABLE_TOP_PRESSED);
                this.movableDivCenterImg.removeClass(CSS_MOVABLE_GRIP_PRESSED);
                this.movableDivBottomImg.removeClass(CSS_MOVABLE_BOTTOM_PRESSED);
                this.movableDiv.removeClass(CSS_MOVABLE);
                this.movableDiv.removeClass(CSS_MOVABLE_HOVER);
                this.movableDiv.removeClass(CSS_MOVABLE_PRESSED);

                if (state == BUTTON_STATE_NORMAL) {
                    this.movableDivTopImg.addClass(CSS_MOVABLE_TOP);
                    this.movableDivCenterImg.addClass(CSS_MOVABLE_GRIP);
                    this.movableDivBottomImg.addClass(CSS_MOVABLE_BOTTOM);
                    this.movableDiv.addClass(CSS_MOVABLE);
                }

                if (state == BUTTON_STATE_HOVER) {
                    this.movableDivTopImg.addClass(CSS_MOVABLE_TOP_HOVER);
                    this.movableDivCenterImg.addClass(CSS_MOVABLE_GRIP_HOVER);
                    this.movableDivBottomImg.addClass(CSS_MOVABLE_BOTTOM_HOVER);
                    this.movableDiv.addClass(CSS_MOVABLE_HOVER);
                }

                if (state == BUTTON_STATE_PRESSED) {
                    this.movableDivTopImg.addClass(CSS_MOVABLE_TOP_PRESSED);
                    this.movableDivCenterImg.addClass(CSS_MOVABLE_GRIP_PRESSED);
                    this.movableDivBottomImg.addClass(CSS_MOVABLE_BOTTOM_PRESSED);
                    this.movableDiv.addClass(CSS_MOVABLE_PRESSED);
                }
            }
        },

        _addTouchSupport: function () {

            this.movableDiv.on('touchstart', $.proxy(this._touchStartScroll, this));
            this.movableDiv.on('touchmove', $.proxy(this._touchMoveScroll, this));
            this.movableDiv.on('touchend', $.proxy(this._touchEndScroll, this));

            this.upImage.on('touchstart', $.proxy(this._touchStartUpDown, this));
            this.upImage.on('touchend', $.proxy(this._touchEndUpDown, this));
            this.downImage.on('touchstart', $.proxy(this._touchStartUpDown, this));
            this.downImage.on('touchend', $.proxy(this._touchEndUpDown, this));

            this.widget().on('touchstart', $.proxy(this._touchStartTable, this));
            this.widget().on('touchmove', $.proxy(this._touchMoveTable, this));
            this.widget().on('touchend', $.proxy(this._touchEndTable, this));
        },

        _touchStartUpDown: function (event) {
            var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
            event.clientY = touch.pageY;
            this._imageMousDown(event);
            event.preventDefault();
            event.stopPropagation();
        },

        _touchEndUpDown: function (event) {
            this._imageMousUp(event);
            event.preventDefault();
            event.stopPropagation();
        },

        _touchStartScroll: function (event) {
            var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
            event.clientY = touch.pageY;
            this._movableDivMouseDown(event);
            event.preventDefault();
            event.stopPropagation();
        },

        _touchMoveScroll: function (event) {
            var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
            event.clientY = touch.pageY;
            this._movableDivMouseMove(event);
            event.preventDefault();
            event.stopPropagation();
        },

        _touchEndScroll: function (event) {
            this._movableDivMouseUp(event);
            event.preventDefault();
            event.stopPropagation();
        },

        _touchStartTable: function (event) {
            var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
            this._oldY = touch.pageY;
        },

        _touchMoveTable: function (event) {
            event.preventDefault();
            var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];

            var delta = (touch.pageY - this._oldY) / 30;
            if (delta < 0)
                delta = Math.floor(delta) + 1;
            else
                delta = Math.floor(delta);

            if (delta != 0 && !isNaN(delta) && delta != null) {
                if (delta > 0) {
                    this.scrollTo(this.firstElementIndex - 1, true);
                }
                else if (delta < 0) {
                    this.scrollTo(this.firstElementIndex + 1, true);
                }
                this._oldY = touch.pageY;
            }
        },

        _touchEndTable: function () {
            this._oldY = null;
        },

        _destroy: function () {
            this.widget().event_buffer("destroy");

            this.widget().off("mousewheel", this._tableMouseWheel);
            this.widget().off("DOMMouseScroll", this._tableMouseWheel); // Firefox
            this.widget().off('touchstart', this._touchStartTable);
            this.widget().off('touchend', this._touchEndTable);
            this.widget().off('touchmove', this._touchMoveTable);

            this.mainDiv.remove();
        }
    });

})(jQuery); 
