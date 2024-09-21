# Pull images
docker pull postgres
docker pull dpage/pgadmin4

# Start Postgres container and get IP
sudo docker run --name db -e POSTGRES_PASSWORD=password -p 5432:5432 -d --net=bridge postgres
sudo docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' db


# Start Pg Admin container
sudo docker run --name pgadmin-container -p 5050:80 -e PGADMIN_DEFAULT_EMAIL=admin@test.com -e PGADMIN_DEFAULT_PASSWORD=password -d dpage/pgadmin4
