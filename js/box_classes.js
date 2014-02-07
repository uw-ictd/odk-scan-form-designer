/*	Represents a generic box field.
	json_init: JSON 	// initialization values that come from a JSON file
	update_init: JSON 	// initialization values that come from updating the field
*/
function Box(json_init, update_init) {
	this.$box = $('<div/>');	
	this.$box.data("obj", this);
	this.$box.css('position', 'absolute');
	
	if(json_init) {
		this.$box.css({width: json_init.box_width, 
					height: json_init.box_height,
					left: json_init.left,
					top: json_init.top});
		this.border_width = json_init.border_width;
	} else {	
		if (update_init) {
			this.$box.css({top: update_init.top, left: update_init.left, 
							width: update_init.box_width, height: update_init.box_height});
		} else {
			// NOTE: initial width and height are aligned
			// to the grid size
			this.$box.css({top: 0, left: 0, 
						width: GRID_X * 10, height: GRID_Y * 10});
		}
		this.border_width = $("#border_width").val();
		this.$box.css({borderWidth: this.border_width});
	}
	this.type = "box"; 
	this.name = "none";	
}

/*	Adds event handlers (on click, on double click, on resize)
	to this box.
	$box: jQuery div representing the box
*/
Box.prototype.addEventHandlers = function($box) {
	var border_width = this.border_width;
	$box.on('resizestop', (function(event, ui) {
		var curr_size = ui.size;
		var nearest_width = Math.ceil(curr_size.width / GRID_X) * GRID_X;
		var nearest_height = Math.ceil(curr_size.height / GRID_Y) * GRID_Y;
		ui.element.width(nearest_width - 2 * border_width);
		ui.element.height(nearest_height - 2 * border_width);	
	}));
	
	// box is removed when double-clicked
	$box.dblclick( function() { this.remove() });
	
	// highlight only this box when clicked
	$box.click(function() {
		$(".selected_field").removeClass("selected_field");	
		$(this).addClass("selected_field");
	});
}

//	Creates a generic box and adds it to the Scan document.
Box.prototype.constructBox = function() {
	this.$box.addClass('field').addClass('box');								
	this.$box.draggable({containment: 'parent', grid: [GRID_X, GRID_Y]});
	this.$box.resizable({handles: 'all', 
						containment: 'parent', 
						grid: [GRID_X, GRID_Y],
						minWidth: GRID_X * 1,
						minHeight: GRID_Y * 1});																								
	this.$box.css({'border-width': this.border_width + 'px'});	
	this.addEventHandlers(this.$box);
	
	$(".selected_field").removeClass("selected_field");
	this.$box.addClass("selected_field");
	$("#scan_doc").append(this.$box);
};

/*	Returns JSON containing DOM properties
	of this box, formatted for exporting 
	the document.
*/
Box.prototype.getFieldJSON = function() {
	var f_info = {};
	f_info.type = this.type;
	f_info.name = this.name;
	f_info.segments = [];

	var seg = {};
	seg.segment_x = this.$box.position().left;
	seg.segment_y = this.$box.position().top;
	seg.segment_width = this.$box.outerWidth();
	seg.segment_height = this.$box.outerHeight();
	
	f_info.segments.push(seg);
	return f_info;
};

/*	Returns JSON containing DOM properties
	of this generic box, formatted for saving 
	the document.
*/
Box.prototype.getProperties = function() {
	var fieldJSON = {};
	fieldJSON.left = this.$box.css('left');
	fieldJSON.top = this.$box.css('top');
	fieldJSON.box_width = this.$box.css('width');
	fieldJSON.box_height = this.$box.css('height');
	fieldJSON.border_width = this.border_width;	
	
	return fieldJSON;
};

/*	Makes a copy of the box, adds event handlers to it,
	and adds it to the Scan document.
*/
Box.prototype.copyField = function() {
	// make a new copy of the $box
	var $new_box = this.$box.clone();
	$new_box.css({left: 0, top: 0});
	$new_box.draggable({containment: 'parent', grid: [GRID_X, GRID_Y]});
	$new_box.resizable({handles: 'all', 
						containment: 'parent', 
						grid: [GRID_X, GRID_Y],
						minWidth: GRID_X * 1,
						minHeight: GRID_Y * 1});						
	this.addEventHandlers($new_box);
	
	// copy the field object
	var $new_field = jQuery.extend({}, this);
	$new_box.data('obj', $new_field);
	$new_field.$box = $new_box;
	
	$(".selected_field").removeClass("selected_field");	
	$new_box.addClass("selected_field");
	$("#scan_doc").append($new_box);
};

/*	Represents an empty box field.
	json_init: JSON 	// initialization values that come from a JSON file
	update_init: JSON 	// initialization values that come from updating the field
*/
function EmptyBox(json_init, update_init) {
	Box.call(this, json_init, update_init); // call super constructor.	
}

// subclass extends superclass
EmptyBox.prototype = Object.create(Box.prototype);
EmptyBox.prototype.constructor = EmptyBox;

/* 	Loads the properties of the empty box into 
	the properties toolbar.
*/
EmptyBox.prototype.loadProperties = function() {
	// set border width
	$("#border_width").val(this.border_width);
}

/*	Creates a new empty box field with the updated
	properties listed in the properties sidebar.
*/
EmptyBox.prototype.updateProperties = function() {
	var empty_box = new EmptyBox(null, this.getProperties());
	empty_box.constructBox();	
}

/*	Returns JSON containing DOM properties
	of this empty box, formatted for saving 
	the document.
*/
EmptyBox.prototype.saveJSON = function() {
	var json = this.getProperties();
	json.field_type = 'empty_box';
	return json;
}

/*	Represents a text box field.
	json_init: JSON 	// initialization values that come from a JSON file
	update_init: JSON 	// initialization values that come from updating the field
*/
function TextBox(json_init, update_init) {
	Box.call(this, json_init, update_init); // call super constructor.	
	
	// add textbox specific properties to this.$box
	this.$box.css({wordWrap: 'break-word'});											
	var $text = $("<p/>");
	
	if (json_init) {
		this.$box.css({fontSize: json_init.font_size});
		$text.text(json_init.text);
	} else {
		this.text = $("#text_input").val();
		$text.text(this.text);
		this.font_size = $("#text_size").val();
		this.$box.css({fontSize: this.font_size});
		
	}
	this.$box.append($text);
}

// subclass extends superclass
TextBox.prototype = Object.create(Box.prototype);
TextBox.prototype.constructor = TextBox;

/* 	Loads the properties of the text box into 
	the properties toolbar.
*/
TextBox.prototype.loadProperties = function() {
	// set text
	$("#text_input").val(this.text);
	
	// set text size
	$("#text_size").prop('selectedIndex', (this.font_size == 'small') ? 0 :
						(this.font_size == 'medium') ? 1 : 2);			
						
	// set border width
	$("#border_width").val(this.border_width);
}


/*	Creates a new text box field with the updated
	properties listed in the properties sidebar.
*/
TextBox.prototype.updateProperties = function() {
	var text_field = new TextBox(null, this.getProperties());
	text_field.constructBox();	
}

/*	Returns JSON containing DOM properties
	of this text box, formatted for saving 
	the document.
*/
TextBox.prototype.saveJSON = function() {
	var json = this.getProperties();
	json.field_type = 'text_box';
	json.text = this.text
	json.font_size = this.$box.css('fontSize');
	return json;
}