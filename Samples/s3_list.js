// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});

// Create S3 service object
s3 = new AWS.S3({apiVersion: '2006-03-01'});

// Create the parameters for calling listObjects

var bucketParams = {
  Bucket : 'output-bucket-group-pavan',
};


// Call S3 to obtain a list of the objects in the bucket
s3.listObjects(bucketParams, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data);
    
    for(let i=0;i<data.Contents.length;i++){
      var params = {Bucket: 'output-bucket-group-pavan', Key: data.Contents[i].Key}
      s3.getObject(params, function(err,data) {
        if(err) {
         console.log(err,err.stack);
        }
        else {
         console.log(data.Body.toString('utf-8'));
        }
       });

    }
    
  }
});

// var params = {Bucket: 'output-bucket-group-pavan', Key: '3_airplane.png'}

// var file = require('fs').createWriteStream('Myfile.txt');

// console.lo(s3.getObject(params).createReadStream().pipe(file));

