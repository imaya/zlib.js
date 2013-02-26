#!/bin/bash

#Variables
USER_DIR=/tmp/buster
MAC_CMD="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
UBUNTU_CMD="google-chrome"

# Test OS
if [ -f "$MAC_CMD" ]
then
	CMD="$MAC_CMD"
else
	CMD="$UBUNTU_CMD"
fi

# Prepare
rm -rf $USER_DIR
mkdir -p $USER_DIR"/Default/"

# Execute the command
exec "$CMD" --user-data-dir="$USER_DIR" --no-default-browser-check --no-first-run --disable-default-apps "$@"