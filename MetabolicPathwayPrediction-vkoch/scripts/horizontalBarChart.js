/* constructing the barchart
Fist, the values from full.js are filtered by the accessory pathways (class a) added to a new array which is then sorted.
Then a new key:value array 'graphData' is constructed to be able to use nvd3's multiBarHorizontalChart.
The consturctor of the multiBarHorizontalChart needed to be altered. THe margins were changed and tooltips were added.

*/

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
  nv.addGraph(function() {
    var chart = nv.models.multiBarHorizontalChart()
        .x(function(d) { return d.name })
        .y(function(d) { return d.count})
        .margin({top: 30, right: 80, bottom: 50, left: 250}) //changed margin-left and right to evade the yAxis' cut off
        .showValues(true)
        .showControls(false);

        // custom tooltip
        chart.tooltip.contentGenerator(function (obj) {
          var format = d3.format(",d");

          return '<table><thead><tr><td class=x-value colspan=3><h1 class=tooltip>' + obj.data.key + '</h1></td></tr></thead>' +
              '<tbody><tr><td class=key> Frequency of Occurence:</td><td class=value>' + obj.data.count + '</td></tr>' +
              '<tr><td class=key>Available In Species: </td><td class=value>' + obj.data.availableInSpec + '</td></tr>' +
              '</tbody></table>'
          });
    chart.tooltip.gravity("e") //tooltip right from curser
    chart.yAxis
        .tickFormat(d3.format(',.2f'))


    d3.select('#horizontalBarChart svg')
        .datum(graphData)
        .transition().duration(500)
        .call(chart);

    nv.utils.windowResize(chart.update)

    return chart;
  });
};

horiBarChart();
