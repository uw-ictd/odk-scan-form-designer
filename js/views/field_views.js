// This containers hold views in the properties sidebar 
ODKScan.FieldContainer = Ember.ContainerView.create({
});

/*	These containers are hold views in their respectiev
	dialog menus.
*/	
ODKScan.CheckboxContainer = Ember.ContainerView.create({
});

ODKScan.BubbleContainer = Ember.ContainerView.create({
});

ODKScan.SegNumContainer = Ember.ContainerView.create({
});

ODKScan.TextBoxContainer = Ember.ContainerView.create({
});


// Radio Buttons

/*
	Code provided from: http://thoughts.z-dev.org/2013/07/04/radio-buttons-in-ember-js/
*/
Ember.RadioButton = Ember.View.extend({
    tagName : "input",
    type : "radio",
    attributeBindings : [ "name", "type", "value", "checked:checked:" ],
    click : function() {
		console.log("radio button value: " + this.$().val());
		console.log("parent view: " + this.get('parentView'));
		if (this.$().val() == "1") {
			console.log("enabling the border");
			$("#border_width").val(1); // set border with to one
			$("#border_container").css('display', 'inline');
			this.get('parentView').set('hasBorder', true);
		} else {		
			console.log("disabling the border");
			$("#border_width").val(0); // set border with to zero
			$("#border_container").css('display', 'none');
			this.get('parentView').set('hasBorder', false);
		}
        this.set("selection", this.$().val())
    },
    checked : function() {
        return this.get("value") == this.get("selection");   
    }.property('selection'),
});

// All views below inherit from this view controller
ODKScan.ViewController = Ember.View.extend({
	didInsertElement: function() {
		console.log("inserted view");		
		if ($(".selected_field").length != 0) {
			// loading view into the properties sidebar
			$(".selected_field").data("obj").loadProperties();
		} else {
			// loading view into a dialog menu, default border set to 'Yes'
			this.get('borderYesView').set('selection', 1);
		}
	},
	radioView: Ember.RadioButton
});

// These views below are rendered in the FieldContainer view created above.
ODKScan.DefaultPropView = Ember.View.create({
  templateName: 'default-prop-view'
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

ODKScan.TextBoxView = ODKScan.ViewController.create({
  templateName: 'textbox-view'
});
