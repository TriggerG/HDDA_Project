
<<<<<<< HEAD
var drawChart2 = function() {
d3.json("scripts/full.json", function (error, data) {
  console.log(data);
=======
function filterClass(value, index, array) {
  if (value.class == "a") { return value } //only values with accessory Pathways
}

accessData = fullData.filter(filterClass) // filtering inputdata
accessData.sort(function(a,b) { return b.count - a.count}) // sort descending
console.log(accessData)

graphData = [{
  "key":"frequency of occurence",
  "colour":"#1f77b4",
  "values": accessData
}] //right structure for the barChart

var horiBarChart = function() {
>>>>>>> 502203b784786a3db4898a1b401cbec64f736c75
  nv.addGraph(function() {
    var chart = nv.models.multiBarHorizontalChart()
        .x(function(d) { return d.name })
        .y(function(d) { return d.count})
        .margin({top: 30, right: 20, bottom: 50, left: 175})
        .showValues(true)
        .showControls(false);


    chart.yAxis
        .tickFormat(d3.format(',.2f'))

    d3.select('#horizontalbarchart svg')
        .datum(graphData)
      .transition().duration(500)
        .call(chart);

    nv.utils.windowResize(chart.update)

    return chart;
  });
};

horiBarChart();
