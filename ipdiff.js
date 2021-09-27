import express from 'express';
const app = express();
const port = 6969;

app.get('/', (req, res) => {
  res.send('Healthy');
});

app.listen(port, () => {
  console.log('Listening on ${port}.');
});
