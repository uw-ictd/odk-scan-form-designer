ODKScan.ElementsController = Ember.ArrayController.extend({
	hasBorder: true,
	isImageEditing: false,
	imgSelect: null,
	currPage: null,
	selectedPageNum: null,
	pages: null,
	init: function() {
		this._super();		
		
		var controller = this;
		$(document).ready(function() {		
			/* 	imgAreaSelect field is initialized here,
				setting it as field allows the controller to 
				access/modify the the selected image region
				based on interaction from the user.
			*/
			var ias = $('#loaded_image').imgAreaSelect({
											instance: true,
											handles: true});				
			controller.set('imgSelect', ias);		
			
			controller.set('currPage', 1);			
			// NOTE: the Scan document is set to letter_size by default
			var $new_page = $("<div/>").addClass("scan_page selected_page letter_portrait");
			var new_page_tab = {pageNum: controller.get('currPage'), isActive: true, pageDiv:$new_page};
			controller.set('selectedPageTab', new_page_tab);
			controller.set('pages', [new_page_tab]);
			// add the new page to the dom
			$("#page_container").append($new_page);
		});
	},
	actions: {
		enableImageEdit: function() {
			$("#prop_sidebar").hide("slow");
			this.set("fieldRefList", []);
			this.set('isImageEditing', true);
		},
		enableFieldEdit: function() {			
			// add references to the currently loaded image from 
			// all of the image snippets that were taken from it
			this.send("addImageRef");
			
			// remove the loaded image from the loaded_image container
			$("#loaded_image").attr("src", null);
		
			// cancel any currently selected image region
			var ias = this.get('imgSelect');
			ias.cancelSelection();
			
			// revert back to displaying the properties sidebar
			$("#prop_sidebar").show("slow");			
			this.set('isImageEditing', false);
		},
		selectImage: function() {
			// add references to the currently loaded image from 
			// all of the image snippets that were taken from it
			this.send("addImageRef");
			
			// cancel any currently selected image region
			var ias = this.get('imgSelect');
			ias.cancelSelection();
			
			/* 	NOTE: Pressing 'Select Image' triggers a hidden html 
				file input button #image_select. The button is hidden
				in order to override its appearance. 
			*/
			$("#image_select").click();
		},
		addImageRef: function() {
			// store the currently loaded image into the saved images container
			var $saved_img = $("<img/>");
			$saved_img.attr("src", $("#loaded_image").attr("src"));
			$("#saved_images").append($saved_img);
			
			var field_ref_list = this.get("fieldRefList");
			// iterate over all of the image snippets that reference
			// the image that was just uploaded, and a reference to
			// the image.
			for (var i = 0; i < field_ref_list.length; i++) {
				var $img_field = field_ref_list[i];
				$img_field.data("img_ref", $saved_img);
			}
			
			// reset the array of fields
			this.set("fieldRefList", []);
		},
		addSelection: function() {
			var ias = this.get('imgSelect');
			var reg = ias.getSelection();
			// check that a region is actually selected
			if (!(reg.width == 0 && reg.height == 0)) {
				// load the image into the dom
				var img_src = $("#loaded_image").attr('src');
				var $img_container = load_into_dom(img_src, reg.height, reg.width, -reg.y1, -reg.x1);				
				var controller = this;
				html2canvas($img_container, {   
					logging:true,
					onrendered : function(canvas) {
						var cropped_img_src = canvas.toDataURL("image/jpeg");			
						var $new_img_div = load_into_scan(cropped_img_src, reg.height, reg.width, reg.height, reg.width, -reg.y1, -reg.x1, 0, 0);
						$new_img_div.data('orig_img_name', $("#loaded_image").data('filename'));	
						
						// add the new image div to the list of fields which are referencing
						// the currently selected image
						controller.get("fieldRefList").pushObject($new_img_div);
						$("#processed_images").children().remove();										
					}
				});			
			}
		},
		deleteField: function() {
			var $curr_field = $(".selected_field");
			if ($curr_field.length != 0) {
				if ($curr_field.hasClass("img_div")) {
					var img_name = $curr_field.data("orig_img_name");
					var img_ref_count = 0;
					// check if other img_divs reference the same image
					$(".selected_page").children(".img_div").each(function() {
						if ($(this).data("orig_img_name") == img_name) {
							img_ref_count += 1;
						}
					});
					
					if (img_ref_count == 1) {
						// delete the image that is being referenced by the current 
						// field, since its the only field referencing the image
						$("#saved_images").children("img").each(function() {
							if ($(this).data("filename") == img_name) {
								$(this).remove();
								return;
							}
						});
					}
				}
			
				$curr_field.remove();
				// update view in the field properties sidebar
				ODKScan.FieldContainer.popObject();
				ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);
			}
		},
		createBox: function() {
			this.set('newFieldType', 'empty_box');
			ODKScan.FieldContainer.popObject();
			ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);		
			ODKScan.EmptyBoxContainer.pushObject(ODKScan.EmptyBoxView);
			$(".selected_field").removeClass("selected_field");
		},
		createCheckbox: function() {
			this.set('newFieldType', 'checkbox');
			ODKScan.FieldContainer.popObject();
			ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);		
			ODKScan.CheckboxContainer.pushObject(ODKScan.CheckboxView);	
			$(".selected_field").removeClass("selected_field");
		},
		createBubbles: function() {
			this.set('newFieldType', 'bubble');
			ODKScan.FieldContainer.popObject();
			ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);
			ODKScan.BubbleContainer.pushObject(ODKScan.BubblesView);	
			$(".selected_field").removeClass("selected_field");
		},
		createNumbers: function() {
			this.set('newFieldType', 'seg_num');
			ODKScan.FieldContainer.popObject();
			ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);
			ODKScan.SegNumContainer.pushObject(ODKScan.SegNumView);
			$(".selected_field").removeClass("selected_field");
		},
		createText: function() {
			this.set('newFieldType', 'text_box');
			ODKScan.FieldContainer.popObject();
			ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);			
			ODKScan.TextBoxContainer.pushObject(ODKScan.TextBoxView);
			$(".selected_field").removeClass("selected_field");
		},
		createFormattedNumber: function() {
			this.set('newFieldType', 'form_num');
			ODKScan.FieldContainer.popObject();
			ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);
			ODKScan.FormNumContainer.pushObject(ODKScan.FormNumView);
			$(".selected_field").removeClass("selected_field");
		},
		copyField: function() {
			if ($(".selected_field").length != 0) {
				var selected_field = $(".selected_field").data('obj');
				selected_field.copyField();		
				var $new_field = $(".selected_field");
				// change the name of the new field so it's not a 
				// duplicate of the original field's name
				$new_field.data('obj').name += "_copy";
				// load properties of the new field into
				// the properties sidebar
				$new_field.click();				
			}
		},
		copyImage: function() {
			if ($(".selected_field").hasClass('img_div')) {
				var $img_div = $(".selected_field");
				var $img = $img_div.children("img");
				load_into_scan($img.attr('src'), 
							$img_div.height(), 
							$img_div.width(), 
							$img.data('orig_height'), 
							$img.data('orig_width'), 
							$img.data('top'), 
							$img.data('left'), 
							0, 
							0);		
			}
		},
		newDoc: function() {
			if ($(".selected_page").children().length == 0) {
				$("#new_doc_dialog").dialog("open");
			} else {
				$("#save_check_dialog").dialog("open");
			}
		},
		newPage: function() {
			// cancel any currently selected image region
			var ias = this.get('imgSelect');
			ias.cancelSelection();
		
			var controller = this;
			$("#new_page_dialog").dialog("option", 
				"buttons", 
					[{text: "Ok", click: function() { 
						// create new page div
						$(".selected_page").removeClass("selected_page");
						var $new_page = $("<div/>").addClass("scan_page selected_page");
						$new_page.addClass($("#page_size").val());
						$("#page_container").append($new_page);	
						
						// deselect current page tab
						Ember.set(controller.get('selectedPageTab'), 'isActive', false);
						
						// create new page tab
						var new_page_num = controller.get('currPage') + 1;
						controller.set('currPage', new_page_num);
						var new_page_tab = {pageNum: new_page_num, isActive: true, pageDiv: $new_page};
						
						// store the new page tab in the controller
						controller.set("selectedPageTab", new_page_tab);						
						var page_arr = controller.get('pages');
						
						page_arr.pushObject(new_page_tab);
						$(this).dialog("close"); 
					}},{text: "Cancel", click: function() { 
						$(this).dialog("close"); 
					}}
				]
			);
			$("#new_page_dialog").dialog("open");
		},
		removePage: function() {
			// cancel any currently selected image region
			var ias = this.get('imgSelect');
			ias.cancelSelection();
		
			// removes the currently selected page tab			
			var controller = this;
			$("#remove_page_dialog").dialog("option", 
				"buttons", 
					[{text: "Ok", click: function() { 
						var page_arr = controller.get('pages');
						var selected_page = controller.get("selectedPageTab");
						for (var i = 0; i < page_arr.length; i++) {
							if (page_arr[i].pageNum == selected_page.pageNum) {
								page_arr[i].pageDiv.remove();
								page_arr.removeAt(i);								
								// make the first tab the currently
								// selected tab by default after a deletion
								controller.send('selectPageTab', page_arr[0]);
							}
						}
						$(this).dialog("close"); 
					}},{text: "Cancel", click: function() { 
						$(this).dialog("close"); 
					}}
				]
			);
			$("#remove_page_dialog").dialog("open");
		},
		selectPageTab: function(page) {
			// deselect current page tab
			Ember.set(this.get('selectedPageTab'), 'isActive', false);
			
			// select new page tab
			Ember.set(page, 'isActive', true);
			this.set('selectedPageTab', page);
		
			$(".selected_page").removeClass("selected_page");
			page.pageDiv.addClass("selected_page");
			// reset the view in the properties sidebar
			ODKScan.FieldContainer.popObject();
			ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);
			// unselect any selected field
			$(".selected_field").removeClass("selected_field");
		},
		loadDoc: function() {
			$("#load_dialog").dialog("open");
		},
		saveDoc: function() {
			/*	Saves metadata about all pages, fields (including all
				parameters that were used to make them) and images.
			*/						
			
			var zip = new JSZip();
			var pages = this.get('pages');		
			
			var curr_directory = "";
			for (var i = 0; i < pages.length; i++) {
				// make page visible, set Scan doc properties
				this.send('selectPageTab', pages[i]);							
				var $page_div = Ember.get(pages[i], 'pageDiv');	
				var savedDoc = {};
				savedDoc.doc_info = {};
				savedDoc.images = [];
				savedDoc.fields = [];
			
				// 'selected_page' class designation should not be
				// stored in the JSON output
				$page_div.removeClass("selected_page");
				
				// save metadata about the page
				savedDoc.doc_info.page_size = $(".selected_page").attr("class");
				
					// save metadata about all images
				$page_div.children(".img_div").each(function() {
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
					img_div.img_name = $(this).data('orig_img_name');					
					savedDoc.images.push(img_div);
				});
		
				/*	 create a new JSON object for each field */
				$page_div.children(".field").each(function() {
					var json = $(this).data("obj").saveJSON();
					savedDoc.fields.push(json);				
				});				
				var json_output = JSON.stringify(savedDoc, null, '\t');
				
				// create images directory, add all used images	
				zip.folder(curr_directory + "images/");
				$page_div.children(".img_div").each(function() {
					var img_name = $(this).data("orig_img_name");
					var search_res = zip.file(new RegExp(curr_directory + "images/" + img_name)); 
					if (search_res.length == 0) {
						// the image is not currently in the images/
						// folder, it needs to be added
						var img_base64 = $(this).data("img_ref").attr("src").split(",")[1];
						zip.file(curr_directory + "images/" + img_name, img_base64, {base64: true});
					}
				});
				
				zip.file(curr_directory + "page.json", json_output);
				curr_directory += "nextPage/";
			}
			
			var zip_contents = zip.generate();
			var scan_doc_zip = "data:application/zip;base64," + zip_contents;				
			$("#scan_json_link").attr('href', scan_doc_zip);				
			$("#save_dialog").dialog("open");
		},
		exportZIP: function() {
			// unselect any selected field (don't want it to be highlighted in the image output)
			$(".selected_field").removeClass("selected_field");
			
			/* Recursively create the file structure. */
			var zip = new JSZip();
			this.send('createZipFolder', this.get('pages'), 0, "", zip);
		},
		createZipFolder: function(pages, curr_index, curr_directory, zip) {
			if (curr_index == pages.length) { 
				// base case
				var content = zip.generate();
				var scanDoc = "data:application/zip;base64," + content;				
				$("#zip_link").attr('href', scanDoc);				
				$("#export_dialog").dialog("open");
				return; 
			} 
			var scanDoc = {};
				
			// make page visible, set Scan doc properties
			this.send('selectPageTab', pages[curr_index]);
			var $page_div = Ember.get(pages[curr_index], 'pageDiv');	
			scanDoc.height = $page_div.height();
			scanDoc.width = $page_div.width();
			scanDoc.fields = [];
			
			// compute and get the JSON for each field
			var all_fields = $page_div.children(".field");			
			for (var j = 0; j < all_fields.length; j++) {
				var $curr_field = $(all_fields[j]);				
				var fieldObj = $curr_field.data("obj");					
				scanDoc.fields.push(fieldObj.getFieldJSON());
			}
			var json_output = JSON.stringify(scanDoc, null, '\t');
			
			var controller = this;
			html2canvas($(".selected_page"), {   
				logging:true,
				onrendered : function(canvas) {
					var img_src = canvas.toDataURL("image/jpeg");					
					/* 	Need to extract the base64 from the image source.
						img_src is in the form: data:image/jpeg;base64,...
						Where '...' is the actual base64.
					*/
					var img_base64 = img_src.split(",")[1];
					
					// add img and json to zip file
					zip.file(curr_directory + "form.jpg", img_base64, {base64: true});
					zip.file(curr_directory + "template.json", json_output);
					controller.send('createZipFolder', pages, curr_index + 1, curr_directory + "nextPage/", zip);
				}
			});				
		}
	}
});