ODKScan.ElementsController = Ember.ArrayController.extend({
	isImageEditing: false,	// toggles app between field editing and image editing mode
	imgSelect: null,		// imgAreaSelect object used to crop images
	currPage: 1,			// current page tab number
	pageStyle: "letter_portrait",	// the page style used by pages in the current Scan document
	selectedPageTab: null,	// metadata about the currently selected page tab (number, active/non-active, DOM reference)
	pages: null,			// list of JSON objects containing page tab metadata
	images: {},				// JSON containing references to image metadata (reference count, image src)
	selectedImageTab: null,	// metadata about the currently selected image tab (name, data, reference count)
	imageList: function() {	// the image tab list
		console.log("evaluating imageList");
		var images = this.get("images");
		var image_list = [];
		for (img in images) {
			image_list.push(images[img]);
		}
		console.log(image_list);
		return image_list;
	}.property(),
	defaultImages: function() {
		// div_top and top_left are both set by addDefaultImages.
		// These values depend on the size of the page they are 
		// added to.
		
		var images = {};
		images.top_left = {img_name: "form",
							img_src: "default_images/top_left.jpg",
							img_height: 67,
							img_width: 197,
							orig_height: 67,
							orig_width: 197,
							img_top: 0,
							img_left: 0,};
		images.top_right = {img_name: "form",
							img_src: "default_images/top_right.jpg",
							img_height: 56,
							img_width: 260,
							orig_height: 56,
							orig_width: 260,
							img_top: 0,
							img_left: 568};						
		images.bottom_left = {img_name: "form",
							img_src: "default_images/bottom_left.jpg",
							img_height: 89,
							img_width: 92,
							orig_height: 89,
							orig_width: 92,
							img_top: 0,
							img_left: 998};		
		images.bottom_right = {img_name: "form",
							img_src: "default_images/bottom_right.jpg",
							img_height: 71,
							img_width: 114,
							orig_height: 71,
							orig_width: 114,
							img_top: 1014,
							img_left: 718};														
		return images;
	}.property(),
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
			
			// code snippet from 
			// http://stackoverflow.com/questions/6150289/how-to-convert-image-into-base64-string-using-javascript
			var canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d'),
			img = new Image;
			img.crossOrigin = 'Anonymous';
			img.src = "default_images/form.jpg";
			img.onload = function(){
				canvas.height = img.height;
				canvas.width = img.width;
				ctx.drawImage(img,0,0);
				var dataURL = canvas.toDataURL('image/jpeg');
				controller.set("defaultFormSrc", dataURL);
				// add default images to page
				controller.send("addDefaultImages");
				controller.notifyPropertyChange("imageList");			
				canvas = null; 
			};			
		});
	},
	actions: {
		enableImageEdit: function() {
			$("#prop_sidebar").hide("slow");
			
			// unselect the current image tab
			var currSelectedImageTab = this.get("selectedImageTab");
			if (currSelectedImageTab != null) {
				Ember.set(currSelectedImageTab, "isActive", false);
			}
			
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
			
			// add default images
			this.send("addDefaultImages");
		},
		cancelPageStyleDialog: function() {
			$("#page_style_dialog").dialog("close");
		},
		addDefaultImages: function() {			
			var images = this.get("defaultImages");
			// calculate the positions for each respective 
			// image snippet within the current page
			images.top_left.div_top = 0;
			images.top_left.div_left = 0;
			
			images.top_right.div_top = 0;
			images.top_right.div_left = $(".selected_page").width() - images.top_right.img_width;
			
			images.bottom_left.div_top = $(".selected_page").height() - images.bottom_left.img_height;
			images.bottom_left.div_left = 0;
			
			images.bottom_right.div_top = $(".selected_page").height() - images.bottom_right.img_height;
			images.bottom_right.div_left = $(".selected_page").width() - images.bottom_right.img_width;
			
			image_to_field(images.top_left);
			image_to_field(images.top_right);
			image_to_field(images.bottom_left);
			image_to_field(images.bottom_right);
			
			// update image ref count of the form
			var form_src = this.get("defaultFormSrc");
			this.send("addImageRef", "form", form_src);
			this.send("addImageRef", "form", form_src);
			this.send("addImageRef", "form", form_src);
			this.send("addImageRef", "form", form_src);
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
		selectImageTab: function(image) {
			// cancel any currently selected image region
			var ias = this.get('imgSelect');
			ias.cancelSelection();
			
			// unselect the current image tab
			var currSelectedImageTab = this.get("selectedImageTab");
			if (currSelectedImageTab != null) {
				Ember.set(currSelectedImageTab, "isActive", false);
			}
			
			// select the new image tab
			Ember.set(image, "isActive", true);
			this.set("selectedImageTab", image);
		
			// set the selected image
			$("#loaded_image").attr("src", image.data);	
		},
		openImageTabDialog: function() {
			$("#itab_remove_dialog").dialog("open");
		}, 
		removeImageTab: function() {
			if($("#remove_itab_cb").prop("checked")) {
				// delete all referenced image snippets
				var img_name = this.get("selectedImageTab").name;
				$(".img_div").filter(function() { return $(this).data("img_name") == img_name}).remove();
				
				delete this.get('images')[this.get("selectedImageTab").name];	

				// notify the image tabs to update
				this.notifyPropertyChange("imageList");				
			} else {
				// delete the selected image tab
				this.get("imageList").removeObject(this.get("selectedImageTab"));
				this.set("selectedImageTab", null);
			}		
				
			$("#loaded_image").attr("src", null);
			this.set("selectedImageTab", null);				
			$("#itab_remove_dialog").dialog("close");
		},
		addImage: function(image_name, img_src) {
			// add image_name to the images field
			var images = this.get('images');
			if (!images[image_name]) {
				// unselect the current image tab
				var currSelectedImageTab = this.get("selectedImageTab");
				if (currSelectedImageTab != null) {
					Ember.set(currSelectedImageTab, "isActive", false);
				}
				
				// create, select new image tab
				var newImageTab = {ref_count: 0, isActive: true, data: img_src, name: image_name};	
				this.set("selectedImageTab", newImageTab);
				Ember.set(images, image_name, newImageTab);
				
				// notify the image tabs to update
				this.notifyPropertyChange("imageList");
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
				// notify the image tabs to update
				this.notifyPropertyChange("imageList");
			}
		},
		addSelection: function() {
			var ias = this.get('imgSelect');
			var reg = ias.getSelection();
			// check that a region is currently selected
			if (!(reg.width == 0 && reg.height == 0)) {
				console.log(reg);
			
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
						var cropped_image = {img_name: $("#loaded_image").data('filename').split(".")[0],
											img_src: cropped_img_src,
											img_height: reg.height,
											img_width: reg.width,
											orig_height: reg.height,
											orig_width: reg.width,
											img_top: -reg.y1,
											img_left: -reg.x1,
											div_top: 0,
											div_left: 0};
						var $new_img_div = image_to_field(cropped_image);						
						// update the image references
						controller.send("addImageRef", $("#loaded_image").data('filename').split(".")[0], $("#loaded_image").attr("src"));
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
			if ($(".selected_field").length != 0 && !$(".selected_field").hasClass("img_div")) {
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
				
				var image = {img_name: $(".selected_field").data("img_name"),
							img_src: $img.attr('src'),
							img_height: $img_div.height(),
							img_width: $img_div.width(),
							orig_height: $img.data('orig_height'),
							orig_width: $img.data('orig_width'),
							img_top: $img.data('top'),
							img_left: $img.data('left'),
							div_top: 0,
							div_left: 0};
				var $new_img_div = image_to_field(image);		
				
				// update the image references
				this.send("addImageRef", img_name);
			}
		},
		newDoc: function() {
			var $all_pages = $(".scan_page");
			if ($all_pages.children(".field").length == 0 && $all_pages.children(".img_div").length == 0) {
				$("#new_doc_dialog").dialog("open");
			} else {
				$("#save_check_dialog").dialog("open");
			}
		},
		newPage: function(page_size, load_from_zip) {
			// cancel any currently selected image region
			var ias = this.get('imgSelect');
			ias.cancelSelection();

			// create new page div
			$(".selected_page").removeClass("selected_page");
			var $new_page = $("<div/>");
			$new_page.addClass("scan_page selected_page");
			
			// set page style	
			if (page_size) { // check if passed a page size argument
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
			
			if (!load_from_zip) {
				// add default images
				this.send("addDefaultImages");
			}
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
			
			// remove all image references from the deleted page	
			var controller = this;
			$(".selected_page .img_div").each(function() {
				controller.send("removeImageRef", $(this).data("img_name"));
			});
		
			var page_arr = this.get('pages');
			var selected_page = this.get("selectedPageTab");
			selected_page.pageDiv.remove();
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
				// recursive case, load next image for the page
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
						var cropped_image = {img_name: img_json.img_name,
									img_src: cropped_img_src,
									img_height: img_json.height,
									img_width: img_json.width,
									orig_height: img_json.orig_height,
									orig_width: img_json.orig_width,
									img_top: img_json.img_top,
									img_left: img_json.img_left,
									div_top: img_json.div_top,
									div_left: img_json.div_left};
						var $new_img_div = image_to_field(cropped_image);
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
				
				// load the image tabs
				var imageList = [];
				var itab_files = zip.folder("image_tabs").file(new RegExp(".*"));
				for (var i = 0; i < itab_files.length; i++) {
					var file = itab_files[i];
					var itab_json = JSON.parse(file.asText());
					imageList.push(itab_json);
				}				
				
				this.set("imageList", imageList);
				
				// unselect the current image tab
				var currSelectedImageTab = this.get("selectedImageTab");
				if (currSelectedImageTab != null) {
					Ember.set(currSelectedImageTab, "isActive", false);
				}
			} else {
				// recursive case, load the next page
				var page_json = JSON.parse(zip.file(new RegExp(curr_directory + "page.json"))[0].asText());
				// create a new page
				this.send("newPage", page_json.doc_info.page_size, true);		

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
			// delete all current pages, fields
			this.set("currPage", 0);
			this.set("pages", []);
			$(".img_div").remove();
			$(".field").remove();
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
			
			// save all image tabs, add them to top-level image_tabs/ directory
			var itab_folder = zip.folder("image_tabs");
			var image_tabs = this.get("imageList");
			for (var i = 0; i < image_tabs.length; i++) {
				var tab = image_tabs[i];
				tab.isActive = false; // make sure no tab is selected
				itab_folder.file(tab.name, JSON.stringify(tab));
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
			
			// scale up the html element sizes
			$("html").css("font-size", "200%")
			this.send('createZipFolder', this.get('pages'), 0, "", zip);			
		},
		createZipFolder: function(pages, curr_index, curr_directory, zip) {
			if (curr_index == pages.length) { 
				// base case
				var content = zip.generate();
				var scanDoc = "data:application/zip;base64," + content;				
				$("#zip_link").attr('href', scanDoc);				
				$("#export_dialog").dialog("open");
				$("html").css("font-size", "62.5%")
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
				logging: true,
				onrendered : function(canvas) {					
					var img_src = canvas.toDataURL("image/jpeg");		
					console.log(img_src);
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