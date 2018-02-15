#!/usr/bin/env bash

! docker build -t midburn-chatops . && echo failed to build docker image && exit 1
! docker run -it --entrypoint bash midburn-chatops -c "npm start" | grep "Error: Specify slack_token_path in environment" >/dev/null \
    && echo failed to run docker image && exit 1
echo Great Success
exit 0
