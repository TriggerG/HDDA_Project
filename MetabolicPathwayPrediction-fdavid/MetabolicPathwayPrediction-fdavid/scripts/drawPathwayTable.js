/*
-----------------------------------------------------------------------------------------------------
Constructing of the pathway DataTable
-----------------------------------------------------------------------------------------------------
~ The Datatable represents all predicted metabolic pathways in the viable analyzed individuals.
~ The table shows the KEGG ID of the respective pathway, its classification into core and accessory
~ pathways and their number of occurrence in reference to the individuals. For reasons of clarity
~ and comprehensibility the header titles of the individuals are consecutively numbered and can
~ be viewed by hovering over the respective header. It is possible to view only core or accessory
~ pathways or search for a specific entry in the table. The columns can be ordered by clicking
~ on th header. If a pathway occurs in an individual, the corresponding cell is highlighted.
~
~ First, the values from the data are extracted for the table headers (ID, pathway, group, number,
~ and the viable individuals.
*/

var tdata = fullData;

/*
-----------------------------------------------------------------------------------------------------
~ EXTRACTING VALUES FOR TABLE HEADER
-----------------------------------------------------------------------------------------------------
~ First, the values from the data are extracted for the table headers (ID, pathway, group, number).
~ Then the viable individuals which have been added to the header.
*/

// variable col contains the entire values for the table header
// variable allIndividuals contains only the individuals
var col = [];
var allIndividuals = [];

for (var i = 0; i < tdata.length; i++) {
    for (var key in tdata[i]) {
        if (col.indexOf(key) === -1) {
            // strings not added to the table header
            if (key !== "availableInSpec" && key !== "description" && key !== "group") {
                col.push(key);
            }
        }
    }
    // merging of species and lineage and add to array
    for (var key in tdata[i]["availableInSpec"]) {
        var txt = tdata[i]["availableInSpec"][key]["species"] + " " + tdata[i]["availableInSpec"][key]["lineage"];
        if (allIndividuals.indexOf(txt) === -1) {
            allIndividuals.push(txt);
        }
    }
}

allIndividuals.sort();
for (var i = 0; i < allIndividuals.length; i++) {
    col.push(allIndividuals[i]);
}

/*
-----------------------------------------------------------------------------------------------------
~ CREATING ROWS FOR TABLE CONTENT
-----------------------------------------------------------------------------------------------------
~ DataTable only works with data in specific format, therefore creating variable dataSet to add
~ all needed data for the table into this array.
~ First, the pathways and belonging data are extracted from the datascript and were added
~ separately to a row. For first 4 columns, data is added based on the values in the datascript.
~ The rest of the cells are filled with a whitespace. Based on a condition filled with a plus
~ (and during the initialisation also filled with a different color).
~ Condition: if element in the list of availableInSpec is the same as the header,
~ precisely does the pathway occur in the respective individual.
*/

// variable dataSet contains only the content of the table rows (not the header)
var dataSet = [];

for (var i = 0; i < tdata.length; i++) {
    var currentRow = [];
    for (var j = 0; j < col.length; j++) {
        if (j < 2) {
            currentRow.push(tdata[i][col[j]]);
        } else if (j === 2) {
            if (tdata[i][col[j]] === "core") {
                currentRow.push("Core");
            } else if (tdata[i][col[j]] === "accessory") {
                currentRow.push("Accessory");
            } else {
                currentRow.push(tdata[i][col[j]]);
            }
        } else if (j === 3) {
            currentRow.push(tdata[i][col[j]]);
        } else {
            var entry = " ";
            for (var key in tdata[i]["availableInSpec"]) {
                var txt = tdata[i]["availableInSpec"][key]["species"] + " " + tdata[i]["availableInSpec"][key]["lineage"];
                if (txt === col[j]) {
                    entry = "+";
                }
            }
            currentRow.push(entry);
        }
    }
    dataSet.push(currentRow)
}

/*
-----------------------------------------------------------------------------------------------------
~ CREATING TABLE HEADER CONTENT AND MOUSEOVER CONTENT
-----------------------------------------------------------------------------------------------------
~ First, the fix titles are set. Then a map for mouseover content is created.
~ For each element in allIndividuals consecutive numbers are set in the header.
~ The belonging individual to each number is set in the map and appears
~ whenever the mouse hovers over the number.
*/

// variable conNames contains the header titles
// map mousOverMap contains the content of the mouseover for each header
var colNames = [{title: "ID"}, {title: "Pathway"}, {title: "Group"}, {title: "#"}];
var mouseOverMap = new Map();

mouseOverMap.set("ID", "KEGG Pathway ID");
mouseOverMap.set("Pathway", "Predicted metabolic pathway");
mouseOverMap.set("Group", "Grouping based on occurrence of predicted pathway in reference to analyzed individuals");
mouseOverMap.set("#", "Pathway occurs in # individuals");

for (var i = 0; i < allIndividuals.length; i++) {
    colNames.push({title: "" + (i + 1)});
    mouseOverMap.set("" + (i + 1), allIndividuals[i]);
}

/*
-----------------------------------------------------------------------------------------------------
~ CREATING THE TABLE WITH EXTRACTED VALUES AND INITIALIZATION WITH DATATABLES
-----------------------------------------------------------------------------------------------------
*/
$(document).ready(function () {
    // toggle for tabs pan, core and accessory. Applies search over the table content
    // and shows only the entries in respective groups
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        $.fn.dataTable
            .tables({visible: true, api: true})
            .columns.adjust();
    });

    /*
    -----------------------------------------------------
    ~ Initialization with DataTables
    -----------------------------------------------------
    */
    var table = $('table.table').DataTable({
        // table content
        "data": dataSet,
        "columns": colNames,
        // show entries button
        "aLengthMenu": [
            [5, 10, 25, 50, -1],
            [5, 10, 25, 50, "All"]
        ],
        "iDisplayLength": 10,
        "responsive": true,
        // horizontal scrollbar if content does not fit on screen
        "scrollX": true,
        // sets the color of the header after initialization is completed
        "initComplete": function (settings, json) {
            $(this.api().table().header()).css({'background-color': '#ffffff', 'color': '#1865a5'});

        },
        // changes the color of the cells which contain a plus
        "columnDefs": [{
            "targets": '_all',
            "createdCell": function (td, cellData, rowData, row, col) {
                if (cellData === "+") {
                    $(td).css({'background-color': 'MediumSeaGreen'});
                }
            }
        }]
    });
    /*
    -----------------------------------------------------
    -----------------------------------------------------
     */

    // Mouseover function with setting an attribute
    $('th').each(function () {
        if (mouseOverMap.has(this.innerHTML)) {
            this.setAttribute('title', mouseOverMap.get(this.innerHTML));
        }
    });

    table.$('th[title]').tooltip(
        {
            "delay": 0,
            "track": true,
            "fade": 250,
            html: true
        });

    // Apply a search to the created DataTable and assign it to
    // an own id. This table is called in the html script if the
    // respective tab is clicked
    $('#coretable').DataTable().search('Core').draw();
    $('#accessorytable').DataTable().search('Accessory').draw();
})

