#!/bin/bash

cd packages/api-subscription
yarn build-incremental &
yarn start-dev
