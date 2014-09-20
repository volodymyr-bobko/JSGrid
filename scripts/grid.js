(function ($) {

    $.widget("jsg.grid", {
        version: "1.0.0",
        options: { columns: [], numberOfRowsInScrollableArea: 10, headerVisible: true, alternatingRowEnabled: false, pagerSettings: {} },

        _create: function () {

            this.columns = [];
            this.orderByColumn = null;

            this.table = $('<table></table>');
            this.table.addClass(gridConstants.CSS_MAIN_TABLE_STYLE);
            this.table.appendTo(this.widget());

            for (var i = 0; i < this.options.columns.length; i++) {
                this.columns.push(new grid_column(this, this.options.columns[i]));
            }

            this.table.grid_header({ grid: this });

            this.table.grid_pager($.extend({
                grid: this,
                numberOfElementsInDataSource: this.options.numberOfElementsInDataSource,
                pageChanged: $.proxy(function (event, data) {
                    this.table.table_scroll({ numberOfElementsInDataSource: this.table.data('jsg-grid_pager').getNumberOfElementsToScroll() });
                    this._raiseGetDataFrame();
                    this.table.data("jsg-table_scroll").scrollTo(0, false);
                }, this)
            }, this.options.pagerSettings));

            this.table.data('jsg-grid_pager').renderTopPager();

            this.table.grid_body({
                grid: this,
                numberOfRowsInBody: this.options.numberOfRowsInScrollableArea,
                alternatingRowEnabled: this.options.alternatingRowEnabled
            });

            this.table.data('jsg-grid_pager').renderBottomPager();

            this.table.table_scroll({
                bufferEvents: !this.table.data('jsg-grid_pager').isPagerVisible(),
                scrollContainer: this.table.data('jsg-grid_body').getScrollContainer(),
                numberOfRowsInScrollableArea: this.options.numberOfRowsInScrollableArea,
                numberOfElementsInDataSource: this.table.data('jsg-grid_pager').getNumberOfElementsToScroll(),
                rowScrollableAreaStartsFrom: this.table.data('jsg-grid_header').depth(),
                scroll: $.proxy(this._raiseGetDataFrame, this)
            });

            this._raiseGetDataFrame();
        },

        setDataFrame: function (dataFrame) {
            this.table.data('jsg-grid_body').update(dataFrame);
            this.table.data('jsg-table_scroll').update();
        },

        refreshData: function () {
            this._raiseGetDataFrame();
        },

        _setOption: function (name, value) {

            $.Widget.prototype._setOption.apply(this, arguments);

            if (name === 'numberOfElementsInDataSource') {
                this.table.grid_pager({ numberOfElementsInDataSource: this.options.numberOfElementsInDataSource });
                this.table.table_scroll({ numberOfElementsInDataSource: this.table.data('jsg-grid_pager').getNumberOfElementsToScroll() });
            }
        },

        _raiseGetDataFrame: function () {

            var scroll = this.table.data('jsg-table_scroll');
            var pager = this.table.data('jsg-grid_pager');

            this._trigger(gridConstants.EVENT_GET_DATA_FRAME, null, {
                orderByFields: this.orderByColumn == null ? [] : this.orderByColumn.orderColumnsNames(),
                direction: this.orderByColumn == null ? null : this.orderByColumn.sortDirection,
                startFromRecord: scroll.getFirstElementIndex() + pager.getFirstElementIndex(),
                numberOfRecordsToShow: this.options.numberOfRowsInScrollableArea
            });
        },

        _destroy: function () {
            this.table.remove();
        }
    });

})(jQuery);
