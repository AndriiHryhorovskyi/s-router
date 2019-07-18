#!/bin/bash

routers=('./bench/s-router.js' './bench/express.js' './bench/fastify.js' './bench/restify.js')
routes=('/' '/users' '/users/123' '/users/123/books' '/users/123/books/abc')
server='http://localhost:3000'
results=()
rps=(0 0 0 0)

supremum=${#routers[@]}
ri=0
while [ $ri -lt $supremum ]
  do
    node "${routers[ri]}" &
    pid=$!

    sleep 2

    for i in "${routes[@]}"
      do
        wrk "${server}${i}" -d 10 -c 1000 -t 8 > /dev/null
        tmp=($(wrk "${server}${i}" -d 10 -c 10000 -t 8 | grep 'Requests/sec:' | grep -o -E '[0-9]+(\.[0-9]+)?'))
        rps[$ri]=$(echo ${rps[$ri]}+$tmp | bc)
      done

    rps[$ri]=$(echo ${rps[$ri]}/${#routes[@]} | bc)
    kill $pid
    ((ri++))
  done
echo "s-router: ${rps[0]} RPS"
echo "express: ${rps[1]} RPS"
echo "fastify: ${rps[2]} RPS"
echo "restify: ${rps[3]} RPS"