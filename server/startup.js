Meteor.startup(function () {

  //console.log('Setup settings');
  setSetting('site_name', 'Britto blog', 'This is the name of your site');
  setSetting('disqus', '', 'This is to enable disqus comments on the blog instead of inbuilt comments, leave blank to use inbuilt ones');
  setSetting('analytics_code', '', 'Enable google analytics by adding code here');
  setSetting('madewith_shortname', 'britto.meteor.com', 'Enable madewith on your site specify [appname.meteor.com] or [urlname.com]');
  
  //add widget settings
  setSetting('show_search', true, 'Show search widget');
  setSetting('show_blogroll', true, 'Show blogroll widget');
  setSetting('show_categorycloud', false, 'Show categorycloud widget');
  
  setSetting('show_comments_globally', true, 'This turns comments on and off globally. it wont delete comments though.');
  
  if(Users.find().count() === 0) {
      
    console.log('no users found, populating db with default values:');
    
    
    console.log('Adding in users');
    userId1 = createUser({username: 'admin', password: 'password', name: 'Your name'});
    userId2 = createUser({username: 'a', password: 'p', name: 'Your other name'});
    
    console.log('Logging in test user');
    var user = loginUser('admin', 'password');
    var key = user.auth;
    
    console.log('adding categories');
    categoryId1 = makeCategory({name: 'Category 1', slug: 'category_1', description: '', auth: key });
    categoryId2 = makeCategory({name: 'Category 2', slug: 'category_2', description: '', auth: key });
    categoryId3 = makeCategory({name: 'Category 3', slug: 'category_3', description: '', auth: key });
    console.log(Categories.find().count()+' categories added');
    
    categories = Categories.find({}, {fields: {_id:1} }).fetch();
    
    console.log('Adding in blogroll link');
    insertBlogRoll({ name: 'Britto - Blogging made better', link: 'http://britto.co/', auth: key});
    
    
    console.log('Adding in test post');
    postId1 = makePost({
        title: 'Hello world',
        body: 'Cruel cruel world',
        slug: 'yellow_world', 
        auth: key, 
        author: userId1, 
        published: true, 
        created: new Date(),
        showComments: true,
        type: 'post'
    });
    
    //Make a long post now
    console.log('Adding in test post2');
    postId2 = makePost({
        title: 'White Riot',
        body: "White riot - a riot of my own\nWhite riot - I want to riot\nWhite riot - a riot of my own\n\nBlack people gotta lot a problems\nBut they don't mind throwing a brick\nWhite people go to school\nWhere they teach you how to be thick\n\nAn' everybody's doing\nJust what they're told to\nAn' nobody wants\nTo go to jail!\n\n\nll the power's in the hands\nOf people rich enough to buy it\nWhile we walk the street\nToo chicken to even try it\n\nEverybody's doing\nJust what they're told to\nNobody wants\nTo go to jail!\n\nAre you taking over\nOr are you taking orders?\nAre you going backwards\nOr are you going forwards?", 
        slug: 'white_riot', 
        auth: key, 
        author: userId1, 
        published: true, 
        created: new Date(),
        showComments: true,
        type: 'post'
    });
    
    console.log('Added in test post 3 - should only be shown from the admin');
    postId3 = makePost({
        title: 'White Riot - should not be shown', 
        body: "should not be shown", 
        slug: 'shouldnt_show', 
        auth: key,
        author: userId2, 
        published: false, 
        created: new Date(),
        showComments: false,
        type: 'post'
    });
    
    console.log('Added '+Posts.find({type:'post'}).count()+' posts');
    
    addPostCategory({postId: postId1, categoryId: categoryId1, auth: key});
    addPostCategory({postId: postId2, categoryId: categoryId2, auth: key});
    addPostCategory({postId: postId3, categoryId: categoryId3, auth: key});
    addPostCategory({postId: postId3, categoryId: categoryId1, auth: key});
    
    console.log("Added "+CategoriesInPosts.find().count()+ " post categories to the posts");
    
    console.log('Adding page');
    postId4 = makePost({
        title: 'about', 
        body: "this is the awesome about page", 
        slug: 'about', 
        auth: key,
        author: userId1,
        published: true, 
        created: new Date(),
        showComments: false,
        type: 'page'
    });
    
    console.log('Added '+Posts.find({type:'page'}).count()+' page');
    
    
    mainMenuId = makeMenu({name: 'main', slug: 'main', showIf: 'always', auth: key});
    adminMenuId = makeMenu({name: 'user_area', slug: 'user_area', showIf: 'auth', auth: key});
    
    console.log('Added '+Menus.find().count()+' menus');
    
    makeMenuItem({menuId: mainMenuId, text: 'Home', url: '/blog/', showIf: 'always', parent: false, position: 0, auth: key});
    makeMenuItem({menuId: mainMenuId, text: 'Login', url: '/home/login', showIf: 'noauth', parent: false, position: 1, auth: key});
    makeMenuItem({menuId: mainMenuId, text: 'Logout', url: '/home/logout', showIf: 'auth', parent: false, position: 1, auth: key});
    
    console.log('Added '+MenuItems.find({menuId: mainMenuId}).count()+' menuitems to mainmenu');
    
    postsId = makeMenuItem({menuId: adminMenuId, url: '/user_area/posts', text: 'Posts', showIf: 'auth', parent: false, position: 0, auth: key});
    if(postsId){
        makeMenuItem({menuId: adminMenuId, url: '/user_area', text: 'New Post', showIf: 'auth', parent: postsId, position: 0, auth: key});
        makeMenuItem({menuId: adminMenuId, url: '/user_area/post_categories', text: 'Categories', showIf: 'auth', parent: postsId, position: 1, auth: key});
    }
    pagesId = makeMenuItem({menuId: adminMenuId, url: '/user_area/pages', text: 'Pages', showIf: 'auth', parent: false, position: 1, auth: key});
    if(pagesId) {
        makeMenuItem({menuId: adminMenuId, url: '/user_area/edit_page', text: 'New Page', showIf: 'auth', parent: pagesId, position: 0, auth: key});
    }else{
        console.log('error when creating submenus');
    }
    makeMenuItem({menuId: adminMenuId, url: '/user_area/menus', text: 'Menus', showIf: 'auth', parent: false, position: 2, auth: key});
    makeMenuItem({menuId: adminMenuId, url: '/user_area/users', text: 'Users', showIf: 'auth', parent: false, position: 3, auth: key});
    makeMenuItem({menuId: adminMenuId, url: '/user_area/settings', text: 'Settings', showIf: 'auth', parent: false, position: 5, auth: key});
    makeMenuItem({menuId: adminMenuId, url: '/user_area/options', text: 'Options', showIf: 'auth', parent: false, position: 4, auth: key});
    
    console.log('Added '+MenuItems.find({menuId: adminMenuId}).count()+' menuitems to adminmenu');
    
    
    console.log('Log out test user. You can log in again using');
    console.log('user: admin');
    console.log('password: password');
    console.log('or user: a password: p for those in a haste ;)');
    logoutSession(key);
    
    console.log('Installer done, enjoy');
  }
});
