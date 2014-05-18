ODKScan.FieldController = Ember.View.extend({
	labelCounts: {checkbox: 1, bubble: 1, seg_num: 1,
						box: 1, text: 1, form_num: 1},
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
			// dialog menu can be opened (if a dialog menu opens up before
			// the html has finished opening then the dialog menu can pop
			// up on the screen in a random location)
			var new_field_type = this.get('controller.newFieldType');		
			var labelCounts = this.get("labelCounts");
			
			if (new_field_type == 'checkbox') {
				var curr_count = labelCounts['checkbox'];
				$("#field_label").val("checkboxes" + curr_count);				
				Ember.set(labelCounts, "checkbox", curr_count + 1);
				
				$("#checkbox_dialog").dialog("open");
			} else if (new_field_type == 'bubble') {
				var curr_count = labelCounts['bubble'];
				$("#field_label").val("bubbles" + curr_count);
				Ember.set(labelCounts, "bubble", curr_count + 1);
				
				$("#bubble_dialog").dialog("open");
			} else if (new_field_type == 'seg_num') {
				var curr_count = labelCounts['seg_num'];
				$("#field_label").val("simpleNumber" + curr_count);
				Ember.set(labelCounts, "seg_num", curr_count + 1);
				
				$("#seg_num_dialog").dialog("open");
			} else if (new_field_type == 'empty_box') {
				var curr_count = labelCounts['box'];
				$("#field_label").val("textBox" + curr_count);
				Ember.set(labelCounts, "box", curr_count + 1);
				
				$("#box_dialog").dialog("open");
			} else if (new_field_type == 'text_box') {
				var curr_count = this.get("labelCounts")['text'];
				$("#field_label").val("text" + curr_count);
				Ember.set(labelCounts, "text", curr_count + 1);
				
				$("#text_dialog").dialog("open");
			} else if (new_field_type == 'form_num') {
				var curr_count = labelCounts['form_num'];
				$("#field_label").val("formattedNumber" + curr_count);
				Ember.set(labelCounts, "form_num", curr_count + 1);
				
				$("#form_num_dialog").dialog("open");
			} else {
				console.log("error no dialog menu to open, unsupported field type");
			}
		}
	}
});