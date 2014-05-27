/**
*	Initializes a new FieldGroup.
*/
function FieldGroup($grouped_fields) {
	this.$grouped_fields = $grouped_fields;
	// disable draggable/resizable features from group fields
	this.$grouped_fields.each(function() {
		if ($(this).hasClass("ui-draggable")) {
			$(this).draggable("destroy");		
		}
		if ($(this).hasClass("ui-resizable") 
			&& ($(this).hasClass("box") || $(this).hasClass("img_div"))) {
			$(this).resizable("destroy");
		}
	});

	// create group container
	this.$group_div = $("<div/>");
	this.$group_div.data("obj", this);
	this.$group_div.addClass("field_group");	
	this.$group_div.append(this.$grouped_fields);
	
	$(".selected_page").append(this.$group_div);
	this.$group_div.draggable({containment: "parent", 
								grid: [GRID_X, GRID_Y]});	
	this.adjustGroupSize();															
}

/**
*	Removes the selected field from the group.
*/
FieldGroup.prototype.removeSelected = function() {
	this.$grouped_fields = this.$grouped_fields.not($(".selected_field"));
}

/**
*	Ungroups the fields.
*/
FieldGroup.prototype.ungroupFields = function() {
	var group_top = parseInt(this.$group_div.css('top'));
	var group_left = parseInt(this.$group_div.css('left'));			

	this.$grouped_fields.unwrap();		
	
	this.$grouped_fields.each(function() {
		var curr_top = parseInt($(this).css("top"));
		var curr_left = parseInt($(this).css("left"));
		$(this).css("top", rem(curr_top + group_top));
		$(this).css("left", rem(curr_left + group_left));
	});
	
	// restore draggable/resizable features
	this.$grouped_fields.each(function() {
		$(this).draggable({containment: 'parent', 
							grid: [GRID_X, GRID_Y]});
		if ($(this).hasClass("box") || $(this).hasClass("img_div")) {
			$(this).resizable({handles: 'all', 
							containment: 'parent', 
							grid: [GRID_X, GRID_Y],
							minWidth: GRID_X,
							minHeight: GRID_Y});
		}
	});	
	
	return this.$grouped_fields;
}

/**
*	Returns the fields in the group.
*/
FieldGroup.prototype.getFields = function() {	
	return this.$grouped_fields;
};

/**
*	Sets the group container to the appropriate size.
*/
FieldGroup.prototype.adjustGroupSize = function() {
	// get position bounds of the selected fields
	var min_top = FieldGroup.minTop(this.$grouped_fields);
	var min_left = FieldGroup.minLeft(this.$grouped_fields);
	var max_bottom = FieldGroup.maxBottom(this.$grouped_fields);
	var max_right = FieldGroup.maxRight(this.$grouped_fields);
	
	this.$group_div.css("width", rem(max_right - min_left));
	this.$group_div.css("height", rem(max_bottom - min_top));
	
	// re-position all fields to align with the group
	// container at the top-left of the page
	this.$grouped_fields.each(function() {
		var curr_top = parseInt($(this).css("top"));
		var curr_left = parseInt($(this).css("left"));
		$(this).css("top", rem(curr_top - min_top));
		$(this).css("left", rem(curr_left - min_left));
	});
	
	this.$group_div.css({top: rem(min_top), left: rem(min_left)});
};

/**
*	Computes the minimum top value 
*	for the group of fields.
*/
FieldGroup.minTop = function($fields) {
	var values = $fields.map(function() { 
					return parseFloat($(this).css('top'))
				});
	return Math.min.apply(null, values.get());
};

/**
*	Computes the minimum left value 
*	for the group of fields.
*/
FieldGroup.minLeft = function($fields) {
	var values = $fields.map(function() { 
					return parseFloat($(this).css('left'))
				});
	return Math.min.apply(null, values.get());
};

/**
*	Computes the maximum bottom value 
*	for the group of fields.
*/
FieldGroup.maxBottom = function($fields) {
	var values = $fields.map(function() { 
					return parseFloat($(this).css('top'))
						+ parseFloat($(this).css('height'))
				});
	return Math.max.apply(null, values.get());
};

/**
*	Computes the maximum right value 
*	for the group of fields.
*/
FieldGroup.maxRight = function($fields) {
	var values = $fields.map(function(){ 
					return parseFloat($(this).css('left'))
						+ parseFloat($(this).css('width'))
				});				
	return Math.max.apply(null, values.get());
};
