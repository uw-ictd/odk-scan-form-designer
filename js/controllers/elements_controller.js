/*
	Constants
*/

var GRID_X = 10;
var GRID_Y = 10;

ODKScan.ElementsController = Ember.ArrayController.extend({
	isImageEditing: false,
	imgSelect: null,
	init: function() {
		this._super();		
		console.log("init controller");
		var controller = this;
		$(document).ready(function() {
			var ias = $('#image_area img').imgAreaSelect({
								instance: true,
								handles: true
							});				
			controller.set('imgSelect', ias);		
			
			$("#box_dialog").dialog({
				autoOpen: false,
				modal: true,
				buttons: {
					"Ok": function() {
						console.log("making box...");
						var $new_box = $('<div/>').addClass('box').addClass('form_element');
						
						$new_box.draggable({containment: 'parent', grid: [GRID_X, GRID_Y]});
						$new_box.resizable({containment: 'parent', grid: [GRID_X, GRID_Y]});
						$new_box.css({'border-width': $("#box_border").val()});
						
						// box is removed when double-clicked
						$new_box.dblclick(
							function() {
								this.remove();
							}
						);
						
						$("#scan_doc").append($new_box);
						$("#box_dialog").dialog("close");
					},
					"Cancel": function() {
						$("#box_dialog").dialog("close");
					}
				}
			});			
		});
	},
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
			$("#prop_sidebar").hide("slow");
			this.set('isImageEditing', true);
		},
		enableFormEdit: function() {
			$("#image_area img").attr('src', null);
			var ias = this.get('imgSelect');
			ias.cancelSelection();
			$("#prop_sidebar").show("slow");			
			this.set('isImageEditing', false);
		},
		selectImage: function() {
			$("#image_select").click();

			$("#image_select").change(
				function (event) {
					var selectedFile = event.target.files[0];
					var reader = new FileReader();

					reader.onload = function(event) {
						// set properties of the image
						$("#loaded_image").attr('src', event.target.result);																	
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
		},
		addSelection: function() {
			var ias = this.get('imgSelect');
			var reg = ias.getSelection();
			if (reg.width == 0 && reg.height == 0) {
				console.log("no region selected");
			} else {
				console.log("region selected!");
					var $new_img = $("<img/>").attr('src', $("#loaded_image").attr('src'));

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
		},
		createBox: function() {
			console.log("creating box");
			$("#box_dialog").dialog("open");
		}
	}
});