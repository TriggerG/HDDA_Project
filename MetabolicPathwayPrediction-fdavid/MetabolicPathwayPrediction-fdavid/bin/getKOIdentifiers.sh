#!/bin/bash
#
# Get list of KEGG ORTHOLOGY identifiers (called K numbers) representing the 
# annotated genes from input annotation file by extracting locus tags, then 
# manually building KEGG GENE identifiers after retrieving the organism code 
# and finally retrieving KO identifiers using the KEGG API.
# Additionally, fetch lineage name for further usage.

name=$1
annotation_gff=$2


# extract locus tags of annotated genes
awk '!/^#/ && ($3 == "gene") {print $9}' $annotation_gff | 
  egrep -o "locus_tag=[0-9a-zA-Z_]*" | 
  cut -d "=" -f 2 | uniq > ${name}.locus_tags
  
if [ $? -ne 0 ]; then
  echo "Error while extracting locus tags"
  exit 1
fi


# identify lineage name and organism code from taxon id in annotation file
taxon=$(egrep -m 1 -o "taxon:[0-9]*" $annotation_gff | cut -d ":" -f2)
curl http://rest.kegg.jp/find/genome/$taxon > taxonSearch
cut -f2 taxonSearch | awk 'BEGIN{FS=";"} {print $NF}' | sed 's/^ //' | 
  sed 's/ /_/g' | head -n 1 > lineage
cut -f2 taxonSearch | grep ", $taxon;" | cut -d "," -f1 > orgCode

if [ $? -ne 0 ]; then
  echo "Error while identifying organism code"
  exit 1
fi


# run for each identified organism code since for some taxon ids
# multiple organism codes are deposited in KEGG GENOME database
while read orgCode; do

  # manually build kegg identifier (<orgCode>:<locus_tag>)
  sed "s/^/$orgCode:/" ${name}.locus_tags >> ${name}.kid

  if [ $? -ne 0 ]; then
    echo "Error while building Kegg identifiers"
    exit 1
  fi

  # get mapping file (kegg identifier -> ko identifier)
  curl http://rest.kegg.jp/link/ko/$orgCode > kid2ko

  if [ $? -ne 0 ]; then
    echo "Error while retrieving the 'KeggID to K number' mapping file"
    exit 1
  fi

  # get relevant lines from mapping file
  grep -f ${name}.kid -F kid2ko | sed 's/ko://g' >> ${name}.ko

  if [ $? -ne 0 ]; then
    echo "Error while extracting K numbers"
    exit 1
  fi

done < orgCode


if [[ $(wc -l ${name}.ko | cut -d " " -f1) -eq 0 ]]; then
  echo "No K numbers found for $name"

  # create empty file to avoid error due to missing output file
  # (samples with empty files are sorted out by channel operation)
  touch ${name}.ko
fi

