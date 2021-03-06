const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const helpers = require('./helpers');
var rerun = require('./sqs_retrive');


app.use(express.static(__dirname + '/public'));
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, 'uploads/');
  },

  // By default, multer removes file extensions so let's add them back
  filename: function(req, file, cb) {
      cb(null, file.originalname);
  }
});
app.listen(port, () => console.log(`Listening on port ${port}...`));


app.get('/', (req, res) => {
  res.sendFile('./index.html', { root: __dirname });
});

app.get('/page', function (req, res) {
  res.send('A message!');
});

app.get('/get-result',(req,res)=>{
  console.log("hi there");



  rerun.rerunAgain((data) => {
    console.log(data);
    res.send(data)
  });
// const script = new vm.Script(data);
// (async () => {
//   const sandbox = {
//     a: ""
//   };
//   await new Promise(resolve => {
// //     var exec = require('child_process').exec;

// // child = exec('node ../sqs_retrive.js',
// //   function (error, stdout, stderr) {
// //     console.log('stdout: ' + stdout);
// //     console.log('stderr: ' + stderr);
// //     if (error !== null) {
// //       console.log('exec error: ' + error);
// //     }
// // });
// sandbox.a = (async () => {
//   const data = await rerun.rerunAgain().then(data=>{
//     return data;
//   }) 
//   return data;
//   })();
// })();


})

app.post('/upload-multiple-images', (req, res) => {
  // 10 is the limit I've defined for number of uploaded files at once
  // 'multiple_images' is the name of our file input field
  let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).array('multiple_images', 100);

  upload(req, res, function(err) {
      if (req.fileValidationError) {
          return res.send(req.fileValidationError);
      }
    


      let result = "You have uploaded these images: <hr />";
      const files = req.files;
      let index, len;

      // Loop through all the uploaded images and display them on frontend
      for (index = 0, len = files.length; index < len; ++index) {
          result += `<img src="${files[index].path}" width="300" style="margin-right: 20px;">`;
      }
      result += '<hr/><a href="./">Upload more images</a>';
      res.send(result);
  });
});

