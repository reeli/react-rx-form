#!/bin/bash

npm run release
cp public/index.html public/200.html
cp -R docs public

#npm install --global surge
#surge --project ./public --domain react-rx-form.surge.sh
