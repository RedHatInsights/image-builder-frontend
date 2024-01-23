#!/bin/bash

# Download the most up-to-date imageBuilder.yaml file and overwrite the existing one
curl https://raw.githubusercontent.com/osbuild/image-builder/main/internal/v1/api.yaml -o ./api/schema/imageBuilder.yaml
