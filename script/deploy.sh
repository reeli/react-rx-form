#!/bin/bash

npm run release
cp public/index.html public/200.html
cp -R docs public
surge --project ./public --domain react-rx-form.surge.sh