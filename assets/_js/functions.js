// force https
// if (window.location.protocol != "https:")
//     window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);

//set currecnt page link as active


$(document).ready(function() {
  var str = location.href.toLowerCase();
  $("nav.site-nav a").each(function() {
    if (str.indexOf(this.href.toLowerCase()) > -1) {
      $("a.current").removeClass("current");
      $(this).addClass("current");
    }
  });
});

//Menu nav toggle
$(document).ready(function() {
  var $nav = $(".mobile-nav");
  var $homeContent = $(".home-content");
  $('.mobile-nav-toggle').click(function(show) {
    show.stopPropagation();
    $nav.toggle('slide', {
      direction: 'up'
    }, 500);
    if($homeContent.hasClass("toggle")){
      $homeContent.removeClass("toggle");
    }
    else
      $homeContent.addClass("toggle");
    //or .site-nav / .mobile-nav

  });
});

var isShowing = false;
$(window).scroll(function() {
    if ($(window).scrollTop() + $(window).height() === $(document).height()) {
        // alert("Show Footer");
        $('.home-content').addClass("footerShowBuss");
        $('footer').addClass("animated fadeInUp footerShow");
        isShowing = true;

    } else if (isShowing === true && $(window).scrollTop() + $(window).height() <= $(document).height() * 0.9) {
        // alert("Hide Footer");
        $('.home-content').removeClass("footerShowBuss");
        $('footer').removeClass("animated fadeInUp footerShow");
        isShowing =  false;
    }
});


$(window).scroll(function() {

  var wScroll = $(this).scrollTop();
  $('.header-content h1').css({
    'transform' : 'translate(0px, '+ wScroll /2 +'%)'
  });

  $('header h1').css({
    'transform' : 'translate(0px, '+ wScroll /2 +'%)'
  });

});
