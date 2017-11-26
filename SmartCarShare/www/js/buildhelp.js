
/*
	
	JavaScript functions to construct structures that use Bootstrap classes
	It's kinda like a SmartCarShare-website Framework
	
	Created:     21/8/17
	Author:      Thomas Reichert
	Last edit:   21/8/17
	
*/

// Build and return the list of navigation links, using an array of label strings, and an array of href strings
function buildNavList(labels, refs) {
	
	// Create <ul> tag
	var list = $('<ul>', {class: 'nav navbar-nav ml-auto'});
	
	// Loop through list items and append to the thing
	var i, len = labels.length;
	var useClass, useHRef;
	for (i = 0; i < len; i++) {
		if (refs[i] === null) { useClass = 'nav-item carshare-item-fade'; useHRef = 'javascript:;'; }
        else { useClass = 'nav-item'; useHRef = refs[i] + "$('#navbarResponsive').collapse('toggle');"; }
		if (i === 0) list.append($('<li>', {class: useClass}).append($('<a>', {class: 'nav-link', href: useHRef, text: labels[i]}).append($('<span>', {class: 'sr-only', text: '(current)'}))));
		else list.append($('<li>', {class: useClass}).append($('<a>', {class: 'nav-link', href: useHRef, text: labels[i]})));
	}
	return list;
	
}

// Build and return the list of footer links, using an array of label strings, and an array of href strings
function buildFootNavs(labels, refs) {
	
	// Create <div> tags
	var con = $('<div>', {class: 'container carshare-footlinks'});
	var list = $('<ul>', {class: 'nav flex-column'});
	
	// Loop through list items and append to the thing
	var i, len = labels.length;
	for (i = 0; i < len; i++) {
		if (refs[i] === null) list.append($('<li>', {class: 'nav-item', text: labels[i]}));
		else list.append($('<li>', {class: 'nav-item'}).append($('<a>', {href: refs[i], text: labels[i]})));
	}
	
	con.append(list);
	return con;
	
}

// Build and return a content panel, using header string, array of content strings, and array of optional href strings
function buildListPanel(title, content, refs) {
	
	// Create <div> hierarchy
	var cont = $('<div>', {class: 'container'});
	var row = $('<div>', {class: 'row'});
	var col = $('<div>', {class: 'mt-5 col-md-8 col-md-offset-2'});
	var panel = $('<div>', {class: 'panel panel-default'});
	var head = $('<div>', {class: 'panel-heading carshare-subheader', text: title});
	var body = $('<div>', {class: 'panel-body'});
	var list = $('<ul>', {class: 'carshare-indent-list'});
	
	// Add list elements to <ul>
	var el;
	var i, len = content.length;
	for (i = 0; i < len; i++) {
		if (refs[i] === null) el = $('<li>', {text: content[i]});
        else el = $('<li>').append($('<button>', { type: 'button', class: 'carshare-btn', text: content[i], onClick: refs[i] }));
		list.append(el);
	}
	
	// Construct the hierarchy and return it
	cont.append(row.append(col.append(panel.append(head).append(body.append(list)))));
	return cont;
}

// Build and return a container with a heading, body text, and an image below the body text
function buildImagePanel(title, subtext, image) {

    // Create <div> hierarchy
    var cont = $('<div>', { class: 'container' });
    var row = $('<div>', { class: 'row' });
    var col = $('<div>', { class: 'mt-5 col-md-8 col-md-offset-2' });
    var panel = $('<div>', { class: 'panel panel-default' });
    var head = $('<div>', { class: 'panel-heading carshare-subheader', text: title });
    var body = $('<div>', { class: 'panel-body' });
    var list = $('<ul>', { class: 'carshare-indent-list' });

    // Add paragraph and image
    var noOfTexts = subtext.length;
    var textNo;
    for (textNo = 0; textNo < noOfTexts; textNo++)
        body.append($('<p>', { text: subtext[textNo] }));
    body.append($('<img>', { src: 'images/' + image, style: 'height: 10em; width: 100%' }));

    // Construct the hierarchy and return it
    cont.append(row.append(col.append(panel.append(head).append(body))));
    return cont;

}

// Build and return a record list panel. Accepts title string,
// array of table header strings (not including image or buttons), and an array of arrays of data.
// Where a column header is null, the data for a cell in that column is an array of 2 elements, with
// the text to be displayed on that button, and a link for when the button is clicked.
function buildRecordList(title, headers, data) {
	
	// Create <div> hierarchy
	var cont = $('<div>', {class: 'container'});
	var row = $('<div>', {class: 'row'});
	var col = $('<div>', {class: 'mt-5 col-md-8 col-md-offset-2'});
	var panel = $('<div>', {class: 'panel panel-default'});
	var head = $('<div>', {class: 'panel-heading carshare-subheader', text: title});
	var body = $('<div>', {class: 'panel-body'});
	var table = $('<table>', {style: 'padding: 0.5em', class: 'table table-responsive'});
	
	// Add header rows
	var i, len = headers.length;
	var tHead = $('<thead>');
	var tRow = $('<tr>');
	tRow.append($('<th>'));
	for (i = 0; i < len; i++) {
		if (headers[i] === null) tRow.append($('<th>'));
		else tRow.append($('<th>', {text: headers[i]}));
	}
	table.append(tHead.append(tRow));
	
	// Add data rows
	var j, recs = data[0].length;
	var cell;
	var tBody = $('<tbody>');
	for (j = 0; j < recs; j++) {
		tRow = $('<tr>');
		cell = $('<td>');
		cell.append($('<img>', {src: 'images/' + data[0][j], style: 'width: 3em; height: 3em;'}));
		tRow.append(cell);
		for (i = 0; i < len; i++) {
			if (headers[i] === null) tRow.append($('<td>').append($('<button>', {type: 'button', class: 'carshare-btn', text: data[i+1][j][0], onClick: data[i+1][j][1]})));
			else tRow.append($('<td>', {text: data[i+1][j]}));
		}
		tBody.append(tRow);
	}
	table.append(tBody);
	
	// Construct the hierarchy and return it
	cont.append(row.append(col.append(panel.append(head).append(body.append(table)))));
	return cont;
}

// Build and return a form
// Accepts header string, subtext string, array of labels, array of input types,
// array of IDs, submit button label, and submit link
function buildForm(header, subtext, labels, inputTypes, IDs, subLabel, ref) {
	
	// Create <div> hierarchy
	var cont = $('<div>', {class: 'container'});
	var row = $('<div>', {class: 'row'});
	var col = $('<div>', {class: 'mt-5 col-md-8 col-md-offset-2'});
	var panel = $('<div>', {class: 'panel panel-default'});
	var head = $('<div>', {class: 'panel-heading carshare-subheader', text: header});
	var body = $('<div>', {class: 'panel-body'});
	var frm = $('<form>');
	
	// Add form groups to the form
	var grp, div, sp;
	var i, len = labels.length;
	for (i = 0; i < len; i++) {
		grp = $('<fieldset>', {class: 'form-group'});
		grp.append($('<label>', {class: 'control-label col-md-4', for: IDs[i], text: labels[i]}));
		div = $('<div>', {class: 'col-md-6'});
		switch(inputTypes[i]) {
            case 'text':
                div.append($('<input>', { type: 'text', id: IDs[i], class: 'form-control' }));
                break;
            case 'textarea':
                div.append($('<textarea>', { rows: 3, id: IDs[i], class: 'form-control' }));
                break;
            case 'readonly':
                div.append($('<input>', { type: 'text', id: IDs[i], class: 'form-control', readonly: 'readonly' }));
                break;
            case 'readonlycombo':
                sp = $('<select>', { id: IDs[i], class: 'form-control', readonly: 'readonly' }).append($('<option>', { value: '-1', text: '(Loading...)' }));
                div.append(sp);
                break;
            case 'date':
                div.addClass('date');
                div.append($('<input>', { type: 'text', id: IDs[i], class: 'form-control' }));
                break;
            case 'combo':
                sp = $('<select>', { id: IDs[i], class: 'form-control' }).append($('<option>', { value: '-1', text: '(Loading...)' }));
                div.append(sp);
                break;
            case 'checkbox':
                div.append($('<input>', { type: 'checkbox', id: IDs[i], class: 'form-control' }));
                break;
		}
		grp.append(div);
		frm.append(grp);
	}
	// Note button type must be specified, and not as submit, to avoid Edge re-firing document ready
	frm.append($('<button>', {type: 'button', class: 'carshare-btn', text: subLabel, onClick: ref}));
	
	// Construct the hierarchy and return it
	body.append($('<p>', {text: subtext}));
	body.append(frm);
	panel.append(head).append(body);
	cont.append(row.append(col.append(panel)));
	return cont;
}

// Build and return a map panel
// Accepts a header string to show in the coloured band atop the whole container
function buildMapPanel(header, subheader) {

    // Create <div> hierarchy
    var cont = $('<div>', { class: 'container' });
    var row = $('<div>', { class: 'row' });
    var col = $('<div>', { class: 'mt-5 col-md-8 col-md-offset-2' });
    var panel = $('<div>', { class: 'panel panel-default' });
    var head = $('<div>', { class: 'panel-heading carshare-subheader', text: header });
    var body = $('<div>', { class: 'panel-body' });
    var mapDiv = $('<div>', { id: 'map', style: 'height: 20em; width: 100%' });

    // Construct the hierarchy and return it
    body.append($('<p>', {text: subheader}));
    body.append(mapDiv);
    panel.append(head).append(body);
    cont.append(row.append(col.append(panel)));
    return cont;

}

var map, marker, markers = [], locat, coder;
function initMapPanel(setLat, setLong) {
    locat = { lat: setLat, lng: setLong };
    map = new google.maps.Map(
        document.getElementById('map'),
        {
            zoom: 12,
            center: locat
        }
    );
    marker = new google.maps.Marker({
        position: locat,
        map: map,
        icon: {
            url: 'http://maps.google.com/mapfiles/kml/paddle/blu-blank.png',
            scaledSize: new google.maps.Size(20, 20)
        }
    });
}

// Build and return a content panel, using body text string, displaying error colours (intended to be shown temporarily)
function buildErrorPanel(bodyText, isHappy) {

    // Create <div> hierarchy
    var cont = $('<div>', { class: 'container', id: 'errPanel' });
    var row = $('<div>', { class: 'row' });
    var col = $('<div>', { class: 'mt-5 col-md-8 col-md-offset-2' });
    var panel = $('<div>', { class: 'panel panel-default' });
    var head, body;
    if (isHappy) {
        head = $('<div>', { class: 'panel-heading carshare-subheader-happy', text: 'Success' });
        body = $('<div>', { class: 'panel-body carshare-happy carshare-transition', text: bodyText });
    }
    else {
        head = $('<div>', { class: 'panel-heading carshare-subheader-bad', text: 'Error' });
        body = $('<div>', { class: 'panel-body carshare-bad carshare-transition', text: bodyText });
    }
    var msg = $('<p>', { class: 'carshare', id: 'errMsg' });
    
    // Construct the hierarchy and return it
    cont.append(row.append(col.append(panel.append(head).append(body.append(msg)))));
    return cont;
}
