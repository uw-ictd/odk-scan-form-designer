// class for Box objects
function Box(init_val) {
	this.$box = $('<div/>');	
	this.$box.data("obj", this);
	
	if(init_val) {
		this.$box.css({width: init_val.box_width, 
					height: init_val.box_height,
					left: init_val.left,
					top: init_val.top});
		this.border_width = init_val.border_width;
	} else {
		// NOTE: initial width and height are aligned
		// to the grid size
		this.$box.css({width: GRID_X * 10, 
					height: GRID_Y * 10,
					left: 0,
					top: 0});
		this.border_width = $("#box_border").val();
	}
	this.type = "box"; 
	this.name = "none";	
}

Box.prototype.constructBox = function() {
	this.$box.addClass('field').addClass('box');								
	this.$box.draggable({containment: 'parent', grid: [GRID_X, GRID_Y]});
	this.$box.resizable({handles: 'all', 
						containment: 'parent', 
						grid: [GRID_X, GRID_Y],
						minWidth: GRID_X * 1,
						minHeight: GRID_Y * 1});	
																							
	this.$box.css({'border-width': this.border_width + 'px'});	
	
	var border_width = this.border_width;
	this.$box.on('resizestop', (function(event, ui) {
		var curr_size = ui.size;
		console.log("width: " + curr_size.width	+ ", height: " + curr_size.height);	
		var nearest_width = Math.ceil(curr_size.width / GRID_X) * GRID_X;
		var nearest_height = Math.ceil(curr_size.height / GRID_Y) * GRID_Y;
		ui.element.width(nearest_width - border_width * 2);
		ui.element.height(nearest_height - border_width * 2);
		console.log("resized to --> width: " + ui.element.width()	+ ", height: " + ui.element.width());	
	}));
	
	// box is removed when double-clicked
	this.$box.dblclick( function() { this.remove() });
	
	this.$box.click(function() {
		$(".selected_field").removeClass("selected_field");	
		$(this).addClass("selected_field");
	});

	$(".selected_field").removeClass("selected_field");
	this.$box.addClass("selected_field");
	
	$("#scan_doc").append(this.$box);
};

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

Box.prototype.getProperties = function() {
	var fieldJSON = {};
	
	fieldJSON.left = this.$box.css('left');
	fieldJSON.top = this.$box.css('top');
	fieldJSON.box_width = this.$box.css('width');
	fieldJSON.box_height = this.$box.css('height');
	fieldJSON.border_width = this.border_width;	
	
	return fieldJSON;
};

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
						
	$new_box.dblclick(function() { this.remove() });
	$new_box.click(function() {
		$(".selected_field").removeClass("selected_field");	
		$(this).addClass("selected_field");
	});
	
	// copy the field object
	var $new_field = jQuery.extend({}, this);
	$new_box.data('obj', $new_field);
	$new_field.$box = $new_box;
	
	$(".selected_field").removeClass("selected_field");	
	$new_box.addClass("selected_field");
	$("#scan_doc").append($new_box);
};

function EmptyBox(init_val) {
	Box.call(this, init_val); // call super constructor.	
}

// subclass extends superclass
EmptyBox.prototype = Object.create(Box.prototype);
EmptyBox.prototype.constructor = EmptyBox;

EmptyBox.prototype.saveJSON = function() {
	var json = this.getProperties();
	json.field_type = 'empty_box';
	return json;
}

function TextBox(init_val) {
	Box.call(this, init_val); // call super constructor.	
	
	this.$box.css({wordWrap: 'break-word'});					
						
	var $text = $("<p/>");
	
	if (init_val) {
		this.$box.css({border: init_val.border, fontSize: init_val.font_size});
		$text.text(init_val.text);
	} else {
		$text.text($("#text_input").val());
		this.$box.css({border: '1px solid black', fontSize: $("#text_size").val()});
	}
	this.$box.append($text);
}

// subclass extends superclass
TextBox.prototype = Object.create(Box.prototype);
TextBox.prototype.constructor = TextBox;

TextBox.prototype.saveJSON = function() {
	var json = this.getProperties();
	json.field_type = 'text_box';
	json.text = this.$box.children('p').text();
	json.font_size = this.$box.css('fontSize');
	return json;
}