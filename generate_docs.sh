#!/bin/sh
mkdir -p documentation
exec naturaldocs -i . -o HTML documentation/html/ -p documentation/conf
