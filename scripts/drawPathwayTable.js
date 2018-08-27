
var tdata = fullData;

// Extract values for HTML header
var col = [];                               // variable col contains the array of Strings of each header
for (var i = 0; i < tdata.length; i++) {
    for (var key in tdata[i]) {              // iterating for each key (header)
        if (col.indexOf(key) === -1) {

            if (key !== "availableInSpec" && key !== "description" && key !== "group") {       // not needed as header for the table
                col.push(key);
            }
        }
    }
    for (var key in tdata[i]["availableInSpec"]) {                 // adding names of organisms in availableInSpec once to the array of headers

        var txt = tdata[i]["availableInSpec"][key]["species"] + " " + tdata[i]["availableInSpec"][key]["lineage"];
        if (col.indexOf(txt) === -1) {
            col.push(txt);
        }
    }
}

// Create dynamic table
var table = document.createElement("table");

// Create HTML table using extracted headers
var tr = table.insertRow(-1);                   // Table row

for (var i = 0; i < col.length; i++) {
    var th = document.createElement("th");
    th.innerHTML = col[i];                      // Table header filled with Strings from col array
    tr.appendChild(th);
}
// Add data to table rows
// DataTable only works with data in HTML format or as data in an array:
// Therefore creating variable dataSet to add all needed data for the table into this array
var dataSet = [];

for (var i = 0; i < tdata.length; i++) {
    var currentRow = [];
    for (var j = 0; j < col.length; j++) {
        if (j < 3) {                                        // first 4 cols are filled with data from JSON (id, name, counts, class)
            currentRow.push(tdata[i][col[j]]);
        } else if (j === 3) {
            if (tdata[i][col[j]] === "core") {
                currentRow.push("Core");
            } else if (tdata[i][col[j]] === "accessory") {
                currentRow.push("Accessory");
            } else {
                currentRow.push(tdata[i][col[j]]);
            }
        } else {
            var entry = " ";                                                        // the rest of the cells are filled with a whitespace
            for (var key in tdata[i]["availableInSpec"]) {// condition for every element in subarray availableInSpec in data
                var txt = tdata[i]["availableInSpec"][key]["species"] + " " + tdata[i]["availableInSpec"][key]["lineage"];
                if (txt === col[j]) {       // check: if the element in the list of availableInSpec is the same as the header -> does the pathway occur in the species
                    entry = "+";                                                  // is it the same, the belonging cell is filled with yes instead of whitespace
                }
            }
            currentRow.push(entry);                         // each row is individually added to a subarray
        }
    }
    dataSet.push(currentRow)                               // all row subarrays are added to the dataset to create the DataTable
}

var allIndividuals = col.splice(4, col.length);

var colNames = [{title: "ID"}, {title: "Pathway"}, {title: "#"}, {title: "Group"}];
var mouseOverMap = new Map();

mouseOverMap.set("ID", "KEGG Pathway ID");
mouseOverMap.set("Pathway", "Predicted metabolic pathway");
mouseOverMap.set("#", "Pathway occurs in # individuals");
mouseOverMap.set("Group", "Grouping based on occurrence of predicted pathway in reference to analyzed individuals");


for (var i = 0; i < allIndividuals.length; i++) {
    colNames.push({title: "" + (i + 1)});
    mouseOverMap.set("" + (i + 1), allIndividuals[i]);
}

// Initialization for applying DataTable Layout to table
$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip({
        trigger: 'hover',
        html: true
    });

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        $.fn.dataTable
            .tables({visible: true, api: true})
            .columns.adjust();
    });

    var table = $('table.table').DataTable({
        "data": dataSet,                  // tr
        "columns": colNames,              // th
        "aLengthMenu": [
            [10, 50, 100, -1],
            [10, 50, 100, "All"]
        ],
        "iDisplayLength": 10,
        dom: 'Bfltip',
        "responsive": true,
        "scrollX": true,
        "initComplete": function (settings, json) {
            $(this.api().table().header()).css({'background-color': '#ffffff', 'color': '#1865a5'});
            $('th').each(function () {
                if (mouseOverMap.has(this.innerHTML)) {
                    this.setAttribute('title', mouseOverMap.get(this.innerHTML));
                }
            })
            $('table.table thead th[title]').tooltip(
                {
                    "delay": 0,
                    "track": true,
                    "fade": 250,
                });
        },
        "columnDefs": [{ //createdCell wasnt working on its own so i had to define it as a default
            "targets": '_all',
            "createdCell": function (td, cellData, rowData, row, col) {
                if (cellData === "+") {
                    $(td).css({'background-color': 'MediumSeaGreen'});
                }
            }
        }]
    });

    // Apply a search to next table content
    $('#coretable').DataTable().search('Core').draw();
    $('#accessorytable').DataTable().search('Accessory').draw();
})

