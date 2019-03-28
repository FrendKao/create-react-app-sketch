var express = require('express');

var dragonfulFormula = require('./fe-error-resolver');

var app = express();

// 设置允许跨域访问该服务
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Credentials','true');
  next();
});

app.listen(8809, () => {
  console.log('SM===> Server started successfully...');
});

app.get('/api/report', (req, res) => {
  var error = JSON.parse(req.query.error);

  if(error) {
    dragonfulFormula('./sources', error).then(data => {
      res.send(data);
    });
  }
});
