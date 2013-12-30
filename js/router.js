ODKScan.Router.map(function () {
	this.resource('elements', {path: "/"}, function() {
	});
});

ODKScan.ODKScanRoute = Ember.Route.extend({
  model: function () {
    return this.store.find('element');
  }
});

ODKScan.ODKScanIndexRoute = Ember.Route.extend({
  model: function () {
    return this.modelFor('elements');
  }
});