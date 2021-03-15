#!/bin/bash

while true
do
    count=`ls -1 uploads/*.JPEG 2>/dev/null | wc -l`
    if [ $count != 0 ]
    then 
       
        echo "waiting...for uploads"
        sleep 5
        for FILE in uploads/*.JPEG; 
        do 
            if [[ -n "$FILE" ]]; then
                echo 2

        # Do what you want
            echo $FILE
            node ./merger.js $FILE; 
            fi
        
        
        done
        sleep 2
        node ./create_ec2.js;
    fi 
    node ./sqs_fetch.js

done



