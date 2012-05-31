BlogController = new Stellar.Controller('blog');

BlogController.index = function() {
  var page = 1;
  if(Stellar.page.params['page']) {
    page = Stellar.page.params['page'];
  }
  Session.set('page', page);

  Meteor.autosubscribe(function() {
    Meteor.subscribe("postpage", Session.get('page'), function() {
      Meteor.subscribe("allcategories", function() {
        //redefining the published and created criteria in here to force them to show without reload
        postlist = Posts.find({
          published: true,
          created: {$lte: new Date() } }, 
          {sort: {created: -1}
        });
        
        Stellar.render('listView', {postlist: postlist, count: postlist.count()});
      });
    });
  });
};

BlogController.show = function() {
  Session.set('blogshow', Stellar.page.params['show']);
  //TODO  Meteor.subscribe("postcomments", post._id, init);
  Meteor.subscribe("allcategories");
  Meteor.subscribe("allcategoriesinposts");
  Meteor.autosubscribe(function() {
    //TODO I need to add the ability to tear down subscriptions here in Stellar... pretty sure this is the reason for the lack of live updates
    Meteor.subscribe("post", Session.get('blogshow'), function() {
      //get one post by slug that is published and created in the past
      var post = Posts.findOne({
        slug: Session.get('blogshow'), 
        published: true, 
        created: { $lte: new Date() } 
      });
          
      if(post) {
        Stellar.render('postView', {post: post});
      }
    });
  });
};

BlogController.category = function() {
  var page = 1;
  if(Stellar.page.params['page']) {
    page = Stellar.page.params['page'];
  }
  Session.set('page', page);

  Meteor.autosubscribe(function() {
    Meteor.subscribe("postpage", Session.get('page'), function() {
      Meteor.subscribe("allcategories", function() {
        Meteor.subscribe("allcategoriesinposts", function() {
          //4 database calls? am i crazy? guess its not that bad in node/meteor though?
          
          //get the categorySlug or categorySlugs from the request by splitting
          //look for a nicer split symbol?
          //_and_ would be nice, but this means that a category with named and would break.
          categorySlugs = Stellar.page.params['show'].split("$");
          
          //console.log("categorySlug = "+categorySlugs[0]+ " length = "+categorySlugs.length);
          
          //get the categoryIds from the slugs
          categories = Categories.find ( { 
            slug: { $in: categorySlugs } }, 
            {fields: { postId : 1 } 
          });
          
          categoryIds = [];
          categories.forEach ( function ( category ) {
            categoryIds.push( category._id );
          });
          
          //console.log ( "categoryIds = "+categoryIds[0]+" length ="+categoryIds.length );
          
          //get the postIds to load using the categorySlugs array
          postsWithCategory = CategoriesInPosts.find({ 
            categoryId: { $in: categoryIds } }, 
            {fields: { postId: 1 }
          });
          
          postIds = [];
          postsWithCategory.forEach ( function ( category ) {
            postIds.push( category.postId );
          });
          
          //console.log("postIds[0] = "+postIds[0]+" length = "+postIds.length );
          
          //get posts by _id that are published and created in the past
          postlist = Posts.find ({ 
            _id: { $in: postIds }, 
            published: true, 
            created: {$lte: new Date() } }, 
            { sort: { created: -1 } }
          );
          
          Stellar.render('listView', {postlist: postlist, count: postlist.count()});
        });
      });
    });
  });
};

