// function for barchart
var drawChart = function() {
  nv.addGraph(function() {
    var chart = nv.models.discreteBarChart()
      .x(function(d) {
        console.log('d:' , d); //console log after hovering over chart
        return d.label }) //label from testdata.js as x value
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

//after pressing 'Load Chart'
$(function() {
  $("#btnLoadChart").click(function(){ //after clicking item #btnLoadChart write it to console
      console.log('Draw Chart');
      drawChart();
  });
});
