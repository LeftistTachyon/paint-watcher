#!/usr/bin/env bash
pm2 start npm --name paint-watcher --watch --attach --no-autorestart -- start
