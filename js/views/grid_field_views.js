/* GridField views inherit from the GridFieldController */
ODKScan.GridFieldController = ODKScan.FieldController.extend({
	gridElements: [{colIndex: 1, rowIndex: 1}],
	numCol: 1,
	numRow: 1,
	layoutName: "grid-field-layout",
	updateGridValueView: function() {
		console.log("observed change!!!!");
		var newValues = [];
		
		for (var i = 1; i <= this.get('numRow'); i++) {
			for (var j = 1; j <= this.get('numCol'); j++) {
				newValues.push({colIndex: j, rowIndex: i});
			}			
		}
		
		this.set('gridElements', newValues);
	}.observes('numCol', 'numRow'),
	actions: {
		updateNumColumns: function() {
			console.log("updated # of columns: " + $("#num_col").val());
			this.set('numCol', $("#num_col").val());
		},
		updateNumRows: function() {
			console.log("updated # of rows: " + $("#num_row").val());
			this.set('numRow', $("#num_row").val());
		},
	}
});

ODKScan.CheckboxView = ODKScan.GridFieldController.create({
	templateName: 'cb-view'
});

ODKScan.BubblesView = ODKScan.GridFieldController.create({
	templateName: 'bubbles-view'
});

ODKScan.SegNumView = ODKScan.GridFieldController.create({
	templateName: 'seg-num-view'
});