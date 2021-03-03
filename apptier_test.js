// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
const { count } = require('console');
// Set the region
AWS.config.loadFromPath('./config.json');
AWS.config.update({region: 'us-east-1'});
// Create an SQS service object
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

var queueURL = "https://sqs.us-east-1.amazonaws.com/928329822548/InputQueue";

var params = {
 AttributeNames: [
    "SentTimestamp"
 ],
 MaxNumberOfMessages: 10,
 MessageAttributeNames: [
    "All"
 ],
 QueueUrl: queueURL,
 VisibilityTimeout: 2,
 WaitTimeSeconds: 0
};




async function getInputQueueLength()
{
let QueueCountParams = {
    QueueUrl: "https://sqs.us-east-1.amazonaws.com/928329822548/InputQueue",
    AttributeNames: ['ApproximateNumberOfMessages',
        'ApproximateNumberOfMessagesNotVisible',
        'ApproximateNumberOfMessagesDelayed']
};

const count = await sqs.getQueueAttributes(QueueCountParams).promise().then(data =>{
    return parseInt(data.Attributes.ApproximateNumberOfMessages);
},err=>{
    Promise.reject(err);
   // return 0;
});
 
 console.log("My count is "+count);
   return count;

}


//getInputQueueLength()>0








//////////////////

k=4
while(k>0) 
{
    k=k-1;

    console.log("Inside Looooop")
let check=false;
sqs.receiveMessage(params, function(err, data) {

  if(!data.Messages)
  {
    console.log("Queue is empty Now")
     check=true;
      return ;

  }

    if (err) {
        console.log("Receive Error", err);
      } else if (data.Messages) {
      
   
          // console.log(data.Messages[0].MessageAttributes.Key.StringValue);
    
        
          var  currentFile = data.Messages[0].MessageAttributes.Key.StringValue ;
    
    
        
                        // Create S3 service object
                        s3 = new AWS.S3({apiVersion: '2006-03-01'});
    
                        // Create the parameters for calling listObjects
    
                        var bucketParams = {
                        Bucket : 'pavan-kalyan-reddy-thota',
                        };
    
                        // Call S3 to obtain a list of the objects in the bucket
                        s3.listObjects(bucketParams, function(err, data) {
                        if (err) {
                          //  console.log("Error", err);
                        } else {
                           // console.log("Success", data);
    
                        }
                        });
    
                        var params = {Bucket: 'pavan-kalyan-reddy-thota', Key : currentFile} 
                      
                        //to download to current folder
                        var file = require('fs').createWriteStream(currentFile);
                        s3.getObject(params).createReadStream().pipe(file);
    
                      // console.log(file);
                        
    
                        //To run Python Code
                        const spawn = require("child_process").spawn;
                        const pythonProcess = spawn('python3',["image_classification.py",file.path]);
                        console.log("++++");
                       // console.log(pythonProcess);
                       pythonProcess.stdout.on('data', (data) => {
                        // Do something with the data returned from python script
                        console.log(data.toString() +"ooo");
                        
                        InputFile = currentFile
                        predictedOutput = data.toString()
    
                                              //On success upload to S3 and output SQS
    
    
                                      
    
                                            // call S3 to retrieve upload file to specified bucket
                                            BUCKET_NAME ="output-bucket-group-pavan"
    
                                            var uploadParams = {Bucket: BUCKET_NAME, Key: InputFile, Body:  InputFile+"----"+predictedOutput};
                                           // var file = process.argv[3];
                                           
    
                                           
                        
                                            // call S3 to retrieve upload file to specified bucket
                                            s3.upload (uploadParams, function (err, data) {
                                            if (err) {
                                                console.log("Error", err);
                                            } if (data) {
                                                console.log("Upload Success in S3 OutputBucket", data.Location);
    
    
                                               
    
                                                                      //Upload to OutputSQS after successful upload to S3
                                                                                                      
                                                                        var OutPutQueueParams = {
                                                                            // Remove DelaySeconds parameter and value for FIFO queues
                                                                        DelaySeconds: 10,
                                                                        MessageAttributes: {
                                                                            "Key": {
                                                                            DataType: "String",
                                                                            StringValue: InputFile  //InputImage file name as Key
                                                                            }
                                                                        },
                                                                        MessageBody: InputFile + " upload.",
                                                                        // MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
                                                                        // MessageGroupId: "Group1",  // Required for FIFO queues
                                                                        QueueUrl: "https://sqs.us-east-1.amazonaws.com/928329822548/OutputQueue"
                                                                        };
    
    
    
    
                                                                        
                                                                            sqs.sendMessage(OutPutQueueParams, function(err, data) {
                                                                                if (err) {
                                                                                console.log("Error", err);
                                                                                } else {

                                                                                  console.log("check++++++++++",InputFile)  
                                                                                console.log("Success -Uploaded to Output Queue", data);
                                                                                }
                                                                            });
                                                                        
                                                          
    
                                                                        console.log("++++");
    
    
                                                       
    
    
    
    
                                            }
                                            });
    
                                           
    
    
    
    
    
    
    
    
    
    
    
    
    
                    });
    
                    pythonProcess.stderr.on(
                        'data',
                        (data) => {
                          console.log(data.toString());
                          //logOutput('stderr')(data);
                        }
                      );
                      var deleteParams = {
                        QueueUrl: queueURL,
                        ReceiptHandle: data.Messages[0].ReceiptHandle
                      };
                      sqs.deleteMessage(deleteParams, function(err, data) {
                        if (err) {
                          console.log("Delete Error", err);
                        } else {
                        console.log("deleted",currentFile);
                          console.log("Message Deleted", data);
                        }
                      });
      }
   
  });   


  if(check==true)
    break;
  
  console.log("------")


}

