// Redirect to Login page if not signed in

// Models

var Item = function (item, id) {
    if (typeof item === 'string') item = JSON.parse(item);
    if (typeof item !== 'object') item = {};
    return {
        id: id || item.id || null,
        issued: item.issued ? new Date(item.issued) : new Date(),
        expires: item.expires ? new Date(item.expires) : null,
        name: item.name || null,
        title: item.title || null,
        summary: item.summary || null,
        type: isNaN(parseInt(item.type)) ? null : parseInt(item.type),
        topic: isNaN(parseInt(item.topic)) ? null : parseInt(item.topic),
        link: item.link || null,
        size: isNaN(parseInt(item.size)) ? null : parseInt(item.size),
        image: item.image || null,
        video: item.video || null,
        hidden: !!item.hidden || null,
        foia: !!item.foia || null,
        redacted: item.redacted || null,
        addendum: !!item.addendum || null,
        notes: item.notes || null
    }
}

// Replaces special Word chars with plain text

function plainText(str) {

    if (!str) return null;

    return str.replace(/[\u2018\u2019\u201A]/g, "'")  // smart single quotes and apostrophe
        .replace(/[\u201C\u201D\u201E]/g, '"')          // smart double quotes
        .replace(/\u2026/g, "...")                      // ellipsis
        .replace(/[\u2013\u2014]/g, "-")                // dashes
        .replace(/\u02C6/g, "^")                        // circumflex
        .replace(/\u2039/g, "<")                        // open angle bracket
        .replace(/\u203A/g, ">")                        // close angle bracket
        .replace(/[\u02DC\u00A0]/g, " ")                // spaces
        .replace(/\>/g, "&gt;")
        .replace(/\</g, "&lt;");
}


var Repository = (function () {

    var methods = {

        list: function (callback) {
            //firebase.database().ref('site/items').once('value').then(function (snap) {
            items.once('value').then(function (snap) {
                var objects = snap.val();
                var list = [];
                for (var key in objects) {
                    var item = new Item(objects[key]);
                    item.id = key;
                    list.push(item);
                }
                list = list.sort(function (a, b) {
                    return b.issued - a.issued;
                });

                callback(list);
            });
        },

        get: function (id, callback) {

            if (id) items.child(id).once('value').then(function (snap) {
                callback(snap.val());
            })
            else callback(new Item());
        },

        // callback is optional and will return either null or a text message on error
        update: function (item, callback) {
            if (!item) return;
            //if (!item.id) item.id = firebase.database().ref().child('items').push().key;
            if (!item.id) item.id = items.push().key;
            item = new Item(item);
            // Date objects must be converted to integer or string for FB to save
            if (item.issued) item.issued = item.issued.getTime();
            if (item.expires) item.expires = item.expires.getTime();
            item.number = plainText(item.number);
            item.title = plainText(item.title);
            item.summary = plainText(item.summary);
            item.notes = plainText(item.notes);

            firebase.database().ref('site/items').child(item.id).set(item, callback);
            return item;
        },

        // Removes item and returns either null or message on error
        remove: function (item, callback) {
            if (item && item.id) items   //firebase.database().ref('site/items')
                .child(item.id)
                .remove()
                .then(callback)
                .catch(callback);
        },

        metadata: function (callback) {
            //firebase.database().ref('site/metadata').once('value').then(function (snapshot) {
            metadata.once('value').then(function (snap) {
                callback(snap.val());
            });
        },

        // see: https://firebase.google.com/docs/storage/web/upload-files

        upload: function (folder, file, filename, callback, progress) {

            if (!folder) folder = file.type.indexOf('image') === 0 ? 'images' : 'docs';

            var task = firebase.storage().ref(folder).child(filename || file.name).put(file);

            task.on('state_changed', function (snap) {

                if (typeof progress === 'function') progress({
                    percent: (snap.bytesTransferred / snapshot.totalBytes) * 100,
                    state: snap.state
                });

                // firebase.storage.TaskState.PAUSED: // or 'paused'
                // firebase.storage.TaskState.RUNNING: // or 'running'
            },
            function (error) {
                // Handle unsuccessful uploads
            },
            function () {
                if (typeof callback === 'function') {
                    task.snapshot.ref.getDownloadURL().then(function (url) {
                        callback(url);
                    });
                }
            });

        },

        getURL: function (folder, filename, callback) {

            if (!folder) folder = /(.jpg|.png|.gif)/i.test(filename) ? 'images' : 'docs';

            if (!filename || filename.indexOf('http') === 0) {
                callback(filename);
            }
            else {
                firebase.storage().ref(folder).child(filename).getDownloadURL().then(function (url) {
                    callback(url);
                });
            }
        },

        // news images are automatically generated by firebase with max height of 300px

        getThumbnailURL: function (folder, filename, callback) {

            if (!filename || filename.indexOf('http') === 0) {
                callback(filename);
            }
            else {
                var thumbname = filename.replace('.', '_600x300.');
                methods.getURL(folder || 'images', thumbname, function (url) {
                    if (url) {
                        callback(url);
                    }
                    else {
                        // not found so try get original size image
                        methods.getURL(folder || 'images', filename, function (url) {
                            callback(url);
                        })
                    }
                })
            }
        },

        directory: function (folder, callback) {

            firebase.storage().ref(folder).listAll().then(function (res) {
                res.items.forEach(function (itemRef) {
                    console.log(itemRef);
                });
                callback();
            });
        },

        videos: function (callback) {

            // YouTube 
            // Must get an API key from Google and enable the YouTube Data API on the project.
            // IMPORTANT: Google will auto-expire keys if not used for 90 days
            // If this happens then may need to create a new project and key as difficult to activate expired key.
            // Can only get 50 items per call and must use nextPageToken to get full list.
            // Note that YouTube will not include videos marked 'PRIVATE'

            var APP_KEY = "AIzaSyCQcW3wDxplz6TvUg0qTn3QnKeT6GgNXR0";
            var PLAYLIST_ID = "UUBx2XRsXYGxDS_R9MPwfRRw";
            var buffer = [];

            function getPlaylist(nextPageToken) {

                var url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet" +
                    // "&fields=nextPageToken,items(snippet(title,resourceId))" +  // to limit size of returned json to certain fields
                    "&maxResults=50" +
                    "&playlistId=" + PLAYLIST_ID +
                    "&key=" + APP_KEY +
                    "&pageToken=" + (nextPageToken || "");
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onload = function () {
                    if (xhr.status === 200) {
                        var packet = JSON.parse(xhr.responseText);
                        buffer = buffer.concat(packet.items);
                        if (packet.nextPageToken) {
                            getPlaylist(packet.nextPageToken);
                        }
                        else {
                            // flatten items and return list
                            callback(buffer.map(function (item) {
                                item = item.snippet;
                                if (!item.thumbnails || !item.thumbnails.standard) {
                                    console.log(item);
                                }
                                return {
                                    id: item.resourceId.videoId,
                                    name: item.resourceId.videoId,
                                    title: item.title,
                                    summary: item.description,
                                    sort: item.position,
                                    issued: new Date(item.publishedAt),

                                    // sometimes certain thumbnail sizes are missing
                                    image: (
                                        item.thumbnails.standard ||
                                        item.thumbnails.medium ||
                                        item.thumbnails.default ||
                                        {}
                                    ).url
                                }
                            }));
                        }
                    }
                }
                xhr.send();
            }

            getPlaylist();

        }



    }

    // Initialize and authenticated

    // if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

    var site = firebase.database().ref('site');
    var items = site.child('items');
    var metadata = site.child('metadata');
    var types = metadata.child('types');

    /*
    firebase.auth().onAuthStateChanged(function (user) {
        if (!user && location.pathname.indexOf('login.html') < 0) {
            location.replace('login.html?signInSuccessUrl=' + encodeURIComponent(location.href));
        }
    });
    */

    return methods;

})();


