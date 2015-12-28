// based on the kadirahq/fast-render package, might collide!
export default class SubdomainPersistentLogin {
  constructor(Meteor, domains, expiresAfterDays=30) {
    this.domains = domains;
    this.expiresAfterDays = expiresAfterDays;
    this.monkeyPatchMeteor(Meteor);
  }

  monkeyPatchMeteor(Meteor) {
    // override the getter, so in a different subdomain it will get the token
    // from a cookie first when a logintoken in localstorage is not found
    var originalGetItem = Meteor._localStorage.getItem;
    Meteor._localStorage.getItem = (key) => {
      var original = originalGetItem.call(Meteor._localStorage, key);
      if (key == 'Meteor.loginToken') {
        // in case there is no login token in local storage, try get it from a cookie
        if (!original)
          return this.getToken();
      }

      return original;
    }

    // override Meteor._localStorage methods and resetToken accordingly
    var originalSetItem = Meteor._localStorage.setItem;
    Meteor._localStorage.setItem = (key, value) => {
      if (key == 'Meteor.loginToken') {
        var loginTokenExpires = Meteor._localStorage.getItem('Meteor.loginTokenExpires')

        if (loginTokenExpires) {
          var loginTokenExpires = new Date(Meteor._localStorage.getItem('Meteor.loginTokenExpires'));
        } else {
          let date = new Date
          date.setDate(date.getDate() + this.expiresAfterDays)
          loginTokenExpires = date
        }

        this.setToken(value, loginTokenExpires);
      }

      originalSetItem.call(Meteor._localStorage, key, value);
    };

    var originalRemoveItem = Meteor._localStorage.removeItem;
    Meteor._localStorage.removeItem = (key) => {
      if (key == 'Meteor.loginToken') {
        this.removeToken();
      }

      originalRemoveItem.call(Meteor._localStorage, key);
    }
  }

  removeToken() {
    this.setToken(null, -1);
  }

  getToken() {
    return this.getCookieToken();
  }

  setToken(loginToken, expires) {
    this.domains.map((domain) => {
      this.setCookieToken(loginToken, domain, expires)
    })
  }

  setCookieToken(token, domain, expires) {
    document.cookie = `meteor_login_token=${token}; expires=${expires.toUTCString()}; domain=${domain}; path=/`;
  }

  // parse cookie string and look for the login token
  getCookieToken() {
    if (document.cookie.length > 0) {
      for (cookieKeyValue of document.cookie.split(';')) {
        cookieKeyValue = cookieKeyValue && cookieKeyValue.split('=') || [];
        if (cookieKeyValue.length > 1 && cookieKeyValue[0].trim() == 'meteor_login_token') {
          return cookieKeyValue[1].trim();
        }
      }
    }
  }
}
