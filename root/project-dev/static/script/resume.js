/*
    backPosition
*/
(function($) {
    if (!document.defaultView || !document.defaultView.getComputedStyle) { // IE6-IE8
        var oldCurCSS = $.curCSS;
        $.curCSS = function(elem, name, force) {
            if (name === 'background-position') {
                name = 'backgroundPosition';
            }
            if (name !== 'backgroundPosition' || !elem.currentStyle || elem.currentStyle[name]) {
                return oldCurCSS.apply(this, arguments);
            }
            var style = elem.style;
            if (!force && style && style[name]) {
                return style[name];
            }
            return oldCurCSS(elem, 'backgroundPositionX', force) + ' ' + oldCurCSS(elem, 'backgroundPositionY', force);
        };
    }

    var oldAnim = $.fn.animate;
    $.fn.animate = function(prop) {
        if ('background-position' in prop) {
            prop.backgroundPosition = prop['background-position'];
            delete prop['background-position'];
        }
        if ('backgroundPosition' in prop) {
            prop.backgroundPosition = '(' + prop.backgroundPosition;
        }
        return oldAnim.apply(this, arguments);
    };

    function toArray(strg) {
        strg = strg.replace(/left|top/g, '0px');
        strg = strg.replace(/right|bottom/g, '100%');
        strg = strg.replace(/([0-9\.]+)(\s|\)|$)/g, "$1px$2");
        var res = strg.match(/(-?[0-9\.]+)(px|\%|em|pt)\s(-?[0-9\.]+)(px|\%|em|pt)/);
        return [parseFloat(res[1], 10), res[2], parseFloat(res[3], 10), res[4]];
    }

    $.fx.step.backgroundPosition = function(fx) {
        if (!fx.bgPosReady) {
            var start = $.curCSS(fx.elem, 'backgroundPosition');
            if (!start) { //FF2 no inline-style fallback
                start = '0px 0px';
            }

            start = toArray(start);
            fx.start = [start[0], start[2]];
            var end = toArray(fx.end);
            fx.end = [end[0], end[2]];

            fx.unit = [end[1], end[3]];
            fx.bgPosReady = true;
        }
        //return;
        var nowPosX = [];
        nowPosX[0] = ((fx.end[0] - fx.start[0]) * fx.pos) + fx.start[0] + fx.unit[0];
        nowPosX[1] = ((fx.end[1] - fx.start[1]) * fx.pos) + fx.start[1] + fx.unit[1];
        fx.elem.style.backgroundPosition = nowPosX[0] + ' ' + nowPosX[1];

    };
})(jQuery);


/*
    custom
*/
$(document).ready(function() {

    ////////////////	
    //VARIABLES
    ////////////////
    var view = $(window),
        html = $('html'),
        body = $('body');

    ////////////////
    //SKILLS ANIMATION
    ////////////////
    $('ul#skills').addClass("ready");
    $('ul#skills li').each(function() {
        var i = $(this).index();
        $(this).delay(100 * i).animate({ right: "0%" }, 1000, function() {
            $(this).children('span').fadeIn(600);
        });
    });

    ////////////////
    //PRETTYPHOTO
    ////////////////
    $('a[data-rel]').each(function() {
        $(this).attr('rel', $(this).data('rel'));
    });
    $("a[rel^='prettyPhoto']").prettyPhoto({
        overlay_gallery: false,
        social_tools: '',
        deeplinking: false,
        default_width: 500,
        opacity: "1"
    });

    ////////////////
    //FORM STUFF...
    ////////////////
    $("#contactform #submit_btn").click(function() {

        $("#contactform .input, #contactform textarea").removeClass('error');

        var name = $("#contactform input#name");
        if (name.val() == "") {
            name.addClass('error').focus();
            return false;
        }
        var email = $("#contactform input#email");
        if (email.val() == "") {
            email.addClass('error').focus();
            return false;
        }
        var message = $("#contactform textarea#message");
        if (message.val() == "") {
            message.addClass('error').focus();
            return false;
        }
    });

    ////////////////
    //SUCCESSFUL MESSAGE ALERT
    ////////////////
    if (window.location.hash == "#contact") {
        $('#contactform').slideUp(800, function() {
            $('#messageSent').fadeIn(800);
        });
    }

    ////////////////
    //CLONE NAME AND SOCIAL BUTTONS
    ////////////////
    $('#titleName, #socialIcons').clone().appendTo('#sticker');

    ////////////////
    //RESPONSIVE CHECK
    ///////////////
    function responsive() {
        if (view.width() < 820) {
            body.addClass('respond');
        } else {
            body.removeClass('respond');
        }
    }
    responsive();

    ////////////////
    //WINDOW SCROLL
    ////////////////
    view.scroll(function() {
        //SHOW/HIDE TOP PANEL
        if (view.scrollTop() > 140) {
            $('#sticker').stop().animate({ top: "0" }, 500);
        } else {
            $('#sticker').stop().animate({ top: "-60px" }, 500);
        }

        //PARALLAX BACKGROUND STUFF
        var scrollPosition = $(window).scrollTop() * .25;
        body.css({ backgroundPosition: '0px -' + scrollPosition + 'px' });
    });

    ////////////////
    //WINDOW RESIZE
    ///////////////
    view.resize(function() { responsive(); });

    ////////////////	
    //WINDOW LOAD
    ////////////////
    view.load(function() { responsive(); });

});