var data = fullData;

// Extract values for HTML header
var col = [];                               // variable col contains the array of Strings of each header
for (var i = 0; i < data.length; i++) {
    for (var key in data[i]) {              // iterating for each key (header)
        if (col.indexOf(key) === -1) {
            //console.log(key);

            if (key != "availableInSpec") {       // not needed as header for the table
                col.push(key);
            }
        }
    }
    for (var value in data[i]["availableInSpec"]) {                     // adding each element of the subarray in availableInSpec once to the array of headers
        if (col.indexOf(data[i]["availableInSpec"][value]) === -1) {
            col.push(data[i]["availableInSpec"][value]);
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

for (var i = 0; i < data.length; i++) {
    var currentRow = [];
    for (var j = 0; j < col.length; j++) {
        if (j < 4) {                                        // first 4 cols are filled with data from JSON (id, name, counts, class)
            currentRow.push(data[i][col[j]]);
        } else {
            var entry = " ";                                        // the rest of the cells are filled with a whitespace
            for (var key in data[i]["availableInSpec"]) {           // condition for every element in subarray availableInSpec in data
                if (data[i]["availableInSpec"][key] === col[j]) {   // check: if the element in the list of availableInSpec is the same as the header -> does the pathway occur in the species
                    entry = "yes";                                  // is it the same, the belonging cell is filled with yes instead of whitespace
                }
            }
            currentRow.push(entry);                         // each row is individually added to a subarray
        }
    }
    dataSet.push(currentRow);                               // all row subarrays are added to the dataset to create the DataTable
}

var colNames = [{title: "ID"}, {title: "Pathway"}, {title: "Frequency"}, {title: "Group"}];
for (var i = 4; i < col.length; i++) {
    colNames.push({title: col[i]});
}

// Initialization for applying DataTable Layout to table
$(document).ready(function () {
    $('#pathwaytable').DataTable({
        data: dataSet,
        columns: colNames,
        aLengthMenu: [
            [5, 25, 50, 100, -1],
            [5, 25, 50, 100, "All"]
        ],
        iDisplayLength: 5,
        "scrollX": true
        //deferRender:    true,
        //scrollY:        400,
        //scrollCollapse: true,
        //scroller:       true
        //scrollCollapse: false,
        //fixedColumns:   {
        //  leftColumns: 2
        //}
    });
});
