/* Dialog menu initializations are provided below */
$(document).ready(function() {			
	$("#new_doc_dialog").dialog({
		autoOpen: false,
		modal: true,
		buttons: {
			"Ok": function() {
				console.log("making new document...");
				$("#scan_doc").children().remove();
				$("#scan_doc").removeClass();
				$("#scan_doc").addClass($("#doc_size").val());
				ODKScan.FieldContainer.popObject();
				ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);
			
				$("#new_doc_dialog").dialog("close");
			},
			"Cancel": function() {
				$("#new_doc_dialog").dialog("close");
			}
		}
	});			
	
	$("#save_check_dialog").dialog({
		autoOpen: false,
		modal: true,
		buttons: {
			"Save": function() {
				$("#save_dialog").dialog("open");
				$("#save_check_dialog").dialog("close");
			},
			"Don't Save": function() {
				$("#new_doc_dialog").dialog("open");
				$("#save_check_dialog").dialog("close");
			},
			"Cancel": function() {						
				$("#save_check_dialog").dialog("close");
			}
		}
	});	
	
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
						
						$("#scan_doc").addClass(scanDoc.doc_info.page_size);
						
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
									var cropped_img_src = canvas.toDataURL("image/jpeg"); 
									var img_json = img_pos[img_index]; // get image position/size information					
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
		open: function() {
			ODKScan.FieldContainer.popObject();
			ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);		
			ODKScan.EmptyBoxContainer.pushObject(ODKScan.EmptyBoxView);
			$(".selected_field").removeClass("selected_field");
		},
		autoOpen: false,
		modal: true,
		buttons: {
			"Ok": function() {
				if (is_name_unique()) {	
					var new_box = new EmptyBox();
					new_box.constructBox();
					
					ODKScan.EmptyBoxContainer.popObject();
					ODKScan.FieldContainer.popObject();
					ODKScan.FieldContainer.pushObject(ODKScan.EmptyBoxView);						
					$("#box_dialog").dialog("close");
				} else {
					alert($("#field_name").val() + " is a duplicate field name.");
				}
			},
			"Cancel": function() {
				ODKScan.EmptyBoxContainer.popObject();
				$("#box_dialog").dialog("close");
			}
		}
	});
		
	$("#checkbox_dialog").dialog({
		open: function() {
			ODKScan.FieldContainer.popObject();
			ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);		
			ODKScan.CheckboxContainer.pushObject(ODKScan.CheckboxView);	
			$(".selected_field").removeClass("selected_field");
		},
		autoOpen: false,
		modal: true,
		buttons: {
			"Ok": function() {
				console.log("making checkboxes...");		
				if (is_name_unique()) {				
					var cbField = new CheckboxField();
					cbField.constructGrid();							

					ODKScan.CheckboxContainer.popObject();
					ODKScan.FieldContainer.popObject();
					ODKScan.FieldContainer.pushObject(ODKScan.CheckboxView);	
					$("#checkbox_dialog").dialog("close");
				} else {
					alert($("#field_name").val() + " is a duplicate field name.");
				}
			},
			"Cancel": function() {
				ODKScan.CheckboxContainer.popObject();
				$("#checkbox_dialog").dialog("close");
			}
		}
	});			
	
	$("#bubble_dialog").dialog({
		open: function() {
			ODKScan.FieldContainer.popObject();
			ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);
			ODKScan.BubbleContainer.pushObject(ODKScan.BubblesView);	
			$(".selected_field").removeClass("selected_field");
		},	
		autoOpen: false,
		modal: true,
		buttons: {
			"Ok": function() {
				if (is_name_unique()) {		
					var bubbField = new BubbleField();
					bubbField.constructGrid();		

					ODKScan.BubbleContainer.popObject();
					ODKScan.FieldContainer.popObject();
					ODKScan.FieldContainer.pushObject(ODKScan.BubblesView);										
					$("#bubble_dialog").dialog("close");
				} else {
					alert($("#field_name").val() + " is a duplicate field name.");
				}
			},
			"Cancel": function() {
				ODKScan.BubbleContainer.popObject();
				$("#bubble_dialog").dialog("close");
			}
		}
	});

	$("#seg_num_dialog").dialog({
		open: function() {
			ODKScan.FieldContainer.popObject();
			ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);
			ODKScan.SegNumContainer.pushObject(ODKScan.SegNumView);
			$(".selected_field").removeClass("selected_field");
		},
		autoOpen: false,
		modal: true,
		buttons: {
			"Ok": function() {
				if (is_name_unique()) {	
					var numField = new SegNumField();
					numField.constructGrid();
					
					ODKScan.SegNumContainer.popObject();
					ODKScan.FieldContainer.popObject();
					ODKScan.FieldContainer.pushObject(ODKScan.SegNumView);									
					$("#seg_num_dialog").dialog("close");
				} else {
					alert($("#field_name").val() + " is a duplicate field name.");
				}
			},
			"Cancel": function() {
				ODKScan.SegNumContainer.popObject();
				$("#seg_num_dialog").dialog("close");
			}
		}
	});		

	$("#text_dialog").dialog({
		open: function() {
			ODKScan.FieldContainer.popObject();
			ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);		
			ODKScan.TextBoxContainer.pushObject(ODKScan.TextBoxView);
			$(".selected_field").removeClass("selected_field");
		},
		autoOpen: false,
		modal: true,
		buttons: {
			"Ok": function() {
				if (is_name_unique()) {		
					var text_box = new TextBox();
					text_box.constructBox();
					
					ODKScan.TextBoxContainer.popObject();
					ODKScan.FieldContainer.popObject();
					ODKScan.FieldContainer.pushObject(ODKScan.TextBoxView);					
					$("#text_dialog").dialog("close");
				} else {
					alert($("#field_name").val() + " is a duplicate field name.");
				}
			},
			"Cancel": function() {
				ODKScan.TextBoxContainer.popObject();
				$("#text_dialog").dialog("close");
			}
		}
	});			
	
	$("#form_num_dialog").dialog({
		open: function() {
			ODKScan.FieldContainer.popObject();
			ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);		
			ODKScan.FormNumContainer.pushObject(ODKScan.FormNumView);
			$(".selected_field").removeClass("selected_field");
		},
		autoOpen: false,
		modal: true,
		buttons: {
			"Ok": function() {	
				if (is_name_unique()) {
					var formNumField = new FormNumField();
					formNumField.constructGrid();		
					
					ODKScan.FormNumContainer.popObject();
					ODKScan.FieldContainer.popObject();
					ODKScan.FieldContainer.pushObject(ODKScan.FormNumView);						
					$("#form_num_dialog").dialog("close");
				} else {
					alert($("#field_name").val() + " is a duplicate field name.");
				}
			},
			"Cancel": function() {
				ODKScan.FormNumContainer.popObject();
				$("#form_num_dialog").dialog("close");
			}
		}
	});			
});