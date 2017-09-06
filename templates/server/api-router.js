const router = require('express').Router();

router.get('/test', (req, res) => {
  res.json({
    rtnCode: 0,
    rtnMsg: 'success',
  });
});

router.post('/test', (req, res) => {
  res.json({
    rtnCode: 0,
    rtnMsg: 'success',
  });
});

router.post('/upload', (req, res) => {
  res.json({
    rtnCode: 0,
    rtnMsg: 'success',
  });
});

module.exports = router;
