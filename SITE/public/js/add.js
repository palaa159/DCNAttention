// pull all media networks -> populate in dropdown
// pull all content buckets -> populate in dropdown

// using async

async.parallel({
        media_companies: function(callback) {
            var Media = Parse.Object.extend('media_companies');
            var media = new Media();
            media.fetch({
                success: function(myObject) {
                    // The object was refreshed successfully.
                    // console.log(myObject._serverData.results);
                    callback(null, myObject._serverData.results);
                },
                error: function(myObject, error) {
                    // The object was not refreshed successfully.
                    // error is a Parse.Error with an error code and message.
                    alert('Error fetching media companies!');
                }
            });
        },
        categories: function(callback) {
            var Cat = Parse.Object.extend('categories');
            var cat = new Cat();
            cat.fetch({
                success: function(myObject) {
                    // The object was refreshed successfully.
                    // console.log(myObject._serverData.results);
                    callback(null, myObject._serverData.results);
                },
                error: function(myObject, error) {
                    // The object was not refreshed successfully.
                    // error is a Parse.Error with an error code and message.
                    alert('Error fetching categories!');
                }
            });
        }
    },
    function(err, results) {
        // results is now equals to: {one: 1, two: 2}
        init(results);
    });

var init = function(results) {
    // populate
    results.media_companies.forEach(function(item) {
        var toAdd = $('<option value="' + item.title + '">' + item.title + '</option>');
        // console.log(toAdd);
        $('.ipt_company').append(toAdd);
    });
    results.categories.forEach(function(item) {
        var toAdd = $('<option value="' + item.title + '">' + item.title + '</option>');
        // console.log(toAdd);
        $('.ipt_category').append(toAdd);
    });
    attachEvents();
};

var attachEvents = function() {
    $('.btn_add').off('click').on('click', function() {
        $('.populate_area').append($('#template').clone().removeClass('hidden').addClass('item'));
        $('.btn_delete').off('click').on('click', function() {
            $(this).parent().parent().remove();
        });
    });
    $('.btn_submit').off('click').on('click', function() {
        // gather all items
        // make json
        // saveAll
        var today = (new Date().getMonth() + 1).toString() + (new Date().getDate()).toString();
        console.log(today);
        var DB = Parse.Object.extend('content_' + 'dummy');

        // let's make a list to post
        var listToPost = [];

        $.each($('.item'), function(i, v) {
            var link, headline, image_url, company, category;
            $.each(($(v).find('div')), function(i, v) {
                if (i === 0) { // link
                    link = $(v).children('input').val();
                    // console.log(link);
                } else if (i === 1) {
                    headline = $(v).children('input').val();
                } else if (i === 2) {
                    image_url = $(v).children('input').val();
                } else if (i === 3) {
                    company = $(v).children('select').val();
                } else if (i === 4) {
                    category = $(v).children('select').val();
                }
            });

            var db = new DB();
            db.set('link', link);
            db.set('headline', headline);
            db.set('image_url', image_url);
            db.set('company', company);
            db.set('category', category);
            db.set('social_val', 0);
            db.set('face_val', 0);
            
            listToPost.push(db);
        });

        Parse.Object.saveAll(listToPost, {
            success: function() {
                alert('yeah');
                $('input').val('');
            },
            error: function() {
                alert('nah');
            }
        });
    });
};