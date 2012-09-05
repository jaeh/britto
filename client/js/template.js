Template.widgets.showSearch = function () {
  setting = Settings.findOne({key: 'show_search'});
  if(setting && setting.value) {
    return setting.value;
  }
  return false;
}
Template.widgets.showBlogRoll = function () {
  setting = Settings.findOne({key: 'show_blogroll'});
  if(setting && setting.value) {
    return setting.value;
  }
  return false;
}
Template.widgets.showCategoryCloud = function () {
  setting = Settings.findOne({key: 'show_categorycloud'});
  if(setting && setting.value) {
    return setting.value;
  }
  return false;
}
Template.sidelinks.blogRoll = function() {
  var blogRoll = BlogRoll.find();
  if(blogRoll && blogRoll.count() > 0) {
    return blogRoll;
  }
  return false;
}


Template.nav.menuItems = function() {
  return getMenu('main');
}

Template.user_area_nav.menuItems = function() {
  if(Session.get('user')) {
    return getMenu('user_area');
  }
  return false;
}


function getMenu(slug) {
  //check if there even is a menu with that slug
  menu = Menus.findOne({slug: slug}, {fields: { _id: 1 }});
  
  if(menu) {
    //fetch() the menuitems to get arrays
    find = ['always'];
    if(Session.get('user')) {
      find.push('auth');
    }else{
      find.push('noauth');
    }
    
    menuItems = MenuItems.find(
      {menuId: menu._id, parent: false, showIf: {$in: find}},
      {sort: {position: 1}}
    ).fetch();

    //allow three levels of menus
    for(var i = 0; i < menuItems.length; i++) {
      menuItems[i].sublinks = MenuItems.find(
        {menuId: menu._id, parent: menuItems[i]._id},
        {sort: {position: 1}}
      ).fetch();
      for(var j = 0; j < menuItems[i].sublinks.length; j++) {
        menuItems[i].sublinks[j].sublinks = MenuItems.find(
          {menuId:menu._id, parent: menuItems[i].sublinks[j]._id},
          {sort: {position: 1}}
        ).fetch();
      }
    }
    
    return menuItems;
  }
  return false;
}

function showMenuItem(showIf) {
  if(showIf == 'always'){
    return true;
  }else if(showIf == 'auth') {
    if ( Session.get('user') ) {
      return true;
    }    
  }else if(showIf == 'noauth') {
    if(!Session.get('user')) {
      return true;
    }
  }
  return false;
}


_.each(['postShort', 'post'], function(template) {
  //get commentcount
  Template[template].commentCount = function(id) {
    return Comments.find({postId: id}).count();
  }
  
  //helper that returns the name after getting the user._id
  Template[template].postUser = function(id) {
    user = Users.findOne({_id: id});
    if(user) {
      return user.name;
    } else {
      return '';
    }
  }
});

//list of comments for one post
Template.comments.commentslist = function(_id) {
  comments = Comments.find({postId: _id}, {sort: {created: 1}});
  if(comments.count() === 0) {
    return false;
  }
  return comments;
}

Template.settings.settings = function() {
  settings = Settings.find();
  if(settings.count() === 0) {
    return false;
  }
  return settings;
}

Template.postView.is_disqus = function() {
  setting = Settings.findOne({key: 'disqus'});
  if(setting && setting.value != '') {
    return true;
  }
  return false;
}

//Hack to hell - this needs to go soon as possible
Template.post.attach_event = function(slug) {
  //Use this to add some lag to the event
  $('head').append('<script type="text/javascript">Britto.load.disqus("/blog/'+slug+'");</script>');
}

Template.listView.attach_event = function() {
  //Use this to add some lag to the event
  $('head').append('<script type="text/javascript">Britto.load.disqusCount();</script>');
}


_.each(['postShort', 'post', 'postView', 'post_list', 'user_area'], function(template) {
  Template[template].disqus = function() {
    setting = Settings.findOne({key: 'disqus'});
    if(setting && setting.value != '') {
      return setting.value;
    }
    return false;
  }
  
  Template[template].hasCategory = function ( postId ) {
    categoryCount = CategoriesInPosts.find( { postId: postId} ).count()
    if ( !categoryCount || categoryCount == 0 ) {
      return false;
    }
    return  categoryCount > 0;
  }
  
  Template[template].postCategories = function( postId ) {
    categoriesInPost = CategoriesInPosts.find( { postId: postId }, {fields: { categoryId: 1 } } );
    
    categoryIds = [];
    categoriesInPost.forEach ( function ( category ) {
      categoryIds.push ( category.categoryId );
    });
    
    categories = Categories.find({ _id: { $in: categoryIds } }, {fields: { name: 1, slug: 1 }});
    
    if ( categories ) {
      return categories;
    } else {
      return false;
    }
  }
});

_.each(['options', 'user_area', 'post_list', 'page_list', 'edit_page', 'comment', 'nav', 'post', 'user_area_nav', 'menu_list'], function(template) {
  Template[template].user = function() {
    return Session.get('user');
  }
});

_.each(['post_list', 'page_list'], function(template) {
  Template[template].postUser = function(id) {
    user = Users.findOne({_id: id});
    if(user) {
      return user.name;
    } else {
      return '';
    }
  }
});


//called in user_area.html to get all users for the author select fields
_.each(['user_area', 'edit_page'], function(template) {
  Template[template].userlist = function () {
    return Users.find({}, { fields: { name: 1, _id: 1 } });
  }
});

_.each(['user_area', 'edit_page', 'categorycloud'], function (template) {
  Template[template].allcategories = function(){
    
    categories = Categories.find({}, { fields: { name: 1, slug: 1, _id: 1 } });

    //this should be moved somewhere else or be cached, pretty intensely hitting the database here i guess
    counts = [];
    highest_count = 0;
    lowest_count = 1000;
    
    categoriesWithCount = [];
    categories.forEach(function(category){
      count = CategoriesInPosts.find({ categoryId: category._id }).count();
      if ( highest_count < count ) {
        highest_count = count;
      }
      if ( lowest_count > count && count > 0 ) {
        lowest_count = count;
      }
      returnCategory = { count: count, name: category.name, slug: category.slug, _id: category._id};
      categoriesWithCount.push(returnCategory);
    });    
    
    
    returnCategories = [];
    for (var i = 0; i < categoriesWithCount.length; i++ ){
      
      category = categoriesWithCount[i];
      
      fontsize = category.count / ( highest_count - lowest_count );
      //TODO This should be classes
      if ( fontsize > 1.4 ) {
        fontsize = 1.4;
      }
      if ( fontsize < 1 ) {
        fontsize = 1;
      }
      
      returnCategory = { fontsize: fontsize, name: category.name, slug: category.slug, _id: category._id};
      returnCategories.push(returnCategory);
    }
    return returnCategories;
  }
});

//TODO neaten this method, needs explanation too
//this method enables the input of a date when creating a new post
//it also shows days, monthnames and a selection of years as well as minutes and seconds
Template.date_picker.dates = function () {
  dates = {};
  
  //first get now to have a reference
  now = new Date();
  
  created = {};
  //if there is a .id in the url params get the date of the post with that slug
  if(params.id) {
    //get the date of the post with that id
    created = Posts.find({ slug: params.id }, { fields: { created: 1 } });
  }
  
  //check that created.created really is a date
  if(created && created.created && !isNaN(created.created.getTime())) {
    now = created.created;
  }
  
  
  //populate the year html selectbox with these
  dates.years = [];
  //posts are possible between 1990 and 5 years in the future
  //TODO -> first and last select should be buttons that add more years on hover or click
  year = now.getFullYear();
  
  //push a value into the first element of the year array
  dates.years.push({year: 'load past', selected: false});
  for(var i = 1990; i < (year + 5); i++) {
    dates.years.push({ year: i, selected: i == year });
  }
  dates.years.push({year: 'load future', selected: false});
  
  //setting the months for the <select>s
  dates.months = [];
  for(var i = 0; i < 12; i++) {
    dates.months.push({monthnum: i, monthname: getMonthName(i), selected: i == now.getMonth() });
  }
  
  //setting plus 1 to be able to get the 0 day of the next month (which is the last day of this month in js)
  monthForDay = now.getMonth() + 1;
  //this (ab)use of the javascript Date() method tells us the last day of this month. 
  // TODO -> make this change when the user selects another month, for now every month will have as many days as the first selected month
  lastDayInMonth = new Date(now.getFullYear(), monthForDay, 0).getDate();
  
  //fill the days array with the days for the <option>
  dates.days = [];
  for(var i = 1; i <= lastDayInMonth; i++) {
    dates.days.push({ day: i, selected: i == now.getDate() });
  }
  
  //adding the 24 hours
  dates.hours = [];
  for(var i = 0; i < 24; i++) {
    dates.hours.push({hour: i, selected: i == now.getHours() });
  }
  
  //adding minutes
  dates.minutes = [];
  for(var i = 0; i < 60; i++) {
    dates.minutes.push({ minute: i, selected: i == now.getMinutes() });
  }
  
  //to use the dates interface somewhere in the theme {{>date_picker}} 
  return dates;
}

//transform month int to the name of the month
function getMonthName(month) {
  //maybe add these names to the admin later, formatting of the date string as well as monthnames.
  var m = ['January','February','March','April','May','June','July', 'August','September','October','November','December'];
  return m[month];
}

Template.menu_list.menus = function() {
  return this;
}


Template.menu_list.menuItems = function(){
  return this;
}

Template.menu_list.menuItem = function(){
  return this;
}
