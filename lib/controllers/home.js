HomeController = new Stellar.Controller('home');

//this is the startpage of the whole page, redirects to /blog/ with a list of posts for now
HomeController.index = function() {
  Stellar.redirect('/blog/');
};
//plain rendering of the login screen
HomeController.login = function() {
  Stellar.render('login');
};

HomeController.logout = function() {
  //tell the server the user logged out
  Meteor.call('logout', Session.get('auth'));
  //pass null here to completely delete the cookie
  Stellar.session.updateKey(null);
  //set the user and auth to false
  Session.set('user', false);
  Session.set('auth', false);
  //redirect to the startpage
  Stellar.redirect('/');
};
