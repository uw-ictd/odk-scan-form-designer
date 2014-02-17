ODKScan.FieldController = Ember.View.extend({
	didInsertElement: function() {		
		console.log('field controller initiallizing');
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
			// loading view into a dialog menu, default border set to 'Yes',
			// default number of groups is 2
			this.set('groups', [1, 2]);
			this.get('bdOptions').get('borderYesView').set('selection', 1);
		}
	}
});