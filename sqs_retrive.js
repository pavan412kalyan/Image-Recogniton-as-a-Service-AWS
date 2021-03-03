// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: 'us-east-1'});

// Create an SQS service object
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

var queueURL = "https://sqs.us-east-1.amazonaws.com/928329822548/OutputQueue";

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

x=3
while(x>0)
{
    x=x-1;
sqs.receiveMessage(params, function(err, data) {
  if (err) {
    console.log("Receive Error", err);
  } else if (data.Messages) {
  
    console.log(data.Messages);
   console.log(data.Messages[0].MessageAttributes.Key.StringValue);

     let currentFile = data.Messages[0].MessageAttributes.Key.StringValue ;
         
                   

                    // Create S3 service object
                    s3 = new AWS.S3({apiVersion: '2006-03-01'});

                    // Create the parameters for calling listObjects

                    // var bucketParams = {
                    // Bucket : 'output-bucket-group-pavan',
                    // };

                    // Call S3 to obtain a list of the objects in the bucket
                    // s3.listObjects(bucketParams, function(err, data) {
                    // if (err) {
                    //     console.log("Error", err);
                    // } else {
                    //     console.log("Success", data);

                    // }
                    // });

                    var params = {Bucket: 'output-bucket-group-pavan', Key: currentFile}

                    var file = require('fs').createWriteStream('OutputFromOutputBucket.txt');
                   // file.appendFileSync('OutputFromOutputBucket.txt', 'data to append');
                   // s3.getObject(params).createReadStream().pipe(file);



                    s3.getObject(params, function(err,data) {
                        if(err) {
                         console.log(err,err.stack);
                        }
                        else {
                         console.log(data.Body.toString('utf-8'));
                        }
                       });

    







    var deleteParams = {
      QueueUrl: queueURL,
      ReceiptHandle: data.Messages[0].ReceiptHandle
    };


    sqs.deleteMessage(deleteParams, function(err, data) {
      if (err) {
        console.log("Delete Error", err);
      } else {
        console.log("Message Deleted", data);
      }
    });

  }
});

console.log("------")
}