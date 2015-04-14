module.exports = function(options) {
  options = options || {};
  return function(req, res, next) {

    req.authenticate = function(user, next) {
      req.user = user;

      if (req.session && req.session.userId != user.id) {
        req.session.regenerate(function() {
          req.session.userId = user.id;
          next();
        });
      } else {
        next();
      }
    };

    req.unauthenticate = function(next) {
      delete req.user;

      if (req.session) {
        delete req.session.userId;
        req.session.regenerate(next);
      } else {
        next();
      }
    };

    req.isAuthenticated = function() {
      return !!req.user;
    };

    req.isUnauthenticated = function() {
      return !req.isAuthenticated();
    };

    req.getLoginUrl = function() {
      return typeof options.loginUrl == 'function'
        ? options.loginUrl.call(null, req)
        : options.loginUrl;
    };

    req.getBackUrl = function() {
      return req.session
        ? req.session.backUrl || null
        : null;
    };

    req.rememberAsBackUrl = function(url) {
      if (req.session) {
        req.session.backUrl = url || req.originalUrl;
      }
    };

    req.forgetBackUrl = function() {
      if (req.session) {
        delete req.session.backUrl;
      }
    };

    res.redirectBackOr = function(url) {
      if (req.session) {
        res.redirect(req.getBackUrl() || url);
        req.forgetBackUrl();
      }
    };

    next();
  };
};
