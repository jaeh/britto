Meteor.publish("postcomments", function(id) {
  return Comments.find({postId: id});
});

Meteor.publish("allcomments", function() {
  return Comments.find();
});

Meteor.publish("allusers", function() {
  return Users.find({}, {fields: {username: 0, password: 0, salt: 0}});
});

//TODO Deprecated, needs removing
Meteor.publish("allposts", function() {
  return Posts.find({type: 'post'}, {fields: {}});
});
Meteor.publish("allpages", function() {
  return Posts.find({type: 'page'}, {fields: {}});
});

Meteor.publish("postpage", function(page) {
  var perpage = 10;
  var start = (page-1) * perpage;
  return Posts.find({published: true, created: { $lte: new Date() } }, {sort: {created: -1}, skip: start, limit: perpage, fields: {}});
});

Meteor.publish("post", function(slug) {
  return Posts.find({published: true, created: { $lte: new Date() }, slug: slug}, {fields: {}});
});

Meteor.publish("allsettings", function() {
  return Settings.find({}, {fields: {}});
});

Meteor.publish("allblogroll", function() {
  return BlogRoll.find({}, {fields: {}});
});

Meteor.publish("allcategories", function() {
  return Categories.find({}, {fields: {}});
});

Meteor.publish("allcategoriesinposts", function () {
  return CategoriesInPosts.find({}, {fields: {}});
});

Meteor.publish("allmenus", function () {
  return Menus.find({}, {fields: {}});
});
Meteor.publish("allmenuitems", function () {
  return MenuItems.find({}, {fields: {}});
});
