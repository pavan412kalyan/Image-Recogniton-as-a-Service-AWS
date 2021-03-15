// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'REGION'});
SQS_QUEUE_URL ="https://sqs.us-east-1.amazonaws.com/928329822548/OutQueue.fifo";
// Create an SQS service object
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

var params = {
   // Remove DelaySeconds parameter and value for FIFO queues
  MessageAttributes: {
    "Key": {
        DataType: "String",
        StringValue: "10"
      }
    
  },
  MessageBody: "kfmsdsdaffskfm",
  // MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
   MessageGroupId: "test-group-output",  // Required for FIFO queues
  QueueUrl: SQS_QUEUE_URL
};

sqs.sendMessage(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data.MessageId);
  }
});
