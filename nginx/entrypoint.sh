#!/bin/bash

cp /etc/nginx/nginx.conf.tpl /etc/nginx/nginx.conf

correctUpstreams=$(echo ${UPSTREAMS} | sed "s/;/\n/g")
correctUpstreams=$(echo ${correctUpstreams} | sed "s/^/server /g")
correctUpstreams=$(echo ${correctUpstreams} | sed "s/$/;/g")

sed -i "s/{{ upstreams }}/${correctUpstreams}/g" /etc/nginx/nginx.conf

nginx -g "daemon off;"