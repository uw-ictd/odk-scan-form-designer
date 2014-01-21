/*
	Constants
*/

var GRID_X = 10;
var GRID_Y = 10;

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
									
			$("#uploaded_image").change(
				function (event) {
					var selectedFile = event.target.files[0];
					var reader = new FileReader();
					reader.onload = function(event) {
						$("#uploaded_image").data("img_src", event.target.result);													
					};								
					reader.readAsDataURL(selectedFile);					
				}
			);
			
			$("#uploaded_json").change(
				function (event) {
					var selectedFile = event.target.files[0];
					var reader = new FileReader();
					reader.onload = function(event) {
						console.log('json file: ' + event.target.result);	
						$("#uploaded_json").data("json", event.target.result);
					};								
					reader.readAsText(selectedFile);					
				}
			);
						
			/*
				All dialog windows are initialized below.
			*/
			
			$("#load_dialog").dialog({
				autoOpen: false,
				modal: true,
				buttons: {
					"Ok": function() {				
						// check if no json was uploaded, error case
						// if no json was uploaded?
						if (!$("#uploaded_json").data("json")) {
							console.log("no json uploaded");
						} else {							
							// load images into the scan doc
							var scanDoc = JSON.parse($("#uploaded_json").data("json"));
							var images = scanDoc.images;
							
							if (images && !$("#uploaded_image").data("img_src")) {
								// error case, no image was uploaded
								console.log('error, no image file');
							} else {							
								// load image snippets into the Scan doc
								var img_src = $("#uploaded_image").data("img_src");
								for (var i = 0; i < images.length; i++) {
									var img_json = images[i];
									
									var $img_div = $("<div/>").css({position: 'absolute',
																	height: img_json.height, 
																	width: img_json.width,
																	top: img_json.div_top,
																	left: img_json.div_left});
									$img_div.addClass("img_div");
									$img_div.draggable({containment: 'parent'});
									var $img = $("<img/>").css({top: img_json.img_top, 
																left: img_json.img_left});
									$img.attr('src', img_src);
									
									$img_div.append($img);
									$("#scan_doc").append($img_div);
								}
							}
							
							// load all fields into the doc
							var fields = scanDoc.fields;
							for (var i = 0; i < fields.length; i++) {								
								var f_json = fields[i];
								console.log('loading field: ' + JSON.stringify(f_json, null, '\t'));
								if (f_json.field_type == 'checkbox') {
									console.log("\tloading checkbox");
									var cb_field = new CheckboxField(f_json);
									cb_field.constructGrid();			
								} else if (f_json.field_type == 'bubble') {
									var bubb_field = new BubbleField(f_json);
									bubb_field.constructGrid();			
								} else if (f_json.field_type == 'seg_num') {
									var seg_num_field = new SegNumField(f_json);
									seg_num_field.constructGrid();			
								} 
							}
						}
												
						$("#load_dialog").dialog("close");					
					},
					"Cancel": function() {
						$("#load_dialog").dialog("close");
					}
				}			
			});
			
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
					top: -reg.y1,
					left: -reg.x1,
				});	
												
				// Image is wrapped in a div to eliminate the overflow
				// and only make the selected region visible.
				// NOTE: default position of selected image
				// is set to top-left of Scan doc.
				var $img_div = $('<div/>').addClass("img_div").css({
					position: 'absolute',
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
				$img_div.draggable({containment: 'parent'});
				
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
		loadDoc: function() {
			console.log("loading document...");
			$("#load_dialog").dialog("open");
		},
		saveDoc: function() {
			/*	Need to save metadata about all fields (including all
				parameters that were used to make them) and images.
			*/			
			var savedDoc = {};
			savedDoc.images = [];
			savedDoc.fields = [];
			
			// save metadata about all images
			$(".img_div").each(function() {
				var img_div = {};
				img_div.height = $(this).height();
				img_div.width = $(this).width();
				img_div.div_top = $(this).css('top');
				img_div.div_left = $(this).css('left');
				img_div.img_top = $(this).children("img").css('top');
				img_div.img_left = $(this).children("img").css('left');
				
				savedDoc.images.push(img_div);
			});
		
			/*	 create a new JSON object for each field */
			$(".field").each(function() {
				var json = $(this).data("obj").saveJSON();
				savedDoc.fields.push(json);				
			});
			
			console.log(JSON.stringify(savedDoc, null, '\t'));
		},
		exportZIP: function() {
			// create a zip file for the form image and json
			var zip = new JSZip();
			
			var scanDoc = {};

			// set Scan doc properties
			scanDoc.height = $("#scan_doc").height();
			scanDoc.width = $("#scan_doc").width();
			scanDoc.fields = [];
			
			// compute and get the JSON for each field
			var all_fields = $(".field");			
			for (var i = 0; i < all_fields.length; i++) {
				var $curr_field = $(all_fields[i]);				
				var fieldObj = $curr_field.data("obj");
				
				scanDoc.fields.push(fieldObj.getFieldJSON());
			}
			
			var json_output = JSON.stringify(scanDoc, null, '\t');
			
			html2canvas($("#scan_doc"), {   
				logging:true,
				onrendered : function(canvas) {
					var img_src = canvas.toDataURL("image/jpeg");
					
					/* 	Need to extract the base64 from the image source.
						img_src is in the form: data:image/jpeg;base64,...
						Where '...' is the actual base64.
					*/
					var img_base64 = img_src.split(",")[1];
					
					// add img and json to zip file
					zip.file("form.jpg", img_base64, {base64: true});
					zip.file("template.json", json_output);
					var content = zip.generate();

					var scanDoc = "data:application/zip;base64," + content;
					$("#zip_link").attr('href', scanDoc);
				}
			});	
			$("#save_dialog").dialog("open");
		}
	}
});