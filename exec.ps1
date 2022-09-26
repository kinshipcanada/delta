docker build -t kinship-website .
docker run --init -p 3000:3000 -p 3001:3001 -it kinship-website
