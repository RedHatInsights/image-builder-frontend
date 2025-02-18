#!/bin/bash
set -euo pipefail

# As playwright isn't supported on fedora/el, install dependencies
# beforehand.
sudo dnf install \
     alsa-lib \
     libXrandr-devel \
     libXdamage-devel \
     libXcomposite-devel \
     at-spi2-atk-devel \
     cups \
     atk

sudo useradd admin -p "$(openssl passwd foobar)"

sudo podman run \
     -e "PLAYWRIGHT_HTML_OPEN=never" \
     -e "CI=true" \
     --net=host \
     -v "$PWD:/tests" \
     --privileged  \
     --rm \
     --init \
     mcr.microsoft.com/playwright:v1.50.1-noble \
     /bin/sh -c "cd tests && npx -y playwright@1.50.1 test"

mkdir -p /tmp/artifacts/extra-screenshots
mv *.png /tmp/artifacts/extra-screenshots/
mv playwright-report /tmp/artifacts/
