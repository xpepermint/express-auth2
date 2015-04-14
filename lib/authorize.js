module.exports = function() {
  return function(req, res, next) {

    if (req.isAuthenticated()) {
      return next();
    }

    var loginUrl = req.getLoginUrl();
    if (loginUrl) {
      req.rememberAsBackUrl();
      res.redirect(loginUrl);
    } else {
      res.status(401)
      next(new Error('Access restricted.'));
    }
  };
};
