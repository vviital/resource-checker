#!/bin/bash

if [ $# -eq 0 ]
then
  echo 'Running tests in all containers'
  docker-compose -f docker-compose.test.yml up -d
  packages=$(lerna ls)
  for package in $packages;
  do
    container="${package/\@resource-checker\//}"
    docker-compose  exec -e PACKAGE=$package $container yarn run test-package;
  done
else
  echo "Running tests in $1";
  docker-compose -f docker-compose.test.yml up -d $1;
  docker-compose -f docker-compose.test.yml exec -e PACKAGE="@resource-checker/$1" $1 yarn run test-package;
fi
docker-compose -f docker-compose.test.yml down
