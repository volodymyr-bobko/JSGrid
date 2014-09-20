(function ($) {

    $.widget("jsg.grid_pager", {
        version: "1.0.0",
        options: { showPager: true, pageSize: 15, currentPageIndex: 0, position: gridConstants.PAGER_POSITION_BOTTOM },

        _create: function () {
            this.grid = this.options.grid;
        },

        renderTopPager: function () {
            if (this.options.showPager && this.isTopPagerVisible()) {
                this.topPagerContainer = this.appendPagerToTable();
            }
        },

        renderBottomPager: function () {
            if (this.options.showPager && this.isBottomPagerVisible()) {
                this.bottomPagerContainer = this.appendPagerToTable();
            }
        },

        appendPagerToTable: function () {
            var table = this.widget().get(0);
            var header = this.widget().data('jsg-grid_header');

            var $topPagerRow = $(table.insertRow(table.rows.length));
            var $container = $($topPagerRow.get(0).insertCell(0));
            $container.attr('colspan', header.leafColumnsCount() + 1); // number of columns on lowest level + one column for scroll
            $container.addClass(gridConstants.CSS_PAGER_CONTAINER);
            this._updatePagerContainer($container);
            return $container;
        },

        getPageShortcuts: function () {

            var pageNumbers = [0, 1];

            if (this.getCurrentPageIndex() <= 4) {
                pageNumbers = pageNumbers.concat([2, 3, 4, 5, 6]);
            }
            else if (this.getCurrentPageIndex() < this.getPagesCount() - 4) {
                pageNumbers = pageNumbers.concat([this.getCurrentPageIndex() - 2, this.getCurrentPageIndex() - 1, this.getCurrentPageIndex(), this.getCurrentPageIndex() + 1, this.getCurrentPageIndex() + 2]);
            }
            else {
                for (var number = 7; number >= 0; number--)
                    pageNumbers.push(this.getPagesCount() - number);
            }

            pageNumbers.push(this.getPagesCount() - 1, this.getPagesCount() - 2);

            pageNumbers = $.grep(pageNumbers, $.proxy(function (el, index) {
                return index == $.inArray(el, pageNumbers) && el >= 0 && el < this.getPagesCount();
            }, this));
            pageNumbers.sort(function (a, b) { return a - b; });

            var shortcuts = [];
            for (var pageNumberIndex = 0; pageNumberIndex < pageNumbers.length; pageNumberIndex++) {
                shortcuts.push(pageNumbers[pageNumberIndex]);
                if (pageNumberIndex != pageNumbers.length - 1 && pageNumbers[pageNumberIndex] + 1 != pageNumbers[pageNumberIndex + 1]) {
                    shortcuts.push(null);
                }
            }

            return shortcuts;
        },

        getCurrentPageIndex: function () {
            return this.options.currentPageIndex;
        },

        getPagesCount: function () {
            return Math.max(1,
                    Math.ceil(
                        this.options.numberOfElementsInDataSource / this.options.pageSize));
        },

        getNumberOfElementsToScroll: function () {
            if (this.options.showPager == true) {
                if (this.options.currentPageIndex == this.getPagesCount() - 1) {
                    return this.options.numberOfElementsInDataSource % this.options.pageSize;
                }
                else {
                    return this.options.pageSize;
                }
            }
            else {
                return this.options.numberOfElementsInDataSource;
            }
        },

        getFirstElementIndex: function () {
            return this.options.currentPageIndex * this.options.pageSize;
        },

        isTopPagerVisible: function () {
            return this.options.position == gridConstants.PAGER_POSITION_TOP_AND_BOTTOM || this.options.position == gridConstants.PAGER_POSITION_TOP;
        },

        isBottomPagerVisible: function () {
            return this.options.position == gridConstants.PAGER_POSITION_TOP_AND_BOTTOM || this.options.position == gridConstants.PAGER_POSITION_BOTTOM;
        },

        isPagerVisible: function () {
            return this.isTopPagerVisible() || this.isBottomPagerVisible();
        },

        goToPge: function (index) {
            this.options.currentPageIndex = index;
            if (this.topPagerContainer)
                this._updatePagerContainer(this.topPagerContainer);
            if (this.bottomPagerContainer)
                this._updatePagerContainer(this.bottomPagerContainer);

            this._trigger("pageChanged", null, {
                firstElementIndex: this.getFirstElementIndex(),
                pageSize: this.options.pageSize
            });
        },

        nextPage: function () {
            this.goToPge(this.getCurrentPageIndex() + 1);
        },

        prevPage: function () {
            this.goToPge(this.getCurrentPageIndex() - 1);
        },

        _setOption: function (name, value) {

            $.Widget.prototype._setOption.apply(this, arguments);

            if (name === 'numberOfElementsInDataSource') {
                this.goToPge(0);
            }
            if (name === 'currentPageIndex') {
                this.goToPge(this.options.currentPageIndex);
            }
        },

        _updatePagerContainer: function (container) {
            container.empty();

            var $table = $('<table></table>');
            $table.appendTo(container);

            var row = $table.get(0).insertRow(0);

            // render prev page button
            var $prevPageButtonCell = $(row.insertCell(row.cells.length));
            var $prevPageButton = $('<div></div>');
            $prevPageButton.appendTo($prevPageButtonCell);
            var prevEnabled = this.getCurrentPageIndex() > 0;
            $prevPageButton.addClass(prevEnabled ? gridConstants.CSS_PREV_PAGE_BUTTON : gridConstants.CSS_PREV_PAGE_BUTTON_DISABLED);
            if (prevEnabled)
                $prevPageButton.click($.proxy(this.prevPage, this));

            // render shortcuts
            var shortcuts = this.getPageShortcuts();
            for (var i = 0; i < shortcuts.length; i++) {

                var $shortcut = $(row.insertCell(row.cells.length));

                if (shortcuts[i] != null) {
                    var isCurrentPage = shortcuts[i] == this.getCurrentPageIndex();
                    $shortcut.addClass(isCurrentPage ? gridConstants.CSS_PAGE_INDEX_CURRENT : gridConstants.CSS_PAGE_INDEX);
                    $shortcut.text(shortcuts[i] + 1);
                    $shortcut.data('page', shortcuts[i]);
                    if (!isCurrentPage)
                        $shortcut.click($.proxy(this.goToPge, this, shortcuts[i]));
                }
                else {
                    $shortcut.addClass(gridConstants.CSS_PAGE_INDEXES_DELIMETER);
                    $shortcut.html('&hellip;');
                }
            }

            // render next button
            var $nextPageButtonCell = $(row.insertCell(row.cells.length));
            var $nextPageButton = $('<div></div>');
            $nextPageButton.appendTo($nextPageButtonCell);
            var nextEnabled = this.getCurrentPageIndex() < this.getPagesCount() - 1;
            $nextPageButton.addClass(nextEnabled ? gridConstants.CSS_NEXT_PAGE_BUTTON : gridConstants.CSS_NEXT_PAGE_BUTTON_DISABLED);
            if (nextEnabled)
                $nextPageButton.click($.proxy(this.nextPage, this));
        }
    });

})(jQuery);
