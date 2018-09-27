#!/bin/bash

npm run release
cp public/index.html public/200.html
cp -R docs public