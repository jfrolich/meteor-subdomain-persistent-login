# Subdomain login persistence for your meteor apps

To install this in your meteor 1.3 app:

```
npm install --save meteor-subdomain-persistent-login
```

In your main client javascript file:

```javascript
import initSubdomainPersistentLogin from 'meteor-subdomain-persistent-login'

Meteor.startup(() => {
  initSubdomainPersistentLogin(Meteor, ['app.localhost'])
})
```
This will set the cookie for all subdomains of `app.localhost` and `app.localhost` itself.

Replace `app.localhost` with your domain. If you host your app on multiple domains
you can even give a list of domains. However the login will not persist between domains,
because that is not possible with cookies.

# Configuration
`initSubdomainPersistentLogin` takes an object as a optional third argument, containing further configuration data:

```js
initSubdomainPersistentLogin(
  Meteor,
  ['app.localhost'],
  {
    expiresAfterDays: 30,
    cookieName: 'meteor_subdomain_token'
  }
)
```

- **expiresAfterDays** : After how many days the cookie will expire *(default: 30)*.
- **cookieName**: Which name to use for the cookie *(default: "meteor_subdomain_token")*.
