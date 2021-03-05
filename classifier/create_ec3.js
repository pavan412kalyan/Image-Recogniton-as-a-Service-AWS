// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Load credentials and set region from JSON file
AWS.config.update({region: 'us-east-1'});

// Create EC2 service object

var sqs = new AWS.SQS({apiVersion: '2012-11-05'});




// Handle promise's fulfilled/rejected states


async function getInputQueueLength()
{

let QueueCountParams = {
    QueueUrl: "https://sqs.us-east-1.amazonaws.com/928329822548/InputQueue",
    AttributeNames: ['ApproximateNumberOfMessages',
        'ApproximateNumberOfMessagesNotVisible',
        'ApproximateNumberOfMessagesDelayed']
};

const count = await sqs.getQueueAttributes(QueueCountParams).promise().then(data =>{
    return parseInt(data.Attributes.ApproximateNumberOfMessages)+parseInt(data.Attributes.ApproximateNumberOfMessagesNotVisible)+parseInt(data.Attributes.ApproximateNumberOfMessagesDelayed);
},err=>{
    Promise.reject(err);
   // return 0;
});
 
 console.log("My count is "+count);
   return count;

}

async function getInstances(){
  
// AMI is amzn-ami-2011.09.1.x86_64-ebs
var instanceParams = {
  ImageId: 'ami-037d0e267c35b5c65', 
  InstanceType: 't2.micro',
  KeyName: 'KeyPair1',
  MinCount: 1,
  MaxCount: 1
};

  let instanceCount = await getInputQueueLength().then(data=>{
    return data;
  });
  instanceParams.MaxCount =instanceCount;
  console.log(instanceParams.MaxCount)

// Create a promise on an EC2 service object
var instancePromise = new AWS.EC2({apiVersion: '2016-11-15'}).runInstances(instanceParams).promise();
instancePromise.then(
  function(data) {
    console.log(data);
    var instanceId = data.Instances[0].InstanceId;
    console.log("Created instance successfully", instanceId);
    // Add tags to the instance
    tagParams = {Resources: [instanceId], Tags: [
       {
         Key: 'AppTier_1',
          Value: 'SDK Sample'
       }
    ]};
    // Create a promise on an EC2 service object
    var tagPromise = new AWS.EC2({apiVersion: '2016-11-15'}).createTags(tagParams).promise();
    // Handle promise's fulfilled/rejected states
    tagPromise.then(
      function(data) {
        console.log("Instance tagged");
      }).catch(
        function(err) {
        console.error(err, err.stack);
      });
  }).catch(
    function(err) {
    console.error(err, err.stack);
  });

}

getInstances();




