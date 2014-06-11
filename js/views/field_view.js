ODKScan.FieldController = Ember.View.extend({
	idCounts: {checkbox: 1, bubble: 1, seg_num: 1,
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
			var idCounts = this.get("idCounts");
			
			if (new_field_type == 'checkbox') {
				var curr_count = idCounts['checkbox'];
				$("#field_name").val("checkboxes" + curr_count);				
				Ember.set(idCounts, "checkbox", curr_count + 1);
				
				$("#checkbox_dialog").dialog("open");
			} else if (new_field_type == 'bubble') {
				var curr_count = idCounts['bubble'];
				$("#field_name").val("bubbles" + curr_count);
				Ember.set(idCounts, "bubble", curr_count + 1);
				
				$("#bubble_dialog").dialog("open");
			} else if (new_field_type == 'seg_num') {
				var curr_count = idCounts['seg_num'];
				$("#field_name").val("simpleNumber" + curr_count);
				Ember.set(idCounts, "seg_num", curr_count + 1);
				
				$("#seg_num_dialog").dialog("open");
			} else if (new_field_type == 'empty_box') {
				var curr_count = idCounts['box'];
				$("#field_name").val("textBox" + curr_count);
				Ember.set(idCounts, "box", curr_count + 1);
				
				$("#box_dialog").dialog("open");
			} else if (new_field_type == 'text_box') {
				var curr_count = this.get("idCounts")['text'];
				$("#field_name").val("text" + curr_count);
				Ember.set(idCounts, "text", curr_count + 1);
				
				$("#text_dialog").dialog("open");
			} else if (new_field_type == 'form_num') {
				var curr_count = idCounts['form_num'];
				$("#field_name").val("formattedNumber" + curr_count);
				Ember.set(idCounts, "form_num", curr_count + 1);
				
				$("#form_num_dialog").dialog("open");
			} else {
				console.log("error no dialog menu to open, unsupported field type");
			}
		}
	}
});