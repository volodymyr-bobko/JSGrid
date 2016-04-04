var filterInStock = 'All';

$(window).load(function () {
    $('body').disableSelection();

    $('#themeSelector')
        .change(applyTheme)
        .click(function (event) { this.focus(); event.stopPropagation(); });

    $("#accordion").accordion({ heightStyle: "content" });

    $("#clearLogButton")
            .button()
            .click(function (event) {
                $('#logTextarea').val('');
            });

    $("#pagerSettings").buttonset();
    $('#pagerSettings').change(applyOptions);
    applyTheme();
});

function applyOptions() {
    createGrid();
}

function createGrid() {

    filterInStock = 'All';
    if ($('#gridContainer').data('jsg-grid') != null) {
        $('#gridContainer').grid('destroy');
    }

    $('#gridContainer').grid({
        numberOfElementsInDataSource: data.length,
        alternatingRowEnabled: true,
        numberOfRowsInScrollableArea: 15,
        columns:
            [
                { caption: "Author", name: "Author", field: "", width: 200, subColumns:
                    [
                        { caption: "First Name", name: "FirstName", field: "FirstName", width: 100 },
                        { caption: "Last Name", name: "LastName", field: "SecondName", width: 100 }
                    ]
                },
                { caption: "Book", name: "Book", field: "Book", width: 750 },
                { caption: "Price", name: "Price", field: "Price", width: 80 },
                { caption: "In Stock", name: "InStock", field: "InStock", width: 80 }
            ],
        columnHeaderCustomDraw: ColumnHeaderCustomDraw,
        bodyCellCustomDraw: CellCustomDraw,
        getDataFrame: UpdateGridData,
        pagerSettings: { showPager: !$('#cbPagerNone').is(':checked'), pageSize: 25, position: $("input:radio[name ='pagingOptions']:checked").val() }
    });
}

function logEvent(event, data) {
    if ($('#' + event.type).get(0).checked == false)
        return;

    var description = event.type + '. Data : ' + ObjectTyString(data);
    $('#logTextarea').val(trimTo1000(description + '\n' + $('#logTextarea').val()))
}

function applyTheme() {
    SetStyleSheet('themeLink', 'styles/' + $('#themeSelector').val() + '/jquery-ui-1.9.2.css', 'jquery-ui-1.9.2.css');
    SetStyleSheet('gridStyle', 'styles/' + $('#themeSelector').val() + '/grid-style.css', 'grid-style.css');
    SetStyleSheet('scrollStyle', 'styles/' + $('#themeSelector').val() + '/scroll-style.css', 'scroll-style.css');
}

function UpdateGridData(event, eventData) {
    var res = [];

    var sortedArray = GetSortedData(eventData.orderByFields, eventData.direction);

    for (var i = eventData.startFromRecord; i < eventData.startFromRecord + eventData.numberOfRecordsToShow && i < sortedArray.length; i++) {
        res.push(sortedArray[i]);
    }

    $('#gridContainer').data('jsg-grid').setDataFrame(res);
}

function CompareRows(row1, row2, columns) {
    
    for (var i = 0; i < columns.length; i++) {
        var v1 = row1[columns[i]];
        var v2 = row2[columns[i]];

        if (v1 < v2)
            return true;
        if (v1 > v2)
            return false;
    }

    return false;
}

function GetSortedData(columnsToSortBy, direction) {

    var filteredArray = GetFilteredData();

    var res = new Array();
    if (columnsToSortBy.length == 0) {
        res = filteredArray;
    }
    else {
        var sortedArr = filteredArray;

        for (var i = 0; i < sortedArr.length; i++) {
            for (var j = 0; j < sortedArr.length - 1; j++) {
                if (!CompareRows(sortedArr[j], sortedArr[j + 1], columnsToSortBy)) {
                    var temp = sortedArr[j];
                    sortedArr[j] = sortedArr[j + 1];
                    sortedArr[j + 1] = temp;
                }
            }
        }

        for (var i = 0; i < sortedArr.length; i++) {
            res.push(sortedArr[i]);
        }
        
        if (direction == gridConstants.SORT_ORDER_DESCENDING) {
            res = res.reverse();    
        }
    }
    return res;
}

function GetFilteredData() {
    return $(data).filter(function (index, element) {
        if (filterInStock == 'All')
            return true;
        if (filterInStock == 'Yes')
            return element['InStock'];
        if (filterInStock == 'No')
            return !element['InStock'];
    });
}

function CellCustomDraw(event, data) {

    if (data.field == 'InStock' && !data.isEmpty) {
        var val = data.value;
        var span = $('<span></span>');
        span.html(val ? 'Yes' : 'No');
        data.cell.empty();
        span.appendTo(data.cell);
        data.cell.css('text-align', 'center');
        data.cell.css({ 'font-weight': 'bolder', 'color': val ? 'Green' : 'Red' });
    }

    if (data.field == 'Price' && !data.isEmpty) {
        var val = data.value;
        var cell = data.cell;
        cell.html('<table><tr><td>'
        + '$' + data.dataRow['OldPrice'] +
        '</td><td>'
        + '$' + data.dataRow['Price'] +
        '</td></tr></table>');

        var table = cell.children(0);

        var row = table.get(0).rows[0];
        row.cells[0].style.fontWeight = 'normal';
        row.cells[0].style.textAlign = 'center';
        row.cells[0].style.textDecoration = 'line-through';
        row.cells[1].style.color = 'Red';
        row.cells[1].style.textAlign = 'center';
    }
}

function ColumnHeaderCustomDraw(event, data) {
    if (data.columnName == 'InStock') {

        var captionCell = $('.' + gridConstants.CSS_HEADER_CELL_CAPTION, data.cell);

        captionCell.empty();

        var tableWithFilter = $(
        '<table>'
            + '<tr>'
                + '<td>'
                    + data.caption
                + '</td>'
            + '</tr>'
            + '<tr>'
                + '<td class="filter-container">'
                    +'<select class="in-stock-filter-selector">'
                        + '<option label="All" value="All">All</option>'
                        + '<option label="Yes" value="Yes">Yes</option>'
                        + '<option label="No" value="No">No</option>'
                    +'</select>'
                + '</td>'
            + '</tr>'
        + '</table>');

        tableWithFilter.appendTo(captionCell);
        var filterSelect = $('.in-stock-filter-selector', tableWithFilter);
        filterSelect.bind('click', function (event) { this.focus(); event.stopPropagation(); });
        filterSelect.val(filterInStock);
        filterSelect.change(UpdateInStockFilter);
    }
}

function UpdateInStockFilter(args) {
    filterInStock = this.value;
    
    $('#gridContainer').grid({ numberOfElementsInDataSource: GetFilteredData().length });
    $('#gridContainer').data('jsg-grid').refreshData();
}