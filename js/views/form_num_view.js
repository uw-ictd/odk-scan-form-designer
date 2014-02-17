ODKScan.FormNumController = ODKScan.FieldController.extend({
	groups: [1, 2],
	didInsertElement: function() {
		this._super();
		console.log('loaded formatted number view');
	},
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

ODKScan.FormNumView = ODKScan.FormNumController.create({
  templateName: 'form-num-view'
});
