ODKScan.FormNumController = ODKScan.FieldController.extend({
	/*	formNumGroups is a non-decreasing array of values from [1, 2,...,n] 
		where n is the total number of groups and each value represents 
		the position of a group within the number (i.e. 1 = first group, 
		2 = second group, ..., n = nth group)
	*/
	formNumGroups: [1, 2],
	didInsertElement: function() {
		this._super();
		if ($(".selected_field").length == 0) {
			// loading view into a dialog menu, default number of groups is 2
			this.set('formNumGroups', [{groupNum:1, size:1}, {groupNum:2, size:1}]);
		} else {
			// loading view into a properties sidebar
			var group_sizes = $(".selected_field").data('obj').group_sizes;
			var size_lst = []
			for (var i = 1; i <= group_sizes.length; i++) {
				size_lst.push({groupNum:i, size:group_sizes[i-1]});
			}
			this.set('formNumGroups', size_lst);
		}
	},
	actions: {
		updateNumGroups: function() {	
			var arr = [];
			for (var i = 1; i <= $("#num_col_form_num").val(); i++) {
				arr.push({groupNum:i, size:1});
			}
			this.set('formNumGroups', arr);
		}
	}
});

ODKScan.FormNumView = ODKScan.FormNumController.create({
  templateName: 'form-num-view'
});
