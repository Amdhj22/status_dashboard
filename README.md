# Gpu-monitor

*gpu-monitor* is *web-server* for monitoring `nvidia-smi -q` log parsing data

*Cpu/Mem/process status monitor added.*

## Setup
```bash
$ npm install
```

install dependencies

## Run server 
```bash
$ node server.js
```

Server will be started on port `8081`

## Nginx setup
```bash
$ cp default /etc/nginx/sites-available/
```

Service should be `reloaded`

Nginx will listen on port `80`

## Run log generator
```bash
$ scp gpu_logger.py user@server:path
$ nohup python3 stat_logger.py & 
```

logfile will be passed to `/mnt/airsfs3/status_log/`

in name of `'hostname'_gpu.log` , `'hostname'_cpu.log`

*NOTE* server should be mounted with `airsfs3`

## Build docker image
```bash 
$ docker build -f Dockerfile -t stat_data:x.y.z .
```

## Run docker image
```bash
$ docker run -d -p 8080:80 -v /mnt/airsfs3/status_log:/mnt/airsfs3/status_log stat_data:x.y.z
```



