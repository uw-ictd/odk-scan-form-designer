/* Global functions and constants are listed below. */

// These constants specify the imaginary 
// grid that fields are aligned to in the Scan doc.
var GRID_X = 10; // horizontal grid size unit
var GRID_Y = 10; // vertical grid size unit

/* 	Returns true if the field name in the #field_name
	input box is unique (no other field in the Scan 
	doc has the name), false otherwise.
*/
var is_name_unique = function() {
	var name_unique = true;
	$(".field").each(function() {
		if ($(this).data('obj').name == $("#field_name").val() && !$(this).hasClass("selected_field")) {				
			name_unique = false
		}
	});
	return name_unique;
};

var rem = function(value) {
	return parseFloat(value) / 10 + "rem";
}