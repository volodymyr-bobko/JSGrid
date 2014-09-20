var grid_column = function (grid, meta) {

    $.extend(this.defaultMeta, meta);

    this.headerCell = null;
    this.caption = meta.caption;
    this.name = meta.name;
    this.grid = grid;
    this.field = meta.field;
    this.width = meta.width;
    this.sortDirection = null;
    this.subColumns = [];

    if (meta.subColumns != null) {
        for (var i = 0; i < meta.subColumns.length; i++) {
            this.subColumns.push(new grid_column(this.grid, meta.subColumns[i], grid));
        }
    }
};

grid_column.prototype = {
    defaultMeta: { width: '100px', subColumns: [] },

    leafColumnCount: function() {
        var count = 0;
        for (var i = 0; i < this.subColumns.length; i++)
            count += this.subColumns[i].leafColumnCount();
        if (count == 0)
            return 1;
        return count;
    },

    leafColumns: function() {
        var res = [];
        this.leafColumnsHelper(res);
        return res;
    },

    leafColumnsHelper: function(columns) {
        for (var i = 0; i < this.subColumns.length; i++) {
            this.subColumns[i].leafColumnsHelper(columns);
        }
        if (this.subColumns.length == 0)
            columns.push(this);
    },

    depth: function() {
        if (this.subColumns.length == 0)
            return 1;

        var maxDepth = 0;
        for (var i = 0; i < this.subColumns.length; i++) {
            if (maxDepth < this.subColumns[i].depth()) {
                maxDepth = this.subColumns[i].depth();
            }
        }
        return maxDepth + 1;
    },

    getColumnsForLevel: function(destinationLevel) {
        var columns = [];
        columns = this.getColumnsForLevelHelper(0, destinationLevel, columns);
        return columns;
    },

    getColumnsForLevelHelper: function(currentLevel, destinationLevel, columns) {
        if (currentLevel == destinationLevel)
            columns.push(this);
        else
            for (var i = 0; i < this.subColumns.length; i++) {
                columns = this.subColumns[i].getColumnsForLevelHelper(currentLevel + 1, destinationLevel, columns);
            }
        return columns;
    },

    processHeaderCel: function(cell) {
        this.headerCell = cell;
        cell.empty();
        cell.unbind();

        var cellTable = $('<table width="100%" style="border-collapse:collapse" cellpadding="0" cellspacing="0">'
            + '<tr>'
            + '<td style="width:100%;padding-left:5px">'
            + '<span class="' + gridConstants.CSS_HEADER_CELL_CAPTION + '">' + this.caption + "</span>"
            + '</td>'
            + '</tr>'
            + '</table>');

        cellTable.appendTo(cell);

        if (this.grid.orderByColumn == this) {
            var $row = $('tr', cellTable);
            var $imgCell = $($row.get(0).insertCell(1));

            var div = $('<div/>');
            div.removeClass();

            if (this.sortDirection == gridConstants.SORT_ORDER_ASCENDING) {
                div.addClass(gridConstants.CSS_SORT_DIRECTION_IMG_ASC);
            }

            if (this.sortDirection == gridConstants.SORT_ORDER_DESCENDING) {
                div.addClass(gridConstants.CSS_SORT_DIRECTION_IMG_DESC);
            }

            div.appendTo($imgCell);
        }

        if (!isNaN(parseInt(this.width))) {
            cell.css('width', this.width);
            cell.attr('width', this.width);
        }

        this.grid._trigger(gridConstants.EVENT_HEADER_CELL_CUSTOM_DRAW, null,
        { cell: cell, columnName: this.name, caption: this.caption, columnObj: this });

        var me = this;
        cell.bind('click', null, function(event) { me.orderByMe(); });
    },

    orderByMe: function() {
        if (this.grid.orderByColumn == this) {
            if (this.sortDirection == null || this.sortDirection == gridConstants.SORT_ORDER_DESCENDING) {
                this.sortDirection = gridConstants.SORT_ORDER_ASCENDING;
            } else {
                this.sortDirection = gridConstants.SORT_ORDER_DESCENDING;
            }
        } else {

            var oldSortBy = null;
            if (this.grid.orderByColumn != null)
                oldSortBy = this.grid.orderByColumn;

            this.grid.orderByColumn = this;
            this.sortDirection = gridConstants.SORT_ORDER_ASCENDING;

            if (oldSortBy != null)
                oldSortBy.processHeaderCel(oldSortBy.headerCell);
        }
        this.grid._raiseGetDataFrame();
        this.processHeaderCel(this.headerCell);
    },

    orderColumnsNames: function() {
        var arrRes = [];
        var columns = this.getColumnsForLevel(this.depth() - 1);

        for (var i = 0; i < columns.length; i++) {
            arrRes.push(columns[i].field);
        }
        return arrRes;
    }
};
