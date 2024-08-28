$(window).ready(function () {
    $(".loading").fadeOut("slow");
});

// ========================================================================================================
// Don't tamper my toast(short-time message) function
var toast = function () {
    var tm = this;
    this.con = $('.notifications').length === 0 ? $('<ul class="notifications"></ul>').insertAfter($('body')) : $('.notifications');
    this.default = {
        timer: 5000,
        pos: 'top-right',
        success: {icon: 'fa-check-circle', text: 'Success: This is a success toast.'},
        error: {icon: 'fa-times-circle', text: 'Error: This is an error toast.'},
        warning: {icon: 'fa-exclamation-triangle', text: 'Warning: This is a warning toast.'},
        info: {icon: 'fa-info-circle', text: 'Info: This is an information toast.'}
    };
    this.applyPos = function (toast) {
        var pos = toast.pos;
        if (pos == 'top-left')
            $(toast).parent().css('top', '60px').css('bottom', '').css('right', '').css('transform', '').css('left', '0');
        else if (pos == 'top-center')
            $(toast).parent().css('top', '60px').css('left', '50%').css('bottom', '').css('right', '').css('transform', 'translateX(-50%)');
        else if (pos == 'bottom-right')
            $(toast).parent().css('bottom', '20px').css('right', '0').css('top', '').css('left', '').css('transform', '');
        else if (pos == 'bottom-left')
            $(toast).parent().css('bottom', '20px').css('left', '0').css('top', '').css('right', '').css('transform', '');
        else if (pos == 'bottom-center')
            $(toast).parent().css('bottom', '20px').css('left', '50%').css('top', '').css('right', '').css('transform', 'translateX(-50%)');
        else if (pos == 'left-center')
            $(toast).parent().css('top', '50%').css('left', '0').css('bottom', '').css('right', '').css('transform', 'translateY(-50%)');
        else if (pos == 'right-center')
            $(toast).parent().css('top', '50%').css('right', '0').css('bottom', '').css('left', '').css('transform', 'translateY(-50%)');
        else if (pos == 'middle')
            $(toast).parent().css('top', '50%').css('left', '50%').css('bottom', '').css('right', '').css('transform', 'translateX(-50%) translateY(-50%)');
        else
            $(toast).parent().css('top', '60px').css('right', '0').css('bottom', '').css('left', '').css('transform', 'none');
    };
    this.removeToast = function (toast) {
        toast.addClass("hide-toast");
        if (toast.timeoutId) clearTimeout(toast.timeoutId);
        setTimeout(function () {
            toast.remove()
        }, 1000);
    };
    this.createToast = function (options) {
        var key = ['success', 'error', 'warning', 'info'];
        this.option = (typeof options == 'object' && options) ? options : tm.default;
        var id = key[Math.floor(Math.random() * 4)];
        var text = this.option.text || tm.default[id].text,
            icon = this.option.icon || id;
        var toast = document.createElement("li");
        toast.className = 'toast ' + icon;
        toast.innerHTML =
            '<div class="column"> ' +
            '<i class="fa ' + this.default[icon].icon + '"></i> ' +
            '<span>' + text + '</span> ' +
            '<i class="fa fa-times close" onclick="new toast().removeToast($(this).parent().parent())"></i>' +
            '<div class="indicator"></div></div> ';
        tm.con.append(toast);
        var timer = this.option.timer || tm.default.timer;
        $(toast).find('.indicator').animate({width: 0}, timer, 'linear', 'forwards');
        toast.pos = this.option.pos == undefined ? tm.default.pos : this.option.pos;
        tm.con.children().length <= 1 ? tm.applyPos(toast) : '';
        if (tm.con.children().length <= 1) {
            if (['top-left', 'bottom-left', 'left-center'].includes(toast.pos))
                $(toast).addClass('toast-l');
            else if (['top-right', 'bottom-right', 'right-center'].includes(toast.pos))
                $(toast).addClass('toast-r');
            else
                $(toast).addClass('toast-m');
        } else $(toast).addClass($(toast).prev().attr('class').split(' ')[2]);
        toast.timeoutId = setTimeout(function () {
            tm.removeToast($(toast))
        }, timer);
        $(toast).hover(function (ev) {
            clearTimeout(toast.timeoutId);
            $(toast).find('.indicator').animate().stop().width(100 + '%');
        }, function () {
            $(toast).find('.indicator').animate({width: 0}, timer, 'linear', 'forwards');
            toast.timeoutId = setTimeout(function () {
                tm.removeToast($(toast))
            }, timer);
        });
    }
};
function toast_it(option){
    var toasts = new toast();
    toasts.createToast(option);
}

 var settings_array;

 try {
    settings_array = {
        d_unit: localStorage.getItem('dist') || 'cm', 
        a_unit: localStorage.getItem('are') || 'cm', 
        poly_color: localStorage.getItem('color') || '#ff0000'
    };
    $('#dist').val(localStorage.getItem('dist') || 'cm');
    $('#are').val(localStorage.getItem('are') || 'cm');
    $('#color').val(localStorage.getItem('color') || '#ff0000');
 } catch (error) {
    settings_array = {d_unit: 'cm', a_unit: 'cm', poly_color: '#ff0000'};
 }

function Settings(ele) {
    var msg = $(ele).prev('label').text()+' set to '+$(ele).val();
    toast_it({text: msg, icon: 'info'});
    localStorage.setItem(ele.id, $(ele).val());
}

$("#toggle").on("click", function () {
    $("body").toggleClass("open");
    $(".collapse").removeClass("in");
});
$("#mobile").on("click", function () {
    $("body").toggleClass("mobile-open");
    $('.side-flow').css('display', 'block').animate({ left: '0' }, 10);
    $('aside').css('display', 'block').animate({ left: '0' }, 30)
});
$(window).on("click", function (e) {
    if (e.target == document.getElementById('aside')) {
        var s = $('aside'), a = $('.side-flow');
        $("body").addClass("mobile-open");
        a.css('display', 'block').animate({ left: -a.width() - 15 }, 10);
        s.css('display', 'block').animate({ left: -s.width() - 15 }, 10)
    }
});
$(document).on('mouseenter mouseleave', '.side-nav li', function (ev) {
    var body = $('body');
    var sidebarIconOnly = body.hasClass("open");
    if (!('ontouchstart' in document.documentElement)) {
        if (sidebarIconOnly) {
            var $menuItem = $(this), link = $menuItem.children().first(), sub = $menuItem.find(".collapse");
            if (ev.type === 'mouseenter') {
                link.hasClass('dropdown') ? sub.addClass("in").css('height', 'auto') : sub.removeClass("in");
                $menuItem.addClass('hover-open');
                link.removeClass('collapsed');
            } else {
                $menuItem.removeClass('hover-open');
                sub.removeClass("in");
                link.addClass('collapsed');
            }
        }
    }
});