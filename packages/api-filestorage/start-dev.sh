#!/bin/bash

cd packages/api-filestorage
yarn build-incremental &
yarn start-dev
a