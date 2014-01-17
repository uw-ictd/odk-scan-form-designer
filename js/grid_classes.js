// Constants 

var CHECKBOX_SMALL = 10;
var CHECKBOX_MEDIUM = 16;
var CHECKBOX_LARGE = 25;

var BUBBLE_SMALL = 10;
var BUBBLE_MEDIUM = 16;
var BUBBLE_LARGE = 26;

// sizes are set in [width, height]
var SEG_NUM_SMALL = [20, 28];
var SEG_NUM_MEDIUM = [40, 56];
var SEG_NUM_LARGE = [80, 112];

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
function GridField() {
}

GridField.prototype.constructGrid = function() {
	console.log("making grid...");
	// NOTE: initial width and height are aligned to the grid size
	var $grid_div = $('<div/>').addClass(this.grid_class).addClass('field');
	
	// the new field will be placed at the top left of the Scan doc
	$grid_div.css({top: 0, left: 0, position: 'absolute'});																	
	$grid_div.draggable({containment: 'parent', grid: [GRID_X, GRID_Y]});			
	
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
			$grid_div.append($g_element);
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
				$grid_div.append($g_element);
			}
		}		
		$grid_div.append($("<br>"));							
	}
	
	// all user-defined properties will be stored in a JSON object 
	$grid_div.data("prop", {});		
	
	// set field properties
	var field_prop = $grid_div.data("prop");	
	/* TODO: allow user to manipulate these properties */												
	field_prop.type = this.type;
	field_prop.name = this.name;	
	field_prop.label = this.label;
	
	var cf = {};
	// initialize classifier 
	cf.classifier_height = this.element_height;
	cf.classifier_width = this.element_width;						
	cf.training_data_uri = this.data_uri;
	cf.classification_map = this.cf_map;
	cf.default_classification = true;
	cf.advanced = this.cf_advanced;
	
	var this_field = this;
	var getFieldJSON = function() {
		var f_info = {};
		
		f_info.type = field_prop.type;
		f_info.name = field_prop.name;
		f_info.label = field_prop.label;
		f_info.classifier = cf;
		
		if (this_field.param) {
			f_info.param = this_field.param;
		}
		
		f_info.segments = [];

		var seg = {};
		seg.segment_x = $grid_div.position().left;
		seg.segment_y = $grid_div.position().top;
		seg.segment_width = $grid_div.outerWidth();
		seg.segment_height = $grid_div.outerHeight();
		seg.align_segment = false;
		
		// seg.items contains list of locations of all grid elements
		seg.items = [];

		$grid_div.children('div').each(function() {
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
	}
	
	$grid_div.data("getFieldJSON", getFieldJSON);
	
	// grid fields are removed when double-clicked
	$grid_div.dblclick(
		function() {
			this.remove();
		}
	);
	$grid_div.data("obj", this);
	$("#scan_doc").append($grid_div);
};

// constructs a grid of checkboxes
function CheckboxField() {
	// Set all checkbox attributes
	
	// set the grid class
	this.grid_class = 'cb_div';
	
	// set the class of the grid elements
	this.ele_class = 'c_box';
	
	// TODO: find out how these values should be set
	this.type = 'int';
	this.name = "square_checkboxes";	
	this.label = "square_checkboxes";		
	this.data_uri = "checkboxes";
	this.cf_advanced = {flip_training_data : false};
	this.cf_map = {empty : false};
	
	// checkbox size
	this.element_width = ($("#cb_size").val() == 'small') ? CHECKBOX_SMALL : 
						($("#cb_size").val() == 'medium') ? CHECKBOX_MEDIUM : CHECKBOX_LARGE;
	this.element_height = ($("#cb_size").val() == 'small') ? CHECKBOX_SMALL : 
						($("#cb_size").val() == 'medium') ? CHECKBOX_MEDIUM : CHECKBOX_LARGE;
	
	// the horizontal spacing between the centers of checkboxes
	this.horiz_dx = parseInt($("#cb_horiz_dx").val());
	
	// the vetical spacing between the centers of checkboxes
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

// inherit GridField
CheckboxField.prototype = new GridField();

// make the constructor point to the CheckboxField class
CheckboxField.prototype.constructor = CheckboxField;

// creates the div for each checkbox
CheckboxField.prototype.makeGridElement = function() {
	return $("<div/>").addClass(this.ele_class).css({width: this.element_width, height: this.element_height});
}

// constructs a grid of bubbles
function BubbleField() {
	// Set all bubble attributes
	
	// set the grid class
	this.grid_class = 'bubble_div';
	
	// set the class of the grid elements
	this.ele_class = ($("#bubb_size").val() == 'small') ? 'bubble_small' : 
						($("#bubb_size").val() == 'medium') ? 'bubble_med' : 'bubble_large';
	
	// TODO: find out what these values should actually be
	this.type = $("#bubb_type").val();
	this.name = "circle_bubbles";	
	this.label = "circle_bubbles";		
	this.data_uri = "bubbles";
	this.cf_advanced = {flip_training_data : false};
	this.cf_map = {empty : false};
	
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
	
	// the horizontal spacing between the centers of bubbles
	this.horiz_dx = parseInt($("#bubble_horiz_dx").val());
	
	// the vetical spacing between the centers of bubbles
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

// inherit GridField
BubbleField.prototype = new GridField();

// make the constructor point to the BubbleField class
BubbleField.prototype.constructor = BubbleField;

// creates the div for each bubble
BubbleField.prototype.makeGridElement = function() {
	return $("<div/>").addClass(this.ele_class).css({width: this.element_width, height: this.element_height});
}

function SegNumField() {
	// Set all segmented number attributes
	
	// set the grid class
	this.grid_class = 'num_div';
	
	// set the class of the grid elements
	this.ele_class = 'num';
	
	// TODO: allow user to modify the borders of grid elements?
	this.border_offset = 2;
	
	// TODO: find out what these values should actually be
	this.type = 'string';
	this.name = "seg_number";	
	this.label = "seg_number";		
	this.data_uri = "numbers";
	this.param = $("#num_row_seg_num").val() * $("#num_col_seg_num").val();
	this.cf_advanced = {flip_training_data : false, eigenvalues : 13}; // TODO: remove hardcoded value?
	this.cf_map = {"0":"0", "1":"1", "2":"2", "3":"3", "4":"4", 
					"5":"5", "6":"6", "7":"7", "8":"8", "9":"9"};
	
	// number size
	this.element_width = ($("#seg_num_size").val() == 'small') ? SEG_NUM_SMALL[0] : 
						($("#seg_num_size").val() == 'medium') ? SEG_NUM_MEDIUM[0] : SEG_NUM_LARGE[0];
	this.element_height = ($("#seg_num_size").val() == 'small') ? SEG_NUM_SMALL[1] : 
						($("#seg_num_size").val() == 'medium') ? SEG_NUM_MEDIUM[1] : SEG_NUM_LARGE[1];
	
	// inner dot size
	this.dot_width = ($("#dot_size").val() == 'small') ? DOT_SMALL : 
						($("#dot_size").val() == 'medium') ? DOT_MEDIUM : DOT_LARGE;
	this.dot_height = ($("#dot_size").val() == 'small') ? DOT_SMALL : 
						($("#dot_size").val() == 'medium') ? DOT_MEDIUM : DOT_LARGE;;
	
	// the horizontal spacing between the centers of bubbles
	this.horiz_dx = parseInt($("#seg_num_horiz_dx").val());
	
	// the vetical spacing between the centers of bubbles
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
}

// inherit GridField
SegNumField.prototype = new GridField();

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