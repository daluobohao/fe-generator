const router = require('express').Router();

router.get('/test', (req, res) => {
  res.json({
    rtnCode: -1,
    rtnMsg: 'success',
  });
});

module.exports = router;
