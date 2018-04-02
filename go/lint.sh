#!/bin/bash
# Script that checks the code for errors.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"

function print_real_go_files {
    grep --files-without-match 'DO NOT EDIT!' $(find . -iname '*.go')
}

function check_markdown_up_to_date {
    ./gen-docs.sh
    if [[ $? -ne 0 ]]; then
      echo "ERROR: Failed to generate documentation."
      exit 1
    fi

    git diff --name-only | grep -q DOC.md
    if [[ $? -ne 1 ]]; then
      echo "ERROR: Documentation changes detected, please commit them."
      exit 1
    fi
}

function govet_all {
    echo "Running govet"
    ret=0
    for i in $(print_real_go_files); do
        output=$(go tool vet -all=true -tests=false ${i})
        ret=$(($ret | $?))
        echo -n ${output}
    done;
    if [[ $? -ne 0 ]]; then
      echo "ERROR: go vet errors detected."
      exit 1
    fi
}

function goimports_all {
    echo "Running goimports"
    ${GOPATH}/bin/goimports -l -w $(print_real_go_files)
    if [[ $? -ne 0 ]]; then
      echo "ERROR: goimports changes detected, please commit them."
      exit 1
    fi
}

check_markdown_up_to_date
goimports_all
govet_all
