user www-data;
worker_processes auto; # Ставим число по количеству ядер

pid        /var/run/nginx.pid;

events {
	worker_connections 1024;
	multi_accept on;
	use epoll;
}

http {
	access_log off;
	error_log /var/log/nginx/error.log;

	upstream nodejsproxy {
        hash $uri consistent;
        {{ upstreams }}
    }

    server {
        listen 80 default_server;
        listen [::]:80 default_server;

        location / {
            proxy_pass http://nodejsproxy/;
        }
    }
}
