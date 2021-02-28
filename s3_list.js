// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});

// Create S3 service object
s3 = new AWS.S3({apiVersion: '2006-03-01'});

// Create the parameters for calling listObjects

var bucketParams = {
  Bucket : 'pavan-kalyan-reddy-thota',
};

// Call S3 to obtain a list of the objects in the bucket
s3.listObjects(bucketParams, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data);

  }
});

var params = {Bucket: 'pavan-kalyan-reddy-thota', Key: 'pavan.txt'}

var file = require('fs').createWriteStream('Myfile.txt');
s3.getObject(params).createReadStream().pipe(file);

