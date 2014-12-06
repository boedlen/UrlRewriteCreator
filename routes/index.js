var express = require('express');
var router = express.Router();

var csv = require("fast-csv");
var _ = require('lodash');
var Entities = require('html-entities').XmlEntities;
var entities = new Entities();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.post('/', function(req, res) {
  var rawData = req.body.pastedData;
  var rewritemapName  = req.body.rewritemapName;
  var errors = [];

  var mappingData = [];
  var linenumber = 1;
  csv.fromString(rawData, {headers: false, delimiter:'\t', trim:true})
 .on("data", function(data){

     var obj = {
      oldUrl : data[0],
      newUrl : data[1],
      linenumber: linenumber
     };

     var existingRecord = _.find(mappingData, function(elm){
      return elm.oldUrl === obj.oldUrl;
     });

     if (existingRecord) {
      errors.push('"'+obj.oldUrl + '" already exists in linenumber ' + existingRecord.linenumber +' and ' + linenumber);
     } else {
      mappingData.push(obj);
     }


     linenumber++;
 })
 .on("end", function(){

     var output = '<rewriteMap name="'+ rewritemapName +'" defaultValue="">\r\n';

     _.each(mappingData, function(elm){
      output += '<add key="'+xmlencode(elm.oldUrl)+'" value="'+xmlencode(elm.newUrl)+'" />\r\n';
     });
     output += '</rewriteMap>';
    res.render('index', { input: rawData, output: output, rewritemapName: rewritemapName, errors: errors });
  });



});

function xmlencode(url){
  return encodeURI(entities.encode(url));
}

module.exports = router;
