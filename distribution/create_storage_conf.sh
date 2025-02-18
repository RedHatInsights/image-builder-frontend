#!/usr/bin/env bash

mkdir -p /etc/containers

tee -a /etc/containers/storage.conf <<EOF
[storage]
driver = "vfs"
runroot = "/run/containers/storage"
graphroot = "/var/lib/containers/storage"
EOF
