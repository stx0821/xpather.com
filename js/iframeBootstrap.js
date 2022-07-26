(function () {
  var jq = document.createElement("script");
  jq.src = "/js/jquery.min.js";
  document.getElementsByTagName("head")[0].appendChild(jq);
  jq.onload = function () {
    jQuery.noConflict();
    $ = jQuery;
    jQuery(parent.document)
      .find("head")
      .append(
        $("<link/>", {
          rel: "stylesheet",
          href:
            // document.cfg.srcUrl +
            "/css/custom.css?v=" +
            parent.window.config.version,
        })
      );
    $.when(
      $.getScript(document.cfg.srcUrl + "js/jquery.xpath.js"),
      $.getScript(
        document.cfg.srcUrl +  "js/lodash.min.js"
      ),
      $.getScript(document.cfg.srcUrl + "js/htmlhint.js"),
      $.getScript(document.cfg.srcUrl + "js/sax.js")
    )
      .then(function () {
        return $.when();
      })
      .then(function () {
        return $.when(
          $.getScript(
            document.cfg.srcUrl + "js/bundle.js?v=" + parent.window.config.version
          )
        );
      })
      .done(function () {});
  };
})();
