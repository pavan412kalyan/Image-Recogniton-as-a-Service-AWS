// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region
AWS.config.loadFromPath('./config.json');
AWS.config.update({region: 'us-east-1'});

// Create an SQS service object
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

var queueURL = "https://sqs.us-east-1.amazonaws.com/928329822548/OutputQueue";


//Get length of output queue
async function getOutputQueueLength()
{
let QueueCountParams = {
    QueueUrl: "https://sqs.us-east-1.amazonaws.com/928329822548/OutputQueue",
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
 
 //console.log("My count is "+count);
   return count;

}

let dataMesg;
async function getCurrentFileFromOutputQueue()
{
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
   VisibilityTimeout: 30,
   WaitTimeSeconds: 15
  };
  const currentFile = await sqs.receiveMessage(params).promise().then(data =>{
    if(!data.Messages)
    {
      //console.log("Queue is empty Now")
        return null ;
  
    } else if (data.Messages) {
        
     
            // console.log(data.Messages[0].MessageAttributes.Key.StringValue);
      
          //current file
          dataMesg = data;
            return data.Messages[0].MessageAttributes.Key.StringValue ;
        }
      
  });
  return currentFile;

    
  
}

async function deleteFromSQS(){
  var queueURL = "https://sqs.us-east-1.amazonaws.com/928329822548/OutputQueue";
  var deleteParams = {
    QueueUrl: queueURL,
    ReceiptHandle: dataMesg.Messages[0].ReceiptHandle
  };
const data = await sqs.deleteMessage(deleteParams).promise().then(data=>{
    return data;
  }) 
  return data;
}

// (async () => {
// const data = await rerunAgain().then(data=>{
//   return data;
// }) 
// return data;
// })();


async function rerunAgain(callback){
  console.log("in rerunagain")
let msg = "";
let count = await getOutputQueueLength().then(data=>{
    return data;
});
while(true)
{
  console.log(count);

  const currentFile = await getCurrentFileFromOutputQueue().then(data=>{
    return data;
  });
  
  if(currentFile==null)
  {
    console.log("sqs-empty now")
     break;
  }
  // Create S3 service object
s3 = new AWS.S3({apiVersion: '2006-03-01'});
    
var params = {Bucket: 'output-bucket-group-pavan', Key: currentFile}

                   // file.appendFileSync('OutputFromOutputBucket.txt', 'data to append');
                   // s3.getObject(params).createReadStream().pipe(file);

//to download to current folder
var file = require('fs').createWriteStream('OutputFromOutputBucket.txt');    
    
s3.getObject(params, function(err,data) {
  if(err) {
   console.log(err,err.stack);
  }
  else {
   msg += data.Body.toString('utf-8');
     }
 });

const deletedData = await deleteFromSQS().then(data=>{
    return data;
  });
  //console.log("Data deleted is"+deletedData);

console.log("------")
}
// return msg;
console.log(msg)
callback(msg);
}

module.exports = {rerunAgain}