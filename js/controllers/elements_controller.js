/*
	Constants
*/

var GRID_X = 10;
var GRID_Y = 10;

var CHECKBOX_SMALL = 10;
var CHECKBOX_MEDIUM = 16;
var CHECKBOX_LARGE = 25;

var BUBBLE_SMALL = 10;
var BUBBLE_MEDIUM = 16;
var BUBBLE_LARGE = 25;

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

				if (j == 0) { // edge case, first grid element in the row
					$g_element.css({marginLeft: this.margin_left, 
							marginTop: mT, 
							marginBottom: mB, 
							marginRight: this.horiz_dx / 2});
				} else if (j < this.num_cols - 1) {
					$g_element.css({marginLeft: this.horiz_dx / 2, 
							marginTop: mT, 
							marginBottom: mB, 
							marginRight: this.horiz_dx / 2});
				} else { // edge case, last grid element in the row
					$g_element.css({marginLeft: this.horiz_dx / 2, 
							marginTop: mT, 
							marginBottom: mB, 
							marginRight: this.margin_right});
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
	cf.classification_map = {empty: false};
	cf.default_classification = true;
	cf.advanced = {flip_training_data : true};	
	
	var getFieldJSON = function() {
		var f_info = {};
		
		f_info.type = field_prop.type;
		f_info.name = field_prop.name;
		f_info.label = field_prop.label;
		f_info.classifier = cf;
		
		f_info.segments = [];

		var seg = {};
		seg.segment_x = $grid_div.position().left;
		seg.segment_y = $grid_div.position().top;
		seg.segment_width = $grid_div.outerWidth();
		seg.segment_height = $grid_div.outerHeight();
		seg.align_segment = false;
		
		// seg.items contains list of locations of all grid elements
		seg.items = [];
		
		$grid_div.children(this.ele_class).each(function() {
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
	this.type = 'int';
	this.name = "circle_bubbles";	
	this.label = "circle_bubbles";		
	this.data_uri = "bubbles";
	
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
	
	// TODO: find out what these values should actually be
	this.type = 'int';
	this.name = "seg_number";	
	this.label = "seg_number";		
	this.data_uri = "numbers";
	
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
	
	var y_pos = this.element_height / 6;
	var x_pos = this.element_width / 4;
	
	for (var i = 1; i <= 5; i += 2) {
		var $left_dot = $("<div/>");
		$left_dot.addClass("dot");
		// NOTE: assuming this.dot_width == this.dot_width
		$left_dot.css({width: this.dot_width, height: this.dot_height, borderRadius: this.dot_width / 2});
		
		// shifts over the dot to place its center at the appropriate location
		$left_dot.css({left: x_pos - (this.dot_width / 2), top: (y_pos * i) - (this.dot_height / 2)});
		
		var $right_dot = $("<div/>");
		$right_dot.addClass("dot");
		// NOTE: assuming this.dot_width == this.dot_width
		$right_dot.css({width: this.dot_width, height: this.dot_height, borderRadius: this.dot_width / 2});
		
		// shifts over the dot to place its center at the appropriate location
		$right_dot.css({left: (3 * x_pos) - (this.dot_width / 2), top: (y_pos * i) - (this.dot_height / 2)});
		
		$new_num.append($left_dot);
		$new_num.append($right_dot);
	}
	return $new_num;
}

ODKScan.ElementsController = Ember.ArrayController.extend({
	isImageEditing: false,
	imgSelect: null,
	init: function() {
		this._super();		
		
		var controller = this;
		$(document).ready(function() {		
			/* 	imgAreaSelect field is initialized here,
				setting it as field allows the controller to 
				access/modify the the selected image region
				based on interaction from the user.
			*/
			var ias = $('#image_area img').imgAreaSelect({
								instance: true,
								handles: true
							});				
			controller.set('imgSelect', ias);		
						
			/*
				All dialog windows are initialized below.
			*/
			
			$("#save_dialog").dialog({
				autoOpen: false,
				modal: true,
				buttons: {
					"Ok": function() {
						$("#zip_link").attr("download", $("#zip_name").val());
						// trigger the file to be downloaded
						document.getElementById("zip_link").click();
						$("#save_dialog").dialog("close");
					},
					"Cancel": function() {
						$("#save_dialog").dialog("close");
					}
				}			
			});
			
			$("#box_dialog").dialog({
				autoOpen: false,
				modal: true,
				buttons: {
					"Ok": function() {
						console.log("making box...");
						var $new_box = $('<div/>').addClass('field').addClass('box');
						
						// NOTE: initial width and height are aligned to the grid size
						var box_width = GRID_X * 10;
						var box_height = GRID_Y * 10;
						// $new_box is placed at the top left of the Scan doc
						$new_box.css({width: box_width, height: box_height, top: 0, left: 0});						
						
						$new_box.draggable({containment: 'parent', grid: [GRID_X, GRID_Y]});
						$new_box.resizable({handles: 'all', 
											containment: 'parent', 
											grid: [GRID_X, GRID_Y],
											minWidth: GRID_X * 5,
											minHeight: GRID_Y * 5});
																												
						$new_box.css({'outline-width': $("#box_border").val() + 'px'});
						$new_box.css({position: 'absolute'});
						
						// all user-defined properties will be stored in a JSON object 
						$new_box.data("prop", {});
						
						// set field properties
						var field_prop = $new_box.data("prop");	
						/* TODO: allow user to manipulate these properties */						
						field_prop.type = "box"; 
						field_prop.name = "none";			
						
						// this function is invoked when the JSON output is created
						var getFieldJSON = function() {
							var f_info = {};
							
							f_info.type = field_prop.type;
							f_info.name = field_prop.name;
							f_info.segments = [];
				
							var seg = {};
							seg.segment_x = $new_box.position().left;
							seg.segment_y = $new_box.position().top;
							seg.segment_width = $new_box.outerWidth();
							seg.segment_height = $new_box.outerHeight();
							
							f_info.segments.push(seg);
							return f_info;
						}
						
						$new_box.data("getFieldJSON", getFieldJSON);
						
						// box is removed when double-clicked
						$new_box.dblclick(
							function() {
								this.remove();
							}
						);
						
						$("#scan_doc").append($new_box);
						$("#box_dialog").dialog("close");
					},
					"Cancel": function() {
						$("#box_dialog").dialog("close");
					}
				}
			});
				
			$("#checkbox_dialog").dialog({
				autoOpen: false,
				modal: true,
				buttons: {
					"Ok": function() {
						console.log("making checkboxes...");
						
						var cbField = new CheckboxField();
						cbField.constructGrid();						
						
						$("#checkbox_dialog").dialog("close");
					},
					"Cancel": function() {
						$("#checkbox_dialog").dialog("close");
					}
				}
			});			
			
			$("#bubble_dialog").dialog({
				autoOpen: false,
				modal: true,
				buttons: {
					"Ok": function() {
						console.log("making fill-in bubbles...");
						
						var bubbField = new BubbleField();
						bubbField.constructGrid();						
						
						$("#bubble_dialog").dialog("close");
					},
					"Cancel": function() {
						$("#bubble_dialog").dialog("close");
					}
				}
			});

			$("#seg_num_dialog").dialog({
				autoOpen: false,
				modal: true,
				buttons: {
					"Ok": function() {
						console.log("making numbers...");
						
						var numField = new SegNumField();
						numField.constructGrid();						
						
						$("#seg_num_dialog").dialog("close");
					},
					"Cancel": function() {
						$("#seg_num_dialog").dialog("close");
					}
				}
			});					
		});
	},
	actions: {
		enableImageEdit: function() {
			$("#prop_sidebar").hide("slow");
			this.set('isImageEditing', true);
		},
		enableFormEdit: function() {
			$("#image_area img").attr('src', null);
			var ias = this.get('imgSelect');
			ias.cancelSelection();
			$("#prop_sidebar").show("slow");			
			this.set('isImageEditing', false);
		},
		selectImage: function() {
			$("#image_select").click();

			$("#image_select").change(
				function (event) {
					var selectedFile = event.target.files[0];
					var reader = new FileReader();

					reader.onload = function(event) {
						// set properties of the image
						$("#loaded_image").attr('src', event.target.result);																	
					};
					
					reader.readAsDataURL(selectedFile);					
				}
			);
		},
		saveImage: function() {
			html2canvas($("#scan_doc"), {   
				logging:true,
				onrendered : function(canvas) {
					canvas.toBlob(function(blob) {
						var fname = "scan_output"					
						saveAs(blob, fname);
					});	
				}
			});
		},
		addSelection: function() {
			var ias = this.get('imgSelect');
			var reg = ias.getSelection();
			if (reg.width == 0 && reg.height == 0) {
				// indicates that no region is currently selected
				// do nothing
				console.log("no region selected");
			} else {
				console.log("region selected!");
				var $new_img = $("<img/>").attr('src', $("#loaded_image").attr('src'));

				$new_img.css({
					position: 'relative',
					top: -reg.y1,
					left: -reg.x1,
				});	
												
				// Image is wrapped in a div to eliminate the overflow
				// and only make the selected region visible.
				// NOTE: default position of selected image
				// is set to top-left of Scan doc.
				var $img_div = $('<div/>').css({
					position: 'absolute', 
					overflow: 'hidden',
					width: reg.width, 
					height: reg.height,
					top: 0, 
					left: 0});
				
				$img_div.addClass("img_div");
				
				// image is removed when double-clicked
				$img_div.dblclick(
					function() {
						this.remove();
					}
				);								
				$img_div.append($new_img);
				$img_div.draggable({containment: 'parent', position: 'relative'});
				
				$("#scan_doc").append($img_div);								
			}
		},
		createBox: function() {
			console.log("creating box");
			$("#box_dialog").dialog("open");
		},
		createCheckbox: function() {
			console.log("creating checkboxes");
			$("#checkbox_dialog").dialog("open");
		},
		createBubbles: function() {
			console.log("creating fill-in bubbles");
			$("#bubble_dialog").dialog("open");
		},
		createNumbers: function() {
			console.log("creating segmented numbers");
			$("#seg_num_dialog").dialog("open");
		},
		saveJSON: function() {
			console.log("creating JSON");
			var res = {};

			// set Scan doc properties
			res.height = $("#scan_doc").height();
			res.width = $("#scan_doc").width();
			res.fields = [];
			
			// iterate over all field elements
			var all_fields = $(".field");			
			for (var i = 0; i < all_fields.length; i++) {
				var curr = $(all_fields[i]);
				
				var fieldJSON = curr.data("getFieldJSON")();
				res.fields.push(fieldJSON);
			}
			var res = JSON.stringify(res, null, '\t');
		},
		saveZIP: function() {
			// create a zip file for the form image and json
			var zip = new JSZip();
			
			var res = {};

			// set Scan doc properties
			res.height = $("#scan_doc").height();
			res.width = $("#scan_doc").width();
			res.fields = [];
			
			// iterate over all field elements
			var all_fields = $(".field");			
			for (var i = 0; i < all_fields.length; i++) {
				var curr = $(all_fields[i]);
				
				var fieldJSON = curr.data("getFieldJSON")();
				res.fields.push(fieldJSON);
			}
			
			var json_output = JSON.stringify(res, null, '\t');
			
			html2canvas($("#scan_doc"), {   
				logging:true,
				onrendered : function(canvas) {
					var img_src = canvas.toDataURL("image/jpeg");
					
					/* 	Need to extract the base64 from the image source.
						img_src is in the form: data:image/jpeg;base64,...
						Where '...' is the actual base64.
					*/
					var img_base64 = img_src.split(",")[1];
					
					// add img to zip file
					zip.file("form.jpg", img_base64, {base64: true});
					zip.file("template.json", json_output);
					var content = zip.generate();

					var res = "data:application/zip;base64," + content;
					$("#zip_link").attr('href', res);
				}
			});	
			$("#save_dialog").dialog("open");
		}
	}
});