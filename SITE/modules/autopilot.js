var id = 0;
var id_to_title;

module.exports = {
    fake_valuate: function(parse, CONTENT_DATABASE, contents, res) {
        // console.log(contents);
        // random a cat_id 1-7
        if (id === 7) {
            id = 1;
        } else {
            id++;
        }
        console.log('Picking id: ' + id);
        // pick 2 in contents to compete
        // get cat_id of id
        var cat_contents = [];
        contents.forEach(function(content) {
            if (content.cat_id === id.toString()) {
                id_to_title = content.category;
                cat_contents.push(content);
            }
        });
        console.log('content in cat length: ' + cat_contents.length);
        // console.log(cat_contents);
        // pick 2
        var tmp_range = [];
        for (var i = 0; i < cat_contents.length; i++) {
            // console.log(i);
            tmp_range.push(i);
            // console.log(tmp_range);
        }
        console.log('tmp_range = ');
        console.log(tmp_range);
        var rand_content_1 = tmp_range[Math.floor(Math.random() * tmp_range.length)];
        // remove
        tmp_range.splice(tmp_range.indexOf(rand_content_1), 1);
        var rand_content_2 = tmp_range[Math.floor(Math.random() * tmp_range.length)];

        console.log('Pairing completed');
        console.log(rand_content_1, rand_content_2);
        cat_contents[rand_content_1].val_history.push({
            ts: new Date().getTime(),
            //
            face_val: parseFloat((((Math.random() * 2) + 1) / 3).toFixed(2)),
            social_val: parseFloat((((Math.random() * 2) + 1) / 3).toFixed(2))
        });
        // TODO: update total_face_val
        cat_contents[rand_content_2].val_history.push({
            ts: new Date().getTime(),
            face_val: parseFloat((((Math.random() * 2) + 1) / 3).toFixed(2)),
            social_val: parseFloat((((Math.random() * 2) + 1) / 3).toFixed(2))
        });
        var toUpdate_1 = {
            objectId: cat_contents[rand_content_1].objectId,
            data: {
                val_history: cat_contents[rand_content_1].val_history
            }
        };
        var toUpdate_2 = {
            objectId: cat_contents[rand_content_2].objectId,
            data: {
                val_history: cat_contents[rand_content_1].val_history
            }
        };
        var toUpdate = [toUpdate_1, toUpdate_2];
        parse.updateObjectAutopilot(CONTENT_DATABASE, toUpdate, res, id_to_title);
    }
};

// Helpers
function calculateVal(arr, which) {
    var totVal = 0;
    arr.forEach(function(item) {
        totVal += parseFloat(item[which]);
    });
    return totVal;
}