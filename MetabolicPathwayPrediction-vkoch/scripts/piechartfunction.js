var data = testdata2;
var height = 350;
var width = 350;

var drawPiechart = function () {
    nv.addGraph(function () {
        var piechart = nv.models.pieChart()
            .x(function (d) {
                return d.label
            })
            .y(function (d) {
                return d.value
            })
            .showLabels(true)     //Display pie labels
            .labelThreshold(.05)  //Configure the minimum slice size for labels to show up
            .labelType("percent") //Configure what type of data to show in the label. Can be "key", "value" or "percent"
            .donut(true)          //Turn on Donut mode. Makes pie chart look tasty!
            .width(width)
            .height(height)
            .donutRatio(0.35)     //Configure how big you want the donut hole size to be.
        ;

        d3.select("#piechart svg")
            .datum(data)
            .transition().duration(600)
            .call(piechart);

        nv.utils.windowResize(function () {
            piechart.update()
        });
        return piechart;
    });
};

drawPiechart();