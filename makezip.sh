#!/bin/sh
# Used by me on macOS to create a WebDesk zip installer
# DO NOT file a bug report or change for this
cd "./desk" && rm -rf "../desk.zip" && cp ../bootrom.js system && zip -r "../desk.zip" "apps" "system" && \
    zip -d "../desk.zip" "__MACOSX/*" "*/.DS_Store" "*/__MACOSX" || echo "Ignoring zip errors as these files are not required" && \
    rm -f system/bootrom.js && echo "done"
