#!/bin/bash
#
# Predict pathways from list of KEGG ORTHOLOGY identifiers using MinPath
# with executables in directory that is passed as argument.

name=$1
ko=$2
minpath=$3

export MinPath=$3
python2.7 $3/MinPath*.py -ko $ko \
  -report $name.ko.report -details $name.ko.details > $name.ko.stdout
