function loginCallback(error, returnVal) {
  if(!error) {
    Stellar.session.updateKey(returnVal.auth);
    Session.set('user', returnVal);
    Stellar.redirect('user_area');
  } else {
    return standardHandler(error, returnVal);
  }
}

/* TODO - Goodbye for now, add back later
function renderNewSlide(content) {
  Stellar.log('Render new slide');
  newSlide = $('<div class="slide">' + content + '</div>');
  newSlide.css('left', '0%');
  newSlide.css('top', '2em');
  newSlide.css('display', 'none');
  $('#slides').append(newSlide);
  if($('#slides .slide').length > 1) {
    counter = $('#slides .slide').length;
    $('#slides .slide').each(function(index) {
      if(index+1 !== counter) {
        $(this).fadeOut('slow').promise().done(function() {$(this).remove();});
      } else {
        $('#slides .slide:last').fadeIn('slow');
      }
    });
  } else {
    $('#slides .slide:last').css('display','block');
  }
}
*/

//This is the callback for sessionUser, this adds in the helper method which all the menus check for on the client side
function sessionLogin(error, returnVal) {
  if(!error) {
    Session.set('user', returnVal)
  } else {
    Stellar.redirect('home/login');
  }
}

Template.search.events = {
  'click #search-button, submit #search-button': function(e) {
    e.preventDefault();
    var search_string = $('#search-input').attr('value');
  
    if(search_string != '') {
      Stellar.redirect('search/results?find='+search_string);
    }
  }
};

Template.postView.events = {
  'click #comment-button, submit #comment-button': makeComment
};

Template.login.events = {
  'click #login-button, submit #login-button': doLogin
};

Template.user_area.events = {
  'click #post-button, submit #post-button': makePost,
  'change #post-title, keyup #post-title': slugifyInput,
  'change .change-slug, keyup .change-slug': slugifyInput,
  'change #date-control-group select': checkDate,
  'click .category-remove-button, submit .category-remove-form': removePostCategory,
  'click .category-add-button, submit .category-add-form': addPostCategory
};

Template.settings.events = {
  'click #change-setting-button, submit #change-setting-button': changeSetting,
  'click #add-blog-roll-button, submit #add-blog-roll-button': addBlogRoll,
  'click .delete-blog-roll': deleteBlogRoll
};

Template.options.events = {
  'click': function() {console.log('slut');},
  'click #change-password-button, submit #change-password-button': changePassword,
  'click #change-user-button, submit #change-user-button': changeUser
};

Template.comment.events = {
  'click .delete-comment, submit .delete-comment': deleteComment
};

Template.post.events = {
  'click .delete-post, submit .delete-post': deletePost,
  'click .edit-post, submit .edit-post': editPost
};

Template.users.events = {
  'click #new-user-button, submit #new-user-button': addUser,
  'click .delete-user, submit .delete-user': deleteUser
};

Template.post_list.events = {
  'click .post-edit-button': editPost,
  'click .post-delete-button': deletePost,
  'click .post-publish-button': publishPost,
  'click .post-unpublish-button': unpublishPost,
  //'change .orderby': changeOrderBy, //not now
  'click .category-remove-button': removePostCategory
};

Template.post_categories.events = {
  'click .category-delete-button': deleteCategory,
  'click #add-category-submit, submit #add-category': makeCategory,
  'change #category-name, keyup #category-name': slugifyInput,
  'change .change-slug, keyup .change-slug': slugifyInput
};

Template.datePicker.events = {
  //this could be much nicer, but <select> and <option> dont support mouseover, not even when using jquery :(
  //'hover .post-year-option select': loadMoreYears,
  'change .post-month-select': getDaysInMonth
}

Meteor.startup(function() {
  //This is a helper function for the page to keep state between refresh
  if(!Session.get('user') && Stellar.session.getKey()) {
    Meteor.call('sessionUser', Stellar.session.getKey(), sessionLogin);
  }

  Meteor.call('blog_page_count', function(error, result) {if(!error && result) {Session.set('blog_page_count', result);}});
});

function changeSetting(e) {
  e.preventDefault();
  if(Session.get('user')) {
    settings = [];
    $('#change-setting-form input').each(
      function(input) { 
        val = $(this).val();
        //checkbox select to bool mapping
        if($(this).attr('type') == 'checkbox') {
          val = $(this).attr('checked') == 'checked';
        }
        
        settings.push([$(this).attr('data-key'), val]);
      }
    );
    
    Meteor.call('changeSetting', {settings: settings, auth: Stellar.session.getKey()}, standardHandler);
  }
}

function standardHandler(error, response) {
  if(!error && response) {
    //TODO move this to other places where needed
    //Stellar.redirect('');
  } else {
    if(error && error.error && error.error == 401) {
      Stellar.redirect('home/login');
      Britto.alert('error', error.reason);
      return false;
    }
    Britto.alert('error', 'There was an error updating that');
    //return false;
  }    
}

function changePassword(e) {
  e.preventDefault();
  if(Session.get('user')) {
    if($('#change-new-password').val() === '') {
      Britto.alert('warning', 'Your passwords were blank, what sort of parents would we be letting you do that?');
      return;
    }
    if($('#change-new-password').val() == $('#change-repeat-password').val()) {
      Meteor.call('changePassword', {current_password: $('#change-current-password').val(), password: $('#change-new-password').val(), auth: Stellar.session.getKey()}, standardHandler);
    } else {
      Britto.alert('warning', 'Your passwords were not the same');
    }
  }
}

function changeUser(e) {
  e.preventDefault();
  if(Session.get('user')) {
    details = {auth: Stellar.session.getKey(), name: $('#change-user-name').val()};
    Meteor.call('changeUser', details, standardHandler);
  }
}

function addUser(e) {
  e.preventDefault();
  if(Session.get('user')) {
    details = {auth: Stellar.session.getKey(), name: $('#add-user-name').val(), username: $('#add-user-username').val(), password: $('#add-user-password').val()};
    Meteor.call('addUser', details, standardHandler);
  }
}

function addBlogRoll(e) {
  e.preventDefault();
  if(Session.get('user')) {
    details = {auth: Stellar.session.getKey(), name: $('#add-blog-roll-name').val(), link: $('#add-blog-roll-link').val()};
    Meteor.call('insertBlogRoll', details, standardHandler);
  }
}

function deleteComment(e) {
  e.preventDefault();
  if(Session.get('user')) {
    target = e.target;
    commentId = $(target).attr('data-id');
    Meteor.call('deleteComment', {commentId: commentId, auth: Stellar.session.getKey()});
  }
}

function deleteUser(e) {
  e.preventDefault();
  if(Session.get('user') && confirm('Are you sure you want to delete this user?')) {
    target = e.target;
    userId = $(target).attr('data-user-id');
    Meteor.call('removeUser', {id: userId, auth: Stellar.session.getKey()}, standardHandler);
  }
}

function deleteBlogRoll(e) {
  e.preventDefault();
  if(Session.get('user')) {
    target = e.target;
    id = $(target).attr('data-id');
    Meteor.call('deleteBlogRoll', {id: id, auth: Stellar.session.getKey()}, standardHandler);
  }
}

function deletePost(e) {
  e.preventDefault();
  if(Session.get('user') && confirm('Are you sure you want to delete this post?')) {
    target = e.target;
    postId = $(target).attr('data-id');
    Meteor.call('deletePost', {commentId: postId, auth: Stellar.session.getKey()}, deletedPost);
  }
}

function editPost(e) {
  e.preventDefault();
  target = e.target;
  postId = $(target).attr('data-slug');
  Stellar.redirect('/user_area/edit?id='+postId);
}

function deletedPost(error, response) {
  if(!error && response) {
    Stellar.redirect('/');
  } else {
    return standardHandler(error, response);
  }
}

function changeTitle() {
  slug = slugify ($('#post-title').val());
  $('#post-slug').val(slug);
}

function makePost(e) {
  e.preventDefault();
  //these should all be sanitized in all functions?
  author = $('select#post-author option:selected').val();
  
  published = $('#post-published').attr('checked') == 'checked';
  showComments = $('#post-showcomments').attr('checked') == 'checked';
  
  title = $('#post-title').val();
  body = $('#post-body').val();
  slug = slugify($('#post-slug').val());
  
  _id = $('#post-id').val();
  
  created = new Date( $('#post-year').val(), $('#post-month').val(), $('#post-day').val(), $('#post-hour').val(), $('#post-minute').val() );
  if(isNaN(created)) {
    created = new Date();
  }
  
  if(Session.get('user')) {
    Meteor.call('post', {
        title: title,
        body: body,
        slug: slug,
        showComments: showComments,
        auth: Stellar.session.getKey(),
        author: author,
        published: published,
        created: created,
        _id: _id
      },
      madePost
    );
  }
  return false;
}

//create post callback
function madePost(error, response) {
  if(!error) {
    //redirect to the admin post list
    Stellar.redirect('/user_area/posts');
  } else {
    return standardHandler(error, response);
  }
}


function doLogin(e) {
  e.preventDefault();
  Meteor.call('login', $('#login-username').val(), $('#login-password').val(), loginCallback);
  return false;
}

function makeComment(e) {
  e.preventDefault();
  nameText = $('#comment-name').val();
  commentText = $('#comment-comment').val();
  //Stop blank messages
  if(commentText.length > 0 && nameText.length > 0) {
    Meteor.call('comment', {name: nameText, comment: commentText, postId: $('#comment-post').val()}, madeComment);
  }
  return false;
}

function madeComment(error, response) {
  if(!error) {
    $('#comment-comment').val('');
  } else {
    return standardHandler(error, response);
  }
}

//checks the day for the user_area
function checkDate() {
  //remove all shown errors if there are some
  $('.error').removeClass('error');

  error = false;
  
  day = $('#post-day').val();
  month = $('#post-month').val();
  year = $('#post-year').val();
  
  lastDayMonth = parseInt(month) + 1;
  
  // if monthnum is december or higher, reset to january
  if(month >= 12) {
    lastDayMonth = 0;
  }
  
  lastDayInMonth = new Date( year, lastDayMonth, 0 ).getDate();
  
  if(lastDayInMonth < day) {
    //error
    $('#post-day').addClass('error');
    return false;
  }
  return true;
}

function publishPost(e) {
  e.preventDefault();
  target = e.target;
  slug = $(target).attr('data-slug');
  Meteor.call('publishPost', {slug: slug, published: true, auth: Stellar.session.getKey()}, standardHandler);
}

function unpublishPost(e) {
  e.preventDefault();
  target = e.target;
  slug = $(target).attr('data-slug');
  Meteor.call('unpublishPost', {slug: slug, published: false, auth: Stellar.session.getKey() }, standardHandler);
}

function changeOrderBy(e) {
  orderby = e.target;
  $('ul#post-list-sort li a').each(function(){
    href = $(this).attr('href').split('&');
    href[1] = orderby;
    for(var hr in href) { //TODO Change this to _.each
      href = href + hr;
    }
    $(this).attr('href', hr);
  });
}

function makeCategory(e) {
  e.preventDefault();
  
  if(Session.get('user')) {
    name = $('#category-name').val();
    slug = $('#category-slug').val();
    description = $('#category-description').html();
    Meteor.call( 'makeCategory', { name: name, slug: slug, description: description, auth: Stellar.session.getKey() }, madeCategory);
  }
  return false;
}

function madeCategory(error, response) {
  if(error) {
    return standardHandler(error, response);
  }
  $('#category-name').val('');
  $('#category-slug').val('');
  $('#category-description').html('');
}


function deleteCategory(e) {
  e.preventDefault();
  if(Session.get('user') && confirm('Are you sure you want to delete this category?')) {
    target = e.target;
    categoryId = $(target).attr('data-id');
    Meteor.call('deleteCategory', {categoryId: categoryId, auth: Stellar.session.getKey() }, standardHandler);
    return true;
  }
  return false;
}

function changeCategoryName() {
  slug = $('#category-name').val();
  $('#category-slug').val(slug.replace(/\s/g, '_').toLowerCase());
}

function addPostCategory(e) {
  e.preventDefault();
  if(Session.get('user')) {
    target = $(e.target);
    categoryId = target.attr('data-id');
    postId = target.parent('li').parent('ul').attr('data-id');
    Meteor.call('addPostCategory', { postId: postId, categoryId: categoryId, auth: Stellar.session.getKey()}, standardHandler);
    return true;
  }
  return false;
}

//removes a category from a post
function removePostCategory(e) {
  e.preventDefault();
  if(Session.get('user') && confirm('Do you really want to remove this Category from this Post?')) {
    target = $(e.target);
    categoryId = target.attr('data-id');
    postId = target.parent('li').parent('ul').attr('data-id');
    Meteor.call('removePostCategory', {postId: postId, categoryId: categoryId, auth: Stellar.session.getKey()}, standardHandler);
    return true;
  }
  return false;
}

//handle the calculation of the number of days in a month for the datePicker template
function getDaysInMonth(e) {
  target = $(e.target);
  
  //add +1 to get the next month
  month = parseInt(target.val()) + 1;
  
  //set the month to 0 if it exceeds the max
  if(month > 12) {
    month -= 12;
  }
  
  //get the year from the html form
  year = $('.post-year-select option:selected').val();
  //get the number of days in this month by querying the 0th day of the next month
  lastDayInMonth = new Date(year, month, 0).getDate();
  
  //fill the days array with the days for the <option> html element
  option_list = '';
  for(var i = 1; i <= lastDayInMonth; i++) {
    option_list += '<option value="'+i+'">'+i+'</option>';
  }
  $('.post-day-select').html(option_list);
}

function slugifyInput(e) {
  //populate the change-slug input with the slugified title
  $('input.change-slug').val(slugify($(e.target).val()));
}

function slugify(slug) {
  //first replace spaces with underscores and lowercase the slug
   slug = slug.replace(/\s/g, '_').toLowerCase();
   
  //replace äüö with ae ue and oe for german titles
  //later add support for more/other special chars defined in the admin interface 
  //removing the need of adding them all here and always test against those that we need to test against
  tr = {"\u00e4":"ae", "\u00fc":"ue", "\u00f6":"oe", "\u00df":"ss" }
  slug = slug.replace(/[\u00e4|\u00fc|\u00f6|\u00df]/g, function($0) { return tr[$0] });
  
  //remove all remaining specialchars, i dont like multiple underscores, so replace with nothing?
  slug = slug.replace(/[^a-z0-9_]+/g, '');
  
  return slug;
}

