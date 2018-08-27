/* Constructing the Barchart
Fist, the values from full.js are filtered for accessory pathways (class a) and added to a new array which is then sorted.
Then a new key:value array 'graphData' is constructed to be able to use nvd3's multiBarHorizontalChart.
The consturctor of the multiBarHorizontalChart needed to be altered. The margins were changed and tooltips were added.
The array 'availableInSpec' was extracted to correclty display the species while hovering over the bars. The tooltip is diplayed as a table.
*/

var accessData = fullData.filter(filterClass)                   // filtering inputdata
accessData.sort(function(a,b) { return b.count - a.count})      // in place sorting (descending)


var graphData = [{                   // transforming to the right structure in order to draw the barchart //
  "key":"number of occurence",
  "colour":"#1f77b4",
  "values": accessData
}]

var horiBarChart = function() {
  nv.addGraph(function() {
    var chart = nv.models.multiBarHorizontalChart()
        .x(function(d) { return d.name })
        .y(function(d) { return d.count})
        .margin({top: 30, right: 80, bottom: 50, left: 300})  // changing margin left and right to evade the y-axis' cut off
        .showValues(false)
        .showControls(false)
        .showLegend(false);

    chart.yAxis
        .tickFormat(d3.format(',d'))                          // the y-axis is actually the x-axis because the chart is rotated
        .axisLabel("Quantity of Accessory Pathways");

    chart.tooltip                                                         // custom tooltip when hovering over the bars
        .gravity("e")                                                     // tooltip right from curser
        .contentGenerator(function (obj) {                                // the function returns the table for the tooltip for each bar
          var arraySpecies = extractSpecies(obj.data.availableInSpec);    // it extracts the whole array 'availableInSpec'
          var specText = "";
          arraySpecies.forEach(speciesToString);                          // content of the array is stored in 'specText'

          function speciesToString(value, index, array) {                 // extracts the content of an array and inserts single line breaks for the table
              if (index % 3 == 0 && index != 0) {
              specText = specText + value.species + " " + value.lineage + "; "  + "<br>" + "</br>"
              }
              else {
              specText = specText + value.species + " " + value.lineage + "; "
              }
          }

          return  '<table class= "bartable" > <thead> <tr> <td class=x-value colspan=3> <h5 class= "hname">' + obj.data.name + '</h5> </td> </tr> </thead>' +
                  '<tbody> <tr> <th class= "thnumber" > Num of Occurence: </th> <td class= "spacer"> </td> <td class = "tdcount">' + obj.data.count + '</td></tr>' +
                  '<tr><th class= "thspec"> Available In Species: </th> <td class= "spacer"> </td> <td class= "tdspec">' + specText + '</td> </tr>' +
                  '</tbody> </table>'
        });

      d3.select('#horizontalBarChart svg')
          .datum(graphData)
          .transition().duration(500)
          .call(chart);

      nv.utils.windowResize(chart.update)
})};

horiBarChart();   //draw barchart

/// functions //

function filterClass(value, index, array) {             // it filters only accessory Pathways
  if (value.class === "accessory") { return value }
}
function extractSpecies (value, index, array) {return value};
