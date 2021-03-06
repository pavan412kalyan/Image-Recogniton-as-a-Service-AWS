#!/bin/bash

while true
do
    count=`ls -1 uploads/*.JPEG 2>/dev/null | wc -l`
    if [ $count != 0 ]
    then 

        for FILE in uploads/*.JPEG; 
        do 
            if [[ -n "$FILE" ]]; then
                echo 2

        # Do what you want
            echo $FILE
            node ./merger.js $FILE; 
            fi
        
        
        done
        node ./create_ec2.js;
    fi 
done



