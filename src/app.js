const express = require('express');
const path = require('path');
const ejs = require('ejs');

const app = express();
const vv = {
  WEBGL: 'webgl',
  BLUR: 'blur',
  RENDER: 'render',
  FONT: 'font',
  SDF: 'sdf',
}

const options = {
  maxAge: 10000,
  setHeaders: function(res) {
    // res.set('Vary', '*');
    res.set('Cache-Control', 'no-cache');
    console.log('请求服务器资源');
  }
}
app.use(express.static('public', options));


app.get('/', (_, res) => {
  res.render(vv.WEBGL);
});

app.get('/webgl', (_, res) => {
  res.render(vv.WEBGL);
});

app.get('/blur', (_, res) => {
  res.render(vv.BLUR);
});

app.get('/render', (_, res) => {
  res.render(vv.RENDER);
});

app.get('/font', (_, res) => {
  res.render(vv.FONT);
});

app.get('/sdf', (_, res) => {
  res.render(vv.SDF);
});

app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

app.listen(5004, () => {
  console.log('https 服务器启动');
});