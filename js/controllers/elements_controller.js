ODKScan.ElementsController = Ember.ArrayController.extend({
	isImageEditing: false,
	actions: {
		createElement: function () {
		  var length = this.get('shapeLength');
		  if (!length.trim()) { return; }
		  var new_div = $('<div/>').draggable().text("BLAH");
		  new_div.css('border', '1px solid black');
		  new_div.css('width', length);
		  new_div.css('height', length);

		  // Create the new Shape model
		  var currShape = this.store.createRecord('element', {
			type: "square",
			sideLength: length,
			perimeter: 4 * length,
			thisShape: new_div
		  });
		  
		  $('body').append(new_div);

		  // Clear the shapeLength input box
		  this.set('shapeLength', '');

		  // Save the new model
		  currShape.save();
		  console.log("created element");
		},
		enableImageEdit: function() {
			console.log("enabling image editing");
			$("#prop_sidebar").hide("slow");
			this.set('isImageEditing', true);
		},
		enableFormEdit: function() {
			console.log("enabling form editing");
			$("#prop_sidebar").show("slow");
			this.set('isImageEditing', false);
		},
		selectImage: function() {
			console.log("image select button was pressed");
			$("#image_select").click();

			$("#image_select").change(
				function (event) {
					console.log("loading image: " + event.target.files[0]);
					
					var selectedFile = event.target.files[0];
					var reader = new FileReader();
					var new_img = document.createElement("img");

					reader.onload = function(event) {
						// set properties of the image
						new_img.title = selectedFile.name;
						new_img.src = event.target.result;
						
						/*
						// Assuming that the image should NOT be scaled
						loadImage.scale(
							new_img,
							// NOTE: by default limit the image size to .5 of the page width and height
							{maxWidth: $("#scan_doc").width() / 2,
							 maxHeight: $("#scan_doc").height() / 2
							}
						);
						*/						
						$("#image_area").append(new_img);	
						
						$('#image_area img').imgAreaSelect({
							handles: true,
							onSelectEnd: function(img, selection) {
								var $new_img = $("<img/>").attr('src', img.src);
								$new_img.css({
									width: selection.width,
									height: selection.height,
									marginLeft: -selection.x1,
									marginTop: -selection.y1,
									position: 'relative'
								})	
								$("#scan_doc").append($new_img);
							}
						});
					};
					
					reader.readAsDataURL(selectedFile);					
				}
			);
		}
	}
});