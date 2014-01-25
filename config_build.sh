#!/bin/bash
# Build config for build.sh
VERSION=`sed -n 's/.*em\:version\=\"\(.*\)\"/\1/p' install.rdf`
APP_NAME=webpg-firefox-v${VERSION}
CHROME_PROVIDERS="extension locale extension/skin"
CLEAN_UP=1
ROOT_FILES="AUTHORS COPYING"
ROOT_DIRS="defaults plugins"
BEFORE_BUILD=
#AFTER_BUILD="xpisign -f -k /home/kylehuff/.ssl/codesigning.pem ${APP_NAME}.xpi ${APP_NAME}_s.xpi"
AFTER_BUILD="firefox ${APP_NAME}.xpi"
