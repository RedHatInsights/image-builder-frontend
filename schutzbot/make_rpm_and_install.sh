#!/bin/bash
set -euo pipefail

sudo dnf install -y \
     nodejs-npm \
     libappstream-glib

npm ci

make rpm

sudo dnf install -y rpmbuild/RPMS/noarch/*rpm
