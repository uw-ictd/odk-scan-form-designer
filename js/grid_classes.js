// Constants 

var CHECKBOX_SMALL = 10;
var CHECKBOX_MEDIUM = 16;
var CHECKBOX_LARGE = 25;

var BUBBLE_SMALL = 10;
var BUBBLE_MEDIUM = 16;
var BUBBLE_LARGE = 26;

// sizes are set in [width, height]
var SEG_NUM_SMALL = [20, 28];
var SEG_NUM_MEDIUM = [30, 42];
var SEG_NUM_LARGE = [45, 63];

var DOT_SMALL = 2;
var DOT_MEDIUM = 5;
var DOT_LARGE = 7;

/*	GridElement class acts similar to an abstract class
	in Java, it has to be subclassed in order to invoke
	the constructGrid function.
	
	Each subclass requires the following fields to be 
	initialized:
		- num_rows (int) 
		- num_cols (int)
		- margin_top (int)
		- margin_bottom (int)
		- margin_left (int)
		- margin_right (int)
		- vert_dy (int)
		- horz_dx (int)
		- element_height (int)
		- element_width (int)
		- ele_class (string)
		- grid_class (string)
		- data_uri (string)
		- cf_map (JSON)
		- cf_advanced (JSON)
		- makeGridElement (function, returns jQuery object)
*/

/* 	Constructs GridField object, passed in the
	init_val constructor when the Scan doc is loaded
	from a JSON file.
*/
function GridField(init_val) {
	this.$grid_div = $('<div/>');
	this.$grid_div.data("obj", this);
	
	if (init_val) {
		this.num_rows = init_val.num_rows;
		this.num_cols = init_val.num_cols;
		this.margin_top = init_val.margin_top;
		this.margin_bottom = init_val.margin_bottom;
		this.margin_left = init_val.margin_left;
		this.margin_right = init_val.margin_right;
		this.vert_dy = init_val.vert_dy;
		this.horiz_dx = init_val.horiz_dx;
		this.element_height = init_val.element_height;
		this.element_width = init_val.element_width;
		this.ele_class = init_val.ele_class;
		this.$grid_div.css({top: init_val.top, left: init_val.left});
		this.border_width = init_val.border_width;	
	} else {
		this.$grid_div.css({top: 0, left: 0});
		this.border_width = $("#border_width").val();
	}
}

// returns the properties which are common
// to all of the subclasses of GridField
GridField.prototype.getProperties = function() {
	var json = {};
	
	json.num_rows = this.num_rows;
	json.num_cols = this.num_cols;
	json.margin_top = this.margin_top;
	json.margin_bottom = this.margin_bottom;
	json.margin_left = this.margin_left;
	json.margin_right = this.margin_right;
	json.vert_dy = this.vert_dy;
	json.horiz_dx = this.horiz_dx;
	json.element_height = this.element_height;
	json.element_width = this.element_width;
	json.ele_class = this.ele_class;
	json.left = this.$grid_div.css('left');
	json.top = this.$grid_div.css('top');
	json.border_width = this.border_width;
	
	return json;
}

GridField.prototype.constructGrid = function() {
	console.log("making grid...");
	// NOTE: initial width and height are aligned to the grid size
	this.$grid_div.addClass(this.grid_class).addClass('field');
	
	// the new field will be placed at the top left of the Scan doc
	this.$grid_div.css({position: 'absolute', borderWidth: this.border_width});																	
	this.$grid_div.draggable({containment: 'parent', grid: [GRID_X, GRID_Y], stack: ".field"});			
	
	// construct the grid
	for (var i = 0; i < this.num_rows; i++) {	
		var mT;
		var mB;
		
		// special case: only one row
		if (this.num_rows == 1) {
			mT = this.margin_top;
			mB = this.margin_bottom;
		} else if (i == 0) { // first row
			mT = this.margin_top;
			mB = this.vert_dy / 2;
		} else if (i < this.num_rows - 1) { // middle row
			mT = this.vert_dy / 2;
			mB = this.vert_dy / 2;
		} else { // last row
			mT = this.vert_dy / 2;
			mB = this.margin_bottom;
		}
	
		// special case: only one grid element in the row
		if (this.num_cols == 1) {
			var $g_element = this.makeGridElement();
				
			$g_element.css({marginLeft: this.margin_left, 
					marginTop: mT, 
					marginBottom: mB, 
					marginRight: this.margin_right});
			this.$grid_div.append($g_element);
		} else {												
			for (var j = 0; j < this.num_cols; j++) {	
				var $g_element = this.makeGridElement();
				$g_element.css({marginTop: mT, marginBottom: mB});

				if (j == 0) { // edge case, first grid element in the row
					$g_element.css({marginLeft: this.margin_left, marginRight: this.horiz_dx / 2});
				} else if (j < this.num_cols - 1) {
					$g_element.css({marginLeft: this.horiz_dx / 2, marginRight: this.horiz_dx / 2});
				} else { // edge case, last grid element in the row
					$g_element.css({marginLeft: this.horiz_dx / 2, marginRight: this.margin_right});
				}
				this.$grid_div.append($g_element);
			}
		}		
		this.$grid_div.append($("<br>"));							
	}
	
	// grid fields are removed when double-clicked
	this.$grid_div.dblclick( function() { 
		ODKScan.FieldContainer.popObject();
		ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);
		this.remove() 
	});
	
	var obj = this;
	this.$grid_div.click(function() {
		$(".selected_field").removeClass("selected_field");	
		$(this).addClass("selected_field");		
		
		ODKScan.FieldContainer.popObject();
		if (obj.field_type == 'checkbox') {
			ODKScan.FieldContainer.pushObject(ODKScan.CheckboxView);
		} else if (obj.field_type == "bubble") {
			ODKScan.FieldContainer.pushObject(ODKScan.BubblesView);
		} else if (obj.field_type == "seg_num") {
			ODKScan.FieldContainer.pushObject(ODKScan.SegNumView);
		} else {
			console.log("error - unsupported field type");
		}		
	});

	$(".selected_field").removeClass("selected_field");
	this.$grid_div.addClass("selected_field");
	$("#scan_doc").append(this.$grid_div);
};

GridField.prototype.getFieldJSON = function() {
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

GridField.prototype.copyField = function() {
	// make a new copy of the $grid_div
	var $new_grid = this.$grid_div.clone();
	$new_grid.css({left: 0, top: 0});
	$new_grid.draggable({containment: 'parent', grid: [GRID_X, GRID_Y]});
	$new_grid.dblclick(function() { 
		ODKScan.FieldContainer.popObject();
		ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);
		this.remove() 
	});
	
	var obj = this;
	$new_grid.click(function() {
		$(".selected_field").removeClass("selected_field");	
		$(this).addClass("selected_field");
		
		ODKScan.FieldContainer.popObject();
		if (obj.field_type == 'checkbox') {
			ODKScan.FieldContainer.pushObject(ODKScan.CheckboxView);
		} else if (obj.field_type == "bubble") {
			ODKScan.FieldContainer.pushObject(ODKScan.BubblesView);
		} else if (obj.field_type == "seg_num") {
			ODKScan.FieldContainer.pushObject(ODKScan.SegNumView);
		} else {
			console.log("error - unsupported field type");
		}		
	});
	// copy the field object
	var $new_field = jQuery.extend({}, this);
	$new_grid.data('obj', $new_field);
	$new_field.$grid_div = $new_grid;
	
	$(".selected_field").removeClass("selected_field");	
	$new_grid.addClass("selected_field");
	$("#scan_doc").append($new_grid);
};

// constructs a grid of checkboxes
function CheckboxField(init_val) {
	GridField.call(this, init_val);
	this.field_type = "checkbox";
	
	// Set all checkbox attributes
	
	// set the grid class
	this.grid_class = 'cb_div';
	
	// TODO: find out how these values should be set
	this.type = 'int';
	this.name = "square_checkboxes";	
	this.label = "square_checkboxes";		
	this.data_uri = "checkboxes";
	this.cf_advanced = {flip_training_data : false};
	this.cf_map = {empty : false};
	
	if (!init_val) {
		// set the class of the grid elements
		this.ele_class = 'c_box';
		
		// checkbox size
		this.element_width = ($("#cb_size").val() == 'small') ? CHECKBOX_SMALL : 
							($("#cb_size").val() == 'medium') ? CHECKBOX_MEDIUM : CHECKBOX_LARGE;
		this.element_height = ($("#cb_size").val() == 'small') ? CHECKBOX_SMALL : 
							($("#cb_size").val() == 'medium') ? CHECKBOX_MEDIUM : CHECKBOX_LARGE;
		
		// the horizontal spacing between the edges of checkboxes
		this.horiz_dx = parseInt($("#cb_horiz_dx").val());
		
		// the vetical spacing between the edges of checkboxes
		this.vert_dy = parseInt($("#cb_vert_dy").val());
		
		// margin values
		this.margin_top = parseInt($("#cb_margin_top").val());
		this.margin_bottom = parseInt($("#cb_margin_bottom").val());
		this.margin_left = parseInt($("#cb_margin_left").val());
		this.margin_right = parseInt($("#cb_margin_right").val());
		
		// number of rows
		this.num_rows = $("#num_row_cb").val();
		
		// number of columns
		this.num_cols = $("#num_col_cb").val();
	}
}

// inherit GridField
CheckboxField.prototype = Object.create(GridField.prototype);

// make the constructor point to the CheckboxField class
CheckboxField.prototype.constructor = CheckboxField;

// creates the div for each checkbox
CheckboxField.prototype.makeGridElement = function() {
	return $("<div/>").addClass(this.ele_class).css({width: this.element_width, height: this.element_height});
}

// loads the properties of the checkbox into the checkbox view
CheckboxField.prototype.loadProperties = function() {
	// checkbox size
	$("#cb_size").prop('selectedIndex', (this.element_width == CHECKBOX_SMALL) ? 0 :
						(this.element_width == CHECKBOX_MEDIUM) ? 1 : 2);					
	
	// the horizontal spacing between the edges of checkboxes
	$("#cb_horiz_dx").val(this.horiz_dx);
	
	// the vetical spacing between the edges of checkboxes
	$("#cb_vert_dy").val(this.vert_dy);
		
	// margin values
	$("#cb_margin_top").val(this.margin_top);
	$("#cb_margin_bottom").val(this.margin_bottom);
	$("#cb_margin_left").val(this.margin_left);
	$("#cb_margin_right").val(this.margin_right);
	
	// number of rows
	$("#num_row_cb").val(this.num_rows);
	
	// number of columns
	$("#num_col_cb").val(this.num_cols);
	
	// set border width
	$("#border_width").val(this.border_width);
	
	if (this.border_width != "0") {
		// set border option to 'yes'
		$($("input[name=borderOption]")[0]).prop('checked', true);
		$("#border_container").css('display', 'inline');
	} else {		
		// set border option to 'no'
		$($("input[name=borderOption]")[1]).prop('checked', true);
		$("#border_container").css('display', 'none');
	}
}

// creates new checkbox with the properties in the
// properties sidebar
CheckboxField.prototype.updateProperties = function() {
	var cbField = new CheckboxField();
	cbField.constructGrid();	
}

// returns JSON containing the current state of 
// the field (position, grid element type, etc.)
CheckboxField.prototype.saveJSON = function() {
	var json = this.getProperties();
	json.field_type = this.field_type;
	return json;
}

// constructs a grid of bubbles
function BubbleField(init_val) {
	GridField.call(this, init_val);
	this.field_type = 'bubble';
	
	// Set all bubble attributes
	
	// set the grid class
	this.grid_class = 'bubble_div';
	
	// TODO: find out what these values should actually be
	this.type = $("#bubb_type").val();
	this.name = "circle_bubbles";	
	this.label = "circle_bubbles";		
	this.data_uri = "bubbles";
	this.cf_advanced = {flip_training_data : false};
	this.cf_map = {empty : false};
	
	if (init_val) {
		this.param = init_val.param;
	} else {
		// set the class of the grid elements
		this.ele_class = ($("#bubb_size").val() == 'small') ? 'bubble_small' : 
							($("#bubb_size").val() == 'medium') ? 'bubble_med' : 'bubble_large';
		
		if (this.type == 'tally') {
			this.param = $("#num_row_bubbles").val() * $("#num_col_bubbles").val();
		} else if (this.type == 'select1') {
			this.param = 'yes_no';
		}
		
		// bubble size
		this.element_width = ($("#bubb_size").val() == 'small') ? BUBBLE_SMALL : 
							($("#bubb_size").val() == 'medium') ? BUBBLE_MEDIUM : BUBBLE_LARGE;
		this.element_height = ($("#bubb_size").val() == 'small') ? BUBBLE_SMALL : 
							($("#bubb_size").val() == 'medium') ? BUBBLE_MEDIUM : BUBBLE_LARGE;
		
		// the horizontal spacing between the edges of bubbles
		this.horiz_dx = parseInt($("#bubble_horiz_dx").val());
		
		// the vetical spacing between the edges of bubbles
		this.vert_dy = parseInt($("#bubble_vert_dy").val());
		
		// margin values
		this.margin_top = parseInt($("#bubble_margin_top").val());
		this.margin_bottom = parseInt($("#bubble_margin_bottom").val());
		this.margin_left = parseInt($("#bubble_margin_left").val());
		this.margin_right = parseInt($("#bubble_margin_right").val());
		
		// number of rows
		this.num_rows = $("#num_row_bubbles").val();
		
		// number of columns
		this.num_cols = $("#num_col_bubbles").val();
	}
}

// inherit GridField
BubbleField.prototype = Object.create(GridField.prototype);

// make the constructor point to the BubbleField class
BubbleField.prototype.constructor = BubbleField;

// creates the div for each bubble
BubbleField.prototype.makeGridElement = function() {
	return $("<div/>").addClass(this.ele_class).css({width: this.element_width, height: this.element_height});
}

// loads the properties of the bubbles into the bubbles view
BubbleField.prototype.loadProperties = function() {
	// bubble size
	$("#bubb_size").prop('selectedIndex', (this.element_width == BUBBLE_SMALL) ? 0 :
						(this.element_width == BUBBLE_MEDIUM) ? 1 : 2);		

	// bubble type
	$("#bubb_type").prop('selectedIndex', (this.type == 'tally') ? 0 : 1);			
	
	// the horizontal spacing between the edges of bubbles
	$("#bubble_horiz_dx").val(this.horiz_dx);
	
	// the vetical spacing between the edges of checkboxes
	$("#bubble_vert_dy").val(this.vert_dy);
		
	// margin values
	$("#bubble_margin_top").val(this.margin_top);
	$("#bubble_margin_bottom").val(this.margin_bottom);
	$("#bubble_margin_left").val(this.margin_left);
	$("#bubble_margin_right").val(this.margin_right);
	
	// number of rows
	$("#num_row_bubbles").val(this.num_rows);
	
	// number of columns
	$("#num_col_bubbles").val(this.num_cols);
	
	// set border width
	$("#border_width").val(this.border_width);
	
	if (this.border_width != "0") {
		// set border option to 'yes'
		$($("input[name=borderOption]")[0]).prop('checked', true);
		$("#border_container").css('display', 'inline');
	} else {		
		// set border option to 'no'
		$($("input[name=borderOption]")[1]).prop('checked', true);
		$("#border_container").css('display', 'none');
	}
}

// creates new bubbles with the properties in the
// properties sidebar
BubbleField.prototype.updateProperties = function() {
	var bubbField = new BubbleField();
	bubbField.constructGrid();	
}

// returns JSON containing the current state of 
// the field (position, grid element type, etc.)
BubbleField.prototype.saveJSON = function() {
	var json = this.getProperties();
	json.field_type = this.field_type;
	json.param = this.param;
	return json;
}

function SegNumField(init_val) {
	GridField.call(this, init_val);
	this.field_type = 'seg_num';
	
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
		return; // the rest of the values have already been set by init()
	} else {
		// set the class of the grid elements
		this.ele_class = 'num';
		
		// TODO: allow user to modify the borders of grid elements?
		this.border_offset = 2;

		// number size
		this.element_width = ($("#seg_num_size").val() == 'small') ? SEG_NUM_SMALL[0] : 
							($("#seg_num_size").val() == 'medium') ? SEG_NUM_MEDIUM[0] : SEG_NUM_LARGE[0];
		this.element_height = ($("#seg_num_size").val() == 'small') ? SEG_NUM_SMALL[1] : 
							($("#seg_num_size").val() == 'medium') ? SEG_NUM_MEDIUM[1] : SEG_NUM_LARGE[1];
		
		// inner dot size
		this.dot_width = ($("#dot_size").val() == 'small') ? DOT_SMALL : 
							($("#dot_size").val() == 'medium') ? DOT_MEDIUM : DOT_LARGE;
		this.dot_height = ($("#dot_size").val() == 'small') ? DOT_SMALL : 
							($("#dot_size").val() == 'medium') ? DOT_MEDIUM : DOT_LARGE;
		
		// the horizontal spacing between the edges of segmented numbers
		this.horiz_dx = parseInt($("#seg_num_horiz_dx").val());
		
		// the vetical spacing between the edges of segmented numbers
		this.vert_dy = parseInt($("#seg_num_vert_dy").val());
		
		// margin values
		this.margin_top = parseInt($("#seg_num_margin_top").val());
		this.margin_bottom = parseInt($("#seg_num_margin_bottom").val());
		this.margin_left = parseInt($("#seg_num_margin_left").val());
		this.margin_right = parseInt($("#seg_num_margin_right").val());
		
		// number of rows
		this.num_rows = $("#num_row_seg_num").val();
		
		// number of columns
		this.num_cols = $("#num_col_seg_num").val();
		
		this.param = this.num_rows * this.num_cols;
		
		if (this.border_width != "0") {
			// set border option to 'yes'
			$($("input[name=borderOption]")[0]).prop('checked', true);
			$("#border_container").css('display', 'inline');
		} else {		
			// set border option to 'no'
			$($("input[name=borderOption]")[1]).prop('checked', true);
			$("#border_container").css('display', 'none');
		}
	}
}

// inherit GridField
SegNumField.prototype = Object.create(GridField.prototype);

// make the constructor point to the SegNumField class
SegNumField.prototype.constructor = SegNumField;

// creates the div for each segmented number
SegNumField.prototype.makeGridElement = function() {
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
	return $new_num;
}

// loads the properties of the segmented numbers into the segmented number view
SegNumField.prototype.loadProperties = function() {
	// NOTE: ASSUMING no duplicate values in first index of
	// SEG_NUM_SMALL, SEG_NUM_MEDIUM, and SEG_NUM_LARGE 
	$("#seg_num_size").prop('selectedIndex', (this.element_width == SEG_NUM_SMALL[0]) ? 0 :
						(this.element_width == SEG_NUM_SMALL[1]) ? 1 : 2);					
	
	// NOTE: ASSUMING dot_width == dot_height
	$("#dot_size").prop('selectedIndex', (this.dot_width == DOT_SMALL) ? 0 :
						(this.dot_width == DOT_MEDIUM) ? 1 : 2);											
	
	this.dot_height = ($("#dot_size").val() == 'small') ? DOT_SMALL : 
					($("#dot_size").val() == 'medium') ? DOT_MEDIUM : DOT_LARGE;
	
	// the horizontal spacing between the edges of segmented numbers
	$("#seg_num_horiz_dx").val(this.horiz_dx);
	
	// the vetical spacing between the edges of segmented numbers
	$("#seg_num_vert_dy").val(this.vert_dy);
		
	// margin values
	$("#seg_num_margin_top").val(this.margin_top);
	$("#seg_num_margin_bottom").val(this.margin_bottom);
	$("#seg_num_margin_left").val(this.margin_left);
	$("#seg_num_margin_right").val(this.margin_right);
	
	// number of rows
	$("#num_row_seg_num").val(this.num_rows);
	
	// number of columns
	$("#num_col_seg_num").val(this.num_cols);
	
	if (this.border_width != "0") {
		// set border option to 'yes'
		$($("input[name=borderOption]")[0]).prop('checked', true);
		$("#border_container").css('display', 'inline');
	} else {		
		// set border option to 'no'
		$($("input[name=borderOption]")[1]).prop('checked', true);
		$("#border_container").css('display', 'none');
	}
}

// creates new segmented numbers with the properties in the
// properties sidebar
SegNumField.prototype.updateProperties = function() {
	var segNumField = new SegNumField();
	segNumField.constructGrid();	
}

// returns JSON containing the current state of 
// the field (position, grid element type, etc.)
SegNumField.prototype.saveJSON = function() {
	var json = this.getProperties();
	json.field_type = this.field_type;
	json.param = this.param;
	json.border_offset = this.border_offset;
	json.dot_width = this.dot_width;
	json.dot_height = this.dot_height;
	return json;
}