(function (modules) {
  var installedModules = {};
  function __webpack_require__(moduleId) {
    if (installedModules[moduleId]) return installedModules[moduleId].exports;
    var module = (installedModules[moduleId] = {
      exports: {},
      id: moduleId,
      loaded: false,
    });
    modules[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__
    );
    module.loaded = true;
    return module.exports;
  }
  __webpack_require__.m = modules;
  __webpack_require__.c = installedModules;
  __webpack_require__.p = "";
  return __webpack_require__(0);
})([
  function (module, exports, __webpack_require__) {
    "use strict";
    var xpathForElement_1 = __webpack_require__(1);
    var xpathForColPos_1 = __webpack_require__(6);
    __webpack_require__(11);
    var refreshEvaluation_1 = __webpack_require__(12);
    var XmlTreeGenerator_1 = __webpack_require__(15);
    var general_1 = __webpack_require__(2);
    var settings_1 = __webpack_require__(10);
    var $ = jQuery;
    var refreshEvaluationDebounced = _.debounce(function () {
      general_1.showSpinner(true);
      setTimeout(refreshEvaluation_1.refreshEvaluation, 10);
    }, 10);
    $("#xpathonline_input").on("input", function () {
      refreshEvaluationDebounced();
    });
    refreshEvaluationDebounced();
    $(window.parent.document).ready(function () {
      var leftPanel = $("<div/>", { id: "xpathonline_left_panel" });
      $("#left-pane", window.parent.document).append(leftPanel);
      var initialCmValue = general_1.getRecordId()
        ? ""
        : "<app>\n    <welcome-message>Hi! This is xpather beta...</welcome-message>\n    <abstract>\n        This web app enables you to query XML/HTML documents with your\n\t\tbrowser in real time. It can generate queries for you too! \n    </abstract>\n    <description>\n        <subject>\n\t\t\tYou can enter your xpath query in the top-left panel \n\t\t\tand it will be instantly executed against this document.\n\t\t\tOnce some results are displayed on the right, you can \n\t\t\tscroll to them by clicking on them. \n\t\t</subject>\n\t\t<subject>\n\t\t\tTo generate an xpath query for a specific element,\n\t\t\tplease hold CTRL and hover over it.\n\t\t\tAn xpath is generated heuristically with the aim\n\t\t\tto be unambiguous and the shortest possible.\n\t\t</subject>\n    </description>\n\t<extra-notes>\n\t\t<note>\n\t\t\tNone of entered documents leave your computer because all\n\t\t\tthe processing is done by your powerful browser!\n\t\t\t(of course as long as you do not save your input)\n\t\t</note>\n        <note>\n\t\t\tThis application is in an early beta version so please\n\t\t\tbe forgiving. XPath 2.0 is supported but namespaces are\n\t\t\tstill being added and they may not fully work yet. \n\t\t\tPlease send your comments to: xpather.com@gmail.com\n\t\t</note>\n\t\t<note>\n\t\t\tBy default XML mode is used but if a document cannot\n\t\t\tbe parsed as XML then HTML mode kicks in.\n\t\t</note>\n\t\t<note>\n\t\t\tPasting documents bigger than 500kb may cause your\n\t\t\tbrowser become sluggish or unresponsive.\n\t\t</note>\n\t</extra-notes>\n</app>";
      window.parent.document.myCodeMirror = window.parent.CodeMirror(
        $(leftPanel, window.parent.document)[0],
        { value: initialCmValue, mode: "htmlmixed" }
      );
      window.parent.document.myCodeMirror.on(
        "change",
        function (cm, changedObject) {
          var text = parent.document.myCodeMirror.getValue();
          if (text.length > 3e5) {
            if (
              !confirm(
                "The pasted text has more than 200k characters. " +
                  "Threfore the performance of the tool might not be satisfactory and the browser may become unresponsive." +
                  "Are you sure you want to continue?"
              )
            ) {
              parent.document.myCodeMirror.setValue("");
            }
          }
          refreshEvaluationDebounced();
        }
      );
      $("#format-btn", parent.document).click(function () {
        var editor = window.parent.document.myCodeMirror;
        function getAllRange() {
          return {
            from: { line: 0, ch: 0 },
            to: { line: 99999999, ch: 9999999 },
          };
        }
        function autoFormatSelection() {
          var range = getAllRange();
          editor.autoFormatRange(range.from, range.to);
          editor.setCursor({ line: 0, ch: 0 });
        }
        autoFormatSelection();
      });
      $("#save-btn", parent.document).click(function () {
        var rootUrl = parent.window.config.rootUrl;
        var cmValue = parent.document.myCodeMirror.getValue();
        var query = $("#xpathonline_input").val();
        $.ajax({
          url: rootUrl + "api/record/",
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          dataType: "json",
          data: JSON.stringify({ document: cmValue, query: query }),
          contentType: "application/json",
        }).done(function (data) {
          parent.window.location.href = rootUrl + data.id;
        });
      });
      $("#random-xml-btn", parent.document).click(function () {
        var cm = window.parent.document.myCodeMirror;
        var tree = XmlTreeGenerator_1.generateTree(5, 5);
        console.log(tree);
        var allNodes = [];
        var xpath = [];
        var html = tree.html(allNodes, 0, xpath, 0);
        cm.setValue(html);
      });
      $("#input_copy_btn", parent.document).click(function () {
        general_1.copyToClipboardMsg(
          $("#xpathonline_output", parent.document)[0]
        );
      });
      function getShortestXpathReal(xpath, text) {
        if (settings_1.DEBUG_MODE) {
          console.log("xpath: ");
          console.log(xpath);
        }
        var _a = general_1.getHtmlDocument(text),
          xml = _a.doc,
          rootPath = _a.rootPath,
          numOfContainers = _a.numOfContainers;
        try {
          var el = _.isEmpty(rootPath)
            ? $(xml).xpath(xpath, general_1.pre)
            : $(xml).xpath(rootPath).xpath(xpath, general_1.pre);
        } catch (ex) {
          console.error("Error when parsing: " + ex);
          console.error("Error when parsing: " + ex);
          return null;
        }
        if (el.length > 0) {
          return xpathForElement_1.default(el[0], xml, rootPath);
        }
      }
      var getShortestXpath = general_1.memoizeByText(getShortestXpathReal);
      var inputPartPointedDebounced = _.debounce(function (e) {
        inputPartPointed(e);
      }, 10);
      var inputPartPointed = function (e) {
        if (e.ctrlKey) {
          var pos = { left: e.pageX, top: e.pageY };
          var coords = parent.document.myCodeMirror.coordsChar(pos);
          var text_1 = parent.document.myCodeMirror.getValue();
          xpathForColPos_1
            .default([coords.line, coords.ch], text_1)
            .then(function (res) {
              if (settings_1.DEBUG_MODE) {
                console.log("ElLoc: ");
                console.log(res);
              }
              var xpath = res.xpath
                .map(function (e) {
                  return e.tag + "[" + (e.num + 1) + "]";
                })
                .join("/");
              return xpath;
            })
            .then(function (xpath) {
              var result = getShortestXpath(xpath, text_1);
              $("#xpathonline_input").val(result);
              $("#xpathonline_input").trigger("input");
            })
            .catch(function (err) {
              general_1.handleError(err);
            });
        }
      };
      $($("#xpathonline_left_panel", parent.document)[0]).mousemove(
        inputPartPointedDebounced
      );
      if (general_1.getRecordId()) {
        $.ajax({ url: "/api/record/" + general_1.getRecordId() }).done(
          function (data) {
            parent.document.myCodeMirror.setValue(data.document);
            $("#xpathonline_input").val(data.query);
            $("#xpathonline_input").trigger("input");
          }
        );
      }
    });
  },
  function (module, exports, __webpack_require__) {
    "use strict";
    var general_1 = __webpack_require__(2);
    var xpathForElement = function (elOrg, doc, rootPath) {
      if (elOrg) {
        if (elOrg.nodeType === 2) {
          var el = elOrg.ownerElement;
        } else if (elOrg.nodeType === 3) {
          var el = elOrg.parentElement;
        } else {
          var el = elOrg;
        }
        var fullPathParts = _.union([el], $(el).parents()).map(function (el) {
          var el = $(el);
          var tagName =
            el[0].ownerDocument.constructor.name != "XMLDocument"
              ? el.prop("localName")
              : el.prop("nodeName");
          if (el.attr("id")) {
            var tagIdInd =
              el.prevAll(tagName + '[id="' + el.attr("id") + '"]').length + 1;
            return [
              "id",
              tagName + "[@id='" + el.attr("id") + "']" + "[" + tagIdInd + "]",
            ];
          } else if (el.attr("class")) {
            var tagClassInd =
              el.prevAll(tagName + '[class="' + el.attr("class") + '"]')
                .length + 1;
            return [
              "class",
              tagName +
                "[@class='" +
                el.attr("class") +
                "']" +
                "[" +
                tagClassInd +
                "]",
            ];
          } else {
            var tagInd = el.prevAll(tagName.replace(":", "\\:")).length + 1;
            return ["ind", tagName + "[" + tagInd + "]"];
          }
        });
        var initialProposals = [
          "/" + fullPathParts[0][1],
          "",
          "./" + fullPathParts[0][1],
        ];
        var res = findShortestPath(
          _.tail(fullPathParts),
          initialProposals,
          el,
          doc,
          rootPath
        );
        res = res[1] == "/" ? res : "/" + res;
        if (elOrg.nodeType === 2) {
          res += "/@" + elOrg.name;
        } else if (elOrg.nodeType === 3) {
          var pos = _.filter(elOrg.parentNode.childNodes, function (e) {
            return e.nodeType === 3;
          }).indexOf(elOrg);
          res += "/text()[" + (pos + 1) + "]";
        }
        return res;
      }
    };
    function getMatchingElements(rootPath, doc, p) {
      return _.isEmpty(rootPath)
        ? $(doc).xpath(p, general_1.pre)
        : $(doc).xpath(rootPath).xpath(p, general_1.pre);
    }
    function findShortestPath(fullPathPartsLeft, proposals, el, doc, rootPath) {
      var result = _.find(proposals, function (p) {
        var matchingElements = [];
        try {
          p = p[1] == "/" ? p : "/" + p;
          matchingElements = getMatchingElements(rootPath, doc, p);
        } catch (ex) {
          console.log("Wrong xpath" + p);
        }
        return (
          matchingElements.length === 1 && $(matchingElements[0]).is($(el))
        );
      });
      if (result || proposals.length == 0) {
        return result;
      } else {
        var proposals = $.map(proposals, function (p) {
          var head = _.head(fullPathPartsLeft);
          if (!head) return;
          return ["./" + head[1] + p, "/" + head[1] + p, "//" + head[1] + p, p];
        });
        if (proposals.length > 5e3) {
          proposals = [];
          console.log("ERROR" + proposals);
        }
        return findShortestPath(
          _.tail(fullPathPartsLeft),
          proposals,
          el,
          doc,
          rootPath
        );
      }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = xpathForElement;
  },
  function (module, exports, __webpack_require__) {
    "use strict";
    var XpathException_1 = __webpack_require__(3);
    var _ = __webpack_require__(4);
    var JsDiff = null;
    function getMyCM() {
      return typeof parent !== "undefined"
        ? parent.document.myCodeMirror
        : null;
    }
    exports.getMyCM = getMyCM;
    function handleError(error) {
      showSpinner(false);
      if (XpathException_1.isXpathException(error)) {
        var xpathException = error;
        if (xpathException.type === "INCORRECT_XML_OR_HTML") {
          showInputErrors(error);
        } else {
          setOutputStats(xpathException.nonStandardOutputMessage, true);
        }
      } else {
        setOutputStats(error.toString());
      }
    }
    exports.handleError = handleError;
    function showSpinner(show) {
      if (show) {
        $("#xpathonline_spinner").css("opacity", 0.5);
      } else if (!show) {
        $("#xpathonline_spinner").css("opacity", 0);
      }
    }
    exports.showSpinner = showSpinner;
    function setOutputStats(msg, isHtml) {
      if (isHtml) {
        $("#xpathonline_stats").html(msg);
      } else {
        $("#xpathonline_stats").text(msg);
      }
    }
    exports.setOutputStats = setOutputStats;
    var cmWidgets = [];
    function clearWidgets() {
      cmWidgets.forEach(function (e) {
        return jQuery(e).remove();
      });
      cmWidgets = [];
    }
    exports.clearWidgets = clearWidgets;
    function showInputErrors(err) {
      var errorsList = jQuery("<ul/>", {
        id: "input_errors_list",
        style: "font-size: 10pt; color: #BB0000",
      });
      var errors = err.content;
      errors.forEach(function (e) {
        var liElement = jQuery("<li/>", {
          text: "(" + e.line + ", " + e.col + "): " + e.message,
          style: "cursor: pointer",
        });
        $(liElement).click(function () {
          getMyCM().scrollIntoView({ line: e.line - 1, ch: e.col });
        });
        var errorWidget = jQuery("<span/>", {
          style:
            "background: rgb(255, 180, 180); font-size: 9pt; padding: 2px; border-radius: 6px; line-height: normal, padding: 4px; z-index: 9999",
          text: "" + e.message,
        });
        errorWidget.hide();
        $(liElement).hover(
          function () {
            return errorWidget.show();
          },
          function () {
            return errorWidget.hide();
          }
        );
        cmWidgets.push(errorWidget);
        getMyCM().addWidget({ line: e.line, ch: e.col }, errorWidget[0], false);
        errorsList.append(liElement);
      });
      $("#xpathonline_stats").append(
        "Incorrect input. Click and hover over the error messages below to locate the issue."
      );
      $("#xpathonline_output", parent.document).append(errorsList);
    }
    exports.showInputErrors = showInputErrors;
    function getHtmlDocument(inputText) {
      setParseMode(true);
      var text = inputText;
      getNameSpaces(text);
      var rootPath = "";
      var numberOfContainers = 0;
      var doc = new DOMParser().parseFromString(text, "application/xml");
      if ($(doc).find("parsererror").length > 0) {
        setParseMode(false);
        doc = new DOMParser().parseFromString(text, "text/html");
        if (text.search("<body(\\s|>)") == -1) {
          text = "<body>" + text + "</body>";
          rootPath += "/body";
          numberOfContainers++;
        }
        if (text.search("<html(\\s|>)") == -1) {
          text = "<html><head></head>" + text + "</html>";
          rootPath = "/html" + rootPath;
          numberOfContainers++;
        }
        validateHTML(inputText);
      }
      return {
        doc: doc,
        rootPath: rootPath,
        numOfContainers: numberOfContainers,
      };
    }
    exports.getHtmlDocument = getHtmlDocument;
    function validateHTML(inputText) {
      var HTMLHint = __webpack_require__(5).HTMLHint;
      var messages = HTMLHint.verify(inputText, {
        "tagname-lowercase": true,
        "attr-lowercase": false,
        "tag-pair": true,
        "spec-char-escape": false,
        "id-unique": true,
        "attr-no-duplication": true,
      });
      if (messages.length > 0) {
        throw {
          type: "INCORRECT_XML_OR_HTML",
          nonStandardOutputMessage: "Incorrect xml/html input",
          content: messages,
        };
      }
    }
    function setParseMode(isXml) {
      parent.window.config.state.isXmlMode = isXml;
      if (typeof parent !== "undefined") {
        $("#input_parse_mode", parent.document).html(
          isXml ? "XML mode" : "HTML mode"
        );
      }
    }
    var xmlNamespaces = {};
    function getNameSpaces(text) {
      var regex = new RegExp('xmlns:?([\\w]*)="([^\\"]*)"', "g");
      xmlNamespaces = {};
      for (var res = regex.exec(text); res !== null; res = regex.exec(text)) {
        xmlNamespaces[res[1] == "" ? "defaultNamespace4321" : res[1]] = res[2];
      }
      return xmlNamespaces;
    }
    exports.pre = function (prefix) {
      if (!_.isNil(prefix) && prefix.length > 0) {
        return xmlNamespaces[prefix];
      } else {
        return xmlNamespaces["defaultNamespace4321"];
      }
    };
    function memoize(func, resolver) {
      var lodash = _;
      return lodash.memoize(func, resolver);
    }
    exports.memoize = memoize;
    function memoizeByText(func) {
      function resolver() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i - 0] = arguments[_i];
        }
        return args
          .map(function (v) {
            return hashCode(v);
          })
          .join();
      }
      return memoize(func, resolver);
    }
    exports.memoizeByText = memoizeByText;
    function hashCode(text) {
      var hash = 0,
        i,
        chr,
        len;
      if (text.length === 0) return hash;
      for (i = 0, len = text.length; i < len; i++) {
        chr = text.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
      }
      return hash;
    }
    exports.hashCode = hashCode;
    function copyToClipboardMsg(elem) {
      var succeed = copyToClipboard(elem);
      if (!succeed) {
        alert("Copy not supported or blocked.)");
      }
    }
    exports.copyToClipboardMsg = copyToClipboardMsg;
    function copyToClipboard(elem) {
      var targetId = "_hiddenCopyText_";
      var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
      var origSelectionStart, origSelectionEnd;
      if (isInput) {
        target = elem;
        origSelectionStart = elem.selectionStart;
        origSelectionEnd = elem.selectionEnd;
      } else {
        target = parent.document.getElementById(targetId);
        if (!target) {
          var target = parent.document.createElement("textarea");
          target.style.position = "absolute";
          target.style.left = "-9999px";
          target.style.top = "0";
          target.id = targetId;
          parent.document.body.appendChild(target);
        }
        var ouputTextFormatted = $.map($(elem).find("li"), function (v) {
          return v.textContent.replace(/\s+/g, " ").replace(/^\s/g, "");
        }).join("\n");
        target.textContent = ouputTextFormatted;
      }
      var currentFocus = parent.document.activeElement;
      target.focus();
      target.setSelectionRange(0, target.value.length);
      var succeed;
      try {
        succeed = parent.document.execCommand("copy");
      } catch (e) {
        succeed = false;
      }
      if (currentFocus && typeof currentFocus.focus === "function") {
        currentFocus.focus();
      }
      if (isInput) {
        elem.setSelectionRange(origSelectionStart, origSelectionEnd);
      } else {
        target.textContent = "";
      }
      return succeed;
    }
    function showDifferences(one, other) {
      one = one.replace(/\s+/g, " ");
      other = other.replace(/\s+/g, " ");
      var diff = JsDiff.diffChars(one, other);
      if (one != other && diff.length > 0) {
        throw {
          type: "INCORRECT_XML_OR_HTML",
          nonStandardOutputMessage: "Incorrect xml/html input",
          content: { diff: diff, corrected: other },
        };
      }
    }
    function showDiffPopup(errorContent) {
      var display = jQuery("<div/>", {
        id: "popup_inner",
        class: "white-popup",
      });
      var fragment = jQuery("<div/>", {});
      var fixErrorsBtn = jQuery("<button/>", {
        text: "Fix errors",
        id: "fix_error_btn",
      });
      $(fixErrorsBtn).click(function () {
        getMyCM().setValue(errorContent.corrected);
      });
      errorContent.diff.forEach(function (part) {
        var color = part.added ? "green" : part.removed ? "red" : "grey";
        var span = window.parent.document.createElement("span");
        span.style.color = color;
        span.appendChild(window.parent.document.createTextNode(part.value));
        fragment.append(span);
      });
      jQuery(display).append(fixErrorsBtn).append(fragment);
      window.parent.jQuery.magnificPopup.open({
        items: { src: display, type: "inline" },
      });
    }
    function showButtonWithInputErrors(err) {
      var showErrorsBtn = jQuery("<button/>", {
        id: "show_errors_btn",
        text: "Show errors",
      });
      $(showErrorsBtn).click(function () {
        return showDiffPopup(err.content);
      });
      $("#xpathonline_stats")
        .append("Incorrect input. &nbsp;&nbsp;")
        .append(showErrorsBtn);
    }
    exports.showButtonWithInputErrors = showButtonWithInputErrors;
    function getRecordId() {
      var urlMatches = parent.window.location.href.match(/\/([A-Za-z0-9]{8})$/);
      if (urlMatches && urlMatches.length === 2) {
        return urlMatches[1];
      }
    }
    exports.getRecordId = getRecordId;
  },
  function (module, exports) {
    "use strict";
    function isXpathException(xpath) {
      return xpath.type != undefined;
    }
    exports.isXpathException = isXpathException;
  },
  function (module, exports) {
    module.exports = _;
  },
  function (module, exports) {
    module.exports = window;
  },
  function (module, exports, __webpack_require__) {
    "use strict";
    var xpathColPosMap_1 = __webpack_require__(7);
    var _ = __webpack_require__(4);
    var settings_1 = __webpack_require__(10);
    var general_1 = __webpack_require__(2);
    var xpathForColPosReal = function (lineCol, text) {
      var lineCol2 = { l: lineCol[0], c: lineCol[1] };
      function isBeforeLineCol(first, second) {
        if (first.l < second.l) {
          return true;
        } else if (first.l == second.l) {
          return first.c <= second.c;
        } else {
          return false;
        }
      }
      return xpathColPosMap_1.default(text).then(function (result) {
        if (result && settings_1.DEBUG_MODE) {
          console.log("result:Array<ElLoc>: ");
          console.log(result.getResult);
        }
        var r = _(result.getResult())
          .filter(function (el) {
            return (
              isBeforeLineCol(el.b, lineCol2) && isBeforeLineCol(lineCol2, el.e)
            );
          })
          .minBy(function (el) {
            return el.e.l * 1e4 + el.e.c - (el.b.l * 1e4 + el.b.c);
          });
        if (!r) {
          throw {
            type: "Cannot generate xpath for this position",
            nonStandardOutputMessage: "Cannot generate xpath for this position",
          };
        }
        return r;
      });
    };
    function memoizeXpathForColPos() {
      function resolver(lineCol, text) {
        return general_1.hashCode(text) + " " + lineCol[0] + " " + lineCol[1];
      }
      return general_1.memoize(xpathForColPosReal, resolver);
    }
    exports.memoizeXpathForColPos = memoizeXpathForColPos;
    var xpathForColPos = memoizeXpathForColPos();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = xpathForColPos;
  },
  function (module, exports, __webpack_require__) {
    "use strict";
    var sax = __webpack_require__(8);
    var _ = __webpack_require__(4);
    var XpathElements_1 = __webpack_require__(9);
    var settings_1 = __webpack_require__(10);
    var general_1 = __webpack_require__(2);
    var ParserResult = (function () {
      function ParserResult() {
        this.result = [];
        this.hashIndexMap = {};
      }
      ParserResult.prototype.push = function (obj) {
        var newLen = this.result.push(obj);
        this.hashIndexMap[XpathElements_1.hashTagPathLowerCase(obj.xpath)] =
          newLen - 1;
      };
      ParserResult.prototype.find = function (xpath) {
        return this.result[
          this.hashIndexMap[XpathElements_1.hashTagPathLowerCase(xpath)]
        ];
      };
      ParserResult.prototype.findWithRootAdded = function (xpath) {
        var xpath2 = _.clone(xpath);
        xpath2.unshift({ tag: "*", num: 0 });
        return this.result[
          this.hashIndexMap[XpathElements_1.hashTagPathLowerCase(xpath2)] - 1
        ];
      };
      ParserResult.prototype.getResult = function () {
        return this.result;
      };
      return ParserResult;
    })();
    exports.ParserResult = ParserResult;
    ParserResult.rootElement = "xml";
    var xpathColposMapReal = function (text) {
      var selfClosingTags =
        parent.window.config.state.isXmlMode == true
          ? []
          : [
              "area",
              "base",
              "br",
              "col",
              "command",
              "embed",
              "hr",
              "img",
              "keygen",
              "input",
              "link",
              "meta",
              "param",
              "source",
              "track",
              "wbr",
            ];
      if (settings_1.DEBUG_MODE) {
        console.log("parser input: ");
        console.log(text);
      }
      var parser = sax.parser(false, { position: true });
      var getCurPos = function () {
        return { l: parser.line, c: parser.column };
      };
      var curPath = [];
      function compare(elementPos, location) {
        return (
          JSON.stringify(
            elementPos.map(function (v) {
              return [v.tag, v.num];
            })
          ) ===
          JSON.stringify(
            location.map(function (v) {
              return [v.tag, v.num];
            })
          )
        );
      }
      var result = new ParserResult();
      var attributesOfCurrent = [];
      var lastOpenTagStart = null;
      var lastTagEnd = null;
      var lastResultLevel = null;
      var level = 0;
      parser.onopentagstart = function (node) {
        lastOpenTagStart = {
          l: parser.line,
          c: parser.column - node.name.length - 2,
        };
        curPath.push({
          tag: "*",
          num: curPath.length > 0 ? _.last(curPath).childPosition : 0,
        });
      };
      parser.ontext = function (text) {
        if (new RegExp("^(\\s)*$").test(text)) {
          return;
        }
        if (settings_1.DEBUG_MODE) {
          console.log("ontext: ");
          console.log(text);
        }
        var lines = text.split("\n");
        var lastLineLen =
          _.last(lines).replace(/\s/g, "").length === 0
            ? 0
            : _.last(lines).length;
        var endPos = {
          l: lastTagEnd.l + lines.length - 1,
          c: (lines.length <= 1 ? lastTagEnd.c : 0) + lastLineLen,
        };
        var xpath = _.clone(curPath);
        xpath.push({
          tag: "text()",
          num: _.result(_.last(curPath), "textPosition", 0),
        });
        result.push({ b: lastTagEnd, e: endPos, xpath: xpath, node: text });
        _.set(
          _.last(curPath),
          "textPosition",
          _.result(_.last(curPath), "textPosition", 0) + 1
        );
      };
      parser.onopentag = function (node) {
        level++;
        if (
          curPath.length > 0 &&
          typeof _.last(curPath).childPosition === "undefined"
        ) {
          _.last(curPath).childPosition = 0;
        }
        var newResult = {
          b: lastOpenTagStart,
          xpath: _.clone(curPath),
          node: node,
        };
        result.push(newResult);
        attributesOfCurrent.forEach(function (v) {
          return result.push(v);
        });
        attributesOfCurrent.length = 0;
        lastResultLevel = level;
        lastTagEnd = getCurPos();
        if (settings_1.DEBUG_MODE) {
          console.log("onopentag: ");
          console.log(node);
        }
        if (isSelfClosing(node.name.toLowerCase())) {
          onCloseTag(node);
        }
      };
      parser.onattribute = function (attr) {
        var endPos = { l: parser.line, c: parser.column };
        var startPos = {
          l: endPos.l,
          c: endPos.c - attr.name.length - attr.value.length - 3,
        };
        var xpath = _.clone(curPath);
        xpath.push({ tag: "@" + attr.name.toLowerCase(), num: 0 });
        attributesOfCurrent.push({ b: startPos, e: endPos, xpath: xpath });
      };
      parser.onerror = function (err) {};
      function onCloseTag(node) {
        if (settings_1.DEBUG_MODE) {
          console.log("onclosetag 1: ");
          console.log(_.cloneDeep(result.getResult()));
          console.log(_.cloneDeep(curPath));
        }
        level--;
        var f = result.find(curPath);
        if (f && f.e == undefined) {
          f.e = getCurPos();
        }
        curPath.pop();
        _.set(
          _.last(curPath),
          "childPosition",
          _.result(_.last(curPath), "childPosition") + 1
        );
        lastTagEnd = getCurPos();
        if (settings_1.DEBUG_MODE) {
          console.log("onclosetag 2: ");
          console.log(node);
        }
      }
      function isSelfClosing(name) {
        return selfClosingTags.indexOf(name) !== -1;
      }
      parser.onclosetag = function (node) {
        if (isSelfClosing(_.get(node, "name", node).toLowerCase())) {
          return;
        }
        onCloseTag(node);
      };
      var promise = new Promise(function (resolve, reject) {
        parser.onend = function () {
          result.getResult().shift();
          result.getResult().forEach(function (e) {
            e.b.l--;
            if (e.e != undefined) {
              e.e.l--;
            }
            e.xpath.shift();
          });
          if (settings_1.DEBUG_MODE) {
            console.log("parser results: ");
            console.log(result.getResult);
          }
          resolve(result);
        };
      });
      parser
        .write(
          "<" +
            ParserResult.rootElement +
            ">\n" +
            text +
            ("</" + ParserResult.rootElement + ">")
        )
        .close();
      return promise;
    };
    var xpathColposMap = general_1.memoizeByText(xpathColposMapReal);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = xpathColposMap;
  },
  function (module, exports) {
    module.exports = sax;
  },
  function (module, exports, __webpack_require__) {
    "use strict";
    var general_1 = __webpack_require__(2);
    function hashTagPath(tagPath) {
      return general_1
        .hashCode(
          JSON.stringify(
            tagPath.map(function (v) {
              return [v.tag, v.num];
            })
          )
        )
        .toString();
    }
    exports.hashTagPath = hashTagPath;
    function hashTagPathLowerCase(tagPath) {
      return general_1
        .hashCode(
          JSON.stringify(
            tagPath.map(function (v) {
              return [v.tag.toLowerCase(), v.num];
            })
          )
        )
        .toString();
    }
    exports.hashTagPathLowerCase = hashTagPathLowerCase;
  },
  function (module, exports) {
    "use strict";
    exports.DEBUG_MODE = false;
  },
  function (module, exports, __webpack_require__) {
    "use strict";
    var general_1 = __webpack_require__(2);
    var $ = jQuery;
    $("<link/>", {
      rel: "stylesheet",
      href:
        document.cfg.srcUrl +
        "js/xpathonline_iframe.css?v=" +
        parent.window.config.version,
    }).appendTo("head");
    var input = jQuery("<textarea/>", {
      id: "xpathonline_input",
      spellcheck: "false",
      cols: 40,
      rows: 3,
      size: 120,
      placeholder: "Type your xpath query here...",
      text: general_1.getRecordId()
        ? ""
        : ".//*[self::abstract or self::subject or self::note][position() <= 2]",
    });
    var rightTopcontainer = jQuery("<div/>", {
      id: "xpathonline_right_container",
      style: "width: 38%",
    });
    var searchOutput = jQuery("<div/>", { id: "xpathonline_output" });
    var statsOutput = jQuery("<div/>", {
      id: "xpathonline_stats",
      class: "font-consistent",
      style: "float: left",
    });
    var spinner = jQuery("<img/>", {
      id: "xpathonline_spinner",
      src: "default.png",
      style: "float: right; opacity: 0; width: 7%",
    });
    rightTopcontainer.append(statsOutput).append(spinner);
    var container = jQuery("<div/>", {
      id: "xpathonline_container",
      style: "position: fixed; top: 0; left:0;",
    });
    container.append(input).append(rightTopcontainer).prependTo("body");
    $("#right-pane", parent.document).append(searchOutput);
  },
  function (module, exports, __webpack_require__) {
    "use strict";
    var colPosForXpath_1 = __webpack_require__(13);
    var general_1 = __webpack_require__(2);
    var NodeTypeEnum_1 = __webpack_require__(14);
    var settings_1 = __webpack_require__(10);
    var marks = [];
    function resetOutput() {
      $("#xpathonline_output", parent.document).text("");
      general_1.setOutputStats("");
      marks.forEach(function (mark) {
        mark.clear();
      });
      marks = [];
      general_1.clearWidgets();
    }
    function getParentIfNotTag(el) {
      if (el.nodeType === NodeTypeEnum_1.NodeTypeEnum.Attr) {
        return el.ownerElement;
      }
      if (el.nodeType === NodeTypeEnum_1.NodeTypeEnum.Text) {
        return el.parentElement;
      }
      return el;
    }
    exports.refreshEvaluation = function () {
      colPosForXpath_1
        .default(
          parent.document.myCodeMirror.getValue(),
          $("#xpathonline_input").val()
        )
        .then(function (res) {
          if (settings_1.DEBUG_MODE) {
            console.log("refreshEvaluation: Array<ElLoc>");
            console.log(res);
          }
          resetOutput();
          var searchOutputList = jQuery("<ol/>", {
            id: "xpathonline_output_list",
          });
          if (res && res.length > 0) {
            general_1.setOutputStats("Elements found: " + res.length);
            var showJustTextCached_1 = showJustText();
            res.forEach(function (r) {
              var entry = jQuery("<li/>", {});
              var spanIside = jQuery("<span/>", {
                text: showJustTextCached_1
                  ? r.matchingDomElement.textContent
                  : getParentIfNotTag(r.matchingDomElement).outerHTML,
              });
              $(entry).append(spanIside);
              $(entry).click(function () {
                parent.document.myCodeMirror.scrollIntoView({
                  line: r.b.l,
                  ch: r.b.c,
                });
              });
              var hoverMarks = [];
              $(entry).hover(
                function (e) {
                  hoverMarks.push(
                    parent.document.myCodeMirror.markText(
                      { line: r.b.l, ch: r.b.c },
                      { line: r.e.l, ch: r.e.c },
                      { css: "background-color: rgb(255, 180, 180)" }
                    )
                  );
                },
                function (e) {
                  hoverMarks.forEach(function (mark) {
                    mark.clear();
                  });
                  hoverMarks = [];
                }
              );
              $(searchOutputList).append(entry);
              marks.push(
                parent.document.myCodeMirror.markText(
                  { line: r.b.l, ch: r.b.c },
                  { line: r.e.l, ch: r.e.c },
                  { className: "xpathonline_selected" }
                )
              );
            });
            $("#xpathonline_output", parent.document).append(searchOutputList);
            general_1.showSpinner(false);
          }
        })
        .catch(function (ex) {
          resetOutput();
          general_1.handleError(ex);
        });
    };
    function showJustText() {
      var outputFormat = $(
        "input[name=displayOptions]:checked",
        parent.document
      ).val();
      return outputFormat == "display-text";
    }
    $("#outputFormat", parent.document).click(function (e) {
      setTimeout(exports.refreshEvaluation, 20);
    });
    $("#outputFormat label", parent.document).change(function () {
      exports.refreshEvaluation();
    });
  },
  function (module, exports, __webpack_require__) {
    "use strict";
    var _ = __webpack_require__(4);
    var xpathColPosMap_1 = __webpack_require__(7);
    var general_1 = __webpack_require__(2);
    var settings_1 = __webpack_require__(10);
    var colPosForXpathReal = function (text, xpath) {
      try {
        var listOfSimpleFullPathParts = getListOfSimpleFullPathParts(
          text,
          xpath
        );
      } catch (ex) {
        return Promise.reject(ex);
      }
      if (settings_1.DEBUG_MODE) {
        console.log("listOfSimpleFullPathParts: ");
        console.log(listOfSimpleFullPathParts);
      }
      if (listOfSimpleFullPathParts) {
        return getColPos(text, listOfSimpleFullPathParts);
      } else {
        return Promise.reject("Incorrect xpath for getting colPos" + xpath);
      }
      function getColPos(text, toFindXpaths) {
        return xpathColPosMap_1.default(text).then(function (xpathColPosMap) {
          return toFindXpaths
            .map(function (xpathToFind) {
              var foundMapping = xpathColPosMap.findWithRootAdded(xpathToFind);
              if (foundMapping) {
                foundMapping.matchingDomElement = xpathToFind.relatedDomElement;
              } else {
                console.info("Element not found by SAX: ");
                console.dir(xpathToFind);
              }
              return foundMapping;
            })
            .filter(function (e) {
              return e;
            });
        });
        function compare(elementPos, location) {
          return (
            JSON.stringify(
              elementPos.map(function (v) {
                return [v.num, v.tag.toLowerCase()];
              })
            ) ===
            JSON.stringify(
              location.map(function (v) {
                return [v.num, v.tag.toLowerCase()];
              })
            )
          );
        }
      }
    };
    var colPosForXpath = general_1.memoizeByText(colPosForXpathReal);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = colPosForXpath;
    function isNonStandardResult(list) {
      return _.some(list, function (el) {
        return (
          _.isString(el) ||
          _.isNumber(el) ||
          _.isBoolean(el) ||
          _.includes(["HTMLDocument", "XMLDocument"], el.constructor.name)
        );
      });
    }
    function getElementByXpath(rootPath, xml, xpath) {
      return _.isEmpty(rootPath)
        ? $(xml).xpath(xpath, general_1.pre)
        : $(xml).xpath(rootPath).xpath(xpath, general_1.pre);
    }
    function addIndexes(el) {
      el.childPosition = 0;
      $(el)
        .children()
        .each(function (i, e) {
          addIndexes(e);
          e.childPosition = i;
        });
    }
    function getListOfSimpleFullPathParts(text, xpath) {
      var _a = general_1.getHtmlDocument(text),
        xml = _a.doc,
        rootPath = _a.rootPath,
        numOfContainers = _a.numOfContainers;
      var rootEl = $("html", xml)[0];
      addIndexes(_.isNil(rootEl) ? xml.documentElement : rootEl);
      try {
        var el = getElementByXpath(rootPath, xml, xpath);
      } catch (ex) {
        console.error("Error when parsing: " + ex);
        throw ex;
      }
      var listOfSimpleFullPathParts = null;
      if (el.length > 0) {
        if (isNonStandardResult(el)) {
          var error = {
            type: "DOM_AGNOSTIC_RESULT",
            nonStandardOutputMessage:
              "Non-standard output: <br>" +
              _.map(el, function (e) {
                return e + "<br>";
              }).join(""),
          };
          console.debug("Could not find right element");
          throw error;
        }
        listOfSimpleFullPathParts = _.map(el, function (ie) {
          var e;
          if (ie.nodeType === 2) {
            e = ie.ownerElement;
          } else if (ie.nodeType === 1) {
            e = ie;
          } else if (ie.nodeType === 3) {
            e = ie.parentElement;
          }
          var simpleFullPathPart = _.union(
            $(e)
              .parents()
              .get()
              .reverse()
              .filter(function (e, ind) {
                return ind >= numOfContainers;
              }),
            [e]
          ).map(function (el) {
            var el$ = $(el);
            var tagName = "*";
            var tagInd = el$[0].childPosition;
            return { tag: tagName, num: tagInd };
          });
          simpleFullPathPart.relatedDomElement = ie;
          if (ie.nodeType === 2) {
            simpleFullPathPart.push({ tag: "@" + ie.name, num: 0 });
          } else if (ie.nodeType === 3) {
            var pos = _.filter(ie.parentNode.childNodes, function (e) {
              return e.nodeType === 3;
            }).indexOf(ie);
            simpleFullPathPart.push({ tag: "text()", num: pos });
          }
          return simpleFullPathPart;
        });
      } else {
        throw "No elements found.";
      }
      return listOfSimpleFullPathParts;
    }
    exports.getListOfSimpleFullPathParts = getListOfSimpleFullPathParts;
  },
  function (module, exports) {
    "use strict";
    (function (NodeTypeEnum) {
      NodeTypeEnum[(NodeTypeEnum["Tag"] = 1)] = "Tag";
      NodeTypeEnum[(NodeTypeEnum["Attr"] = 2)] = "Attr";
      NodeTypeEnum[(NodeTypeEnum["Text"] = 3)] = "Text";
    })(exports.NodeTypeEnum || (exports.NodeTypeEnum = {}));
    var NodeTypeEnum = exports.NodeTypeEnum;
  },
  function (module, exports, __webpack_require__) {
    "use strict";
    var __extends =
      (this && this.__extends) ||
      function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() {
          this.constructor = d;
        }
        d.prototype =
          b === null
            ? Object.create(b)
            : ((__.prototype = b.prototype), new __());
      };
    var _ = __webpack_require__(4);
    var HtmlEl = (function () {
      function HtmlEl() {}
      return HtmlEl;
    })();
    var Attribute = (function (_super) {
      __extends(Attribute, _super);
      function Attribute(name, value) {
        _super.call(this);
        this.name = name;
        this.value = value;
      }
      return Attribute;
    })(HtmlEl);
    Attribute.attributes = {
      class: "c1 c2",
      alt: "some_expl",
      src: "some_src",
    };
    var Node = (function (_super) {
      __extends(Node, _super);
      function Node(canBeTextNode) {
        var _this = this;
        _super.call(this);
        this.isTextNode = false;
        this.openTag = function (textPos, allElements, xpath) {
          var openTagStart = "<" + _this.tagName;
          textPos += openTagStart.length;
          _this.attributes.forEach(function (a) {
            a.xpath = _.cloneDeep(xpath);
            a.xpath.push({ tag: "@" + a.name, num: 0 });
            a.b = { l: 0, c: textPos + 1 };
            var attrHtml = " " + a.name + '="' + a.value + '"';
            textPos += attrHtml.length;
            openTagStart += attrHtml;
            a.e = { l: 0, c: textPos };
            allElements.push(a);
          });
          return openTagStart + ">";
        };
        this.closeTag = function () {
          return "</" + _this.tagName + ">";
        };
        if (canBeTextNode) {
          this.isTextNode = Math.random() > 0.5;
        }
        if (!this.isTextNode) {
          var rand = Math.round(Math.random() * (Node.tagNames.length - 1));
          this.tagName = Node.tagNames[rand];
          this.attributes = _.map(Attribute.attributes, function (v, k) {
            return { v: v, k: k };
          })
            .filter(function () {
              return Math.random() > 0.5;
            })
            .map(function (o) {
              return new Attribute(o.k, o.v);
            });
        } else {
          this.tagName = "text()";
        }
      }
      Node.prototype.html = function (allElements, textPos, xpath, childIndex) {
        var _this = this;
        var getInd = function (child, children) {
          if (child.isTextNode) {
            return children
              .filter(function (c) {
                return c.isTextNode;
              })
              .indexOf(child);
          } else {
            return children
              .filter(function (c) {
                return !c.isTextNode;
              })
              .indexOf(child);
          }
        };
        var getHtml = function () {
          if (!_this.isTextNode) {
            var openTag = _this.openTag(textPos, allElements, xpath);
            textPos += openTag.length;
            var output_1 =
              openTag +
              _this.children
                .map(function (child, ind) {
                  var output = child.html(
                    allElements,
                    textPos,
                    xpath,
                    getInd(child, _this.children)
                  );
                  textPos += output.length;
                  return output;
                })
                .join("") +
              _this.closeTag();
            textPos += _this.closeTag().length;
            return output_1;
          } else {
            var output_2 = "some text";
            textPos += output_2.length;
            return output_2;
          }
        };
        this.b = { l: 0, c: textPos };
        allElements.push(this);
        xpath.push({ tag: this.tagName, num: childIndex });
        this.xpath = _.cloneDeep(xpath);
        var output = getHtml();
        this.e = { l: 0, c: textPos };
        xpath.pop();
        return output;
      };
      Node.prototype.mapToElLoc = function () {
        return { b: this.b, e: this.e, xpath: this.xpath };
      };
      return Node;
    })(HtmlEl);
    exports.Node = Node;
    Node.tagNames = ["aaa", "bbb", "ccc", "ddd"];
    function generateTree(maxHeight, maxWidth) {
      var percentOfHigherTrees = 0.01;
      var probabilityOfHavingChildren = 0.99;
      var getNodeWithChildren = function (probOfChildren, canBeTextNode) {
        var node = new Node(canBeTextNode);
        if (Math.random() < probOfChildren) {
          var numOfChildren = Math.ceil(Math.random() * maxWidth);
          node.children = [];
          _.reduce(
            _.range(numOfChildren),
            function (res, val) {
              var currCanBeText = _.isEmpty(res) || !_.last(res).isTextNode;
              res.push(
                getNodeWithChildren(Math.pow(probOfChildren, 4), currCanBeText)
              );
              return res;
            },
            node.children
          );
        } else {
          node.children = [];
        }
        return node;
      };
      return getNodeWithChildren(probabilityOfHavingChildren, false);
    }
    exports.generateTree = generateTree;
  },
]);
