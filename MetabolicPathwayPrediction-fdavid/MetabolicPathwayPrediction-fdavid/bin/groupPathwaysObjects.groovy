#!/vol/software/bin/groovy
/**
 * 
 * Collect and structure results from pathway prediction and filter for 
 * metabolic pathways.
 * 
 * This script takes an array of file names, as well as a string representation
 * of the nextflow "params" dictionary. The specified files contain JSON objects
 * which store information on the predicted pathways for each individual with 
 * the keys "id" for the pathway id, "from" for the individual, and "name" for 
 * the pathway name. The script collects the predicted pathways of each 
 * individual into one data object for all individuals grouped by pathway id. 
 * This script also retrieves information on KEGG PATHWAY class and description
 * for each pathway and filters them for metabolic pathways only.
 * Finally, the resulting JSON object is written to a JSON file as well as to a 
 * JavaScript file (together with the "params" dictonary) to later use for 
 * visualization.
 */

@Grab('org.codehaus.groovy.modules.http-builder:http-builder:0.7')
@Grab('oauth.signpost:signpost-core:1.2.1.2')
@Grab('oauth.signpost:signpost-commonshttp4:1.2.1.2')

import groovyx.net.http.RESTClient
import static groovyx.net.http.ContentType.*
import groovy.json.JsonOutput
import groovy.json.JsonSlurper


// transfer array of file names into array of JSON objects
allPathways = args[0][1..-2].split(', ')
    .collect{filename -> 
        new JsonSlurper().parse(new File(filename))
    }

// parse string representation of params map back to map object
paramsString = args[1]
params = paramsString[1..-2].split(', ')
    .collectEntries{ entry ->
        def pair = entry.split(':')
        [(pair.first()): pair.last()]
    }


fileCount = allPathways.collect{it["from"]}.unique().size()

def client = new RESTClient('http://rest.kegg.jp/')

groupedPathways = allPathways.flatten().groupBy{it["id"]}.collect{
    pid, contents -> 

    result = [:]
    result["id"] = pid
    result["name"] = contents[0]["name"]
		
    // initialize with "NA" and replace when data is available
    result["group"] = "NA"
    description = null

    try { 
        resp = client.get(path : "get/path:map${pid}")
        dat = new BufferedReader(resp.getData())			
        dat.eachLine{ line ->
            if (line =~ /^CLASS/) {
                pathwayGroup = (line - ~/CLASS\s*/).split(";").collect{it.trim()}
	        result["group"] = [pathwayGroup[0], pathwayGroup[1]]
	    } 
            if (line =~ /^DESCRIPTION/) {
                description = line - ~/DESCRIPTION\s*/
            }
        }
    } catch(Exception ex){}
		
    result["availableInSpec"] = contents.collect{it["from"]}
		
    if(contents.size() == fileCount) {
        result["class"] = "core"
    } else {
        result["class"] = "accessory"
    }

    result["count"] = contents.size()
    result["description"] = description ? description : "NA"
        
    return result
}

// filter for metabolic pathways only
groupedMetabolicPathways = groupedPathways.findAll{ results -> 
    results.group[0] == "Metabolism"
    }
	
json = JsonOutput.prettyPrint(JsonOutput.toJson(groupedMetabolicPathways))

params["individuals"] = fileCount
paramsJson=JsonOutput.prettyPrint(JsonOutput.toJson(params))
	
new File('full.json').text = json
new File('full.js').text = """var fullData = ${json};\nvar params=${paramsJson};"""

