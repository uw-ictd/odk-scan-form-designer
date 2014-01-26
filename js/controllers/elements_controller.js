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
								var img_pos = [];
								var img_index = 0;
								$("#scan_doc").children().remove();
								
								var remove_pics = function(index) {
									// check if all pics have been loaded
									if (index == img_pos.length) {
										$("#processed_images").children().remove();
									}
								};
								
								for (var i = 0; i < images.length; i++) {
									var img_json = images[i];
									console.log(JSON.stringify(img_json));
									
									var $img_container = $("<div/>").css({position: 'absolute',
													height: img_json.orig_height, 
													width: img_json.orig_width,
													overflow: 'hidden',
													position: 'absolute'});
									img_pos.push(img_json);
									
									var $wrapped_image = $("<img/>").attr('src', img_src);
									$wrapped_image.css({
										position: 'relative',
										top: img_json.img_top,
										left: img_json.img_left,
									});			
									$img_container.append($wrapped_image);
									$('#processed_images').append($img_container);

									html2canvas($img_container, {   
										logging:true,
										onrendered : function(canvas) {												
											var img_src = canvas.toDataURL("image/jpeg");						
											var $img = $("<img/>").attr('src', img_src);											
											$img.css({width: '100%', height: '100%'});
											var img_json = img_pos[img_index];
											img_index += 1;
											remove_pics(img_index);
											
											$img.data('left', img_json.img_left);
											$img.data('top', img_json.img_top);
											$img.data('orig_width', img_json.orig_width);
											$img.data('orig_height', img_json.orig_height);
											
											var $img_draggable = $("<div/>").css({width: img_json.width, height: img_json.height}).append($img);
											$img_draggable.addClass('img_div');											
											$img_draggable.css({position: 'absolute', left: img_json.div_left, top: img_json.div_top});																						
											$("#scan_doc").append($img_draggable);						
											$img_draggable.draggable({containment: 'parent', position: 'absolute'});
											$img_draggable.resizable({containment: 'parent', aspectRatio: true, handles: 'all'});	
											$img_draggable.dblclick(function() { $(this).remove() });
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
								} else if (f_json.field_type == 'box') {
									var box = new Box(f_json);
									box.constructBox();		
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
						var new_box = new Box();
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
						var $text_box = $("<div/>").css({width: GRID_X * 10, 
														height: GRID_Y * 10, 
														border: '1px solid black',														
														wordWrap: 'break-word',
														fontSize: $("#text_size").val(),
														fontFamily: "Times New Roman"});						
						$text_box.draggable({containment: 'parent'});
						$text_box.resizable({containment: 'parent', handles: 'all'});	
						
						var $text = $("<p/>").text($("#text_input").val());
						$text_box.append($text);
						$("#scan_doc").append($text_box);
						$("#text_dialog").dialog("close");
					},
					"Cancel": function() {
						$("#text_dialog").dialog("close");
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
				
				$("#wrapped_image").attr('src', $("#loaded_image").attr('src'));
				$("#wrapped_image").css({
					position: 'relative',
					top: -reg.y1,
					left: -reg.x1,
				});		
				
				// Image is wrapped in a div to eliminate the overflow
				// and only make the selected region visible.
				// NOTE: default position of selected image
				// is set to top-left of Scan doc.			
				$("#img_container").css({
					overflow: 'hidden',
					position: 'absolute',
					width: reg.width, 
					height: reg.height});		
				
				html2canvas($("#img_container"), {   
					logging:true,
					onrendered : function(canvas) {
						var img_src = canvas.toDataURL("image/jpeg");						
						var $img = $("<img/>").attr('src', img_src);
						$img.data('top', -reg.y1);
						$img.data('left', -reg.x1);
						$img.data('orig_width', reg.width);
						$img.data('orig_height', reg.height);
						
						$img.css({width: '100%', height: '100%'});
						var $img_draggable = $("<div/>").css({width: reg.width, height: reg.height});
						$img_draggable.css({left: 0, top: 0, position: 'absolute'});										
						$("#scan_doc").append($img_draggable);						
						$img_draggable.draggable({containment: 'parent'});
						$img_draggable.resizable({containment: 'parent', aspectRatio: true, handles: 'all'});	
						$img_draggable.addClass('img_div').append($img);		
						$img_draggable.dblclick(function() { $(this).remove() });
						$("#img_container").children('img').attr('src', null);							
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