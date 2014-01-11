/*
	Constants
*/

var GRID_X = 10;
var GRID_Y = 10;
var CHECKBOX_SIZE = 30;

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
						// NOTE: initial width and height are aligned to the grid size
						var $cb_div = $('<div/>').addClass('cb_div').addClass('field');
						
						// the new field will be placed at the top left of the Scan doc
						$cb_div.css({top: 0, left: 0, position: 'absolute'});																		
						$cb_div.draggable({containment: 'parent', grid: [GRID_X, GRID_Y]});				
						
						// the horizontal spacing between the centers of checkboxes
						var horiz_dx = parseInt($("#cb_horiz_dx").val());
						
						// the vetical spacing between the centers of checkboxes
						var vert_dx = parseInt($("#cb_vert_dy").val());
						
						// margin values
						var MARGIN_TOP = parseInt($("#cb_margin_top").val());
						var MARGIN_BOTTOM = parseInt($("#cb_margin_bottom").val());
						var MARGIN_LEFT = parseInt($("#cb_margin_left").val());
						var MARGIN_RIGHT = parseInt($("#cb_margin_right").val());
						
						for (var i = 0; i < $("#vert_num_cb").val(); i++) {	
							var mT;
							var mB;
							
							// special case: only one row
							if ($("#vert_num_cb").val() == 1) {
								mT = MARGIN_TOP;
								mB = MARGIN_BOTTOM;
							} else if (i == 0) { // first row
								mT = MARGIN_TOP;
								mB = (vert_dx - CHECKBOX_SIZE) / 2;
							} else if (i < $("#vert_num_cb").val() - 1) { // middle row
								mT = (vert_dx - CHECKBOX_SIZE) / 2;
								mB = (vert_dx - CHECKBOX_SIZE) / 2;
							} else { // last row
								mT = (vert_dx - CHECKBOX_SIZE) / 2;
								mB = MARGIN_BOTTOM;
							}
						
							// special case: only one checkbox in the row
							if ($("#horiz_num_cb").val() == 1) {
								var $cb = $('<div/>').addClass('c_box');
								$cb.css({width: CHECKBOX_SIZE, height: CHECKBOX_SIZE});		
									
								$cb.css({marginLeft: MARGIN_LEFT, 
										marginTop: mT, 
										marginBottom: mB, 
										marginRight: MARGIN_RIGHT});
								$cb_div.append($cb);
							} else {												
								for (var j = 0; j < $("#horiz_num_cb").val(); j++) {	
									var $cb = $('<div/>').addClass('c_box');
									$cb.css({width: CHECKBOX_SIZE, height: CHECKBOX_SIZE});

									// TODO: remove hardcoded margin values
									if (j == 0) { // edge case, first checkbox
										$cb.css({marginLeft: MARGIN_LEFT, 
												marginTop: mT, 
												marginBottom: mB, 
												marginRight: (horiz_dx - CHECKBOX_SIZE) / 2});
									} else if (j < $("#horiz_num_cb").val() - 1) {
										$cb.css({marginLeft: (horiz_dx - CHECKBOX_SIZE) / 2, 
												marginTop: mT, 
												marginBottom: mB, 
												marginRight: (horiz_dx - CHECKBOX_SIZE) / 2});
									} else { // edge case, last checkbox
										$cb.css({marginLeft: (horiz_dx - CHECKBOX_SIZE) / 2, 
												marginTop: mT, 
												marginBottom: mB, 
												marginRight: MARGIN_RIGHT});
									}
									$cb_div.append($cb);
								}
							}		
							$cb_div.append($("<br>"));							
						}
						
						// all user-defined properties will be stored in a JSON object 
						$cb_div.data("prop", {});		
						
						// set field properties
						var field_prop = $cb_div.data("prop");	
						/* TODO: allow user to manipulate these properties */												
						field_prop.type = "int";
						field_prop.name = "square_checkboxes";	
						field_prop.label = "square_checkboxes";	
						
						var cf = {};
						// initialize classifier 
						cf.classifier_height = CHECKBOX_SIZE;
						cf.classifier_width = CHECKBOX_SIZE;						
						cf.training_data_uri = "checkboxes";
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
							seg.segment_x = $cb_div.position().left;
							seg.segment_y = $cb_div.position().top;
							seg.segment_width = $cb_div.outerWidth();
							seg.segment_height = $cb_div.outerHeight();
							seg.align_segment = false;
							
							// seg.items contains list of locations of all checkboxes
							seg.items = [];
							
							$cb_div.children('.c_box').each(function() {
								var cb_loc = {}; // stores location of the checkbox
								
								/* 	NOTE: The checkbox location is given with
									respect to its center. Also, position().left
									and position().right do not take into account
									the margins around the div, we have to add
									horiz_offset to account for the margin.
								*/								
								var horiz_offset = parseInt($(this).css('margin-left'));
								
								// we use outerWidth() and outerHeight() because they take borders into account
								cb_loc.item_x = horiz_offset + $(this).position().left + ($(this).outerWidth() / 2);
								cb_loc.item_y = horiz_offset + $(this).position().top + ($(this).outerHeight() / 2);
								
								seg.items.push(cb_loc);
							});
							
							f_info.segments.push(seg);
							return f_info;
						}
						
						$cb_div.data("getFieldJSON", getFieldJSON);
						
						// checkboxes are removed when double-clicked
						$cb_div.dblclick(
							function() {
								this.remove();
							}
						);
						
						$("#scan_doc").append($cb_div);
						$("#checkbox_dialog").dialog("close");
					},
					"Cancel": function() {
						$("#checkbox_dialog").dialog("close");
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
			console.log(JSON.stringify(res, null, '\t'));
		}
	}
});