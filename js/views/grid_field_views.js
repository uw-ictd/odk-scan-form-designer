/* GridField views inherit from the GridFieldController */
ODKScan.GridFieldController = ODKScan.FieldController.extend({
	layoutName: "grid-field-layout"
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