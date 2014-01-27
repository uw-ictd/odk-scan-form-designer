// TODO: add documentation about FormField
function FormField() {
}

// constructor for FormField object, passed in the
// init_val constructor when the Scan doc is loaded
// from a JSON file
FormField.prototype.init = function(init_val) {
	this.$grid_div = $('<div/>');
	this.$grid_div.data("obj", this);
	
	if (init_val) {
		this.num_cols = init_val.num_cols;
		this.margin_top = init_val.margin_top;
		this.margin_bottom = init_val.margin_bottom;
		this.margin_left = init_val.margin_left;
		this.margin_right = init_val.margin_right;
		this.element_height = init_val.element_height;
		this.element_width = init_val.element_width;
		this.ele_class = init_val.ele_class;
		this.$grid_div.css({top: init_val.top, left: init_val.left});
	} else {
		this.$grid_div.css({top: 0, left: 0});
	}
}

// returns the properties which are common
// to all of the subclasses of FormField
FormField.prototype.getProperties = function() {
	var json = {};
	
	json.num_rows = this.num_rows;
	json.num_cols = this.num_cols;
	json.margin_top = this.margin_top;
	json.margin_bottom = this.margin_bottom;
	json.margin_left = this.margin_left;
	json.margin_right = this.margin_right;
	json.element_height = this.element_height;
	json.element_width = this.element_width;
	json.ele_class = this.ele_class;
	json.left = this.$grid_div.css('left');
	json.top = this.$grid_div.css('top');
	
	return json;
}

FormField.prototype.constructGrid = function() {
	console.log("making grid...");
	// NOTE: initial width and height are aligned to the grid size
	this.$grid_div.addClass(this.grid_class).addClass('field');
	
	this.$grid_div.css({position: 'absolute'});																	
	this.$grid_div.draggable({containment: 'parent', grid: [GRID_X, GRID_Y], stack: ".field"});		
	
	var fieldObj = this;
	$(this.group_sizes).each(function(index, group_size) {
		var $g_element = fieldObj.makeGridElement(group_size, index);
		$g_element.css({marginTop: fieldObj.margin_top, marginBottom: fieldObj.margin_bottom});

		if (index == 0) { // edge case, first grid element in the row
			$g_element.css({marginLeft: fieldObj.margin_left, marginRight: fieldObj.group_dx / 2});
			fieldObj.$grid_div.append($g_element);
			
			var delim = fieldObj.makeGridDelim();
			fieldObj.$grid_div.append(delim);
		} else if (index < fieldObj.num_cols - 1) {			
			$g_element.css({marginLeft: fieldObj.group_dx / 2, marginRight: fieldObj.group_dx / 2});
			fieldObj.$grid_div.append($g_element);
			
			var delim = fieldObj.makeGridDelim();
			fieldObj.$grid_div.append(delim.clone());
		} else { // edge case, last grid element in the row
			$g_element.css({marginLeft: fieldObj.group_dx / 2, marginRight: fieldObj.margin_right});
			fieldObj.$grid_div.append($g_element);
		}
	});				
	
	// grid fields are removed when double-clicked
	this.$grid_div.dblclick( function() { this.remove() });
	
	this.$grid_div.click(function() {
		$(".selected_field").removeClass("selected_field");	
		$(this).addClass("selected_field");
	});

	$(".selected_field").removeClass("selected_field");
	this.$grid_div.addClass("selected_field");
	$("#scan_doc").append(this.$grid_div);
};

FormField.prototype.getFieldJSON = function() {
	var f_info = {};
	f_info.type = this.type;
	f_info.name = this.name;
	f_info.label = this.label;
	
	var cf = {};
	// initialize classifier 
	cf.classifier_height = this.element_height;
	cf.classifier_width = this.element_width;						
	cf.training_data_uri = this.data_uri;
	cf.classification_map = this.cf_map;
	cf.default_classification = true;
	cf.advanced = this.cf_advanced;
		
	f_info.classifier = cf;
	
	// check if the field has a 'param'
	// attribute (only bubbles require it)
	if (this.param) {
		f_info.param = this.param;
	}
	
	f_info.segments = [];

	var seg = {};
	seg.segment_x = this.$grid_div.position().left;
	seg.segment_y = this.$grid_div.position().top;
	seg.segment_width = this.$grid_div.outerWidth();
	seg.segment_height = this.$grid_div.outerHeight();
	seg.align_segment = false;
	
	// seg.items contains list of locations of all grid elements
	seg.items = [];

	this.$grid_div.children('div').each(function() {
		var ele_loc = {}; // stores location of the grid element
		
		/* 	NOTE: The element location is given with
			respect to its center. Also, position().left
			and position().right do not take into account
			the margins around the div, we have to add
			horiz_offset to account for the margin.
		*/								
		var horiz_offset = parseInt($(this).css('margin-left'));
		var vert_offset = parseInt($(this).css('margin-top'));
		
		// we use outerWidth() and outerHeight() because they take borders into account
		ele_loc.item_x = horiz_offset + $(this).position().left + ($(this).outerWidth() / 2);
		ele_loc.item_y = vert_offset + $(this).position().top + ($(this).outerHeight() / 2);
		
		seg.items.push(ele_loc);
	});
	
	f_info.segments.push(seg);
	return f_info;
};

FormField.prototype.copyField = function() {
	// make a new copy of the $grid_div
	var $new_grid = this.$grid_div.clone();
	$new_grid.css({left: 0, top: 0});
	$new_grid.draggable({containment: 'parent', grid: [GRID_X, GRID_Y]});
	$new_grid.dblclick(function() { this.remove() });
	$new_grid.click(function() {
		$(".selected_field").removeClass("selected_field");	
		$(this).addClass("selected_field");
	});
	
	// copy the field object
	var $new_field = jQuery.extend({}, this);
	$new_grid.data('obj', $new_field);
	$new_field.$grid_div = $new_grid;
	
	$(".selected_field").removeClass("selected_field");	
	$new_grid.addClass("selected_field");
	$("#scan_doc").append($new_grid);
};

function FormNumField(init_val) {
	this.init(init_val); // essentially calling the superclass's constructor
	// Set all segmented number attributes
	
	// set the grid class
	this.grid_class = 'num_div';
	
	// TODO: find out what these values should actually be
	this.type = 'string';
	this.name = "seg_number";	
	this.label = "seg_number";		
	this.data_uri = "numbers";
	this.cf_advanced = {flip_training_data : false, eigenvalues : 13}; // TODO: remove hardcoded value?
	this.cf_map = {"0":"0", "1":"1", "2":"2", "3":"3", "4":"4", 
					"5":"5", "6":"6", "7":"7", "8":"8", "9":"9"};
	
	if (init_val) {
		console.log('loading from');
		this.border_offset = init_val.border_offset;
		this.param = init_val.param;
		this.dot_width = init_val.dot_width;
		this.dot_height = init_val.dot_height;
		this.group_dx = init_val.group_dx;
		this.num_dx = init_val.num_dx;
		this.num_group = init_val.num_group;
		this.group_sizes = init_val.group_sizes;
		this.delim_type = init_val.delim_type;
	} else {
		// set the class of the grid elements
		this.ele_class = 'num';
		
		// TODO: allow user to modify the borders of grid elements?
		this.border_offset = 2;
		
		//this.param = $("#num_row_seg_num").val() * $("#num_col_seg_num").val();

		// number size
		this.element_width = ($("#form_num_size").val() == 'small') ? SEG_NUM_SMALL[0] : 
							($("#form_num_size").val() == 'medium') ? SEG_NUM_MEDIUM[0] : SEG_NUM_LARGE[0];
		this.element_height = ($("#form_num_size").val() == 'small') ? SEG_NUM_SMALL[1] : 
							($("#form_num_size").val() == 'medium') ? SEG_NUM_MEDIUM[1] : SEG_NUM_LARGE[1];
		
		// inner dot size
		this.dot_width = ($("#form_num_dot_size").val() == 'small') ? DOT_SMALL : 
							($("#form_num_dot_size").val() == 'medium') ? DOT_MEDIUM : DOT_LARGE;
		this.dot_height = ($("#form_num_dot_size").val() == 'small') ? DOT_SMALL : 
							($("#form_num_dot_size").val() == 'medium') ? DOT_MEDIUM : DOT_LARGE;
		
		// the horizontal spacing between the edges of numbers
		this.num_dx = parseInt($("#form_num_dx").val());
		
		// the horizontal spacing between the edges of groups
		this.group_dx = parseInt($("#form_num_group_dx").val());
		
		var group_sizes = [];
		
		$(".num_groups").each(function() {
			group_sizes.push(parseInt($(this).val()));
		});
		
		// stores the size of each respective group
		this.group_sizes = group_sizes;
		
		this.delim_type = $("#delim_type").val();
		
		// margin values
		this.margin_top = parseInt($("#form_num_margin_top").val());
		this.margin_bottom = parseInt($("#form_num_margin_bottom").val());
		this.margin_left = parseInt($("#form_num_margin_left").val());
		this.margin_right = parseInt($("#form_num_margin_right").val());
		
		// number of columns
		this.num_cols = $("#num_col_form_num").val();
	}
}

// inherit FormField
FormNumField.prototype = new FormField();

// make the constructor point to the FormNumField class
FormNumField.prototype.constructor = FormNumField;

// creates the div for each segmented number
FormNumField.prototype.makeGridElement = function(num_digits, group_num) {
	var $new_num = $("<div/>").addClass(this.ele_class).css({width: this.element_width, height: this.element_height});
	
	/*	NOTE: Dots are spaced out evenly - 
	
		1st row is placed 1/6 of the height from 
		the top of the number, 2nd row is 3/6 of
		the height from the top, and the 3rd row 
		is 5/6 of the height from the top of the
		number.

		1st column is placed 1/4 of the width from
		the left side of the number, and the 2nd 
		column is 3/4 of the width from the left.
	*/
	
	var y_pos = (this.element_height - this.border_offset) / 6;
	var x_pos = (this.element_width - this.border_offset) / 4;
	
	for (var i = 1; i <= 5; i += 2) {
		var $left_dot = $("<div/>");
		$left_dot.addClass("dot");
		// NOTE: assuming this.dot_width == this.dot_height for borderRadius calculation
		$left_dot.css({width: this.dot_width, height: this.dot_height, borderRadius: this.dot_width / 2});
		
		// shifts over the dot to place its center at the appropriate location
		$left_dot.css({left: x_pos - (this.dot_width / 2), top: (y_pos * i) - (this.dot_height / 2)});
		
		var $right_dot = $("<div/>");
		$right_dot.addClass("dot");
		// NOTE: assuming this.dot_width == this.dot_height for borderRadius calculation
		$right_dot.css({width: this.dot_width, height: this.dot_height, borderRadius: this.dot_width / 2});
		
		// shifts over the dot to place its center at the appropriate location
		$right_dot.css({left: (3 * x_pos) - (this.dot_width / 2), top: (y_pos * i) - (this.dot_height / 2)});
		
		$new_num.append($left_dot);
		$new_num.append($right_dot);
	}
	
	var $form_num_group = $("<div/>");
	$form_num_group.addClass('num_group');
	
	for (var i = 0; i < num_digits; i++) {
		var $num = $new_num.clone();
		
		if (i == 0) { // edge case, first grid element in the group
			$num.css({marginLeft: 0});
			if (num_digits == 1) { // edge case, one element in the group
				$num.css({marginRight: 0});
			} else {
				$num.css({marginRight: this.num_dx / 2});
			}
		} else if (i < num_digits - 1) {			
			$num.css({marginLeft: this.num_dx / 2, marginRight: this.num_dx / 2});
		} else { // edge case, last grid element in the group
			$num.css({marginLeft: this.num_dx / 2, marginRight: 0});
		}			
				
		$form_num_group.append($num);
	}
	
	return $form_num_group;
}

FormNumField.prototype.makeGridDelim = function(num_digits) {
	var $new_delim = $("<div/>");
	$new_delim.addClass(this.ele_class);
	$new_delim.css({width: this.element_width, 
					height: this.element_height,
					marginTop: this.margin_top,
					marginBottom: this.margin_bottom,
					marginLeft: this.group_dx / 2, 
					marginRight: this.group_dx / 2,
					textAlign: 'center'});
	var $delim_text = $("<p/>").text(this.delim_type);
	$new_delim.append($delim_text);
	return $new_delim;
}

// returns JSON containing the current state of 
// the field (position, grid element type, etc.)
FormNumField.prototype.saveJSON = function() {
	var json = this.getProperties();
	json.field_type = 'form_num';
	json.param = this.param;
	json.border_offset = this.border_offset;
	json.dot_width = this.dot_width;
	json.dot_height = this.dot_height;
	json.num_dx = this.num_dx;
	json.group_dx = this.group_dx;
	json.group_sizes = this.group_sizes;
	json.delim_type = this.delim_type;
	return json;
}