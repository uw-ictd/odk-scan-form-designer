ODKScan.ElementsCheckboxesController = Ember.ArrayController.extend({
	numRows: 0,
	init: function() {
		console.log("initializing the checkbox view");
	},
	rowsChanged: function() {
		console.log("the # of rows is now: " + this.get('numRows'));
	}.observes('numRows'),
	actions: {
		setNumRows: function() {
			console.log("numRows has changed");
			this.set('numRows', $("#num_row_cb").val());
		}
	}
});