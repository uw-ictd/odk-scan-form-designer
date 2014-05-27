$(window).bind('beforeunload', function(){ return 'You are about to leave the ODK Scan application.'});

$(document).ready(function() {		
	/* General page setup */
	
	// set default view in properties sidebar
	ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);
	
	$("#update_prop").click(function() {
		if ($(".selected_field").length != 0) {
			if (is_name_valid()) {
				var $orig_field = $(".selected_field");
				var $field_parent = $orig_field.parent();
				
				// remove selected field from group
				if ($field_parent.hasClass("field_group")) {
					var $field_group = $field_parent.data("obj");
					
					// store positions of group and selected field
					var orig_left = parseFloat($orig_field.css("left"));
					var orig_top = parseFloat($orig_field.css("top"));
					var group_left = parseFloat($field_parent.css("left"));
					var group_top = parseFloat($field_parent.css("top"));
					
					// remove the selected field from the group, otherwise
					// it will be added twice to the new group
					$field_group.removeSelected();
					var $grouped_fields = $field_group.ungroupFields();
					
					// create a new updated field, delete the old one
					$(".selected_field").data("obj").updateProperties();
					$orig_field.remove();	
					
					// add the selected field back to the group
					$grouped_fields = $grouped_fields.add($(".selected_field")[0]);
					// offset the field position of the selected field
					$(".selected_field").css("left", rem(orig_left + group_left));
					$(".selected_field").css("top", rem(orig_top + group_top));
					
					// create a new group
					var $new_group = new FieldGroup($grouped_fields);		
				} else {				
					$(".selected_field").data("obj").updateProperties();
					$orig_field.remove();					
				}
			}
		}
	});	
	
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
	
	$("#uploaded_zip").change(
		function (event) {
			var selectedFile = event.target.files[0];
			var reader = new FileReader();
			reader.onload = function(event) {
				console.log('json file: ' + event.target.result);	
				$("#uploaded_zip").data("zip", event.target.result);
			};								
			reader.readAsDataURL(selectedFile);					
		}
	);
	
	$("#image_select").change(
		function (event) {
			var selectedFile = event.target.files[0];
			var reader = new FileReader();
			reader.onload = function(event) {
				// set properties of the image
				$("#loaded_image").attr('src', event.target.result);																	
				$("#loaded_image").data('filename', selectedFile.name);	
			};					
			reader.readAsDataURL(selectedFile);					
		}
	);
});