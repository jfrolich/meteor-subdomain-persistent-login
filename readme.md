# Subdomain login persistence for your meteor apps

To install this in your meteor 1.3 app:

```
npm install --save meteor-subdomain-persistent-login
```

in your main client javascript file:

```javascript
import SubdomainPersistentLogin from 'meteor-subdomain-persistent-login'

Meteor.startup(() => {
  const subdomainPersistentLogin = new SubdomainPersistentLogin(Meteor, ['.app.localhost'])
})
```

Replace `.app.localhost` with your domain. If you host your app on multiple domains
you can even give a list of domains. However the login will not persist between domains,
because I do not think that is possible with cookies.
