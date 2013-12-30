// creates a class which defines todo items
ODKScan.Element = DS.Model.extend({
  type: DS.attr('string'),
  sideLength: DS.attr('string'),
  perimeter: DS.attr('string')
});