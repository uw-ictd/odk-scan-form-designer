// This containers hold views in the properties sidebar 
ODKScan.FieldContainer = Ember.ContainerView.create({
});

/*	These containers hold views in their respective
	dialog menus.
*/	
ODKScan.EmptyBoxContainer = Ember.ContainerView.create({
});

ODKScan.TextBoxContainer = Ember.ContainerView.create({
});

ODKScan.CheckboxContainer = Ember.ContainerView.create({
});

ODKScan.BubbleContainer = Ember.ContainerView.create({
});

ODKScan.SegNumContainer = Ember.ContainerView.create({
});

ODKScan.FormNumContainer = Ember.ContainerView.create({
});

/*
	Radio Button
	Code used/modified from: http://thoughts.z-dev.org/2013/07/04/radio-buttons-in-ember-js/
*/
Ember.RadioButton = Ember.View.extend({
    tagName : "input",
    type : "radio",
	name: "borderOption",
    attributeBindings : [ "name", "type", "value", "checked:checked:" ],
    click : function() {
		if (this.$().val() == "1") {
			$("#border_width").val(1); // set border with to one
			$("#border_container").css('display', 'inline');
		} else {		
			$("#border_width").val(0); // set border with to zero
			$("#border_container").css('display', 'none');
		}
        this.set("selection", this.$().val())
    }.observes('selection'),
    checked : function() {
        return this.get("value") == this.get("selection");   
    }.property('selection'),
});

GridSize = Ember.View.extend({
	templateName: 'grid-size-view'
});

BorderOptions = Ember.View.extend({
	templateName: 'border-options-view'
});

MarginOptions = Ember.View.extend({
	templateName: 'margin-options-view'
});

// All views below inherit from this view controller
ODKScan.ViewController = Ember.View.extend({
	layoutName: "field-layout",
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
			// loading view into a dialog menu, default border set to 'Yes',
			// default number of groups is 2
			this.set('groups', [1, 2]);
			this.get('bdOptions').get('borderYesView').set('selection', 1);
		}
	},
	groups: [1, 2],
	actions: {
		updateNumGroups: function() {	
			var arr = [];
			for (var i = 1; i <= $("#num_col_form_num").val(); i++) {
				arr.push(i);
			}
			this.set('groups', arr);
		}
	}
});

// These views below are rendered in the FieldContainer view created above.
ODKScan.DefaultPropView = Ember.View.create({
  templateName: 'default-prop-view'
});

ODKScan.EmptyBoxView = ODKScan.ViewController.create({
  templateName: 'empty-box-view'
});

ODKScan.TextBoxView = ODKScan.ViewController.create({
  templateName: 'textbox-view'
});

ODKScan.CheckboxView = ODKScan.ViewController.create({
	templateName: 'cb-view'
});

ODKScan.BubblesView = ODKScan.ViewController.create({
  templateName: 'bubbles-view'
});

ODKScan.SegNumView = ODKScan.ViewController.create({
  templateName: 'seg-num-view'
});

ODKScan.FormNumView = ODKScan.ViewController.create({
  templateName: 'form-num-view'
});
