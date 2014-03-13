ODKScan.ElementsController = Ember.ArrayController.extend({
	hasBorder: true,
	isImageEditing: false,
	imgSelect: null,
	currPage: null,
	selectedPageNum: null,
	pages: null,
	images: {},
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
			// cancel any currently selected image region
			var ias = this.get('imgSelect');
			ias.cancelSelection();
			
			/* 	NOTE: Pressing 'Select Image' triggers a hidden html 
				file input button #image_select. The button is hidden
				in order to override its appearance. 
			*/
			$("#image_select").click();
		},
		addImage: function(image_name) {
			// store the currently loaded image into the 'images' field
			var images = this.get('images');
			if (!images[image_name]) {
				images[image_name] = 
					{ref_count: 0, data: $("#loaded_image").attr("src")}
			}
		},
		addImageRef: function(image_name) {
			// add a new reference to an image
			if (!(image_name in this.get('images'))) {
				this.send("addImage", image_name);
			}
			
			var image = this.get('images')[image_name];
			image.ref_count += 1;
		},
		removeImageRef: function(image_name) {
			// remove a reference to an image
			var image = this.get('images')[image_name];
			image.ref_count -= 1;
			if (image.ref_count == 0) {
				// no more image snippets are referencing this
				// image, it can be deleted from the controller
				delete this.get('images')[image_name];
			}
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
						// load the image snippet into the currently selected page
						var cropped_img_src = canvas.toDataURL("image/jpeg");			
						var $new_img_div = load_into_scan(cropped_img_src, reg.height, reg.width, reg.height, reg.width, -reg.y1, -reg.x1, 0, 0);
						$new_img_div.data('img_name', $("#loaded_image").data('filename'));	
						// update the image references
						controller.send("addImageRef", $("#loaded_image").data('filename'));
						$("#processed_images").children().remove();										
					}
				});			
			}
		},
		deleteField: function() {
			var $curr_field = $(".selected_field");
			if ($curr_field.length != 0) {
				if ($curr_field.hasClass("img_div")) {
					// decrement the image reference count
					this.send("removeImageRef", $curr_field.data("img_name"));
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
		newPage: function(page_size) {
			// cancel any currently selected image region
			var ias = this.get('imgSelect');
			ias.cancelSelection();

			// create new page div
			$(".selected_page").removeClass("selected_page");
			var $new_page = $("<div/>");
			$new_page.addClass("scan_page selected_page");
			
			if (page_size) {
				// check if a page size was provided
				$new_page.addClass(page_size);
			} else {
				// use the current page size
				$new_page.addClass("letter_portrait");
			}
			
			$new_page.addClass($("#page_size").val());
			$("#page_container").append($new_page);	
			
			// deselect current page tab
			Ember.set(this.get('selectedPageTab'), 'isActive', false);
			
			// create new page tab
			var new_page_num = this.get('currPage') + 1;
			this.set('currPage', new_page_num);
			var new_page_tab = {pageNum: new_page_num, isActive: true, pageDiv: $new_page};
			
			// store the new page tab in the controller
			this.set("selectedPageTab", new_page_tab);						
			var page_arr = this.get('pages');
			
			page_arr.pushObject(new_page_tab);
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
			// cancel any currently selected image region
			var ias = this.get('imgSelect');
			ias.cancelSelection();
		
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
		cancelLoad: function() {
			$("#load_dialog").dialog("close");
		},
		loadZip: function() {
			// delete all current pages
			this.set("currPage", 0);
			this.set("pages", []);
			Ember.set(this.get('selectedPageTab'), 'isActive', false);

			if (!$("#uploaded_zip").data("zip")) {
				alert("Please choose a zip file to load.");
			} else {							
				// unzip the zipped file
				var zip = new JSZip();
				
				/* 	Need to extract the base64 from the zip file string.
					the string is in the form: "data:application/x-zip-compressed;base64,..."
					Where '...' is the actual base64.
				*/
				zip.load($("#uploaded_zip").data("zip").split(",")[1], {base64: true});

				// recursive function used to load images
				var load_images = function(images, curr_index, curr_directory) {
					if (curr_index == images.length) {
						// base case
						load_pages(curr_directory + "nextPage/");
						return;
					} else { 
						// recursive case
						var img_json = images[curr_index];
						
						// load the image source
						var img_data = zip.file("images/" + img_json.img_name);
						var img_src = "data:image/jpeg;base64," + btoa(img_data.asBinary());

						// load the image into the dom
						var $img_container = load_into_dom(img_src, 
												img_json.orig_height,
												img_json.orig_width,
												img_json.img_top,
												img_json.img_left);												

						html2canvas($img_container, {   
							logging:true,
							onrendered : function(canvas) {												
								var cropped_img_src = canvas.toDataURL("image/jpeg"); 					
								load_into_scan(cropped_img_src, 
											img_json.height, 
											img_json.width, 
											img_json.orig_height,
											img_json.orig_width,
											img_json.img_top, 
											img_json.img_left, 
											img_json.div_top, 
											img_json.div_left);											
								load_images(images, curr_index + 1, curr_directory);
							}
						});							
					}
				}
				
				var controller = this;
				var load_pages = function(curr_directory) {
					if (zip.folder(new RegExp(curr_directory)).length == 0) {
						$("#processed_images").remove();
						return; // base case
					} else {
						// recursive case
						var page_json = JSON.parse(zip.file(new RegExp(curr_directory + "page.json"))[0].asText());
						console.log(JSON.stringify(page_json, null, "\t"));
						// create a new page
						controller.send("newPage", page_json.doc_info.page_size);		

						// add all of the fields to the page
						var fields = page_json.fields;
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
						// load all of the images
						load_images(page_json.images, 0, curr_directory);										
					}							
				}													
			}
			// begin loading pages starting from the root directory
			// of the loaded zip file
			load_pages("^");
		
			$("#load_dialog").dialog("close");
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
				savedDoc.doc_info.page_size = $page_div.attr("class");
				
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
					img_div.img_name = $(this).data('img_name');					
					savedDoc.images.push(img_div);
				});
		
				/*	 create a new JSON object for each field */
				$page_div.children(".field").each(function() {
					var json = $(this).data("obj").saveJSON();
					savedDoc.fields.push(json);				
				});				
				var json_output = JSON.stringify(savedDoc, null, '\t');												
				zip.file(curr_directory + "page.json", json_output);				
				curr_directory += "nextPage/";
			}		
			
			// add all images to the top-level images/ directory
			var images = this.get("images");
			for (image_name in images) {
				var img_info = images[image_name];
				if (img_info.ref_count > 0) {
					var img_base64 = img_info.data.split(",")[1];
					zip.file("images/" + image_name, img_base64, {base64: true});
				}
			}
			
			// reset the current page tab to the first page
			this.send("selectPageTab", pages[0]);
			
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