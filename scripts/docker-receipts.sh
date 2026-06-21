#!/usr/bin/env sh
set -eu

IMAGE_NAME="${RECEIPTS_IMAGE:-receipts-local:latest}"
CONTAINER_NAME="${RECEIPTS_CONTAINER:-receipts-local}"
HOST_PORT="${RECEIPTS_PORT:-4173}"

usage() {
  echo "Usage: scripts/docker-receipts.sh build|run|stop|delete"
}

container_exists() {
  docker container inspect "$CONTAINER_NAME" >/dev/null 2>&1
}

image_exists() {
  docker image inspect "$IMAGE_NAME" >/dev/null 2>&1
}

case "${1:-}" in
  build)
    docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
    docker build --tag "$IMAGE_NAME" .
    docker image prune --force --filter "label=com.receipts.local=true" >/dev/null
    echo "Built $IMAGE_NAME"
    ;;

  run)
    if ! image_exists; then
      echo "Image $IMAGE_NAME does not exist. Run: scripts/docker-receipts.sh build" >&2
      exit 1
    fi

    docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
    docker run \
      --detach \
      --name "$CONTAINER_NAME" \
      --label com.receipts.local=true \
      --publish "127.0.0.1:${HOST_PORT}:4173" \
      "$IMAGE_NAME" >/dev/null
    echo "Running $CONTAINER_NAME at http://127.0.0.1:${HOST_PORT}/receipts/"
    ;;

  stop)
    if container_exists; then
      docker stop "$CONTAINER_NAME" >/dev/null || true
      echo "Stopped $CONTAINER_NAME"
    else
      echo "Container $CONTAINER_NAME does not exist"
    fi
    ;;

  delete)
    docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
    docker image rm "$IMAGE_NAME" >/dev/null 2>&1 || true
    docker image prune --force --filter "label=com.receipts.local=true" >/dev/null
    echo "Deleted $CONTAINER_NAME and $IMAGE_NAME"
    ;;

  *)
    usage >&2
    exit 2
    ;;
esac
