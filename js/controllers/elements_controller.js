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
			var ias = $('#image_area img').imgAreaSelect({
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
			/* 	NOTE: Pressing 'Select Image' triggers a hidden html 
				file input button #image_select. The button is hidden
				in order to override its appearance. 
			*/
			$("#image_select").click();
		},
		addSelection: function() {
			var ias = this.get('imgSelect');
			var reg = ias.getSelection();
			// check that a region is actually selected
			if (!(reg.width == 0 && reg.height == 0)) {
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
		deleteField: function() {
			var $curr_field = $(".selected_field");
			if ($curr_field.length != 0) {
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
			console.log("adding new page!");			
			// create new page div
			$(".selected_page").removeClass("selected_page");
			var $new_page = $("<div/>").addClass("scan_page selected_page letter_portrait");
			$("#page_container").append($new_page);	
			
			// deselect current page tab
			Ember.set(this.get('selectedPageTab'), 'isActive', false);
			
			// create new page tab
			var new_page_num = this.get('currPage') + 1;
			this.set('currPage', new_page_num);
			var new_page_tab = {pageNum: new_page_num, isActive: true, pageDiv: $new_page};
			this.set("selectedPageTab", new_page_tab);
			var page_arr = this.get('pages');
			page_arr.pushObject(new_page_tab);					
			
			// TODO: add support for dialog menu?
			//$("#new_page_dialog").dialog("open");
		},
		removePage: function() {
			var page_arr = this.get('pages');
			var selected_page = this.get("selectedPageTab");
			for (var i = 0; i < page_arr.length; i++) {
				if (page_arr[i].pageNum == selected_page.pageNum) {
					if (page_arr.length > 0) {
						// make the first tab the currently
						// selected tab by default after a deletion
						this.send('selectPageTab', page_arr[0]);
					}
					page_arr[i].pageDiv.remove();
					page_arr.removeAt(i);
				}
			}
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
			/*	Need to save metadata about all fields (including all
				parameters that were used to make them) and images.
			*/			
			var savedDoc = {};
			savedDoc.doc_info = {};
			savedDoc.images = [];
			savedDoc.fields = [];
			
			// save metadata about the page
			savedDoc.doc_info.page_size = $(".selected_page").attr("class");
			
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
			$("#scan_json_link").attr('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(json_output));	
			$("#save_dialog").dialog("open");
		},
		exportZIP: function() {
			// create a zip file for the form image and json
			var zip = new JSZip();
			
			var scanDoc = {};

			// set Scan doc properties
			scanDoc.height = $(".selected_page").height();
			scanDoc.width = $(".selected_page").width();
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