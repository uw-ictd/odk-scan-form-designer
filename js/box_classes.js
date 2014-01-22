// class for Box objects
function Box(init_val) {
	this.$box = $('<div/>');	
	this.$box.data("obj", this);
	
	if(init_val) {
		this.left = init_val.left;
		this.top = init_val.top;
		this.box_width = init_val.box_width;
		this.box_height = init_val.box_height;
		this.border_width = init_val.border_width;
	} else {
		this.left = 0;
		this.top = 0;
		// NOTE: initial width and height are aligned
		// to the grid size
		this.box_width = GRID_X * 5;
		this.box_height = GRID_Y * 5;
		this.border_width = $("#box_border").val();
	}
	this.type = "box"; 
	this.name = "none";		
}

Box.prototype.constructBox = function() {
	this.$box.addClass('field').addClass('box');
	this.$box.css({width: this.box_width, height: this.box_height, top: this.top, left: this.left});						
	
	this.$box.draggable({containment: 'parent', grid: [GRID_X, GRID_Y]});
	this.$box.resizable({handles: 'all', 
						containment: 'parent', 
						grid: [GRID_X, GRID_Y],
						minWidth: GRID_X * 1,
						minHeight: GRID_Y * 1});
																							
	this.$box.css({'border-width': this.border_width + 'px'});
	this.$box.css({position: 'absolute'});		
	
	// box is removed when double-clicked
	this.$box.dblclick(
		function() {
			this.remove();
		}
	);
	
	$("#scan_doc").append(this.$box);
};

Box.prototype.getFieldJSON = function() {
	var f_info = {};
	
	f_info.type = this.type;
	f_info.name = this.name;
	f_info.segments = [];

	var seg = {};
	seg.segment_x = this.$box.position().left;
	seg.segment_y = this.$box.position().top;
	seg.segment_width = this.$box.outerWidth();
	seg.segment_height = this.$box.outerHeight();
	
	f_info.segments.push(seg);
	return f_info;
};

Box.prototype.saveJSON = function() {
	var fieldJSON = {};
	
	fieldJSON.field_type = 'box';
	fieldJSON.left = this.$box.css('left');
	fieldJSON.top = this.$box.css('top');
	fieldJSON.box_width = this.$box.css('width');
	fieldJSON.box_height = this.$box.css('height');
	fieldJSON.border_width = this.border_width;
	
	return fieldJSON;
};