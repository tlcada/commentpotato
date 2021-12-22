$image = 12345.dkr.ecr.eu-north-1.amazonaws.com
$tag = commentpotato_server:latest
$login = aws ecr get-login-password --region eu-north-1
docker login --username AWS --password $login $image

# Build Docker image
docker build -t $tag .

# Push docker image to ECR
docker tag $tag $image/$tag
docker push $image/$tag

# Deploy to production
eb deploy

# Clean containers and images
docker rm $(docker ps -a -q)
docker rmi $(docker images -q)
