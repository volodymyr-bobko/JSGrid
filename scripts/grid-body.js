(function ($) {

    $.widget("jsg.grid_body", {
        version: "1.0.0",
        options: { numberOfRowsInBody: 10, alternatingRowEnabled: false },

        _create: function () {

            this.grid = this.options.grid;
            this.scrollContainer = null;
            this.bodyRows = [];

            this.buildBody();
        },

        buildBody: function () {

            var leafColumns = this.widget().data('jsg-grid_header').leafColumns();
            var rowsInBody = this.options.numberOfRowsInBody;

            var tableObject = this.widget().get(0);

            for (var rowNumber = 0; rowNumber < rowsInBody; rowNumber++) {
                //append new row;
                var newRow = tableObject.insertRow(tableObject.rows.length);

                for (var columnNumber = 0; columnNumber < leafColumns.length; columnNumber++) {
                    var $newCell = $(newRow.insertCell(newRow.cells.length));
                    $newCell.addClass(columnNumber != 0 ? gridConstants.CSS_BODY_CELL : gridConstants.CSS_BODY_CELL_LEFT);
                    $newCell.html("&nbsp;");

                    this.grid._trigger(gridConstants.EVENT_BODY_CELL_CUSTOM_DRAW, null, { cell: $newCell });
                }
                this.bodyRows.push($(newRow));
            }

            if (rowsInBody > 0) {
                // get first row and add scroll container
                var firstBodyRow = this.bodyRows[0].get(0);
                this.scrollContainer = $(firstBodyRow.insertCell(firstBodyRow.cells.length));
                this.scrollContainer.attr('rowspan', rowsInBody);
                this.scrollContainer.addClass(gridConstants.CSS_SCROLL_CONTAINER);
            }
        },

        update: function (dataFrame) {

            var leafColumns = this.widget().data('jsg-grid_header').leafColumns();

            for (var tableRowNumber = 0; tableRowNumber < this.bodyRows.length; tableRowNumber++) {

                var dataSourceIndex = tableRowNumber + this.widget().data('jsg-table_scroll').firstElementIndex;
                var isOdd = dataSourceIndex % 2 == 1;

                var dataRow = null;
                if (dataFrame.length >= tableRowNumber)
                    dataRow = dataFrame[tableRowNumber];

                var cellCount = leafColumns.length;

                for (var columnPosition = 0; columnPosition < cellCount; columnPosition++) {
                    var $currentCell = $(this.bodyRows[tableRowNumber].get(0).cells[columnPosition]);

                    var className = !isOdd && this.options.alternatingRowEnabled ?
                        columnPosition == 0 ? gridConstants.CSS_BODY_CELL_ALT_LEFT : gridConstants.CSS_BODY_CELL_ALT
                        : 
                        columnPosition == 0 ? gridConstants.CSS_BODY_CELL_LEFT : gridConstants.CSS_BODY_CELL;
                
                    $currentCell.removeClass(gridConstants.CSS_BODY_CELL);
                    $currentCell.removeClass(gridConstants.CSS_BODY_CELL_ALT);
                    $currentCell.removeClass(gridConstants.CSS_BODY_CELL_LEFT);
                    $currentCell.removeClass(gridConstants.CSS_BODY_CELL_ALT_LEFT);

                    $currentCell.addClass(className);
                
                    var column = leafColumns[columnPosition];

                    if (dataRow != null) {
                        $currentCell.html(dataRow[column.field]);
                    }
                    else {
                        $currentCell.empty();
                    }

                    this.grid._trigger(gridConstants.EVENT_BODY_CELL_CUSTOM_DRAW, null,
                    {
                        cell: $currentCell,
                        field: column.field,
                        value: dataRow == null ? null : dataRow[column.field],
                        dataRow: dataRow,
                        dataSourceIndex: dataSourceIndex,
                        isEmpty: dataRow == null
                    });
                }
            }
        },

        getScrollContainer: function () {
            return this.scrollContainer;
        }
    });

})(jQuery);
