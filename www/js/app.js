/**
 * Wait before the DOM has been loaded before initializing the Ubuntu UI layer
 */
var UI = new UbuntuUI();

$(document).ready(function () {
    UI.init();
    UI.pagestack.push("main");

    if (typeof localStorage["feeds"] == "undefined") {
        restoreDefault();
    }

    //load local storage feeds
    var feeds = eval(localStorage["feeds"]);
    if (feeds !== null) {
        var feeds_list = UI.list('#yourfeeds');
        feeds_list.removeAllItems();
        feeds_list.setHeader('My feeds');

        for (var i = 0; i < feeds.length; i++) {
            feeds_list.append(feeds[i],
                              null,
                              null,
                              function (target, thisfeed) { loadFeed(thisfeed); },
                              feeds[i]);
        }
    }

    UI.button('yes').click(function (e) {
        var url = $("#rssFeed").val();
        if (url !== "") {
            var feeds = eval(localStorage["feeds"]);
            feeds.push(url);
            localStorage.setItem("feeds", JSON.stringify(feeds));
            window.location.reload();
        }
    });

    UI.button('addfeed').click(function () {
        $('#addfeeddialog').show();
    });
});

function restoreDefault() {
    localStorage.clear();
    var feeds = [];
    feeds.push("http://daker.me/feed.xml");
    feeds.push("http://www.omgubuntu.co.uk/feed");
    feeds.push("http://hespress.com/feed/index.rss");
    feeds.push("http://rss.slashdot.org/Slashdot/slashdot");
    feeds.push("http://www.reddit.com/.rss");
    feeds.push("http://www.guokr.com/rss/");

    try {
        localStorage.setItem("feeds", JSON.stringify(feeds));
        window.location.reload();
    } catch (e) {
        if (e == QUOTA_EXCEEDED_ERR) {
            console.log("Error: Local Storage limit exceeds.");
        } else {
            console.log("Error: Saving to local storage.");
        }
    }
}

function loadFeed(url) {
   UI.pagestack.push("results");
   UI.dialog("loading").show()

    console.log("url is: " + url );

    $.getFeed( {
                  url: url,
                  success: function(feed) {
                      UI.dialog("loading").hide();

                      var results_list = UI.list('#resultscontent');
                      results_list.removeAllItems();
                      results_list.setHeader(feed.title);

                      console.log("title: " + feed.title);

                      // walk through the feeds
                      for( var i = 0; i < feed.items.length; i++ ) {
                          var item = feed.items[ i ];

//                          console.log("title: " + item.title);
//                          console.log("link: " +  item.link);
//                          console.log("content: " + item.description);

                            results_list.append(
                                item.title.replace(/"/g, "'"),
                                null,
                                null,
                                function (target, result_infos) {
                                  showArticle.apply(null, result_infos); },
                                [ escape(item.title),
                                  escape(item.link),
                                  escape(item.description) ] );
                      }
                    }

    });
}

function showArticle(title, url, desc) {
   UI.pagestack.push("article");

   if (typeof desc == "undefined")
       desc = "(No description provided)";
   $("#articleinfo").html("<p>" + unescape(title) + "</p><p>" + unescape(desc) + "</p><p><a target=\"_blank\" href=\"" + unescape(url) + "\">" + unescape(url) + "</a></p>");

}
