site = {
    "version":4.202
};

window.addEventListener('WebComponentsReady', function() {
    defineElements();
});

if (window.history && history.pushState) {
    linkCalculator();
} else {
    document.querySelector('.fixedFab').classList.add('no-history');
};

function linkCalculator () {
    var links = document.querySelectorAll('.link');
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        link.addEventListener('click', function(event){
            event.preventDefault();
            loadPage(this.href);
        });
    };
};

function Get(yourUrl){
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET",yourUrl,false);
    Httpreq.send(null);
    return Httpreq.responseText;          
};

/*if (sessionStorage.getObject('user') == null) {
    var user = {};
    sessionStorage.setObject('user', user);
};*/

if (localStorage.getObject('options') == null) {
    options = {"theme":"light"};
    localStorage.setObject('options', options);
} else {
    options = localStorage.getObject('options')
}

setTheme();

function setTheme() {
    if (localStorage.getObject('options').theme == "dark") {
        document.querySelector('html').classList.add('mdc-theme--dark');
    } else {
        document.querySelector('html').classList.remove('mdc-theme--dark');
    }
}


if (localStorage.getItem('user') == null) {
    localStorage.setObject('user', {"latestVersion":site.version,"redirect":"none"}); //Redirect can be set to none, delta, gamma, beta, or alpha. Latest Version is when the site was last accessed.
    openDialog('Welcome to James M: Epsilon!', 'This new version of the site is a complete recode and redesign.');
    var user = localStorage.getObject('user');
} else {
    var user = localStorage.getObject('user');
    if (user.latestVersion < site.version) {
        $.get("/src/changelog.json", function (data) {
            var i = 0;
            var versionList = '<div class="mdc-card"><ul class="mdc-list mdc-list--two-line">';
            var current = data[i];
            while (current.version != user.latestVersion) {
                versionList += '<li class="mdc-list-item"><span class="mdc-list-item__text">' + current.title + '<span class="mdc-list-item__secondary-text">' + current.subtitle + '</span></span></li>';
                i++;
                current = data[i];
            }
            versionList += '</ul></div>';
            console.log(versionList);
            openDialog('Some Things have Changed!', versionList);
            user.latestVersion = site.version;
            localStorage.setObject('user', user);
        });
    };
};

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

var toolbar = mdc.toolbar.MDCToolbar.attachTo(document.querySelector('.mdc-toolbar'));
toolbar.fixedAdjustElement = document.querySelector('.mdc-toolbar-fixed-adjust');
mdc.ripple.MDCRipple.attachTo(document.querySelector('.mdc-fab'));
var dialog = new mdc.dialog.MDCDialog(document.querySelector('#dialogBox'));

dialog.listen('MDCDialog:accept', function() {
    console.log('accepted');
    var dialogBox = document.querySelector('.mdc-dialog__surface');
    var dialogActions = document.querySelector('.mdc-dialog__footer');
    dialogActions.innerHTML = '<button type="button" class="mdc-button mdc-dialog__footer__button mdc-dialog__footer__button--accept mdc-dialog__action">Okay!</button>';
    dialogBox.classList.remove('article');
});

dialog.listen('MDCDialog:cancel', function() {
    console.log('canceled');
    var dialogBox = document.querySelector('.mdc-dialog__surface');
    var dialogActions = document.querySelector('.mdc-dialog__footer');
    dialogActions.innerHTML = '<button type="button" class="mdc-button mdc-dialog__footer__button mdc-dialog__footer__button--accept mdc-dialog__action">Okay!</button>';
    dialogBox.classList.remove('article');
});

function openDialog(title, body, scroll) {
    var dialog = new mdc.dialog.MDCDialog(document.querySelector('#dialogBox'));
    document.getElementById('dialogBox-label').innerHTML = title;
    document.getElementById('dialogBox-description').innerHTML = body;
    dialog.show();
    if (scroll) {
        document.querySelector('.mdc-dialog__body').classList.add('mdc-dialog__body--scrollable');
    } else {
        document.querySelector('.mdc-dialog__body').classList.remove('mdc-dialog__body--scrollable');
    };
};

let drawer = new mdc.drawer.MDCTemporaryDrawer(document.querySelector('#navDrawer'));
document.querySelector('#menuButton').addEventListener('click', () => drawer.open = !drawer.open);

openArticle = function readUpdate(update) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        var article = JSON.parse(this.responseText);
        openDialog(article.title, article.body, true);
        var dialog = new mdc.dialog.MDCDialog(document.querySelector('#dialogBox'));
        var dialogActions = document.querySelector('.mdc-dialog__footer');
        var dialogBox = document.querySelector('.mdc-dialog__surface');
        dialogActions.innerHTML = '<button class="mdc-button mdc-dialog__footer__button mdc-dialog__footer__button--accept mdc-dialog__action"><i class="material-icons mdc-button__icon">close</i>Close</button>';
        dialogBox.classList.add('article');
    };
    xmlhttp.open("GET", update, true);
    xmlhttp.send();
};

function fullscreen(elementId) {
    var elem = document.getElementById(elementId);
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
        e(elem).addClass('fullscreen');
    }
};

function newTab(src) {
    var element = document.createElement('a');
    element.setAttribute('href', src);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
};

openOptions = function(){
    openDialog('Options', 'Theme: <div class="mdc-select"><select onchange="setOption(\'theme\', this.value);setTheme();" id="themePicker" class="mdc-select__surface"><option value="light" default selected>Light</option><option value="dark">Dark</option></select><div class="mdc-select__bottom-line"></div></div>', false);
    var options = localStorage.getObject('options');
    document.querySelector('#themePicker').value = options.theme;
}

setOption = function(property, value){
    var options = localStorage.getObject('options');
    if (options == null) {
        var options = {};
    };
    eval('options.' + property + ' = "' + value + '"');
    localStorage.setObject('options', options);
};

function loadPage(page) {
    $.get(page + "/index.html", function (data) {
        var html = $(data);
        var newPage = $('#content', html);
        console.log(newPage.prevObject);
        var content = newPage.prevObject[39];
        var toolbar = newPage.prevObject[31];
        var drawer = newPage.prevObject[33];
        document.querySelector('#content').innerHTML = content.innerHTML;
        document.querySelector('.mdc-toolbar--waterfall').innerHTML = toolbar.innerHTML;
        document.querySelector('#navDrawer').innerHTML = drawer.innerHTML;
        linkCalculator();
        $.getScript( page + "/page.js" );
        var state = {"redirect":false};
        history.pushState(state, page, page);
        window.scrollTo(0, 0); 
        document.querySelector('#moreButton').addEventListener('click', function(){
            if (document.querySelector('#appsList') == null) {
                $.get("/src/app.html", function (data) {
                    var wrapper = document.createElement('div');
                    wrapper.innerHTML = data;
                    var appsList = wrapper.firstChild;
                    document.body.appendChild(appsList);
                }); 
            } else {
                document.body.removeChild(document.querySelector('#appsList'));
            };
        });
    });
};

window.onpopstate = function(event) {
    loadPage(document.location);
    console.log(document.location);
};

prevValue = '';

function search() {
    if (document.querySelector('#searchBox').value != '') {
        if (document.querySelector('#searchBox').value != prevValue) {
            if (document.querySelector('#searchWindow') == null) {
                var searchDialog = document.createElement('div');
                searchDialog.id = 'searchWindow';
                document.body.appendChild(searchDialog);
            };
            var result = '<h1 class="gc-fullWidth">Search Results</h1>';
            $.get("/src/updates/index.html", function (data) {
                var html = $(data);
                var query = document.querySelector('#searchBox').value;
                var results = $('.mdc-card:contains("'+ query +'")', html);
                if (results.length > 0) {
                    result += '<h2 class="gc-fullWidth">Updates</h2>';
                    for (var i=0; results.length > i; i++) {
                        result += results[i].outerHTML;
                    };
                };
                $.get("/code/index.html", function (data) {
                    var html = $(data);
                    var query = document.querySelector('#searchBox').value;
                    var results = $('.mdc-card:contains("'+ query +'")', html);
                    if (results.length > 0) {
                        result += '<h2 class="gc-fullWidth">Code</h2>'; 
                        for (var i=0; results.length > i; i++) {
                            result += results[i].outerHTML;
                        };
                    };
                    $.get("/media/index.html", function (data) {
                        var html = $(data);
                        var query = document.querySelector('#searchBox').value;
                        var results = $('.mdc-card:contains("'+ query +'")', html);
                        if (results.length > 0) {
                            result += '<h2 class="gc-fullWidth">Media</h2>'; 
                            for (var i=0; results.length > i; i++) {
                                result += results[i].outerHTML;
                            };
                        };
                        document.querySelector('#searchWindow').innerHTML = result;
                    }); 
                }); 
            }); 
        };
    } else {
        if (document.querySelector('#searchWindow') != null) {
            document.body.removeChild(document.querySelector('#searchWindow'));
        };
    }
    prevValue = document.querySelector('#searchBox').value;
};

document.querySelector('#moreButton').addEventListener('click', function(){
    if (document.querySelector('#appsList') == null) {
        $.get("/src/app.html", function (data) {
            var wrapper = document.createElement('div');
            wrapper.innerHTML = data;
            var appsList = wrapper.firstChild;
            document.body.appendChild(appsList);
        }); 
    } else {
        document.body.removeChild(document.querySelector('#appsList'));
    };
});

function defineElements () {
    class searchTags extends HTMLElement {
        constructor() {
          super();
          var shadow = this.attachShadow({mode: 'open'});
        var wrapper = document.createElement('span');
        wrapper.setAttribute('class','wrapper');
        var style = document.createElement('style');

        style.textContent = '.wrapper {' +
                                'display: none;' +
                            '}';

        shadow.appendChild(style);
        shadow.appendChild(wrapper);
        }
    };
    customElements.define('search-tags', searchTags);
};

window.setInterval(function(){
    search();
}, 33);