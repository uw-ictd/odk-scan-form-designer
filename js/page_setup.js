$(document).ready(function() {		
	// general page setup

	ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);

	$("#update_prop").click(function() {
		console.log("updating field properties");
		if ($(".selected_field")) {
			$(".selected_field").data("obj").updateProperties();
		}
	});	
	
	$("#load_prop").click(function() {
		console.log("loading field properties");
		if ($(".selected_field")) {
			$(".selected_field").data("obj").loadProperties();
		}
	});	
});