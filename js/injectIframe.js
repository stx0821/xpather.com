(function () {
  var srcUrl = window.config.rootUrl;
  (function () {
    window.iframe_xpathonline_loaded = function () {
      var iframe = window.frames["iframe_xpathonline"];
      var innerDoc = iframe.contentWindow || iframe.contentDocument || iframe;
      if (innerDoc.document) innerDoc = innerDoc.document;
      var boostrapJs = innerDoc.createElement("script");
      innerDoc.cfg = { srcUrl: srcUrl };
      boostrapJs.src =
        // innerDoc.cfg.srcUrl +
        "/js/iframeBootstrap.js?bv=" +
        window.config.version;
      innerDoc.getElementsByTagName("head")[0].appendChild(boostrapJs);
      boostrapJs.onload = function () {
        jQuery.noConflict();
        var $ = jQuery;
      };
    };
    var container = document.createElement("iframe");
    container.setAttribute("id", "iframe_xpathonline");
    container.setAttribute("width", 700);
    container.setAttribute("height", 300);
    container.setAttribute("src", "");
    container.setAttribute("onload", "window.iframe_xpathonline_loaded()");
    container.setAttribute("translate", "no");
    var bodyEl = document.getElementById("top-pane");
    bodyEl.insertBefore(container, bodyEl.firstChild);
  })();
  var runSplit = function () {
    return [
      Split(["#top-pane", "#bottom-pane"], {
        direction: "vertical",
        sizes: [10, 90],
        minSize: 100,
        snapOffset: 0,
        gutterSize: 7,
        cursor: "row-resize",
      }),
      Split(["#left-pane", "#right-pane"], {
        direction: "horizontal",
        snapOffset: 5,
        sizes: [60, 40],
        gutterSize: 7,
        cursor: "row-resize",
      }),
    ];
  };
  var splitEls = runSplit();
  var refreshSplit = debounce(function () {
    splitEls[0].destroy();
    splitEls[1].destroy();
    splitEls = runSplit();
  }, 100);
  refreshSplit();
  $(window).resize(function () {
    refreshSplit();
  });
  function debounce(func, wait, immediate) {
    var timeout;
    return function () {
      var context = this,
        args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }
})();
