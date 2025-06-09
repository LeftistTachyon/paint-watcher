#!/usr/bin/env bash
pm2 start npm --name paint-watcher --attach --no-autorestart -- start
