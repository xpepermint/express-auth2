# [express](https://github.com/strongloop/express)-auth2

> User authentication middleware for ExpressJS.

This is a lightweight middleware which adds authentication main building blocks to your Express application.

## Setup

Install the package.

```js
npm instal --save express-auth2
```

For a real-world authentication (e.g. login using username and password) you will also need [body-parser](https://github.com/expressjs/body-parser), [express-session](https://github.com/expressjs/session) and [cookie-parser](https://github.com/expressjs/cookie-parser), unless your application will handle only simple token-based authentications (e.g. basic authentication).

Continue by attaching the module to your Express application.

```js
var auth = require('express-auth2');
var app = express();
...
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('pass'));
app.use(session({
  secret: 'pass',
  resave: true,
  saveUninitialized: true
}));
app.use(auth.init());
```

This will add helper methods to the `request` and `response` objects.

# Examples

## Login Using Email & Password

Create a login form view.

```jade
form(action='/login', method='post')
  input(type='text', name='email', placeholder='Enter your email')
  input(type='password', name='password', placeholder='Enter your password')
  button(type='submit') Submit
```

Define routes for handling `login`.

```js
app.get('/login', function(req, res) {
  res.render('login'); // Render form.
});

app.post('/login', function(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var user = { id: 123, email: email };

  if (email != user.email) { // Pretend we query the real database.
    res.redirect('/login'); // Render form.
  } else {
    req.authenticate(user, function() {
      res.redirectBackOr('/'); // Redirect back or to root path.
    });
  }
});
```

Define route for handling `logout`.

```js
app.get('/logout', function(req, res) {
  req.unauthenticate(function() {
    res.redirect('/'); // Redirect to root path.
  });
});
```

Create a handler at `./auth/session.js` which authenticates a user from a `req.session.userId` on every request.

```js
module.exports = function() {
  return function(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else if (req.session && req.session.userId) {
      var user = { id: req.session.userId, email: req.session.userId }; // Pretend we query real database.
      req.authenticate(user, next);
    } else {
      next();
    }
  };
};
```

Now configure the module, attach the handler to a route and require authentication.

```js
var authSession = require('./auth/session');
...
app.use(auth.init({ loginUrl:'/login' }));
app.use(authSession());
...
app.get('/secure-place', auth.requireAuthentication(), function(req, res) {
  ...
});
```

The `/secure-place` will now redirect unauthenticated user to the `/login` path. A user will be redirected back to the `/secure-place` on successful login.

## Auth.init(options)

> Initialization middleware which adds methods for building authentications to request and response objects.

#### options.loginUrl :: String | Function(req)

> Path to the login page. Not that you can pass a function in case of a dynamic path (e.g. when using route translations).

## Auth.authorize()

> Middleware that stops unauthenticated access. When an unauthenticated user tries to access a route defined after this middleware, a user is redirected to a login page or 401 is returned if login path is not set.

## Request Object

#### req.authenticate(user, next) :: null

**user:** Object, **next:** Function

> Authenticates a user from the `user` object. Note that the `user` object must have an `id` key.

#### req.unauthenticate(next) :: null

**next:** Function

> Unauthenticates a user.

#### req.isAuthenticated() :: Boolean

> Returns `true` if a user is authenticated.

#### req.isUnauthenticated() :: Boolean

> Returns `true` if a user is not authenticated (the reverse of the `isAuthenticated`).

#### req.getLoginUrl() :: String | Function

> Returns URL path for the login page. Note that this parameter is configured through the initializer.

#### req.getBackUrl() :: String

> Returns URL path to the page where a user will be redirected back after  login.

#### req.rememberAsBackUrl(url) :: null

**url:** String

> Memorizes the current URL. This method is used by the middleware when a user tries to access a page that needs authentication.

#### req.forgetBackUrl() :: null

> Forgets the redirect-back URL.

## Respond Object

#### res.redirectBackOr(url) :: null

**url:** String

> Redirects a user the `getBackUrl()` or to the provided `url` if the no memorized URL is found.
