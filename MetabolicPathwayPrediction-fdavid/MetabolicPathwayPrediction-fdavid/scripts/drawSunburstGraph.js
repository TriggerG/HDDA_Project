/*
-----------------------------------------------------------------------------------------------------
Constructing of the Sunburst Chart
-----------------------------------------------------------------------------------------------------
~ The sunburst chart represents a visualization of hierarchical piechart, like a tree diagram.
~ The Pan pathways are divided in there groups Core and Accessory, which are again divided
~ in their metabolism classes and again in their corresponding metabolic pathways.

~ First, all individual pathways, which belong to the core are filtered. The same for the Accessory pathways.
~ Then the functions, which belong to the both groups are filtered separately as well.
~ Iterate over the data and check, to which metabolic class belongs the pathway and build the array for nvd3 visualization.
~ Finally, bring the assigned pathways in the right format to ensure nvd3 to implement the chart correctly and call the sunburst function.
*/

var sunData = fullData;

/*
--------------------------------------------------------------
~ GET ALL PATHWAYS SEPARATELY FOR CORE AND ACCESSORY
~ SAME FOR METABOLIC CLASSES FOR BOTH GROUPS AGAIN SEPARATELY
--------------------------------------------------------------
 */

var corePathways = [];
var corepathFunction = [];
var accPathways = [];
var accpathFunction = [];

for (var i = 0; i < sunData.length; i++) {
    // Get all individual core pathways
    if (sunData[i]["class"] === "core") {
        if (corePathways.indexOf(sunData[i]["name"]) === -1) {
            corePathways.push(sunData[i]["name"]);
        }
        if (sunData[i]["group"] === "NA") {
            if (corepathFunction.indexOf("NA") === -1) {
                corepathFunction.push("NA");
            }
        } else if (corepathFunction.indexOf(sunData[i]["group"][1]) === -1) {
            corepathFunction.push(sunData[i]["group"][1]);
        }
    }

    // Get all individual accessory pathways
    if (sunData[i]["class"] === "accessory") {
        if (accPathways.indexOf(sunData[i]["name"]) === -1) {
            accPathways.push(sunData[i]["name"]);
        }
        if (sunData[i]["group"] === "NA") {
            if (accpathFunction.indexOf("NA") === -1) {
                accpathFunction.push("NA");
            }
        } else if (accpathFunction.indexOf(sunData[i]["group"][1]) === -1) {
            accpathFunction.push(sunData[i]["group"][1]);
        }
    }
}

/*
-----------------------------------------------------
~ ASSIGN EACH PATHWAY TO CORRESPONDING METABOLIC CLASS
-----------------------------------------------------
 */

// Iterate over the data and check, to which metabolic class belongs the pathway and build the array for nvd3 visualization
// implemented both for core and accessory
var coreFunctions = [];
for (var j = 0; j < corepathFunction.length; j++) {
    var coreFunctionChildren = [];
    for (var i = 0; i < sunData.length; i++) {
        if (sunData[i]["class"] === "core") {
            if (sunData[i]["group"] === corepathFunction[j] || sunData[i]["group"][1] === corepathFunction[j]) {
                var child = {"name": sunData[i]["name"]};
                coreFunctionChildren.push(child);
            }
        }
    }
    coreFunctions.push({"name": corepathFunction[j], "size": coreFunctionChildren.length, "children": coreFunctionChildren});
}

var accFunctions = [];
for (var j = 0; j < accpathFunction.length; j++) {
    var accFunctionChildren = [];
    for (var i = 0; i < sunData.length; i++) {
        if (sunData[i]["class"] === "accessory") {
            if (sunData[i]["group"] === accpathFunction[j] || sunData[i]["group"][1] === accpathFunction[j]) {
                var child = {"name": sunData[i]["name"]};
                accFunctionChildren.push(child);
            }
        }
    }
    accFunctions.push({"name": accpathFunction[j], "size": accFunctionChildren.length, "children": accFunctionChildren});
}

/*
-----------------------------------------------------
~ BRING IN THE REQUIRED FORMAT TO ENSURE NVD3
~ TO BUILD THE CHART AND CALL FUNCTION
-----------------------------------------------------
 */

// Finally, bring the assigned pathways in the right format to ensure nvd3 to implement the chart correctly
function sData() {
    return [{
        "name": "Pan", "size": corePathways.length + accPathways.length,
        "children": [
            {
                "name": "Core", "size": corePathways.length,
                "children": coreFunctions
            },
            {
                "name": "Accessory", "size": accPathways.length,
                "children": accFunctions
            }
        ]
    }]
}

// Call the nvd3 sunburst function
var drawSunburst = function () {
    nv.addGraph(function() {
        var sunChart = nv.models.sunburstChart();
        sunChart.color(d3.scale.category20c());
        d3.select("#sunburst svg")
            .datum(sData())
            .transition().duration(1200)
            .call(sunChart);
        nv.utils.windowResize(sunChart.update);
        return sunChart;
    });
}

drawSunburst();