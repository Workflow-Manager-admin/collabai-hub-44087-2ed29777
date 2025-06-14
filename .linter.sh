#!/bin/bash
cd /home/kavia/workspace/code-generation/collabai-hub-44087-2ed29777/collabai_hub
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

