// function for barchart //
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

// horizontal barchart //
var drawHorizontalChart = function() {
d3.json('http://nvd3.org/examples/multiBarHorizontalData.json', function(data) {
  nv.addGraph(function() {
    var chart = nv.models.multiBarHorizontalChart()
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        .margin({top: 30, right: 20, bottom: 50, left: 175})
        .showValues(true)           //Show bar value next to each bar.
        .tooltips(true)             //Show tooltips on hover.
        .transitionDuration(350)
        .showControls(true);        //Allow user to switch between "Grouped" and "Stacked" mode.

    chart.yAxis
        .tickFormat(d3.format(',.2f'));

    d3.select('#horizontalchart svg')
        .datum(horizontaldata)
        .transition().duration(500)
        .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
  });
});
};

// function for loading graphs //
$(function() {
  $("#btnLoadCharts").click(function(){ //after clicking item #btnLoadChart write it to console
      console.log('Draw Chart');
      drawChart();
      drawHorizontalChart()
  });
});
