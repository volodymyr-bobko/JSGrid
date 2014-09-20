(function ($) {

    $.widget("jsg.grid_header", {
        version: "1.0.0",
        options: { isVisible: true },

        _create: function () {
            this.grid = this.options.grid;
            this.headerRows = [];
            this.update();
        },

        clear: function () {
            $(this.headerRows).each(function (i, r) { r.remove(); });
            this.headerRows = [];
        },

        update: function () {
            this.clear();
            var depth = this.depth();

            var table = this.widget().get(0);

            for (var level = 0; level < depth; level++) {
                //append new row;
                var $headerLevelRow = $(table.insertRow(level));
                this.headerRows.push($headerLevelRow);
                var columnsAtLevel = this.getColumnsForLevel(level);
                for (var columnNumber = 0; columnNumber < columnsAtLevel.length; columnNumber++) {
                    //append new cell;
                    var $columnCell = $($headerLevelRow.get(0).insertCell($headerLevelRow.get(0).cells.length));

                    $columnCell.addClass(gridConstants.CSS_HEADER_CELL);
                    $columnCell.attr({
                        colSpan: columnsAtLevel[columnNumber].leafColumnCount(),
                        rowSpan: depth - columnsAtLevel[columnNumber].depth() + 1 - level
                    });

                    columnsAtLevel[columnNumber].processHeaderCel($columnCell);
                }

                $headerLevelRow.css('display', this.options.isVisible ? '' : 'none');
            }

            var scrollHeaderCell = $(table.rows[0].insertCell(table.rows[0].cells.length));
            scrollHeaderCell.attr('rowSpan', depth);
            scrollHeaderCell.html('&nbsp;');
            scrollHeaderCell.addClass(gridConstants.CSS_HEADER_CELL);
        },

        depth: function () {
            var maxDepth = 0;
            for (var i = 0; i < this.grid.columns.length; i++) {
                if (maxDepth < this.grid.columns[i].depth()) {
                    maxDepth = this.grid.columns[i].depth();
                }
            }
            return maxDepth;
        },

        leafColumnsCount: function () {
            var count = 0;
            for (var i = 0; i < this.grid.columns.length; i++) {
                count += this.grid.columns[i].leafColumnCount();
            }
            return count;
        },

        getColumnsForLevel: function (level) {
            var columns = [];
            for (var i = 0; i < this.grid.columns.length; i++) {
                columns = columns.concat(this.grid.columns[i].getColumnsForLevel(level));
            }
            return columns;
        },

        leafColumns: function () {
            var columns = [];
            for (var i = 0; i < this.grid.columns.length; i++) {
                columns = columns.concat(this.grid.columns[i].leafColumns());
            }
            return columns;
        }
    });

})(jQuery);
