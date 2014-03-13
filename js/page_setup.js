$(window).bind('beforeunload', function(){ return 'You are about to leave the ODK Scan application.'});

$(document).ready(function() {		
	/* General page setup */
	
	// set default view in properties sidebar
	ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);
	
	$("#update_prop").click(function() {
		console.log("updating field properties");
		if ($(".selected_field").length != 0) {
			if (is_name_unique()) {
				var origField = $(".selected_field");
				$(".selected_field").data("obj").updateProperties();
				origField.remove();
			} else {
				alert($("#field_name").val() + " is a duplicate field name.");
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