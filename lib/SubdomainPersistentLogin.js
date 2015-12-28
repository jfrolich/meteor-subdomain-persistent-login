'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// based on the kadirahq/fast-render package, might collide!

var SubdomainPersistentLogin = (function () {
  function SubdomainPersistentLogin(Meteor, domains) {
    var expiresAfterDays = arguments.length <= 2 || arguments[2] === undefined ? 30 : arguments[2];

    _classCallCheck(this, SubdomainPersistentLogin);

    this.domains = domains;
    this.expiresAfterDays = expiresAfterDays;
    this.monkeyPatchMeteor(Meteor);
  }

  _createClass(SubdomainPersistentLogin, [{
    key: 'monkeyPatchMeteor',
    value: function monkeyPatchMeteor(Meteor) {
      var _this = this;

      // override the getter, so in a different subdomain it will get the token
      // from a cookie first when a logintoken in localstorage is not found
      var originalGetItem = Meteor._localStorage.getItem;
      Meteor._localStorage.getItem = function (key) {
        var original = originalGetItem.call(Meteor._localStorage, key);
        if (key == 'Meteor.loginToken') {
          // in case there is no login token in local storage, try get it from a cookie
          if (!original) return _this.getToken();
        }

        return original;
      };

      // override Meteor._localStorage methods and resetToken accordingly
      var originalSetItem = Meteor._localStorage.setItem;
      Meteor._localStorage.setItem = function (key, value) {
        if (key == 'Meteor.loginToken') {
          var loginTokenExpires = Meteor._localStorage.getItem('Meteor.loginTokenExpires');

          if (loginTokenExpires) {
            var loginTokenExpires = new Date(Meteor._localStorage.getItem('Meteor.loginTokenExpires'));
          } else {
            var date = new Date();
            date.setDate(date.getDate() + _this.expiresAfterDays);
            loginTokenExpires = date;
          }

          _this.setToken(value, loginTokenExpires);
        }

        originalSetItem.call(Meteor._localStorage, key, value);
      };

      var originalRemoveItem = Meteor._localStorage.removeItem;
      Meteor._localStorage.removeItem = function (key) {
        if (key == 'Meteor.loginToken') {
          _this.removeToken();
        }

        originalRemoveItem.call(Meteor._localStorage, key);
      };
    }
  }, {
    key: 'removeToken',
    value: function removeToken() {
      this.setToken(null, -1);
    }
  }, {
    key: 'getToken',
    value: function getToken() {
      return this.getCookieToken();
    }
  }, {
    key: 'setToken',
    value: function setToken(loginToken, expires) {
      var _this2 = this;

      this.domains.map(function (domain) {
        _this2.setCookieToken(loginToken, domain, expires);
      });
    }
  }, {
    key: 'setCookieToken',
    value: function setCookieToken(token, domain, expires) {
      document.cookie = 'meteor_login_token=' + token + '; expires=' + expires.toUTCString() + '; domain=' + domain + '; path=/';
    }

    // parse cookie string and look for the login token

  }, {
    key: 'getCookieToken',
    value: function getCookieToken() {
      if (document.cookie.length > 0) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = document.cookie.split(';')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var cookieKeyValue = _step.value;

            cookieKeyValue = cookieKeyValue && cookieKeyValue.split('=') || [];
            if (cookieKeyValue.length > 1 && cookieKeyValue[0].trim() == 'meteor_login_token') {
              return cookieKeyValue[1].trim();
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    }
  }]);

  return SubdomainPersistentLogin;
})();

exports.default = SubdomainPersistentLogin;