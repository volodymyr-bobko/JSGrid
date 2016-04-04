function SetStyleSheet(linkid, url, suffix) {
    
    if (document.createStyleSheet) {
        $('link')
            .filter(
                function (index, e) {
                    return $(e).attr('href').indexOf(suffix) != -1;
                })
            .remove(); // to workaround limitation of 31 stylesheet per document in IE
        document.createStyleSheet(url);
    }
    else {
        $('#' + linkid).attr('href', url);
    }
}

function ObjectTyString(obj) {
    var res = '{ '

    var props = []
    for (var propt in obj) {
        var val = obj[propt];
        props.push(propt + ':' + val);
    }
    res += props.join(", ");
    return res + " }";
}

function trimTo1000(str) {
    if (str.length > 1000)
        return str.substr(0, 1000);
    return str;
}