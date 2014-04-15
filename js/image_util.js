var crop_image = function(image) {		
	/*	Image is wrapped in a div to eliminate the overflow
		and only make the selected region visible.	
		NOTE: 'image' must the following attributes:
			- img_src: src data for the image snippet
			- top_pos: top offset within original image
			- left_pos: left offset within original image
			- img_height: height of image snippet
			- img_width: width of image snippet
	*/			
	var $wrapped_image = $("<img/>");
	$wrapped_image.attr('src', image.img_src);
	$wrapped_image.css({
		position: 'relative',
		top: image.top_pos,
		left: image.left_pos,
	});		

	var $img_container = $("<div/>");
	$img_container.css({position: 'absolute',
					height: image.img_height, 
					width: image.img_width,
					overflow: 'hidden'});		
	$img_container.append($wrapped_image);

	/*	NOTE: html2canvas requires the DOM elements be loaded into
		the canvas in order to work correctly, so the image is loaded
		into the processed_images div.
	*/
	$("#processed_images").append($img_container);
	return $img_container;
};

var image_to_field = function(image) {
	/* 	Creates a image field from the image attributes. 
		NOTE: 'image' must the following attributes:
			- img_name: the name of the original source image
			- img_src: src data for the image snippet
			- img_top: top offset within original image
			- img_left: left offset within original image
			- div_top: top position of the field
			- div_left: left position of the field
			- orig_height: original height of image snippet
			- orig_width: original width of image snippet
			- img_height: current/resized height of image snippet
			- img_width: current/resized width of image snippet
	*/

	var $img = $("<img/>");
	$img.attr('src', image.img_src);	
	/* 	Original image selection offset and size
		are stored in order to resize and position
		the image after it's saved.
	*/
	$img.data('top', image.img_top);
	$img.data('left', image.img_left);
	$img.data('orig_width', image.orig_width);
	$img.data('orig_height', image.orig_height);		
	/*	NOTE: in order for the image to be resizable
		it is put into a div and set to match the div's
		width and height, the div is made resizable so
		the image matches its width and height as it 
		becomes resized.
	*/
	$img.css({width: '100%', height: '100%'});
	
	// create div container for the image
	var $img_draggable = $("<div/>");
	$img_draggable.data('img_name', image.img_name);	
	$img_draggable.css({width: image.img_width, 
					height: image.img_height, 
					left: image.div_left, 
					top: image.div_top, 
					position: 'absolute'});										
	// make the div draggable/resizable
	$img_draggable.draggable({containment: 'parent'});
	$img_draggable.resizable({containment: 'parent', 
		aspectRatio: true, handles: 'all'});	
	
	// add event listeners
	$img_draggable.click(function() {
		ODKScan.FieldContainer.popObject();
		ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);	
		$(".selected_field").removeClass("selected_field");
		$(this).addClass("selected_field");
	});
	
	// image fields are identified by the 'img_div' class
	$img_draggable.addClass('img_div').append($img);		
	$(".selected_page").append($img_draggable);
	return $img_draggable;
};