
function filterClass(value, index, array) {
  if (value.class == "a") { return value } //only values with accessory Pathways
}

accessData = fullData.filter(filterClass) // filtering inputdata
accessData.sort(function(a,b) { return b.count - a.count})
console.log(accessData) // sort descending


var horiBarChart = function() {
  nv.addGraph(function() {
    var chart = nv.models.multiBarHorizontalChart()
        .x(function(d) { return d.name })
        .y(function(d) { return d.count})
        .margin({top: 30, right: 20, bottom: 50, left: 175})
        .showValues(true)
        .tooltips(true)
        .showControls(true);

    chart.yAxis
        .tickFormat(d3.format(',.2f'));

    d3.select('#horizontalBarChart svg')
        .datum(bardata)
      .transition().duration(500)
        .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
  });
};

horiBarChart();
