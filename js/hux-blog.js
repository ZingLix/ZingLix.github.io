/*!
 * Clean Blog v1.0.0 (http://startbootstrap.com)
 * Copyright 2015 Start Bootstrap
 * Licensed under Apache 2.0 (https://github.com/IronSummitMedia/startbootstrap/blob/gh-pages/LICENSE)
 */

/*!
* Hux Blog v1.6.0 (http://startbootstrap.com)
* Copyright 2016 @huxpro
* Licensed under Apache 2.0 
*/

// Tooltip Init
// Unuse by Hux since V1.6: Titles now display by default so there is no need for tooltip
// $(function() {
//     $("[data-toggle='tooltip']").tooltip();
// });


// make all images responsive
/* 
 * Unuse by Hux
 * actually only Portfolio-Pages can't use it and only post-img need it.
 * so I modify the _layout/post and CSS to make post-img responsive!
 */
// $(function() {
//  $("img").addClass("img-responsive");
// });

// responsive tables
$(document).ready(function () {
    $("table").wrap("<div class='table-responsive'></div>");
    $("table").addClass("table");
});

// responsive embed videos
$(document).ready(function () {
    $('iframe[src*="youtube.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>');
    $('iframe[src*="youtube.com"]').addClass('embed-responsive-item');
    $('iframe[src*="vimeo.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>');
    $('iframe[src*="vimeo.com"]').addClass('embed-responsive-item');
});

// Navigation Scripts to Show Header on Scroll-Up
jQuery(document).ready(function ($) {
    var MQL = 1170;

    //primary navigation slide-in effect
    if ($(window).width() > MQL) {
        var headerHeight = $('.navbar-custom').height(),
            bannerHeight = $('.intro-header .container').height();
        $(window).on('scroll', {
            previousTop: 0
        },
            function () {
                var currentTop = $(window).scrollTop(),
                    $catalog = $('.side-catalog');

                //check if user is scrolling up by mouse or keyborad
                if (currentTop < this.previousTop) {
                    //if scrolling up...
                    if (currentTop > 0 && $('.navbar-custom').hasClass('is-fixed')) {
                        $('.navbar-custom').addClass('is-visible');
                    } else {
                        $('.navbar-custom').removeClass('is-visible is-fixed');
                    }
                } else {
                    //if scrolling down...
                    $('.navbar-custom').removeClass('is-visible');
                    if (currentTop > headerHeight && !$('.navbar-custom').hasClass('is-fixed')) $('.navbar-custom').addClass('is-fixed');
                }
                this.previousTop = currentTop;


                //adjust the appearance of side-catalog
                $catalog.show()
                if (currentTop > (bannerHeight + 41)) {
                    $catalog.addClass('fixed')
                } else {
                    $catalog.removeClass('fixed')
                }
            });
    }
});



// https://stackoverflow.com/questions/1912501/unescape-html-entities-in-javascript
function htmlDecode(input) {
    var e = document.createElement('textarea');
    e.innerHTML = input;
    // handle case of empty input
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

SimpleJekyllSearch({
    searchInput: document.getElementById('search-input'),
    resultsContainer: document.getElementById('search-results'),
    json: '/search.json',
    searchResultTemplate: '<div class="post-preview item"><a href="{url}"><h2 class="post-title">{title}</h2><h3 class="post-subtitle">{subtitle}</h3><hr></a></div>',
    noResultsText: 'No results',
    limit: 50,
    fuzzy: false,
    // a hack to get escaped subtitle unescaped. for some reason, 
    // post.subtitle w/o escape filter nuke entire search.
    templateMiddleware: function (prop, value, template) {
        if (prop === 'subtitle' || prop === 'title') {
            if (value.indexOf("code")) {
                return htmlDecode(value);
            } else {
                return value;
            }
        }
    }
});

$(document).ready(function () {
    var $searchPage = $('.search-page');
    var $searchOpen = $('.search-icon');
    var $searchClose = $('.search-icon-close');
    var $searchInput = $('#search-input');
    var $body = $('body');

    $searchOpen.on('click', function (e) {
        e.preventDefault();
        $searchPage.toggleClass('search-active');
        var prevClasses = $body.attr('class') || '';
        setTimeout(function () {
            $body.addClass('no-scroll');
        }, 400)

        if ($searchPage.hasClass('search-active')) {
            $searchClose.on('click', function (e) {
                e.preventDefault();
                $searchPage.removeClass('search-active');
                $body.attr('class', prevClasses);  // from closure 
            });
            $searchInput.focus();
        }
    });
});

window.onscroll = function () { scrollFunction() };
function scrollFunction() {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        $(".back-to-top").addClass('visible');
    } else {
        $(".back-to-top").removeClass("visible")
    }
}


function decodeEmail(encodedString) {
    // Holds the final output
    var email = "";

    // Extract the first 2 letters
    var keyInHex = encodedString.substr(0, 2);

    // Convert the hex-encoded key into decimal
    var key = parseInt(keyInHex, 16);

    // Loop through the remaining encoded characters in steps of 2
    for (var n = 2; n < encodedString.length; n += 2) {

        // Get the next pair of characters
        var charInHex = encodedString.substr(n, 2)

        // Convert hex to decimal
        var char = parseInt(charInHex, 16);

        // XOR the character with the key to get the original character
        var output = char ^ key;

        // Append the decoded character to the output
        email += String.fromCharCode(output);
    }
    return email;
}

// Find all the elements on the page that use class="eml-protected"
var allElements = document.getElementsByClassName("eml-protected");

// Loop through all the elements, and update them
for (var i = 0; i < allElements.length; i++) {
    updateAnchor(allElements[i])
}

function updateAnchor(el) {
    // fetch the hex-encoded string
    var encoded = el.attributes["encoded"].value;

    // decode the email, using the decodeEmail() function from before
    var decoded = decodeEmail(encoded);

    // Replace the text (displayed) content
    if (el.textContent == "") {
        el.textContent = decoded;
    }

    // Set the link to be a "mailto:" link
    el.href = 'mailto:' + decoded;
}