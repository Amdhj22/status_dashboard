import os
import time

Hostname = os.uname()[1]
File_path = '/mnt/airsfs3/status_log/'

while True :
    os.system('top -n 2 -d 0.5 -b -i |grep -e Cpu -e MiB -e PID -A 5 >'+ Hostname+'_cpu.tmp' )
    stat = os.stat(Hostname+'_cpu.tmp')
    if(stat.st_size>0):
        os.system('cp '+Hostname+'_cpu.tmp '+File_path+Hostname+'_cpu.log')

    os.system('nvidia-smi -q -f '+ Hostname + '_gpu.tmp')
    stat = os.stat(Hostname+'_gpu.tmp')
    if(stat.st_size>0):
        os.system('cp '+ Hostname + '_gpu.tmp '+File_path+ Hostname + '_gpu.log ')
    
    time.sleep(1)
