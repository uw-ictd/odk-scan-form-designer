/*
	Constants
*/

var GRID_X = 10;
var GRID_Y = 10;

var CHECKBOX_SMALL = 20;
var CHECKBOX_MEDIUM = 35;
var CHECKBOX_LARGE = 50;

var BUBBLE_SMALL = 20;
var BUBBLE_MEDIUM = 35;
var BUBBLE_LARGE = 50;

/*
	Parent class => GridElement
		- Contains code to create the grid of element.
	
		Child class => Checkbox. 
			- Sets fields used by the GridElement class.
		Child class => Bubble
			- Sets fields used by the GridElement class.
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
			mB = (this.vert_dy - this.element_height) / 2;
		} else if (i < this.num_rows - 1) { // middle row
			mT = (this.vert_dy - this.element_height) / 2;
			mB = (this.vert_dy - this.element_height) / 2;
		} else { // last row
			mT = (this.vert_dy - this.element_height) / 2;
			mB = this.margin_bottom;
		}
	
		// special case: only one grid element in the row
		if (this.num_cols == 1) {
			var $g_element = this.makeGridElement();
			$g_element.css({width: this.element_width, height: this.element_height});		
				
			$g_element.css({marginLeft: this.margin_left, 
					marginTop: mT, 
					marginBottom: mB, 
					marginRight: this.margin_right});
			$grid_div.append($g_element);
		} else {												
			for (var j = 0; j < this.num_cols; j++) {	
				var $g_element = this.makeGridElement();
				$g_element.css({width: this.element_width, height: this.element_height});

				if (j == 0) { // edge case, first grid element in the row
					$g_element.css({marginLeft: this.margin_left, 
							marginTop: mT, 
							marginBottom: mB, 
							marginRight: (this.horiz_dx - this.element_width) / 2});
				} else if (j < this.num_cols - 1) {
					$g_element.css({marginLeft: (this.horiz_dx - this.element_width) / 2, 
							marginTop: mT, 
							marginBottom: mB, 
							marginRight: (this.horiz_dx - this.element_width) / 2});
				} else { // edge case, last grid element in the row
					$g_element.css({marginLeft: (this.horiz_dx - this.element_width) / 2, 
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

// creates the div each checkbox
CheckboxField.prototype.makeGridElement = function() {
	return $("<div/>").addClass(this.ele_class);
}

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

// creates the div each bubble
BubbleField.prototype.makeGridElement = function() {
	return $("<div/>").addClass(this.ele_class);
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
																												
						$new_box.css({'border-width': $("#box_border").val()});
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
						Image src is in the form: data:image/jpeg;base64,...
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