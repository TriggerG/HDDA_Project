/* constructing the barchart
Fist, the values from full.js are filtered by the accessory pathways (class a) added to a new array which is then sorted.
Then a new key:value array 'graphData' is constructed to be able to use nvd3's multiBarHorizontalChart.
The consturctor of the multiBarHorizontalChart needed to be altered. THe margins were changed and tooltips were added.

*/

var accessData = fullData.filter(filterClass)                   // filtering inputdata
accessData.sort(function(a,b) { return b.count - a.count})  // in place sorting (descending)

// transforming to the right structure in order to draw the barchart
var graphData = [{
  "key":"number of occurence",
  "colour":"#1f77b4",
  "values": accessData
}]

var horiBarChart = function() {
  nv.addGraph(function() {
    var chart = nv.models.multiBarHorizontalChart()
        .x(function(d) { return d.name })
        .y(function(d) { return d.count})
        .margin({top: 30, right: 80, bottom: 50, left: 300}) //changing margin-left and right to evade the yAxis' cut off
        .showValues(false)                                    // values left of the bars
        .showControls(false)
        .showLegend(false);

    chart.yAxis
        .tickFormat(d3.format(',d'))    //the y-axis is actually the x-axis because the chart is rotated
        .axisLabel("Quantity of Accessory Pathways");



    d3.select('#horizontalBarChart svg')
        .datum(graphData)
        .transition().duration(500)
        .call(chart);
        // custom tooltip

    chart.tooltip
        .gravity("e")                             //tooltip right from curser
        .contentGenerator(function (obj) {
          var format = d3.format(",d");
          var arraySpecies = extractSpecies(obj.data.availableInSpec);
          var txt = "";
          arraySpecies.forEach(speciesToString);

          function speciesToString(value, index, array) {
            if (index % 3 == 0 && index != 0) {
            txt = txt + value.species + " " + value.lineage + "; "  + "<br>" + "</br>"
            }
            else {
            txt = txt + value.species + " " + value.lineage + "; "
            }
          }
          console.log(txt);

          return  '<table class="bartable"><thead><tr><td class=x-value colspan=3> <h1 class= tooltip>' + obj.data.key + '</h1></td></tr></thead>' +
                  '<tbody><tr><th class= "thnumber"> Number of Occurence: </th> <td class= "spacer"> </td> <td class = "tdcount">' + "  " + obj.data.count + '</td></tr>' + //dcount in styles.css
                  '<tr><th class= "thspec"> Available In Species: </th> <td class "spacer"> </td> <td class= "tdspec">' + txt + '</td></tr>' +
                  '</tbody></table>'
        });

    nv.utils.windowResize(chart.update)
})};

horiBarChart();

/// function //

function filterClass(value, index, array) {                 //filtering only accessory Pathways
  if (value.class === "accessory") { return value }
}
function extractSpecies (value, index, array) {
  return value
 };
