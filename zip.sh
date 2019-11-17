#!/bin/bash

[[ -f ../TwitchTime.zip ]] && mv ../TwitchTime.zip ../TwitchTime_old.zip

zip -r ../TwitchTime.zip * -x "*.git*" "README*" "LICENSE" "*.DS_Store*" "*.paint*" "*.sh"
