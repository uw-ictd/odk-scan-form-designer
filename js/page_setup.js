$(document).ready(function() {		
	// general page setup

	ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);

	$("#update_prop").click(function() {
		console.log("updating field properties");
		if ($(".selected_field").length != 0) {
			var origField = $(".selected_field");
			$(".selected_field").data("obj").updateProperties();
			origField.remove();
		}
	});	
	
	$("#load_prop").click(function() {
		console.log("loading field properties");
		if ($(".selected_field").length != 0) {
			console.log("field is currently selected");
			$(".selected_field").data("obj").loadProperties();
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