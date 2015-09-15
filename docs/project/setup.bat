@echo off

rem ###
rem # Setup script to be executed in a bpmn.io project root (some empty folder chosen by YOU)
rem ##

set BASE=%CD%

echo cloning repositories

git clone git@github.com:bpmn-io/diagram-js.git
git clone git@github.com:bpmn-io/moddle.git
git clone git@github.com:bpmn-io/moddle-xml.git
git clone git@github.com:bpmn-io/cmmn-js.git
git clone git@github.com:bpmn-io/cmmn-moddle.git


echo done.


echo setup diagram-js

cd %BASE%\diagram-js
npm install


echo setup moddle

cd %BASE%\moddle
npm install


echo setup moddle-xml

cd %BASE%\moddle-xml
mkdir node_modules
mklink /D %BASE%\moddle-xml\node_modules\moddle %BASE%\moddle
npm install


echo setup cmmn-moddle

cd %BASE%\cmmn-moddle
mkdir node_modules
mklink /D %BASE%\cmmn-moddle\node_modules\moddle-xml %BASE%\moddle-xml
mklink /D %BASE%\cmmn-moddle\node_modules\moddle %BASE%\moddle
npm install


echo prepare setup cmmn-js

mkdir %BASE%\cmmn-js\node_modules

rem link cmmn-js
mklink /D %BASE%\cmmn-js\node_modules\cmmn-moddle %BASE%\cmmn-moddle
mklink /D %BASE%\cmmn-js\node_modules\diagram-js %BASE%\diagram-js


echo setup cmmn-js

cd %BASE%\cmmn-js
npm install


cd %BASE%