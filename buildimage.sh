#!/bin/bash
set -a
source .env
set +a

# Build Docker image
docker build -t backend-app . \
  --build-arg PORT \
  --build-arg AWS_ACCESS_KEY_ID \
  --build-arg AWS_SECRET_ACCESS_KEY \
  --build-arg AWS_REGION \
  --build-arg AWS_BUCKET \
  --build-arg COGNITO_USER_POOL_ID \
  --build-arg COGNITO_APP_CLIENT_ID \
  --build-arg CLOUDFRONT_DOMAIN
