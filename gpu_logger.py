import os
import time

Hostname = os.uname()[1]
File_path = '/mnt/airsfs3/gpu_log/'

while True :
    os.system('nvidia-smi -q -f '+ Hostname + '_info.log')
    stat = os.stat(Hostname+'_info.log')
    if(stat.st_size>0):
        os.system('cp '+ Hostname + '_info.log '+File_path+ Hostname + '_info.log ')
    time.sleep(1)
