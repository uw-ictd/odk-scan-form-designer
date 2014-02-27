ODKScan.FieldController = Ember.View.extend({
	didInsertElement: function() {		
		if ($(".selected_field").length != 0) {
			// loading view into the properties sidebar
			var field_obj = $(".selected_field").data("obj");			
			field_obj.loadProperties();
			
			// check if the selected shape has a border
			if (field_obj.border_width > 0) {
				this.get('bdOptions').get('borderYesView').set('selection', 1);
				$("#border_width").val(field_obj.border_width); 
			} else {
				this.get('bdOptions').get('borderNoView').set('selection', 0);
			}
		} else {
			// loading view into a dialog menu, default border set to 'Yes'
			this.get('bdOptions').get('borderYesView').set('selection', 1);
			
			// the html for the dialog menu has finished loading, now the
			// dialog menu can be opened
			var new_field_type = this.get('controller.newFieldType');			
			if (new_field_type == 'checkbox') {
				$("#checkbox_dialog").dialog("open");
			} else if (new_field_type == 'bubble') {
				$("#bubble_dialog").dialog("open");
			} else if (new_field_type == 'seg_num') {
				$("#seg_num_dialog").dialog("open");
			} else if (new_field_type == 'empty_box') {
				$("#box_dialog").dialog("open");
			} else if (new_field_type == 'text_box') {
				$("#text_dialog").dialog("open");
			} else if (new_field_type == 'form_num') {
				$("#form_num_dialog").dialog("open");
			} else {
				console.log("error no dialog menu to open, unsupported field field type");
			}
		}
	}
});