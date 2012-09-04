#!/bin/sh
mkdir -p documentation/html
mkdir -p documentation/conf
exec naturaldocs -i . -o HTML documentation/html/ -p documentation/conf
