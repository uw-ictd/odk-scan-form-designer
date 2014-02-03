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
			
			// NOTE: the Scan document is set to letter_size by default
			$("#scan_doc").addClass("letter_size");		
		});
	},
	editModeChanged: function() {
		console.log("edit mode changed!!!");
	}.observes('isImageEditing'),
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
		enableBorder: function() {
			$(".border_width input").val(1); // set border with to one
			$(".border_width").css('display', 'inline');
		},
		disableBorder: function() {
			$(".border_width input").val(0); // set border with to zero
			$(".border_width").css('display', 'none');
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
			if ($(".selected_field").length != 0) {
				var selectedField = $(".selected_field").data('obj');
				selectedField.copyField();		
			}
		},
		newDoc: function() {
			if ($("#scan_doc").children().length == 0) {
				$("#new_doc_dialog").dialog("open");
			} else {
				$("#save_check_dialog").dialog("open");
			}
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
			savedDoc.doc_info = {};
			savedDoc.images = [];
			savedDoc.fields = [];
			
			// save metadata about the page
			savedDoc.doc_info.page_size = $("#scan_doc").attr("class");
			
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