# Image-Recogniton-as-a-Service-AWS

This application is build using AWS SDK Libraries in JavaScript node.js and express JS. All the tiers in the system are implemented from scratch using Node.js and ExpressJs.



### Handing asynchronous calls:
As all AWS requests are asynchronous in nature, it is necessary to handle them synchronously. We structured the code using Async and await functionalities by resolving promises and call backs. 

### Crontab:
It is used run the shell command during EC2 reboot or start-up. This crontab helps in automatic startup of App-tier functionalities on EC2 app-tier startup. 

### Bash Scripting:
We have used bash scripting in web-tier and app-tier. We have used Bash scripting to configure Controller (which is always up and running) in the Web-tier, and we have used Bash to configure Run (to start app-tier functionalities) in App-tier. 

# 1. Web Tier


### a.	Merger.js:
This code is written to upload the files to S3 input bucket, and on success we upload the image ID to the input SQS queue.

### b.	Create_ec2.js (LOAD BALANCER):
The algorithm used for the purpose of auto-scaling is implemented in this module. We get the length of the SQS queue and auto-scale the app-tier instances accordingly.
This code creates EC2 instances based on the user demand, which is determined by the SQS queue size. This module is responsible for scale-in (increase the EC2 instances) in the application.

### c.	sqs_fetch.js:
This module fetches the key (image ID) from the output sqs queue and gets the predicted output for that image ID from the output S3 bucket. 

### d.	Controller.sh:
This is a shell script, that is up and running all the time in the Web-tier. The main functionality of this script is to check the input traffic and runs the merger.js, sqs_fetch.js script and create_ec2.js according to the input traffic. 

### e.	App.js:
This file is used to run backend node.js server on the web-tier.

### f.	Index.html:
This is used to display the UI to upload the images from the user and display the output predicted results.


# 2.	App-tier:

### a.	App_tier.js:
This module senses the messages ID of each incoming message from the input queue and fetches the image from S3 bucket.
It further creates a Child Process to start a python classification image process, and gets the predicted output, further it puts the message ID in SQS output queue and predicted output (as Key-Value pairs) in the output S3 bucket. (the message ID is kept in SQS output queue, it is indicated that the process is complete).
Now it deletes the message from the SQS input queue. This process is repeated till there are no more message IDs left in the input SQS queue and eventually self-terminate the instance, this functionality ensures the automatic scale-out feature of our elastic application.
### b.	Run.sh:
This is executed by the crontab on the system start-up or reboot, and is used to start the app-tier functionalities.
### c.	Package.json:
This contains all the dependencies to run the node.js application on the app-tier.

### Detail on how to install your programs and how to run them:

## App-tier:
We need to create an AMI of the app-tier. For this, we need to create a new EC2 instance using the AMI Id provided in the project requirement, which comes with python image classifier model. Now, we have to push our code snippets app_tier.js, run.sh, and package.json.
We should then run the NPM install and NPM install AWS-SDK command, to install all node.js dependencies. We also need to update, the crontab of the EC2 instance to run the run.sh script on start-up or reboot.
We need to create an AMI of the app-tier setup and get the AMI id.
## Web-tier:
Create a new EC2 instance, from a Linux AMI, and install node.js dependencies and AWS-SKD. Copy all the code files of the Web-tier to the EC2 instance and start the node.js server by running ‘node app.js’ command and run the Controller using “Bash Controller.sh” in another terminal. Get the public IP address of the web-tier and access the UI on Port:3000 of the public IP.







