// Set up a collection to contain article information. On the server,
// it is backed by a MongoDB collection titled "articles".

Articles = new Mongo.Collection("articles");
Labels = new Mongo.Collection("labels");


if (Meteor.isClient) { 
  var width = $(window).width() - 25; 
  $("#outer").width(width);


  Meteor.subscribe('theArticles');
  Meteor.subscribe('theLabels');

  globalHotkeys = new Hotkeys();

  // LEFT KEY MEANS NO NO MEANS NO
  globalHotkeys.add({
    combo : "left",
    callback : function () {
      $('.no').css("background-color", "#4099FF");
      $('.no').css("color", "#fff");
      setTimeout( function (){  
        $('.no').trigger('click'); 
      }, 200);
    }
  })

  globalHotkeys.add({
    combo : "right",
    callback : function () {
      $('.yes').css("background-color", "#4099FF");
      $('.yes').css("color", "#fff");
      setTimeout( function (){  
        $('.yes').trigger('click'); 
      }, 200);
    }
  })
 

  // HANDLEBAR HELPERS!
  Template.registerHelper("DateString", function(timestamp) {
    var date = new Date(timestamp);
    return date.toDateString(); 
  });

  Template.registerHelper("LocaleString", function(timestamp) {
    var date = new Date(timestamp);
    return date.toLocaleString(); 
  });

  Template.leaderboard.helpers({

    articles: function () {
      var currentUserId = Meteor.userId();    

      p = Articles.findOne({'body':{$ne:''},
            'user_ids':{$ne:currentUserId},
            'topics':{$exists:true,$not: {$size: 0},
                     $in: Meteor.user().profile.topics}});
 
      if(typeof p === 'undefined'){
        console.log('NO MORE ARTICLES'); 
        Session.set("allDone", true);
      }
      else{      
        Session.set("allDone", false); 
        Session.set("selectedArticle", p._id);   
        return [ p ];
      }
    },

    isAdmin: function(){
      return (Meteor.user().profile['name'] === 'Sophie Chou');
    },
 
    noEntries: function () {
     return (Articles.find().count() === 0);
    },

    allDone: function (){
      return Session.get("allDone");
    //return Articles.find({'user_ids':{$ne : Meteor.userId()}, body:{$ne:''}}).count() === 0;
    },

    selectedArticle: function () {
      var article = Articles.findOne(Session.get("selectedArticle"));
 
      return article && article.title;
    },
    completeCount: function (){
      return Articles.find({'user_ids': Meteor.userId()}).count()
    },
    totalCount: function (){ 
      return Articles.find({'body':{$ne:''},
            'user_ids':{$ne:Meteor.userId()},
            'topics':{$exists:true,$not: {$size: 0},
                     $in: Meteor.user().profile.topics}}).count(); 
      //return Articles.find({}).count()
    },
    percent_complete: function(){
      var completed = Articles.find({'user_ids': Meteor.userId()}).count();
      //var total = Articles.find({'body':{$ne:''}}).count();
      var total = Articles.find({'body':{$ne:''},
            'user_ids':{$ne:Meteor.userId()},
            'topics':{$exists:true,$not: {$size: 0},
                     $in: Meteor.user().profile.topics}}).count(); 
      return Math.round(( completed / total ) * 100);
    },

    numTrue: function(){
      return Labels.find({'user_id':Meteor.userId(), user_label : 1}).count();
    },
    numFalse: function(){
      return Labels.find({'user_id':Meteor.userId(), user_label : 0}).count();
    },

    numMachineTrue: function(){
      return Labels.find({'user_id':Meteor.userId(), article_conf : {$gt: 50}}).count();
    },


    numMachineFalse: function(){
      return Labels.find({'user_id':Meteor.userId(), article_conf : {$lt: 50}}).count();
    },

    falseNegCount: function(){
      return Labels.find({'user_id':Meteor.userId(), article_conf : {$lt: 50}, user_label: 1}).count();
    },

    falsePosCount: function(){
      return Labels.find({'user_id':Meteor.userId(), article_conf : {$gt: 50}, user_label: 0}).count();
    },

    falseNeg: function(){
      return Labels.find({'user_id':Meteor.userId(), article_conf : {$lt: 50}, user_label: 1}, 
        {sort: { timestamp: -1 }, skip:0});
    },


    
    //all of your answers
    results: function(){ 

      //var labels = Labels.find({'user_id': Meteor.userId()}, 
      //  {sort: { timestamp: -1 }, skip:0, limit: 10}); 
      var labels = Labels.find({'user_id': Meteor.userId()},
          {sort: { timestamp: -1 }, skip:0, limit:20}); 
      return labels;
    },

    //corrections
    corrections: function(){ 

      //var labels = Labels.find({'user_id': Meteor.userId()}, 
      //  {sort: { timestamp: -1 }, skip:0, limit: 10}); 
      //THIS?
      //var labels = Labels.find({'user_id': Meteor.userId(),
      //              user_label: {$ne: 1* (article_conf < 50)}},
     //                {sort: { timestamp: -1 }, skip:0, limit:20}); 
      return 0;
    },

    //all of sorting hat's answers
    machineResults: function(){  
      //var values = Labels.find({'user_id': Meteor.userId()}, {fields : {'article_conf':1}}, {sort: { timestamp: -1 }, skip:0, limit: 10}).map(function(x) { return x.article_conf;});
      var values = Labels.find({'user_id': Meteor.userId()}, {fields : {'article_conf':1}}).map(function(x) { return x.article_conf;});
 
      // can't do list comprehensions
      var bools = []
      // map function still returns all, so i cut it here
      for (var i = 0; i < values.length; i++) {
           bools.push(values[i] > 50);
      } 
      return bools;
    },

    showSettings: function(){
      return Session.get('showSettings');
    }

  });


  Template.leaderboard.events({
    'click .article': function(){
      var labelId = this._id;  
      var labelVal = this.user_label;
      Session.set('selectedLabel', labelId);
    },

    'click .change': function () {

      var labelId = this._id;  
      var labelVal = this.user_label;  
      var labelTitle = this.article_title;
      console.log(labelVal ^ 1);

      Labels.update(labelId,
        {$set: 
          {timestamp : Date.now(),
          user_label: labelVal ^ 1}
        }); // FUCKING BITSHIFT BOOYAH
        

      Articles.update(Session.get("selectedArticle"),
       {$pull : {'labels': labelVal}}
       );

      Articles.update(Session.get("selectedArticle"),
       {$push : {'labels': labelVal ^ 1}}
       );
 
      $("#leaderboard").load(location.href + " #leaderboard");
    },

    'click .showSettings': function () {
        Session.set("showSettings", true);
        console.log("SHOW")   
    },

    'click .hideSettings': function () {
        Session.set("showSettings", false);   
    },
 
    'click .yes': function () {

      id = Date.now().toString().substr(4);
      article_title = Articles.find( {_id:Session.get("selectedArticle")}).map(function(x) { return x.title;});
      article_conf = Articles.find( {_id:Session.get("selectedArticle")}, {fields: {'confidence': 1}}).map(function(x) {return x.confidence;}); 
 
      Labels.insert({
        _id : id,
        article_id : Session.get("selectedArticle"),
        article_title: article_title[0],
        article_conf: article_conf[0],
        user_id : Meteor.userId(),
        timestamp : Date.now(),
        user_label: 1

      }); 

      //add this user and this label to the article
      Articles.update(Session.get("selectedArticle"),
       {$push: {'label_ids': id, 'labels': 1, 'user_ids': Meteor.userId()}
      });

      $("#leaderboard").load(location.href + " #leaderboard");
    },
 

    'click .no': function () {

      id = Date.now().toString().substr(4);

      article_title = Articles.find( {_id:Session.get("selectedArticle")}).map(function(x) { return x.title;});

      console.log(article_title);

      article_conf = Articles.find( {_id:Session.get("selectedArticle")}, {fields: {'confidence': 1}}).map(function(x) {return x.confidence;});

      console.log(article_conf);
      
 
      Labels.insert({
        _id : id,
        article_id : Session.get("selectedArticle"),
        article_title: article_title[0],
        article_conf: article_conf[0],
        user_id : Meteor.userId(),
        timestamp : Date.now(),
        user_label: 0

      }); 

      //add this user and this label to the article
      Articles.update(Session.get("selectedArticle"),
       {$push: {'label_ids': id, labels: 0,'user_ids': Meteor.userId()}
      });

      $("#leaderboard").load(location.href + " #leaderboard");
    },

    'click .heart': function () {
      console.log('you heart it!');
    },

    'click .email': function () {
      var topics = Meteor.user().profile['topics'];
      var html = '';
      for (var i = 0; i < topics.length; i++) {
        html += topics[i] + "<br>";
      }
 

      Meteor.call('sendEmail',
            'sbchou@gmail.com',
            'wizard@sortinghat.com',
            'Hello from Sorting Hat!',
            'Hello world',
             html)
      console.log('you sent an email!');
    }
  
  });


  Template.article.helpers({
    selected: function () {
      return Session.equals("selectedArticle", this._id) ? "selected" : '';
    }
  });  


  Template.settings.events({
   'submit #settings-form' : function (event, template) {
     event.preventDefault();

     var selected = template.findAll( "input[type=checkbox]:checked");

     var array = _.map(selected, function(item) {
       return item.defaultValue;
     });
     Meteor.users.update({_id:Meteor.user()._id}, { $set: {'profile.topics': array} });

     console.log(Meteor.user().profile['topics']);

   }
  });


 }

 

// On server startup, get last 20 articles
if (Meteor.isServer) { 
    process.env.MAIL_URL = "smtp://postmaster@sandboxe30f4a212c2043d98e278fb247831889.mailgun.org:4439319b0ce107ef952c6515064a81b8@smtp.mailgun.org:587";
    /**
       PrettyEmail.options = {
        from: 'support@mycompany.com',
        logoUrl: 'http://mycompany.com/logo.png',
        companyName: 'myCompany',
        companyUrl: 'http://mycompany.com',
        companyAddress: '123 Street, ZipCode, City, Country',
        companyTelephone: '+1234567890',
        companyEmail: 'support@mycompany.com',
        siteName: 'mycompany'
      };

      PrettyEmail.send('call-to-action', {
        to: 'sbchou@gmail.com',
        subject: 'You got new message',
        heading: 'Your friend sent you a message',
        message: 'Click the button below to read the message',
        buttonText: 'Read message',
        buttonUrl: 'http://mycompany.com/messages/2314'
      });
    **/
// ---
// generated by coffee-script 1.9.2

// ---
// generated by coffee-script 1.9.2

    // In your server code: define a method that the client can call
    Meteor.methods({
 

      sendEmail: function (to, from, subject, text, html) {
        check([to, from, subject, text, html], [String]);

        // Let other method calls from the same client start running,
        // without waiting for the email sending to complete.
        this.unblock();

        Email.send({
          to: to,
          from: from,
          subject: subject,
          text: text,
          html: html
        });
      }
    });  

    Meteor.publish('theArticles', function(){
      var currentUserId = this.userId; 
      //return Articles.find({}); 
      return Articles.find({'user_id':{$ne : currentUserId}, body:{$ne:''}}, {sort: {date_written: -1 }}); 
      //n o limit
      //return Articles.find({'user_id':{$ne : currentUserId}, body:{$ne:''}}); 
    });

    Meteor.publish('theLabels', function(){
      var currentUserId = this.userId;
      return Labels.find({});
    });
}
