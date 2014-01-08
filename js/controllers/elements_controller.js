/*
	Constants
*/

var GRID_X = 10;
var GRID_Y = 10;

ODKScan.ElementsController = Ember.ArrayController.extend({
	isImageEditing: false,
	imgSelect: null,
	addBorder: false,
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
						var $new_box = $('<div/>').addClass('box').addClass('field');
						
						var box_width = GRID_X * 10;
						var box_height = GRID_Y * 10;
						var border_offset = 2 * $("#box_border").val();
						var $new_cb = $('<div/>').css({width: box_width, height: box_height});
						
						$new_box.draggable({containment: 'parent', grid: [GRID_X, GRID_Y]});
						$new_box.resizable({containment: 'parent', grid: [GRID_X, GRID_Y]});
						$new_box.css({'border-width': $("#box_border").val()});
						$new_box.css({'background-color': 'green'});
						$new_box.data("prop", {});
						
						// set field properties
						var field_prop = $new_box.data("prop");						
						field_prop.type = "box";
						field_prop.name = "none";						
						
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
						var div_width = GRID_X * 10;
						var div_height = GRID_Y * 10;
						var $new_cb = $('<div/>').css({width: div_width, height: div_height});
						
						if (controller.get('addBorder')) {
							$new_cb.css({'border-width': $("#cb_border").val()});
							
							/* 	
								Adding a border to an element increases its 
								width and height, so we must decrement the 
								width and height of the shape to maintain
								grid alignment.
							*/

							$new_cb.width(div_width - 2 * $("#cb_border").val() );
							$new_cb.height(div_height - 2 * $("#cb_border").val());							
							
							// NOTE: hard-coded color and style
							$new_cb.css({'border-color': "black"});
							$new_cb.css({'border-style': "solid"});
							
							// reset the selected border option
							controller.send('disableBorder');
						} else {
							$new_cb.addClass('dashed_border');
						}
																	
						$new_cb.draggable(
							{containment: 'parent', 
							grid: [GRID_X, GRID_Y]
							});
						$new_cb.resizable({containment: 'parent', grid: [GRID_X, GRID_Y]});					
						
						// checkboxes are removed when double-clicked
						$new_cb.dblclick(
							function() {
								this.remove();
							}
						);
						
						$("#scan_doc").append($new_cb);
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
		enableBorder: function() {
			this.set('addBorder', true);
			/*	There's an issue with adding an 'action' to a
				radio button, after selecting an option you're
				unable to change the selected button. 
				
				As a work-around to this issue I'm manually 
				changing the values of the radio buttons once
				an option is selected.
			*/
			$(".border_yes").prop('checked', true);
			$(".border_no").prop('checked', false);
		},
		disableBorder: function() {
			this.set('addBorder', false);
			/*	There's an issue with adding an 'action' to a
				radio button, after selecting an option you're
				unable to change the selected button. 
				
				As a work-around to this issue I'm manually 
				changing the values of the radio buttons once
				an option is selected.
			*/
			$(".border_no").prop('checked', true);
			$(".border_yes").prop('checked', false);
		},
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
					var img_src = canvas.toDataURL('image/png'); 
					canvas.toBlob(function(blob) {
						var fname = "my_dom"					
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
				var f_data = curr.data("prop");
				
				var new_f = {};
				res.fields.push(new_f);
				
				// retrieve/calculate data for the current field
				new_f.type = f_data.type;
				new_f.name = f_data.name;
				new_f.segments = [];
				
				var seg = {};
				seg.segment_x = curr.position().left;
				seg.segment_y = curr.position().top;
				seg.segment_width = curr.outerWidth();
				seg.segment_height = curr.outerHeight();
				
				new_f.segments.push(seg);
			}
			console.log(JSON.stringify(res, null, '\t'));
		}
	}
});