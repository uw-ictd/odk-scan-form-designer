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
			$("#image_select").click();

			$("#image_select").change(
				function (event) {
					var selectedFile = event.target.files[0];
					var reader = new FileReader();
					var new_img = document.createElement("img");

					reader.onload = function(event) {
						// set properties of the image
						new_img.title = selectedFile.name;
						new_img.src = event.target.result;
						
						$("#image_area").append(new_img);	
						
						$('#image_area img').imgAreaSelect({
							handles: true, 
							onSelectEnd: function(img, reg) {
								var $new_img = $("<img/>").attr('src', img.src);

								$new_img.css({
									position: 'relative',
									top: -reg.y1,
									left: -reg.x1,
								});	
																
								// Image is wrapped in a div to eliminate the overflow
								// and only make the selected region visible.
								// NOTE: default position is set to top-left of Scan doc.
								var $img_div = $('<div/>').css({
									position: 'absolute', 
									overflow: 'hidden',
									width: reg.width, 
									height: reg.height,
									top: 0, 
									left: 0});
								
								// image is removed when double-clicked
								$img_div.dblclick(
									function() {
										this.remove();
									}
								);								
								$img_div.append($new_img);
								$img_div.draggable({containment: 'parent', position: 'relative'});
								
								$("#scan_doc").append($img_div);								
							}
						});
					};
					
					reader.readAsDataURL(selectedFile);					
				}
			);
		},
		saveImage: function() {
			html2canvas($("#scan_doc"), {   
				logging:true,
				onrendered : function(canvas) {                           
					var img_src = canvas.toDataURL('image/png'); 
					canvas.toBlob(function(blob) {
						var fname = "my_dom"					
						saveAs(blob, fname);
					});	
				}
			});
		}
	}
});