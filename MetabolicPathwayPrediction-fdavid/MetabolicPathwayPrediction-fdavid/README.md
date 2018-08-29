# MetabolicPathwayPrediction

## Contents
- [Introduction](#introductiion)
- [Usage](#usage)
- [Examples](#examples)
- [Requirements](#requirements)
- [Output](#output)
- [Implementation Details](#implementation-details)

## Introduction

When analyzing groups of bacterial genomes, examining metabolic pathways is essential to understand encoded biological functions. 
This project reconstructs potential metabolic pathways for a number of genomes from their annotation files using 
[MinPath](http://omics.informatics.indiana.edu/MinPath/), followed by calculating pan-, core-, and accessory-pathways.

* pan-pathways: union of all identified pathways from all examined genomes
* core-pathways: pathways present in all examined genomes
* accessory-pathways: identified pathways, that could not be found in all examined genomes

Based on the results an html-report with extensive visualization is generated using [NVD3](http://nvd3.org/).

## Usage

```bash
nextflow run main.nf    [--species <species1[,species2]>] \
                        [--db <path/to/database/>]  \
                        [--minpath <path/to/minpath>]
```

    --species  
Species to be analyzed that are part of the specified local database (see --db).  
Can be a comma-seperated list of different species.

    --db  
Local database with the substructure ./\<species\>/reference/\<assemblyID\>/\<assemblyID\>_genomic.gff.gz 
where \<species\> matches the --species parameter and the \<assemblyID\> looks like GCF_000006765.1_ASM676v1.
In particular, genome and annotation data from NCBI, available at ftp://ftp.ncbi.nlm.nih.gov/genomes/, is suitable for this workflow.

    --out  
Output directory for results.zip.  

    --minpath
Directory that contains MinPath software.


## Examples

Default parameters:
```bash
nextflow run main.nf    --db /vol/biodb/ncbi_genomes/refseq/bacteria  \
                        --species Escherichia_coli  \
                        --out /vol/lehre/m-bs2-s4b/project_workdirs/metabolic_net_1/results/  \
                        --minpath /ceph/software/share/MinPath/
```


Run pipeline for four different species of the family Enterobacteriaceae:
```bash
nextflow run main.nf    --db /vol/biodb/ncbi_genomes/refseq/bacteria  \
                        --species Escherichia_coli,Salmonella_enterica,Shigella_dysenteriae,Klebsiella_pneumoniae
```


## Requirements

This workflow requires already annotated bacterial genomes in form of .gff files. 
Additionally, it is necessary that the main.nf, index.html and the folders /scripts and /styles are located in the same directory. 
Otherwise the created results.zip will not contain all necessary files to build the corresponding webpage.


## Output

After running the nextflow script, a results.zip file will be created in the output directory containing:
* index.html
* /styles folder
* /scripts folder
* full.json

The index.hmtl constructs the visualization of the calculated results. All needed scripts and styles are locally linked in the corresponding folders. 
For better browser compatibility the html script actually uses a .js file which is located in the /scripts folder.

## Implementation details

### 1. Predicting potential pathways

In order to examine metabolic pathways of bacterial genomes, some kind of input data representing the genomes of interest is required.
While it would be possible to start with the actual genomic sequences in form of fasta-files, which are present in the local database as well,
we decided to use the available genome annotations in form of .gff files to avoid the time-consuming step of genome annotation.  

Since for pathway prediction a list of encoded genes for each genome of interest is required, this information has to be extracted from the annotation files.
Our workflow is tailored to annotation files from Refseq reference genomes and thus locus tags were chosen as primary gene identifier.  

For carrying out pathway prediction using MinPath, it is most convenient to use KEGG ORTHOLOGY identifiers (called K numbers) as input,
since KEGG pathways are basically networks of K number nodes. To map locus tags to K numbers, an intermediate step via KEGG GENE identifiers (called KEGG IDs)
turned out to be most favorable, as KEGG IDs can easily be linked to corresponding K numbers using the KEGG API. Additionally, most KEGG IDs consist of the
KEGG organism code followed by the gene's locus tag (\<org\>:\<gene\>), so that they can be manually build after retrieving the organism code.
However, since not all KEGG IDs comply with this scheme, certain genomes of interest may be discarded during the process, reducing the initially specified number of individuals
for which pathways are predicted.
In the process of retrieving the organism code, the lineage name is also extracted from the KEGG GENOME database entry, which allows a more comprehensible label
for the individual genomes during visualization.


### 2. Estimating core/accessory pathways and storing results in suitable data structure

Based on the MinPath output, at first one data object for each genome is created, resembling an array of pathway entries
with each entry being a map with the keys "id" for the KEGG PATHWAY ID, "from" for the genome in which the pathway was found,
and "name" for the pathway name. 

For each genome:  
```JSON
[  
    {  
        "id": <KEGG PATHWAY ID>,  
        "from": {"species": <species>, "lineage": <lineage>, "id": <assemblyAccession_assemblyName>},  
        "name": <pathway name>  
    },  
    ...  
]  
```

In the next step, all genome-wise data objects are combined into one by grouping by KEGG PATHWAY ID
and collecting all genomes for which a certain pathway was predicted into an array designated "availableInSpec". 
For additional information on classification and description of the individual pathways, the KEGG API is used again to retrieve the
relevant KEGG PATHWAY database entries, and results for each pathway are stored as entries "group" and "description" in the corresponding map.
Since this workflow focuses on metabolic pathways, a filtering step for pathways that belong to the KEGG PATHWAY class "Metabolism" is carried out afterwards. 

For subsequent estimation of core and accessory pathways, the number of all analyzed genomes is simply compared to the number of genomes present in 
"availableInSpec" for each pathway, and if the latter equals to the total number of genomes, the pathway is flagged as "core pathway".
Reversely, if it is less than the total number, it is marked as "accessory pathway".  


All these information are stored in the "full.json" file with the following structure:

```JSON
[
    {
        "id": <KEGG PATHWAY ID>,
        "name": <pathway name>,
        "group": [
            <KEGG top-level pathway classification>,
            <KEGG sub-level pathway classification>
        ],
        "availableInSpec": [
            {
                "id": <assemblyAccession_assemblyName>,
                "lineage": <lineage>,
                "species": <species>
            },
            {
                "id": <assemblyAccession_assemblyName>,
                "lineage": <lineage>,
                "species": <species>
            },
            ...
        ],
        "class": <core or accessory>,
        "count": <number of genomes for which this pathway was predicted>,
        "description": <pathway description>
        },
        ...
]
```

Additionally, the whole JSON object is written (together with the Nextflow "params" dictionary) to the JavaScript file "full.js"
in order to allow easy access during visualization.

### 3. Visualization via Webpage

In the final step, the overall results are visualized in a webpage. The basis, of course, is an html file. Several tools to design the page and create interactive charts are used. Every tool is avaiable locally and linked to the head section of the html file. Those are:
* [NVD3](http://nvd3.org/) for charts, based on D3.js
* [D3.js](https://d3js.org/) document manipulation
* [Bootstrap](https://getbootstrap.com/) for designing
* [jQuery](https://jquery.com/) DOM navigation and manipulation
* [DataTable](https://datatables.net/) table creation; based on jQuery

All the associated files are stored in specific directories. Apparently, NVD3 doesn't work with the latest version of D3j. Therefore, version 3 is used. The input data for any chart is drawn from a .js file that contains the same values as the .json file. Hence, the problem that for example Chrome is not able to acces the local .json file is bypassed. Furthermore,every chart requires a specific structure of input data, which is different from the original full.js input. That's why said structure is manually altered in the corresponding java scripts. 
