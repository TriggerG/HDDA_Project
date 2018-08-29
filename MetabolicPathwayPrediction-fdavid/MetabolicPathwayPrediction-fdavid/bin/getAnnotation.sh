#!/bin/bash
#
# Retrieve annotation files of all stored reference genomes for specified 
# species from local database.

allSpecies=$1
db=$2

# parse string of species into array (to allow more than one species)
IFS=',' read -r -a speciesArray <<< "$allSpecies"


# get annotation files for each species
for species in "${speciesArray[@]}"
do
  if [[ ! -d "$db/$species/" ]]; then
    echo "No data for $species in local database"
    continue
  fi

  for assembly in $db/$species/reference/*; do
    cp $assembly/*_genomic.gff.gz .
   
    if [ $? -ne 0]; then
      echo "Error while retrieving genome annotation"
      exit 1
    fi
  done
done


gzip -d *_genomic.gff.gz