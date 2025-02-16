#!/bin/sh
# wait-for-it.sh

set -e

host=$(echo $1 | cut -d: -f1)
port=$(echo $1 | cut -d: -f2)
shift
cmd="$@"

until nc -z $host $port; do
  >&2 echo "$host:$port is unavailable - sleeping"
  sleep 1
done

>&2 echo "$host:$port is up"

if [ -n "$cmd" ]; then
  >&2 echo "Executing command: $cmd"
  exec $cmd
fi 