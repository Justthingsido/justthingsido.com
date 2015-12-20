$(window).scroll(function(){var wScroll=$(this).scrollTop();$('.header').css({'transform':'translate(0px, '+wScroll/0+'%)'});});


jQuery(document).ready(function() {

	jQuery(".mobile-nav-toggle").click(function() {

		jQuery(".mobile-nav.is-open").slideToggle(400, function() {

		});

	});

});
