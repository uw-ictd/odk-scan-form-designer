/* Global functions and constants are listed below. */

// These constants specify the imaginary 
// grid that fields are aligned to in the Scan doc.
var GRID_X = 10; // horizontal grid size unit
var GRID_Y = 10; // vertical grid size unit

/**
*	Singleton class which contains operations
*	to get and update the global zIndex.
*/
function ZIndex() {
	this._init_z = 0;
};

/**
*	Sets up all of the attributes that page
* 	needs to keep track of zIndex information.
*/
ZIndex.prototype.registerPage = function() {
	$(".selected_page").data("currZ", this._init_z);
	$(".selected_page").data("bottomZ", this._init_z);
};

/**
*	Returns the current zIndex.
*/
ZIndex.prototype.getZ = function() {
	return $(".selected_page").data("currZ");
};

/**
*	Sets the current zIndex value.
*/
ZIndex.prototype.setZ = function(val) {
	return $(".selected_page").data("currZ", val);
};

/**
*	Returns the bottom-most zIndex value.
*/
ZIndex.prototype.getBottomZ = function() {
	return $(".selected_page").data("bottomZ");
};

/**
*	Returns the current top-most zIndex value.
*/
ZIndex.prototype.getTopZ = function() {
	return $(".selected_page").data("currZ") - 1;
};

/**
*	Increments the current zIndex.
*/
ZIndex.prototype.incrZ = function() {
	var curr_val = $(".selected_page").data("currZ");
	$(".selected_page").data("currZ", curr_val + 1);
};

var globZIndex = new ZIndex();

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

// converts a numeric value to an rem unit
var rem = function(value) {
	return parseFloat(value) / 10 + "rem";
}

// converts position units to rem
var convert_position = function($obj) {
	$obj.css("top", rem($obj.css("top")));
	$obj.css("left", rem($obj.css("left")));
};	