// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region
AWS.config.loadFromPath('./config.json');
AWS.config.update({region: 'us-east-1'});
// Create an SQS service object
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

// create an ec2 object
const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

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
 VisibilityTimeout: 15,
 WaitTimeSeconds: 30
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
    return parseInt(data.Attributes.ApproximateNumberOfMessages)+parseInt(data.Attributes.ApproximateNumberOfMessagesNotVisible)+parseInt(data.Attributes.ApproximateNumberOfMessagesDelayed);
},err=>{
    Promise.reject(err);
   // return 0;
});
 
 console.log("My count is "+count);
   return count;

}
let dataMesg;
async function getCurrentFileFromInputQueue()
{
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
   VisibilityTimeout: 20,
   WaitTimeSeconds: 20
  };
  const currentFile = await sqs.receiveMessage(params).promise().then(data =>{
    if(!data.Messages)
    {
      console.log("Queue is empty Now")
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

async function uploadToOutS3(InputFile,predictedOutput){
    // call S3 to retrieve upload file to specified bucket
    BUCKET_NAME ="output-bucket-group-pavan"
    
    var uploadParams = {Bucket: BUCKET_NAME, Key: InputFile, Body:  InputFile+"----"+predictedOutput};
  // call S3 to retrieve upload file to specified bucket
  const loc = await s3.upload (uploadParams).promise().then(data=>{
    return data.Location;
  })
  return loc;
        
}

async function deleteFromSQS(){
  var queueURL = "https://sqs.us-east-1.amazonaws.com/928329822548/InputQueue";
  var deleteParams = {
    QueueUrl: queueURL,
    ReceiptHandle: dataMesg.Messages[0].ReceiptHandle
  };
const data = await sqs.deleteMessage(deleteParams).promise().then(data=>{
    return data;
  }) 
  return data;
}

async function pythonRun(path){
  console.log(path)
  const spawn = require("child_process").spawn;
  return new Promise(function(resolve,reject){
    let pythonProcess = spawn('python3',["image_classification.py",path]);
  pythonProcess.stdout.on('data', (data) => { 
    // Do something with the data returned from python script
    console.log(data.toString() +"ooo");
    
    predictedOutput = data.toString()
    resolve(data);
    return predictedOutput;
   });
  })
}

async function uploadToOutSQS(InputFile){
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





    const data = sqs.sendMessage(OutPutQueueParams).promise().then(data=> {
        return data;
    });
    return data;
}

rerunAgain();


async function rerunAgain(){

let count = await getInputQueueLength().then(data=>{
    return data;
  });
while(count>0) 
{
console.log("Inside Looooop")
const currentFile = await getCurrentFileFromInputQueue().then(data=>{
  return data;
});

if(currentFile==null)
{
  console.log("AT THE END")

var meta  = new AWS.MetadataService();

meta.request("/latest/meta-data/instance-id", function(err, data){
   // console.log(data);
   CurrentInstanceID= data;

   
// setup params
const Terminateparams = {
  InstanceIds: [
    CurrentInstanceID    
  ]
};

console.log("Terminating....");
ec2.terminateInstances(Terminateparams, function(err, data) {
  if (err) {
    console.log(err, err.stack); // an error occurred
  } else {
    console.log(data);           // successful response
   //

  }  
});





});
   return;

}

// Create S3 service object
s3 = new AWS.S3({apiVersion: '2006-03-01'});
console.log(currentFile);
    
var params = {Bucket: 'pavan-kalyan-reddy-thota', Key : currentFile} 

//to download to current folder
var file = require('fs').createWriteStream(currentFile);    
    
s3.getObject(params).createReadStream().pipe(file);

console.log(file.path);
 //To run Python Code
 
 console.log("++++");

let InputFile= currentFile;
let predictedOutput = await pythonRun(file.path).then(data=>{
  return data;
})
//  pythonProcess.stderr.on(
//   'data',
//   (data) => {
//     console.log(data.toString());
//     //logOutput('stderr')(data);
//   }
// );
   //On success upload to S3 and output SQS
 const location = await uploadToOutS3(InputFile,predictedOutput).then(data=>{
   return data;
 })
 console.log("Uploaded to s3 bucket at location"+location);
 const datatoSQS = await uploadToOutSQS(InputFile).then(data=>{
   return data;
 })
 console.log(datatoSQS+"Uploaded to SQS bucket");
 const deletedData = await deleteFromSQS().then(data=>{
   return data;
 });
 console.log("Data deleted is"+deletedData);
 console.log("++++");                     
  
  console.log("------")
  count = await getInputQueueLength().then(data=>{
    return data;
  });


}


console.log("AT THE END")

var meta  = new AWS.MetadataService();

meta.request("/latest/meta-data/instance-id", function(err, data){
   // console.log(data);
   CurrentInstanceID= data;

   
// setup params
const Terminateparams = {
  InstanceIds: [
    CurrentInstanceID    
  ]
};

console.log("Terminating....");
ec2.terminateInstances(Terminateparams, function(err, data) {
  if (err) {
    console.log(err, err.stack); // an error occurred
  } else {
    console.log(data);           // successful response
   //

  }  
});





});



}




