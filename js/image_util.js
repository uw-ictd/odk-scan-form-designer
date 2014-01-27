var load_into_dom = function(img_src, img_height, img_width, top_pos, left_pos) {					
	var $wrapped_image = $("<img/>");
	$wrapped_image.attr('src', img_src);
	$wrapped_image.css({
		position: 'relative',
		top: top_pos,
		left: left_pos,
	});		

	var $img_container = $("<div/>");
	$img_container.css({position: 'absolute',
					height: img_height, 
					width: img_width,
					overflow: 'hidden'});		
	$img_container.append($wrapped_image);
	/*	NOTE: html2canvas requires the DOM elements be loaded into
		the canvas in order to work correctly. That's why images
		are loaded into processed_images here rather than local
		img/div elements.
	*/	
	$("#processed_images").append($img_container);
	return $img_container;
};

var load_into_scan = function(img_src, img_height, img_width, orig_height, orig_width, img_top, img_left, div_top, div_left) {
	var $img = $("<img/>");
	$img.attr('src', img_src);	
	/* 	Original image selection offset and size
		are stored in order to recreate the image
		after it's saved.
	*/
	$img.data('top', img_top);
	$img.data('left', img_left);
	$img.data('orig_width', orig_width);
	$img.data('orig_height', orig_height);		
	/*	NOTE: in order to be resizable the image is 
		put into a div which is set to resizable, 
		the image's size then matches the div's size.
	*/
	$img.css({width: '100%', height: '100%'});
	
	var $img_draggable = $("<div/>");
	$img_draggable.css({width: img_width, 
					height: img_height, 
					left: div_left, 
					top: div_top, 
					position: 'absolute'});										
	$img_draggable.draggable({containment: 'parent'});
	$img_draggable.resizable({containment: 'parent', 
							aspectRatio: true, handles: 'all'});	
	$img_draggable.addClass('img_div').append($img);		
	// NOTE: image removed when double-clicked
	$img_draggable.dblclick(function() { $(this).remove() });
	$("#scan_doc").append($img_draggable);
};