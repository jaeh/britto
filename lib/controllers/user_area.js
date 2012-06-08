UserAreaController = new Stellar.Controller('user_area');

//TODO Logic for this is a bit convoluted so will add this to Stellar filters soon
UserAreaController.loginHelper = function() {
  var auth = Session.get('user');
  if(!auth) {
    Stellar.redirect('home/login');
    return false;
  }
  return true;
};

//userarea index, new post added here for now, /user_area/
UserAreaController.index = function() {
  if(UserAreaController.loginHelper()) {
    //render the user_area template with an empty post of the type post
    Stellar.render('user_area', {post: {title: '', body: '', slug: '', type: 'post'}});
  }
};

//user list /user_area/users
UserAreaController.users = function() {
  if(UserAreaController.loginHelper()) {
    Meteor.subscribe("allusers", function() {
      //find all fields in all users
      users = Users.find();
      //if there are users, render them
      if(users) {
        Stellar.render('users', {users: users});
      }
    });
  }
};

//post edit page /user_area/edit?id=slug
UserAreaController.edit = function() {
  if(UserAreaController.loginHelper()) {
    Meteor.subscribe("allposts", function() {
      //find one post with the urlparam id
      post = Posts.findOne({slug: Stellar.page.params['id']});
      if(post) {
        Stellar.render('user_area', {post: post});
      }
    });
  }
};

//options page /user_area/options
UserAreaController.options = function() {
  if(UserAreaController.loginHelper()) {
    Stellar.render('options');
  }
};

//settings page /user_area/settings
UserAreaController.settings = function() {
  if(UserAreaController.loginHelper()) {
    Meteor.subscribe("allblogroll", function() {
      blogRoll = BlogRoll.find();
      if( blogRoll ) {
        Stellar.render('settings', {blogRoll: blogRoll});
      }
    });
  }
};

UserAreaController.post_categories = function() {
  if(UserAreaController.loginHelper()) {
    Meteor.subscribe("allcategories", function(){
      //find any categories there are
      categories = Categories.find({}, { fields: {} });
      
      //if there are categories, render them in the post_categories template
      if ( categories ) {
        Stellar.render('post_categories', {categories: categories} );
      }
    });
  }
};

//list of posts at /user_area/posts
UserAreaController.posts = function () {
  if(UserAreaController.loginHelper()) {
    //saving the sorting in the session to allow other functions to access it    
    //set orderby to session value or to default
    orderby = Session.get('post_list_orderby') || 'asc';
    
    //set sort to session value or to default
    sort = Session.get('post_list_sort' ) || 'created';
    
    //check if the urlparams include sort and set if needed
    if (Stellar.page.params['sort']) {
      sort = Stellar.page.params['sort'];
      Session.set('post_list_sort', Stellar.page.params['sort']);
    }
    //check if the urlparams include orderby and set if needed
    if (Stellar.page.params['orderby']) {
      orderby = Stellar.page.params['orderby'];
      Session.set('post_list_sort_orderby', Stellar.page.params['orderby']);
    }
    
    Meteor.subscribe("allposts", function() {
      Meteor.subscribe("allcategories", function() {
        //get the posts 
        //TODO add sorting capability as above and get it to work without servercalls
        posts = Posts.find({type:'post'}, {fields: {title: 1, date: 1, published: 1, slug: 1, _id: 1}}, {sort: ["created", "asc"]});
        
        //if the posts exist, render them in the post_list template
        if(posts) {
          Stellar.render('post_list', {posts: posts, sort: sort, orderby: orderby, orderby_asc: (orderby == 'asc'), orderby_desc: (orderby == 'desc')});
        }
      });
    });
  }
};


//list of pages at /user_area/pages
UserAreaController.pages = function () {
  if(UserAreaController.loginHelper()) {
    Meteor.subscribe("allpages", function() {
      //find all pages to display in a list
      pages = Posts.find({type: 'page'}, {fields: {title: 1, author: 1, created: 1, published: 1, slug: 1, _id: 1}});
      //if pages exist display them in the page_list template
      if(pages) {
        Stellar.render('page_list', {pages: pages});
      }
    });
  }
};

//edit single page or add new one at /user_area/edit_page?id=slug
UserAreaController.edit_page = function() {
  if(UserAreaController.loginHelper()) {
    Meteor.subscribe("allpages", function() {
      //see if there is a page with the specified slug
      page = Posts.findOne({slug: Stellar.page.params['id'], type: 'page'});
      //if page doesnt exist user wants to create a new page (hopefully)
      if(!page) {
        page = {title:'', body:'', slug: '', type: 'page'};
      }
      //if the page exists now show the edit_page template
      if(page) {
        Stellar.render('edit_page', {page: page});
      }
    });
  }
};

UserAreaController.menus = function() {
  if(UserAreaController.loginHelper()) {
    
    Meteor.subscribe("allmenus", function() {
      menus = Menus.find({}, {fields: { _id: 1 }}).fetch();
        
      if(menus) {
        for(var menuId = 0; menuId < menus.length; menuId++) {
          
          options = getOptions(menus[menuId].showIf);
          
          //fetch() the menuitems to get arrays
          menuItems = MenuItems.find(
            {menuId: menus[menuId]._id, parent: false},
            {sort: {position: 1}}
          ).fetch();
          
          
          //allow three levels of menus, not very nice but it works, menus.forEach( didnt :(
          for(var itemId = 0; itemId < menuItems.length; itemId++) {
            if(menuItems[itemId]) {
              
              menuItems[itemId].options = getOptions(menuItems[itemId].showIf);
              
              menuItems[itemId].sublinks = MenuItems.find(
                {menuId: menus[menuId]._id, parent: menuItems[itemId]._id},
                {sort: {position: 1}}
              ).fetch();
              
              
              for(var subItemId = 0; subItemId < menuItems[itemId].sublinks.length; subItemId++) {
              
                menuItems[itemId].sublinks[subItemId].options = getOptions(menuItems[itemId].sublinks[subItemId].showIf);
              
                if(menuItems[itemId].sublinks[subItemId]) {                
                  menuItems[itemId].sublinks[subItemId].sublinks = MenuItems.find(
                    {menuId: menus[menuId]._id, parent: menuItems[itemId].sublinks[subItemId]._id},
                    {sort: {position: 1}}
                  ).fetch();
                  
                }
              }
            }
          }
          menus[menuId].menuItems = menuItems;
          menus[menuId].options = options;
        }
      }
      Stellar.render('menu_list', {menus:menus});
    });
  }
}

function getOptions(showIf) {
  options = [
    {showIf: 'always', text: 'always', selected: showIf == 'always'},
    {showIf: 'auth', text: 'auth', selected: showIf == 'auth'},
    {showIf: 'noauth', text: 'noauth', selected: showIf == 'noauth'},
    {showIf: 'never', text: 'never', selected: showIf == 'never'}
  ];
  return options;
}
