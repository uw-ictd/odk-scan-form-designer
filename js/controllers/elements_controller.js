ODKScan.ElementsController = Ember.ArrayController.extend({
	isImageEditing: false,	// toggles app between field editing and image editing mode
	imgSelect: null,		// imgAreaSelect object used to crop images
	currPage: 1,			// current page tab number
	pageStyle: "letter_portrait",	// the page style used by pages in the current Scan document
	selectedPageTab: null,	// metadata about the currently selected tab (number, active/non-active, DOM reference)
	pages: null,			// list of JSON objects containing page tab metadata
	images: {},				// JSON containing references to image metadata (reference count, image src)
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
			
			var $new_page = $("<div/>");
			// NOTE: the Scan document is set to letter_portrait by default
			$new_page.addClass("scan_page selected_page");
			$new_page.addClass(controller.get("pageStyle"));
			
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
		openPageStyleDialog: function() {
			$("#page_style_dialog").dialog("open");
		},
		setPageStyle: function() {		
			// delete all fields
			$(this.get("pages")).each(function(index, page) {
				page.pageDiv.children().remove();
			});
		
			this.set("pageStyle", $("#page_size").val());
			
			// remove current page style from all pages
			var $all_pages = $(".scan_page");
			$all_pages.removeClass(); 
			$all_pages.addClass("scan_page");
			$all_pages.addClass(this.get("pageStyle"));
			
			// re-select the current page
			this.send("selectPageTab", this.get("selectedPageTab"));
			$("#page_style_dialog").dialog("close");
		},
		cancelPageStyleDiague: function() {
			$("#page_style_dialog").dialog("close");
		},
		selectImage: function() {	
			// cancel any currently selected image region
			var ias = this.get('imgSelect');
			ias.cancelSelection();
			
			// reset any previously chosen files
			$("#image_select").val("");
			
			/* 	NOTE: Pressing 'Select Image' triggers a hidden html 
				file-input button #image_select. The button is hidden
				in order to override its appearance. 
			*/
			$("#image_select").click();
		},
		addImage: function(image_name, img_src) {
			// add image_name to the images field
			var images = this.get('images');
			if (!images[image_name]) {
				images[image_name] = {ref_count: 0, data: img_src}
			}
		},
		addImageRef: function(image_name, img_src) {
			this.send("addImage", image_name, img_src);
		
			// add a new reference to an image
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
			// check that a region is currently selected
			if (!(reg.width == 0 && reg.height == 0)) {
				// load the image into the dom
				var img_src = $("#loaded_image").attr('src');
				var image = {img_src: img_src, 
									img_height: reg.height, 
									img_width: reg.width, 
									top_pos: -reg.y1,
									left_pos: -reg.x1};					
				var $img_container = crop_image(image);								
				
				// add the selected image region
				// to the selected page
				var controller = this;
				html2canvas($img_container, {   
					logging:true,
					onrendered : function(canvas) {
						var cropped_img_src = canvas.toDataURL("image/jpeg");			
						var cropped_image = {img_src: cropped_img_src,
											img_height: reg.height,
											img_width: reg.width,
											orig_height: reg.height,
											orig_width: reg.width,
											img_top: -reg.y1,
											img_left: -reg.x1,
											div_top: 0,
											div_left: 0};
						var $new_img_div = image_to_field(cropped_image);
						// store reference to the original image name						
						$new_img_div.data('img_name', $("#loaded_image").data('filename'));	
						// update the image references
						controller.send("addImageRef", $("#loaded_image").data('filename'), $("#loaded_image").attr("src"));
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
				/*
				var $new_img_div = load_into_scan($img.attr('src'), 
							$img_div.height(), 
							$img_div.width(), 
							$img.data('orig_height'), 
							$img.data('orig_width'), 
							$img.data('top'), 
							$img.data('left'), 
							0, 
							0);		
				*/
				var image = {img_src: $img.attr('src'),
							img_height: $img_div.height(),
							img_width: $img_div.width(),
							orig_height: $img.data('orig_height'),
							orig_width: $img.data('orig_width'),
							img_top: $img.data('top'),
							img_left: $img.data('left'),
							div_top: 0,
							div_left: 0};
				var $new_img_div = image_to_field(image);
				var img_name = $(".selected_field").data("img_name");
				// store reference to the original image name	
				$new_img_div.data("img_name", img_name);
				
				// update the image references
				this.send("addImageRef", img_name);
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
				$new_page.addClass(this.get("pageStyle"));
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
		openRemovePageDialog: function() {
			$("#remove_page_dialog").dialog("open");
		},
		cancelPageRemove: function() {
			$("#remove_page_dialog").dialog("close");
		},
		removePage: function() {
			// cancel any currently selected image region
			var ias = this.get('imgSelect');
			ias.cancelSelection();
		
			var page_arr = this.get('pages');
			var selected_page = this.get("selectedPageTab");
			page_arr.removeObject(selected_page);
			
			if (page_arr.length > 0) {
				// set the first page to be the selected page
				// after a page removal
				this.send('selectPageTab', page_arr[0]); 
			}
			
			$("#remove_page_dialog").dialog("close");
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
		openLoadDialog: function() {
			// reset any previously uploaded file
			$("#uploaded_zip").val("");
			$("#load_dialog").dialog("open");
		},
		cancelLoad: function() {
			$("#load_dialog").dialog("close");
		},
		loadImages: function(images, curr_index, curr_directory, zip) {
			// loads all image snippets into the current page
			if (curr_index == images.length) {
				// base case
				// remove all temporary image snippets that were
				// loaded into the DOM, load the next page
				$("#processed_images").children().remove();
				this.send("loadPage", curr_directory + "nextPage/", zip);
			} else { 
				// recursive case
				var img_json = images[curr_index];
				
				// load the image source
				var img_data = zip.file("images/" + img_json.img_name);
				var img_src = "data:image/jpeg;base64," + btoa(img_data.asBinary());

				var image = {img_src: img_src, 
							img_height: img_json.orig_height, 
							img_width: img_json.orig_width, 
							top_pos: img_json.img_top,
							left_pos: img_json.img_left};
				
				// load the image into the dom
				var $img_container = crop_image(image);		
				var controller = this;
				html2canvas($img_container, {   
					logging:true,
					onrendered : function(canvas) {												
						var cropped_img_src = canvas.toDataURL("image/jpeg");								
						var cropped_image = {img_src: cropped_img_src,
									img_height: img_json.height,
									img_width: img_json.width,
									orig_height: img_json.orig_height,
									orig_width: img_json.orig_width,
									img_top: img_json.img_top,
									img_left: img_json.img_left,
									div_top: img_json.div_top,
									div_left: img_json.div_left};
						var $new_img_div = image_to_field(cropped_image);
						
						// store reference to the original image name	
						$new_img_div.data("img_name", img_json.img_name);
						// store a reference to the image that was loaded
						controller.send("addImageRef", img_json.img_name, img_src);
						controller.send("loadImages", images, curr_index + 1, curr_directory, zip);
					}
				});							
			}
		},
		loadPage: function(curr_directory, zip) {
			// loads the next page in the zip file
			if (zip.folder(new RegExp(curr_directory)).length == 0) {
				// base case, there's no additional nextPage subdirectories
				return; 
			} else {
				// recursive case, load the next page
				var page_json = JSON.parse(zip.file(new RegExp(curr_directory + "page.json"))[0].asText());
				// create a new page
				this.send("newPage", page_json.doc_info.page_size);		

				// add all of the fields to the page
				var fields = page_json.fields;
				for (var i = 0; i < fields.length; i++) {								
					var f_json = fields[i];
					if (f_json.field_type == 'checkbox') {
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
				// load all of the images for the current page
				this.send("loadImages", page_json.images, 0, curr_directory, zip);										
			}																				
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
		
				// begin loading pages starting from the root directory
				// of the loaded zip file
				this.send("loadPage", "", zip);
			}
			
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