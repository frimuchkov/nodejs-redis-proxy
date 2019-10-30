.PHONY : test fillRedis getValuesFromApi

test:
	docker-compose down -v
	docker-compose up -d --build
	docker-compose run --rm proxy yarn test
	docker-compose down -v

start:
	docker-compose down -v
	docker-compose up -d --build

stop:
	docker-compose down -v
	docker-compose up -d --build

fillRedis:
	docker-compose up -d
	docker-compose run --rm -T proxy yarn fill_redis

getValuesFromApi:
	docker-compose up -d
	docker-compose run --rm -T proxy yarn get_values_from_api $@

