FROM nginx

ARG UPSTREAMS=proxy
ENV UPSTREAMS=${UPSTREAMS}

COPY ./nginx.conf.tpl /etc/nginx/nginx.conf.tpl
COPY entrypoint.sh /entrypoint.sh

CMD ["/entrypoint.sh"]