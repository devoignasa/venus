

var SiteModel = (function () {


    // Config settings may be tweaked as required

    var config = {

        // publication hour in UTC, e.g., 15 = 10am Eastern
        hour: 15,

        // default date language
        lang: 'en-US',

        // default date format
        dateFmt: 'Month Day Year',

        // used to build absolute URLs
        siteURL: 'https://oig.nasa.gov',
        dataURL: 'https://firebasestorage.googleapis.com/v0/b/oig-nasa-gov.appspot.com/o/data%2FSiteData.json?alt=media',
        //dataURL: '/data/SiteModel.json',
        fileURL: 'https://oig.nasa.gov/docs/{{id}}',
        imageURL: 'https://oig.nasa.gov/docs/{{id}}',
        thumbURL: 'https://i.ytimg.com/vi/{{id}}/mqdefault.jpg',
        videoURL: 'https://www.youtube.com/embed/{{id}}?rel=0&autoplay=0&modestbranding=1&enablejsapi=1',

        // a unique key used to store session data
        guid: '{8051A512-4E4E-446F-A5B6-7466FE3128D4}'
    };


    var isLoaded = false;
    var model = { items: [] };
    var buffer = [];

    // PUBLIC

    function onLoad(callback) {

        var json = sessionStorage.getItem(config.guid);

        if (isLoaded) {
            if (typeof callback === 'function') callback();
        }
        else if (json) {
            model = JSON.parse(json, dateParser);
            model.items = preFilter(model.items);
            isLoaded = true;
            if (typeof callback === 'function') callback();
        }
        else {
            xhr = new XMLHttpRequest();
            xhr.open('GET', config.dataURL, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    json = xhr.responseText;
                    if (!json) return;
                    model = JSON.parse(json, dateParser);
                    model.items = preFilter(model.items);
                    sessionStorage.setItem(config.guid, json);
                    isLoaded = true;
                    if (typeof callback === 'function') callback();
                }
            };
            xhr.send();
        }
    }



    // A Linq like query syntax to slice & dice the data as required by each page

    function select(items) {

        // deep clone the data array so that original data remains unmodified 
        // this is especially important when making multiple queries so that
        // each remains autonomous.

        buffer = clone(items || model.items || []);

        return {
            type: function (id) {
                if (!id) return this;
                buffer = buffer.filter(function (item) {
                    return id === item.type;
                });
                return this;
            },
            topic: function (id) {
                if (!id) return this;
                buffer = buffer.filter(function (item) {
                    return id === item.topic;
                });
                return this;
            },
            year: function (fy) {
                if (!fy) return this;
                buffer = buffer.filter(function (item) {
                    return fy === FY(item);
                });
                return this;
            },
            videos: function () {
                var exists = {};
                buffer = buffer.filter(function (item) {
                    if (!item.video || exists[item.video]) return false;
                    return exists[item.video] = true;
                });
                return this;
            },
            take: function (count) {
                if (count) buffer = buffer.slice(0, count);
                return this;
            },

            skip: function (count) {
                if (count) buffer = buffer.slice(count);
                return this;
            },

            groupBy: function (prop) {

                if (!prop) return this;

                var i, item, key, obj = {}, list = [];

                // bin the items to obj by prop name: {'2020': [...], '2021': [...]}

                for (i = buffer.length - 1; i >= 0; i--) {
                    item = buffer[i];
                    key = prop === 'issued' ? FY(item.issued) : prop === 'expires' ? FY(item.expires) : item[prop];
                    if (key) (obj[key] = obj[key] || []).push(item);
                }

                // convert bins to array of objects: [{group: '2020', items: []}, ...]
                i = 0;
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        list.push({
                            id: i++,
                            name: key,
                            items: obj[key]
                        });
                    }
                }

                // group default sort order is DESC

                buffer = list.sort(function (a, b) {
                    a = a.name;
                    b = b.name;
                    return a > b ? -1 : a < b ? 1 : 0;
                });

                return this;
            },

            orderBy: function (prop, dir) {

                if (!prop) return this;

                if (typeof prop === 'function') {
                    buffer = buffer.sort(prop);
                }
                else {
                    var k = /desc/i.test(dir) ? -1 : 1;
                    buffer = buffer.sort(function (a, b) {
                        a = a[prop];
                        b = b[prop];
                        return k * (a < b ? -1 : a > b ? 1 : 0);
                    });
                }
                return this;
            },

            toList: function (options) {

                if (!options) options = {};

                var lang = options.lang || config.lang;
                var fmt = getDateFormat(options.date || config.dateFmt);

                return buffer.map(transpose);

                // iterate over object to convert or add fields for display 

                function transpose(item) {

                    if (item.items) item.items = item.items.map(transpose);

                    // TODO - need way to append any addendums without performance hit
                    // if (items.addendums) item.addendums = items.addendums.map(transpose);
                    item.addendums = [];

                    item.issued = dateFmt(item.issued, lang, fmt);
                    item.expires = dateFmt(item.expires, lang, fmt);
                    item.link = fileURL(item);
                    item.image = imageURL(item);
                    if (item.video) {
                        item.thumb = thumbURL(item);
                        item.video = videoURL(item);
                    }


                    // Fix
                    // For testimory they want to use 'Opening Statement' rather than 'Video' and
                    // 'Written Testimony' rather than 'Report' in links. This looks for keywords 
                    // in new item titles and sets the testimony flag when found. 

                    if (item.type == 5 || (item.type === 1
                        && (/testimony/i.test(item.title) || /testifies/i.test(item.title)))) {
                        item.isTestimony = true;
                    }


                    return item;
                }

            }
        }
    }



    
    

    // PRIVATE HELPERS


    // deep clone an object 
    // Overcomes problem of copying an array of objects where
    // the copy retains references to original objects.

    function clone(o) {
        var output, v, key;
        output = Array.isArray(o) ? [] : {};
        for (key in o) {
            v = o[key];
            output[key] = v instanceof Date ? new Date(v)
                : typeof v === "object" ? clone(v)
                : v;
        }
        return output;
    }


    // converts text date format to date options
    // Examples: "Month Day Year", "mmm d yyyy", "mm/dd/yy", "mmmm yyyy"
    // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString

    function getDateFormat(code) {

        if (!code) code = config.dateFmt;

        return {
            year: /(year|yyyy)/i.test(code) ? 'numeric'
                : /yy/i.test(code) ? '2-digit'
                : undefined,
            month: /(month|mmmm)/i.test(code) ? 'long'
                : /mmm/i.test(code) ? 'short'
                : /mm/i.test(code) ? '2-digit'
                : /m/.test(code) ? 'numeric'
                : /M/.test(code) ? 'narrow'
                : undefined,
            day: /dd/i.test(code) ? '2-digit'
                : /(\Wday|\Wd)/i.test(code) ? 'numeric'
                : undefined,
            weekday: /(weekday|wwww)/i.test(code) ? 'long'
                : /www/i.test(code) ? 'short'
                : /w/i.test(code) ? 'narrow'
                : undefined
        };
    }



    function dateFmt(date, lang, fmt) {
        if (!date || !date.toLocaleDateString) return date;
        return date.toLocaleDateString(lang || config.lang, fmt || config.dateFmt);
    }

    // the document url may be in either file (name) or link (url)
    // perference is given to file over link when both exist

    function fileURL(item) {
        var id = item ? item.file || item.link : null;
        if (!id || id.indexOf('http') === 0) return id;
        return config.fileURL.replace('{{id}}', id);
    }

    // returns absolute url of image file

    function imageURL(item) {
        return !item || typeof item.image !== 'string' ? null
            : item.image.indexOf('http') === 0 ? item.image
            : config.imageURL.replace('{{id}}', item.image);
    }

    // note that if video is http then uses 'unknown' as video ID
    // so that YouTube returns a gray thumbnail
    function thumbURL(item) {
        return !item || typeof item.video !== 'string' ? null
            : item.video.indexOf('http') === 0 ? config.thumbURL.replace('{{id}}', 'unknown')
            : config.thumbURL.replace('{{id}}', item.video);
    }

    function videoURL(item) {
        return !item || typeof item.video !== 'string' ? null
            : item.video.indexOf('http') === 0 ? image.video
            : config.videoURL.replace('{{id}}', item.video);
    }


    function FY(date) {
        if (!date || !date.getTime) return 0;
        return date.getUTCFullYear() + (date.getUTCMonth() < 9 ? 0 : 1);
    }

    // converts string dates back to date objects

    function dateParser(key, value) {
        return (key === 'issued' || key === 'expires') && value ? new Date(value) : value;
    };

    // filters out items that should not be displayed

    function preFilter(items) {
        return items.filter(function (item) {
            return !item.hidden
                && (!item.expires || item.expires.setUTCHours(config.hour, 0, 0, 0) > Date.now())
                && (item.issued && item.issued.setUTCHours(config.hour, 0, 0, 0) <= Date.now());
        });
    }

    // TODO - published data has addendum bit removed and so need to detect

    function addendums(item) {

        var i, pk, obj = {}, items = [];

        for (i = 0; i < buffer.length; i++) {
            pk = 'pk' + buffer[i].name + buffer[i].type;
            (obj[pk] = obj[pk] || []).push(buffer[i]);
        }

        for (pk in obj) {
            if (obj.hasOwnProperty(pk)) {
                // if more than 4 matches then probably not addendums but just common name
                if (obj[pk].length > 1 && obj[pk].length < 4) {
                    items.push(obj[pk]);
                }
            }
        }

        return items;

    }

    // INITIALIZE

    // While not required, if we tigger onLoad() here it will start fetching the json data
    // early on and even before the page is loaded. And this slightly reduces the lag time.

    onLoad();  

    return {
        onLoad: onLoad,
        select: select
   }

})();


var SITETYPE = {
    NEWS: 1,
    SEMIANNUAL: 2,
    AUDIT: 3,
    INVESTIGATION: 4,
    TESTIMONY: 5,
    REVIEW: 7,
    LETTER: 8,
    PROJECT: 10,
    CHALLENGE: 11,
    PRESS: 12,
    OTHER: 13,
    RECOMMEND: 14
}

var SITETOPIC = {
    SPACE: 1,
    SCIENCE: 2,
    IT: 3,
    FINANCIAL: 4,
    MISSION: 5,
    AUDIT: 6,
    EXPORT: 13
};



