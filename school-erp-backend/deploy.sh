#!/bin/bash
# ════════════════════════════════════════════════════════════════════════════
# School ERP — Build & Deploy Script
# Usage:
#   ./deploy.sh uat      — Deploy to UAT
#   ./deploy.sh prod     — Deploy to Production
# ════════════════════════════════════════════════════════════════════════════

set -e

ENV=${1:-uat}

if [[ "$ENV" != "uat" && "$ENV" != "prod" ]]; then
  echo "Usage: ./deploy.sh [uat|prod]"
  exit 1
fi

ENV_FILE=".env.${ENV}"
COMPOSE_FILE="docker-compose.${ENV}.yml"

echo "╔══════════════════════════════════════════════════╗"
echo "║  School ERP Deploy — Environment: ${ENV^^}            ║"
echo "╚══════════════════════════════════════════════════╝"

# 1. Check env file exists
if [ ! -f "$ENV_FILE" ]; then
  echo "❌  $ENV_FILE not found. Copy .env.${ENV}.example to $ENV_FILE and fill in values."
  exit 1
fi

# 2. Pull latest code (optional — skip if running manually)
# git pull origin main

# 3. For UAT — build images locally
if [ "$ENV" == "uat" ]; then
  echo "🔧  Building Docker images..."
  docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache
fi

# 4. For PROD — pull pre-built images from registry
if [ "$ENV" == "prod" ]; then
  source "$ENV_FILE"
  echo "📦  Pulling production images from registry: $DOCKER_REGISTRY..."
  docker pull "${DOCKER_REGISTRY}/erp-api-gateway:${APP_VERSION:-latest}"
  docker pull "${DOCKER_REGISTRY}/erp-auth-service:${APP_VERSION:-latest}"
  docker pull "${DOCKER_REGISTRY}/erp-core-service:${APP_VERSION:-latest}"
  docker pull "${DOCKER_REGISTRY}/erp-lms-service:${APP_VERSION:-latest}"
  docker pull "${DOCKER_REGISTRY}/erp-fee-service:${APP_VERSION:-latest}"
fi

# 5. Take down old containers
echo "⏬  Stopping old containers..."
docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down

# 6. Start new containers
echo "🚀  Starting services..."
docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

# 7. Health check
echo "⏳  Waiting for services to start (30s)..."
sleep 30

echo "🔍  Container status:"
docker-compose -f "$COMPOSE_FILE" ps

echo ""
echo "✅  Deployment to ${ENV^^} complete!"
echo ""
if [ "$ENV" == "uat" ]; then
  echo "   API Gateway:  http://localhost:8080"
  echo "   PgAdmin:      http://localhost:5051"
else
  echo "   API:          https://admin.schoolerp.app/api/"
fi
