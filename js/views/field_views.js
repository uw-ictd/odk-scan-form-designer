ODKScan.FieldContainer = Ember.ContainerView.create({
});

ODKScan.CheckboxContainer = Ember.ContainerView.create({
});

ODKScan.BubbleContainer = Ember.ContainerView.create({
});

ODKScan.SegNumContainer = Ember.ContainerView.create({
});

/* These views below are rendered in the FieldContainer view created above. */

ODKScan.DefaultPropView = Ember.View.create({
  templateName: 'default-prop-view'
});

ODKScan.CheckboxView = Ember.View.create({
  templateName: 'cb-view'
});

ODKScan.BubblesView = Ember.View.create({
  templateName: 'bubbles-view'
});

ODKScan.SegNumView = Ember.View.create({
  templateName: 'seg-num-view'
});