/*
	Constants
*/

var GRID_X = 10;
var GRID_Y = 10;

ODKScan.ElementsController = Ember.ArrayController.extend({
	groups: [1, 2],
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
							
							if (images.length > 0 && !$("#uploaded_image").data("img_src")) {
								// error case, no image was uploaded
								console.log('error, no image file');
							} else {							
								// load image snippets into the Scan doc							
								var img_pos = [];
								var img_index = 0;
								
								// remove all current fields in the Scan doc
								$("#scan_doc").children().remove();
								
								var check_if_done = function(index) {
									// check if all pics have been loaded
									if (index == img_pos.length) {
										$("#processed_images").children().remove();
									}
								};
								
								var img_src = $("#uploaded_image").data("img_src");	
								for (var i = 0; i < images.length; i++) {
									var img_json = images[i];
									img_pos.push(img_json);
	
									// load the image into the dom
									var $img_container = load_into_dom(img_src, 
															img_json.orig_height,
															img_json.orig_width,
															img_json.img_top,
															img_json.img_left);												

									html2canvas($img_container, {   
										logging:true,
										onrendered : function(canvas) {												
											var cropped_img_src = canvas.toDataURL("image/jpeg");															// get image position/size information
											var img_json = img_pos[img_index];											
											load_into_scan(cropped_img_src, 
														img_json.height, 
														img_json.width, 
														img_json.orig_height,
														img_json.orig_width,
														img_json.img_top, 
														img_json.img_left, 
														img_json.div_top, 
														img_json.div_left);
																
											img_index += 1;
											check_if_done(img_index);
										}
									});			
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
								} else if (f_json.field_type == 'empty_box') {
									var empty_box = new EmptyBox(f_json);
									empty_box.constructBox();		
								} else if (f_json.field_type == 'text_box') {
									var text_box = new TextBox(f_json);
									text_box.constructBox();	
								} else if (f_json.field_type == 'form_num') {
									var form_num_field = new FormNumField(f_json);
									form_num_field.constructGrid();		
								} else {
									console.log("unsupported field");
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
						$("#scan_json_link").attr("download", $("#saved_scan_name").val() + ".json");
						document.getElementById("scan_json_link").click();
						$("#save_dialog").dialog("close");
					},
					"Cancel": function() {
						$("#save_dialog").dialog("close");
					}
				}			
			});
						
			$("#export_dialog").dialog({
				autoOpen: false,
				modal: true,
				buttons: {
					"Ok": function() {
						$("#zip_link").attr("download", $("#zip_name").val());
						// trigger the file to be downloaded
						document.getElementById("zip_link").click();
						$("#export_dialog").dialog("close");
					},
					"Cancel": function() {
						$("#export_dialog").dialog("close");
					}
				}			
			});
			
			$("#box_dialog").dialog({
				autoOpen: false,
				modal: true,
				buttons: {
					"Ok": function() {
						console.log("making box...");
						var new_box = new EmptyBox();
						new_box.constructBox();
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

			$("#text_dialog").dialog({
				autoOpen: false,
				modal: true,
				buttons: {
					"Ok": function() {
						var new_text_box = new TextBox();
						new_text_box.constructBox();
						
						$("#text_dialog").dialog("close");
					},
					"Cancel": function() {
						$("#text_dialog").dialog("close");
					}
				}
			});			
			$("#form_num_dialog").dialog({
				autoOpen: false,
				modal: true,
				buttons: {
					"Ok": function() {					
						var formNumField = new FormNumField();
						formNumField.constructGrid();							
						$("#form_num_dialog").dialog("close");
					},
					"Cancel": function() {
						$("#form_num_dialog").dialog("close");
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
		enableFieldEdit: function() {
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
				// load the image into the dom
				var img_src = $("#loaded_image").attr('src');
				var $img_container = load_into_dom(img_src, reg.height, reg.width, -reg.y1, -reg.x1);				

				html2canvas($img_container, {   
					logging:true,
					onrendered : function(canvas) {
						var cropped_img_src = canvas.toDataURL("image/jpeg");			
						load_into_scan(cropped_img_src, reg.height, reg.width, reg.height, reg.width, -reg.y1, -reg.x1, 0, 0);
						$("#processed_images").children().remove();										
					}
				});			
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
		createText: function() {
			console.log("creating text");
			$("#text_dialog").dialog("open");
		},
		createFormattedNumber: function() {
			console.log("creating formatted number");
			$("#form_num_dialog").dialog("open");
		},
		updateNumGroups: function() {	
			var arr = [];
			for (var i = 1; i <= $("#num_col_form_num").val(); i++) {
				arr.push(i);
			}
			this.set('groups', arr);
			console.log('num groups is: ' + $("#num_col_form_num").val());
		},
		copyField: function() {
			var selectedField = $(".selected_field").data('obj');
			selectedField.copyField();		
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
				// NOTE: img position, original size stored in the img's data field
				img_div.img_top = $(this).children("img").data('top');
				img_div.img_left = $(this).children("img").data('left');
				img_div.orig_height = $(this).children("img").data('orig_height');
				img_div.orig_width = $(this).children("img").data('orig_width');
				
				savedDoc.images.push(img_div);
			});
		
			/*	 create a new JSON object for each field */
			$(".field").each(function() {
				var json = $(this).data("obj").saveJSON();
				savedDoc.fields.push(json);				
			});
			
			var json_output = JSON.stringify(savedDoc, null, '\t');
			var filename = "saved_form.json"; // TODO: remove hardcoded filename			
			
			$("#scan_json_link").attr('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(json_output));	
			$("#save_dialog").dialog("open");
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
			
			$(".selected_field").removeClass("selected_field");
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
			$("#export_dialog").dialog("open");
		}
	}
});