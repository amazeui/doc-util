(function() {
  var Clipboard = require('clipboard');
  var $ = window.jQuery;

  if (!$ || !$.AMUI) {
    return;
  }

  var oldIETest = function() {
    var $testCode = $('<!--[if lte IE 9]><span id="old-ie-tester"></span><![endif]-->');
    var isOldIE = $(document.body).append($testCode)
      .find('#old-ie-tester').length;
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
    var _this = this;
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

  function initClipboard() {
    var copyBtn = '<div class="doc-actions"><div class="doc-act-inner">' +
      '<span class="doc-act-clip am-icon-copy"> Copy</span></div></div>';

    $('.doc-code').each(function() {
      var $code = $(this);
      var $prev = $code.prev();

      if ($prev.hasClass('doc-example')) {
        $prev.before(copyBtn);
      } else {
        $code.before(copyBtn);
      }
    });

    // https://zenorocha.github.io/clipboard.js/
    var clipboard = new Clipboard('.doc-act-clip', {
      text: function(trigger) {
        var $next = $(trigger).parent().parent().next();
        var $reqCode = $next.is('.doc-code') ? $next : $next.next('.doc-code');

        return $reqCode.text();
      }
    });

    var timer;

    clipboard.on('success', function(e) {
      var $trigger = $(e.trigger);
      var oldText = ' Copy';
      var success = 'success';

      $trigger.addClass(success).text(' Copied');

      timer && clearTimeout(timer);
      timer = setTimeout(function() {
        $trigger.removeClass(success).text(oldText);
      }, 3000);

      console.info('Copied text to clipboard: ' + e.text);
      e.clearSelection();
    });

    clipboard.on('error', function(e) {
      $(e.trigger).text(' Error!').addClass('error');
      console.error('Action:', e.action);
      console.error('Trigger:', e.trigger);
    });
  }

  $(function() {
    new AMPlugin();
    initClipboard();
  });
}).call(window);
