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
      // objects we haven't labeled yet. does this work?
      //IF NO MORE LEFT
      p = Articles.findOne({'body':{$ne:''}, 'user_ids':{$ne:currentUserId}});
      if(typeof p === 'undefined'){
        console.log('NO MORE ARTICLES'); 
        return [];
      }
      else{      
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
    return Articles.find({'user_ids':{$ne : Meteor.userId()}, body:{$ne:''}}).count() === 0;
    },

    selectedArticle: function () {
      var article = Articles.findOne(Session.get("selectedArticle"));
 
      return article && article.title;
    },
    completeCount: function (){
      return Articles.find({'user_ids': Meteor.userId()}).count()
    },
    totalCount: function (){
      return Articles.find({}).count()
    },
    percent_complete: function(){
      var completed = Articles.find({'user_ids': Meteor.userId()}).count();
      var total = Articles.find({'body':{$ne:''}}).count();
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

    showStats: function(){
      return Session.get('showStats');
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

    'click .showStats': function () {
        Session.set("showStats", true);   
    },

    'click .hideStats': function () {
        Session.set("showStats", false);   
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
    }
  });

  Template.article.helpers({
    selected: function () {
      return Session.equals("selectedArticle", this._id) ? "selected" : '';
    }
  });  
 }

// On server startup, get last 20 articles
if (Meteor.isServer) {

    Meteor.publish('theArticles', function(){
      var currentUserId = this.userId; 
      //return Articles.find({}); 
      //return Articles.find({'user_id':{$ne : currentUserId}, body:{$ne:''}}, {skip:0, limit: 20}); 
      //n o limit
      return Articles.find({'user_id':{$ne : currentUserId}, body:{$ne:''}}); 
    });

    Meteor.publish('theLabels', function(){
      var currentUserId = this.userId;
      return Labels.find({});
    });
}
