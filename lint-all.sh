#!/bin/bash

set -e

echo "Linting go sources"
pushd ./go
./lint.sh
popd

echo "Linting Typescript sources"
pushd ./ts
npm run lint
popd

pushd ./test
npm run lint
popd
