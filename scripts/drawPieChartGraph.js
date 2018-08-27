var pdata = fullData;
var nCore = 0;
var nAcc = 0;
var nRelatable = 0;

for (var i = 0; i < pdata.length; i++) {
        if (pdata[i]["class"] === "core") {
            nCore += 1;
        } else if (pdata[i]["class"] === "accessory") {
            nAcc += 1;
        } else {
            nRelatable += 1;
        }
}

var nPan = nCore + nAcc;

var pDataset =
    [
        {
            "label": "Core",
            "value": nCore
        },
        {
            "label": "Accessory",
            "value": nAcc
        },
        {
            "label": "not relatable",
            "value": nRelatable
        }
    ];

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
            .donut(true)
            .showLegend(false)
            .width(width)
            .height(height)
            .padAngle(.08)
            .cornerRadius(5)
            .id('donut1'); // allow custom CSS for this one svg
        piechart.title("Pan: " + nPan);
        piechart.pie.labelsOutside(true).donut(true);
        d3.select("#piechart svg")
            .datum(pDataset)
            .transition().duration(1200)
            .call(piechart);

        return piechart;
    });
}

drawPiechart();