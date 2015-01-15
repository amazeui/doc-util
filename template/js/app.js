(function() {
  var $ = this.jQuery;

  if (!$ || !$.AMUI) {
    return;
  }

  var oldIETest = function() {
    var $testCode = $('<!--[if lte IE 9]><span id="old-ie-tester"></span><![endif]-->');
    var isOldIE = $(document.body).append($testCode).find('#old-ie-tester').length;
    $testCode.remove();
    return !!isOldIE;
  };

  var AMPlugin = function() {
    this.isOldIE = oldIETest();
    this.init();
  };

  AMPlugin.prototype.init = function() {
    this.toolbar();
  };

  AMPlugin.prototype.toolbar = function() {
    var _this =  this;
    var $w = $(window);
    var $toolbar = $('#amp-toolbar');
    var $goTop = $toolbar.find('#amp-go-top');

    if (!$goTop.length) {
      return;
    }

    $goTop.on('click', function(e) {
      e.preventDefault();
      if (_this.isOldIE) {
        $('html, body').animate({scrollTop: 0}, 500);
        return false;
      }

      $w.smoothScroll(0);
    });

    function checkScrollTop() {
      if ($w.scrollTop() > 10) {
        $goTop.addClass('am-active');
      } else {
        $goTop.removeClass('am-active');
      }
    }

    function checkWinWidth() {
      if ($w.width() > 1110) {
        $toolbar.css({right: ($w.width() - 1110) / 2});
      } else {
        $toolbar.css({right: '10px'});
      }
    }

    checkScrollTop();

    checkWinWidth();

    $w.on('scroll', $.AMUI.utils.debounce(checkScrollTop, 100));
    $w.on('resize', $.AMUI.utils.debounce(checkWinWidth, 100));
  };

  $(function() {
    new AMPlugin();
  });
}).call(this);
