
// A generic Vue application pre-wired with data
// Requires Vue.js and SiteModel.js

window.addEventListener('load', function () {

    SiteModel.onLoad(function () {
        new Vue({
            el: '#VueApp',
            methods: {
                select: SiteModel.select,
                addendums: function () { return []; } // TODO - 
            }
        });
    });

});