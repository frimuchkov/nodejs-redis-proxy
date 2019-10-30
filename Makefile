.PHONY : test fillRedis getValuesFromApi

test:
	docker-compose down -v
	docker-compose up -d --build
	sleep 5
	docker-compose exec -T proxy yarn test
	docker-compose down -v

fillRedis:
	docker-compose up -d
	docker-compose run --rm -T proxy yarn fill_redis

getValuesFromApi:
	docker-compose up -d
	docker-compose run --rm -T proxy yarn get_values_from_api $@

