/*
-----------------------------------------------------------------------------------------------------
Construction of the Bar Chart
-----------------------------------------------------------------------------------------------------
~ The horizontal bar chart displays the quantity and the names of accessible Pathways (or number of bacteria that feature that pathway) predicted by the pipeline.
~ Additionally, a tooltip appears when hovering over a bar.

~ Fist, the values from full.js are filtered for accessory pathways (class a) and added to a new array which is then sorted.
~ Then a new key:value array 'graphData' is constructed to be able to use nvd3's multiBarHorizontalChart.
~ The constructor of the multiBarHorizontalChart needed to be altered. The margins were changed and tooltips were added.
~ The array 'availableInSpec' was extracted to correctly display the species while hovering over the bars. The tooltip is diplayed as a table.
*/

var accessData = fullData.filter(filterClass)                   // filter inputdata
accessData.sort(function(a,b) { return b.count - a.count})      // in place sorting (descending)


var graphData = [{                   // transform to the right structure in order to draw the barchart
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
        .showValues(true)
        .showControls(false)
        .showLegend(false);

    chart.yAxis
        .tickFormat(d3.format(',d'))                          // the y-axis is actually the x-axis because the chart is rotated
        .axisLabel("Quantity of Accessory Pathways");

    chart.tooltip                                                         // custom tooltip when hovering over the bars
        .gravity("e")                                                     // tooltip right from curser
        .contentGenerator(function (obj) {                                // the function returns the table for the tooltip for each bar
          var arraySpecies = extractSpecies(obj.data.availableInSpec);    // it extracts the whole array 'availableInSpec'
          var specText = ""
          arraySpecies.forEach(speciesToString)                         // content of the array is stored in 'specText'

          function speciesToString(value, index, array) {                 // extracts the needed content of an array and inserts single line breaks for the table
              specText = specText + value.species + " " + value.lineage + ";" + "<br>"
          }
          var splitted = specText.split(";")                              // splits the string and puts them in an array
          splitted.sort()
          splitted.shift()                                                // deletes first <br> in array

          return  '<table class= "bartable" > <thead> <tr> <td class=x-value colspan=3> <h5 class= "hname">' + obj.data.name + '</h5> </td> </tr> </thead>' +
                  '<tbody> <tr> <th class= "thnumber" > Num of Occurence: </th> <td class= "spacer"> </td> <td class = "tdcount">' + obj.data.count + '</td></tr>' +
                  '<tr><th class= "thspec" valign="top"> Available In Species: </th> <td class= "spacer"> </td> <td class= "tdspec">' + splitted + '</td> </tr>' +
                  '</tbody> </table>'
        }
      );

      d3.select('#horizontalBarChart svg')
          .datum(graphData)
          .transition().duration(500)
          .call(chart);

      nv.utils.windowResize(chart.update)
})};

horiBarChart()   //draw barchart

/// functions //

function filterClass(value, index, array) {             // it filters only accessory Pathways
  if (value.class === "accessory") { return value }
}
function extractSpecies (value, index, array) {return value};
