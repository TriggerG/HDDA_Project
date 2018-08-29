#!/usr/bin/env nextflow
import groovy.json.JsonOutput

params.species = 'Escherichia_coli'
params.db = '/vol/biodb/ncbi_genomes/refseq/bacteria'
params.out = '/vol/lehre/m-bs2-s4b/project_workdirs/metabolic_net_1/'
params.minpath = '/ceph/software/share/MinPath/'

process getAnnotation {

	output:
	set file("*.gff") into collected_annotation_ch

	script:
	"""
	getAnnotation.sh $params.species $params.db
	"""
}

// extract file name as assembly identifier for later use in tags and file names
annotations_ch = collected_annotation_ch.flatten()
                                        .map{file -> tuple(file.baseName.minus("_genomic"), file)}

process getKOIdentifiers {

	tag {name}

	input:
	set name, file(annotation_gff) from annotations_ch
	
	output:
	set name, file("${name}.ko"), file("lineage") into ko_ch1

	script:
	"""
	getKOIdentifiers.sh $name $annotation_gff
	"""
}

// replace file containing species and lineage name with the actual values
ko_ch2 = ko_ch1.map{ name, koFile, lineageFile ->
			fullName = lineageFile.text.trim()
			species = fullName.split('_')[(0..1)].join('_')
			lineage = fullName.split('_')[(2..-1)].join('_')
			tuple(name, species, lineage, koFile) }

process predictPathways {

	tag {name + " " + species + " " + lineage}

	input:
	set name, species, lineage, file(ko) from ko_ch2.filter{it[3].size() > 0}	

	output:
	set name, species, lineage, file("${name}.reduced.ko.report") into pathways_ch

	script:
	"""
	predictPathways.sh $name $ko $params.minpath
	
	# filter for true minpath pathways and extract only columns for pathway id and name
	awk 'BEGIN {FS=" "}
            /minpath 1/ {
                printf "%s\t", \$2;
                for (i = 14; i <= NF; i++)
                    printf "%s ", \$i;
                print ""
        }' ${name}.ko.report > ${name}.reduced.ko.report
	"""
}

process getValuesFromMinPathOutput {

	tag {name + " " + species + " " + lineage}

	input:
	set name, species, lineage, pwFile from pathways_ch

	output:
	file('individual.json') into pathwaysObjects_ch

	exec:
	groovyPathwaysObjects = file(pwFile).readLines().collect { line ->
	    content = line.split("\t")
	    result = [:]
	    result["id"] = content[0]
	    result["from"] = ["species":species, "lineage":lineage.replace("_", " "), "id":name]
	    result["name"] = content[1]
	    return result
	}
	task.workDir.resolve('individual.json').text = JsonOutput.toJson(groovyPathwaysObjects)
}

process groupPathwaysObjects {

	input:
	val allPathways from pathwaysObjects_ch.filter{it.size()>0}.collect()

	output:
	set file("full.json"), file("full.js") into results_ch
	
	script:
	"""
	groupPathwaysObjects.groovy '$allPathways' '$params'
	"""
}

process zipFinalResults {

	publishDir "${params.out}", mode: 'copy'
	
	input:
	set file(jsonFile), file(jsFile) from results_ch

	output:
	file "results.zip"

	"""
	mkdir ./results
	cp -r $workflow.projectDir/scripts ./results/scripts
	cp $workflow.projectDir/index.html ./results/index.html
	cp -r $workflow.projectDir/styles ./results/styles
	cp $jsFile ./results/scripts/full.js
	cp $jsonFile ./results
	zip -r results{.zip,}
	"""
}
