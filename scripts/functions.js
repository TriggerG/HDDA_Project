// function for discrete barchart //
var drawChart = function() {
  nv.addGraph(function() {
    var chart = nv.models.discreteBarChart()
      .x(function(d) { return d.label }) //label from testdata.js as x value <console.log('d:' , d);>
      .y(function(d) { return d.value }) //value from testdata.js as y value
      .staggerLabels(true) //staggered x-labels
      .showValues(true)
      chart.tooltip.enabled(true);

  d3.select('#chart svg')
    .datum(chartData) //submit data to draw the chart
    .transition().duration(500)
    .call(chart)
    ;

  nv.utils.windowResize(chart.update);

  return chart;
});
};

var drawChart2 = function() {
d3.json("scripts/full.json", function (error, data) {
  console.log(data);
  nv.addGraph(function() {
    var chart = nv.models.discreteBarChart()
    .x(function(d) {
      console.log(d);
      return d.id}) //label from testdata.js as x value <console.log('d:' , d);>
    .y(function(d) { return d.count }) //value from testdata.js as y value
    .staggerLabels(true) //staSggered x-labels
    .showValues(true)
    chart.tooltip.enabled(true);

  d3.select('#chart2 svg')
    .datum(data) //submit data to draw the chart
    .transition().duration(500)
    .call(chart)
    ;

  nv.utils.windowResize(chart.update);

  return chart;
});
});
};

// function for ordered barchart

// function for loading graphs //
$(function() {
  $("#btnLoadCharts").click(function(){ //after clicking item #btnLoadChart write it to console
      console.log('Draw Chart');
      drawChart();
      drawChart2();
  });
});
