ODKScan.FormNumController = ODKScan.FieldController.extend({
	/*	formNumGroups is a non-decreasing array of values from [1...n] 
		where n is the total number of groups and each value represents 
		the position of a group within the number (i.e. 1 = first group, 
		2 = second group, ..., n = nth group)
	*/
	formNumGroups: [1, 2],
	didInsertElement: function() {
		this._super();
		if ($(".selected_field").length == 0) {
			// loading view into a dialog menu, default number of groups is 2
			this.set('formNumGroups', [1, 2]);
		} else {
			// loading view into properties sidebar
			var arr = [];
			var group_sizes = $('.selected_field').data('obj').group_sizes;
			for (var i = 1; i <= group_sizes.length; i++) {
				arr.push(i);
			}
			this.set('formNumGroups', arr);
			
			// for each group of number, set the count to the respective
			// value
			$(".num_groups").each(function(index, group_div) {
				$(group_div).val(obj.group_sizes[index]);
			});
		}
		console.log('loaded formatted number view');
	},
	actions: {
		updateNumGroups: function() {	
			var arr = [];
			for (var i = 1; i <= $("#num_col_form_num").val(); i++) {
				arr.push(i);
			}
			this.set('formNumGroups', arr);
		}
	}
});

ODKScan.FormNumView = ODKScan.FormNumController.create({
  templateName: 'form-num-view'
});
