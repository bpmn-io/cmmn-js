#!/bin/bash

###
# Setup script to be executed in a bpmn.io project root (some empty folder chosen by YOU). Use if you do not want to rely on npm link.
###

base=`pwd`

echo cloning repositories

git clone git@github.com:bpmn-io/diagram-js.git
git clone git@github.com:bpmn-io/moddle.git
git clone git@github.com:bpmn-io/moddle-xml.git
git clone git@github.com:bpmn-io/cmmn-js.git
git clone git@github.com:bpmn-io/cmmn-moddle.git


echo done.

echo setup diagram-js

cd $base/diagram-js
npm install


echo setup moddle

cd $base/moddle
npm install


echo setup moddle-xml

cd $base/moddle-xml
mkdir node_modules
ln -s $base/moddle node_modules/moddle
npm install


echo setup cmmn-moddle

cd $base/cmmn-moddle
mkdir node_modules
ln -s $base/moddle node_modules/moddle
ln -s $base/moddle-xml node_modules/moddle-xml
npm install


echo setup cmmn-js

cd $base/cmmn-js
mkdir node_modules
ln -s $base/moddle node_modules/moddle
ln -s $base/cmmn-moddle node_modules/cmmn-moddle
ln -s $base/diagram-js node_modules/diagram-js
npm install


cd $base

echo all done.