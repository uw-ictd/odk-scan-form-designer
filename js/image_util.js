var load_into_dom = function(img_src, img_height, img_width, top_pos, left_pos) {		
	/*	Image is wrapped in a div to eliminate the overflow
		and only make the selected region visible. html2canvas
		is used to create a jpg of the selected region, which
		is then put into the Scan doc.			

		NOTE: html2canvas requires the DOM elements be loaded into
		the canvas in order to work correctly.
	*/			
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
	$img_draggable.click(function() {
		ODKScan.FieldContainer.popObject();
		ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);	
		$(".selected_field").removeClass("selected_field");
		$(this).addClass("selected_field");
	});
	$img_draggable.addClass('img_div').append($img);		
	// NOTE: image removed when double-clicked
	$img_draggable.dblclick(function() { $(this).remove() });
	$(".selected_page").append($img_draggable);
	return $img_draggable;
};