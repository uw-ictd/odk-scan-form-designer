/* GridField views inherit from the GridFieldController */
ODKScan.GridFieldWithValues = ODKScan.FieldController.extend({
	gridElements: [[{colIndex: 1, rowIndex: 1, ele_value: "default_val"}]],
	numCol: 1,
	numRow: 1,
	preNumCol: 1,
	preNumRow: 1,
	layoutName: "grid-field-layout",
	updateGridValueView: function() {
		var value_grid = this.get('gridElements');
		
		// check how numRow changed
		if (this.get('numRow') > this.get('preNumRow')) {
			// need to add new rows with default values
			var num_new_rows = this.get('numRow') - this.get('preNumRow');
			for (var i = this.get('preNumRow') + 1; i <= this.get('preNumRow') + num_new_rows; i++) {
				var new_row = [];
				for (var j = 1; j <= this.get('numCol'); j++) {
					new_row.pushObject({colIndex: j, rowIndex: i, ele_value: "default_val"});
				}
				value_grid.pushObject(new_row);
			}
		} else if (this.get('numRow') < this.get('preNumRow')) {
			// need to remove rows
			var num_removed_rows = this.get('preNumRow') - this.get('numRow');
			for (var i = 0; i < num_removed_rows; i++) {
				value_grid.popObject();
			}
		}

		// check how numCol changed
		if (this.get('numCol') > this.get('preNumCol')) {
			// need to add new columns with default values
			var num_new_col = this.get('numCol') - this.get('preNumCol');
			for (var i = 1; i <= this.get('numRow'); i++) {
				var curr_row = value_grid[i - 1];
				for (var j = this.get('preNumCol') + 1; j <= this.get('preNumCol') + num_new_col; j++) {
					curr_row.pushObject({colIndex: j, rowIndex: i, ele_value: "default_val"});
				}
			}
		} else if (this.get('numCol') < this.get('preNumCol')) {
			// need to remove columns
			var num_removed_col = this.get('preNumCol') - this.get('numCol');
			for (var i = 1; i <= this.get('numRow'); i++) {
				var curr_row = value_grid[i - 1];
				for (var j = 0; j < num_removed_col; j++) {
					curr_row.popObject();
				}
			}
		}
		
		// update previous values
		this.set('preNumCol', this.get('numCol'));
		this.set('preNumRow', this.get('numRow'));
		this.set('gridElements', value_grid);
	}.observes('numCol', 'numRow'),
	didInsertElement: function() {
		this._super();
		if ($(".selected_field").length == 0) {
			// loading view into a dialog menu, default # of rows is 1, default # of col is 1		
			this.set('gridElements', [[{colIndex: 1, rowIndex: 1, ele_value: "default_val"}]]);	
			this.set('preNumRow', 1);
			this.set('preNumCol', 1);						
		} else {
			// loading view into a properties sidebar
			var curr_field = $(".selected_field").data('obj');
			var grid_values = curr_field.grid_values;
			// set # of rows, columns
			this.set('numRow', parseInt(curr_field.num_rows));
			this.set('numCol', parseInt(curr_field.num_cols));
			this.set('preNumRow', this.get('numRow'));
			this.set('preNumCol', this.get('numCol'));
						
			var new_grid = [];
			var arr_index = 0;
			
			for (var i = 1; i <= this.get('numRow'); i++) {
				var new_row = [];
				for (var j = 1; j <= this.get('numCol'); j++) {
					new_row.push({colIndex: j, rowIndex: i, ele_value: grid_values[arr_index]});
					arr_index += 1;
				}	
				new_grid.push(new_row);
			}
			this.set('gridElements', new_grid);
		}
	},
	focusOut: function() {
		// unhighlight any grid elements that may be highlighted
		$(".selected_field").children().css('backgroundColor', 'initial');
	},
	actions: {
		updateNumColumns: function() {
			console.log("updated # of columns: " + $("#num_col").val());
			this.set('numCol', parseInt($("#num_col").val()));
		},
		updateNumRows: function() {
			console.log("updated # of rows: " + $("#num_row").val());
			this.set('numRow', parseInt($("#num_row").val()));
		},
		inputBoxPressed: function(rowIndex, colIndex) {
			// highlight the selected element
			var ele_class = ".row" + rowIndex + "_col" + colIndex;
			$(".selected_field").children(ele_class).css('backgroundColor', 'black');
		}
	}
});

ODKScan.CheckboxView = ODKScan.GridFieldWithValues.create({
	templateName: 'cb-view'
});

ODKScan.BubblesView = ODKScan.GridFieldWithValues.create({
	templateName: 'bubbles-view'
});

ODKScan.GridFieldNoValues = ODKScan.FieldController.extend({
	layoutName: "grid-field-layout"
});

ODKScan.SegNumView = ODKScan.GridFieldNoValues.create({
	templateName: 'seg-num-view'
});