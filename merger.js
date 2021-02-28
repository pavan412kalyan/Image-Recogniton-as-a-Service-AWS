var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});

// Create S3 service object
s3 = new AWS.S3({apiVersion: '2006-03-01'});
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

// call S3 to retrieve upload file to specified bucket
//var uploadParams = {Bucket: process.argv[2], Key: '', Body: ''};
var uploadParams = {Bucket: 'pavan-kalyan-reddy-thota', Key: '', Body: ''};

//var file = process.argv[3];
var file = "venkat.txt"

// Configure the file stream and obtain the upload parameters
var fs = require('fs');
var fileStream = fs.createReadStream(file);
fileStream.on('error', function(err) {
  console.log('File Error', err);
});
uploadParams.Body = fileStream;
var path = require('path');
uploadParams.Key = path.basename(file);

// call S3 to retrieve upload file to specified bucket
async function uploder(){

  const Data =await s3.upload (uploadParams).promise();
  console.log(Data.key);

  var params = {
    // Remove DelaySeconds parameter and value for FIFO queues
   DelaySeconds: 10,
   MessageAttributes: {
     "Key": {
       DataType: "String",
       StringValue: Data.key
     }
   },
   MessageBody: "1st upload.",
   // MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
   // MessageGroupId: "Group1",  // Required for FIFO queues
   QueueUrl: "https://sqs.us-east-1.amazonaws.com/928329822548/InputQueue"
 };




 if (Data) {
    //console.log("Upload Success---", Data.Location);

    sqs.sendMessage(params, function(err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          console.log("Success", data.MessageId);
        }
      });
  }


}
uploder();



