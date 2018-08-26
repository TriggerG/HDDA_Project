# MetabolicPathwayPrediction

## Introduction

When analyzing groups of bacterial genomes, examining metabolic pathways is essential to understand encoded biological functions. This project reconstructs potential metabolic pathways for a number of genomes from their annotation files using MinPath, followed by calculating pan-, core-, and accessory-pathways.

* pan-pathways: union of all identified pathways from all examined genomes
* core-pathways: pathways present in all examined genomes
* accessory-pathways: identified pathways, that could not be found in all examined genomes

Based on the results an html-report with extensive visualization is generated.


## Usage

```
nextflow run main.nf    [--db <path/to/database/>] 
                        [--species <species1[,species2]>]  
                        [--individuals <n>] 
                        [--out /vol/lehre/m-bs2-s4b/project_workdirs/metabolic_net_1/results/] 
```
                        
    --db  
Local database with the substructure ./\<species\>/latest_assembly_versions/\<assemblyID\>/\<assemblyID\>_genomic.gff.gz  
where \<species\> matches the --species parameter and the \<assemblyID\> looks like GCF_000006765.1_ASM676v1.  
        
    --species  
Species to be analyzed that are part of the specified local database (see --db).  
Can be a comma-seperated list of different species.

    --individuals  
Number of included genome assemblies per specified species.  
Actual number might be less, if $db/\<species\>/latest_assembly_versions/ does not contain enough suitable assemblies.

    --out  
Output directory for folder with MinPath reports.  
                

## Examples

Default parameters:
```
nextflow run main.nf    --db /vol/biodb/ncbi_genomes/refseq/bacteria
                        --species Escherichia_coli
                        --individuals 15
                        --out /vol/lehre/m-bs2-s4b/project_workdirs/metabolic_net_1/results/
```
  

Run pipeline for three different species with 10 individuals each:
```
nextflow run main.nf    --db /vol/biodb/ncbi_genomes/refseq/bacteria
                        --species Escherichia_coli,Pseudomonas_aeruginosa,Haemophilus_influenzae
                        --individuals 10
                        --out /vol/lehre/m-bs2-s4b/project_workdirs/metabolic_net_1/results/
```


## Implementation details

### 1. Predicting potential pathways

In order to examine metabolic pathways of bacterial genomes, some kind of input data representing the genomes of interest is required. 
While it would be possible to start with the actual genomic sequences in form of fasta-files, which are present in the local database as well,
we decided to use the available genome annotations in form of .gff-files to avoid the time-consuming step of genome annotation.  

Since for pathway prediction a list of encoded genes for each genome of interest is required, this information has to be extracted from the annotation files.
Unfortunately, not all genome annotation files use the same kind of identifier to provide information on annotated genes. Therefore, the apparently most widely used one,
namely the locus tag, was chosen as primary gene identifier and thus only annotation files comprising locus tags for annotated genes can be included in the analysis.  

For carrying out pathway prediction using MinPath, it is most convenient to use KEGG Orthology identifiers (called K numbers) as input, 
since KEGG pathways are basically networks of K number nodes. To map locus tags to K numbers, an intermediate step via KEGG gene identifiers (called KEGG IDs)
turned out to be most favorable, as KEGG IDs can easily be linked to corresponding K numbers using the KEGG API. Additionally, most KEGG IDs consist of the
KEGG organism code followed by the gene's locus tag (\<org\>:\<gene\>), so that they can be manually build after retrieving the organism code.
However, since not all KEGG IDs comply with this scheme, certain genomes of interest may be discarded during the process, reducing the initially specified number of individuals
for which pathways are predicted.

Based on the MinPath output, potential metabolic pathways are then retrieved by filtering for KEGG pathway maps that belong either to the category "Metabolism" 
or to "Drug resistance" within the category of "Human Diseases" (KEGG pathway map digit number below 02000).



