/* 	Radio Button
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

AttributeOptions = Ember.View.extend({
	templateName: 'field-attributes-view'
});