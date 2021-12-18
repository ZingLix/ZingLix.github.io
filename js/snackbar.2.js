/**
 * SnackBar.js
 * 
 * This small component is borrowed from 
 * https://codepen.io/wibblymat/pen/avAjq
 */


var createSnackbar = (function () {
  // Any snackbar that is already shown
  var previous = null;

  /*
  <div class="paper-snackbar">
    <button class="action">Dismiss</button>
    This is a longer message that won't fit on one line. It is, inevitably, quite a boring thing. Hopefully it is still useful.
  </div>
  */

  return function (config) {
    var message = config.message,
      actionText = config.actionText,
      action = config.action,
      duration = config.duration;

    if (previous) {
      previous.dismiss();
    }
    var snackbar = document.createElement('div');
    snackbar.className = 'paper-snackbar';
    snackbar.dismiss = function () {
      this.style.opacity = 0;
    };
    var text = document.createTextNode(message);
    snackbar.appendChild(text);
    if (actionText) {
      if (!action) {
        action = snackbar.dismiss.bind(snackbar);
      }
      var actionButton = document.createElement('button');
      actionButton.className = 'action';
      actionButton.innerHTML = actionText;
      actionButton.addEventListener('click', action);
      snackbar.appendChild(actionButton);
    }
    setTimeout(function () {
      if (previous === this) {
        previous.dismiss();
      }
    }.bind(snackbar), duration || 5000);

    snackbar.addEventListener('transitionend', function (event, elapsed) {
      if (event.propertyName === 'opacity' && this.style.opacity == 0) {
        this.parentElement.removeChild(this);
        if (previous === this) {
          previous = null;
        }
      }
    }.bind(snackbar));



    previous = snackbar;
    document.body.appendChild(snackbar);
    // In order for the animations to trigger, I have to force the original style to be computed, and then change it.
    getComputedStyle(snackbar).bottom;
    snackbar.style.bottom = '0px';
    snackbar.style.opacity = 1;
  };
})();


var lastNoticeTime = localStorage.getItem('lastNoticeTime');
var slowNoticeTime = localStorage.getItem('slowNoticeTime');
var noticeSlow = false;
var mainUrl = "https://zinglix.xyz";

if (slowNoticeTime == null || Math.floor(Date.now() / 1000) - parseInt(slowNoticeTime) > 60) {
  var slowLoad = window.setTimeout(function () {
    localStorage.setItem('slowNoticeTime', Math.floor(Date.now() / 1000));
    localStorage.setItem('lastNoticeTime', Math.floor(Date.now() / 1000));
    if (window.location.origin != mainUrl) {
      createSnackbar({
        message: "您正在访问镜像站点，还是慢？",
        actionText: "查看所有镜像",
        action: function (e) { window.location = "/mirror" },
        duration: 8000
      });
    } else {
      createSnackbar({
        message: "访问过慢？试试镜像站点？",
        actionText: "Go",
        action: function (e) { window.location = "https://blog.zinglix.xyz" + window.location.pathname },
        duration: 8000
      });
    }
    noticeSlow = true;
  }, 3000);

  window.addEventListener('load', function () {
    window.clearTimeout(slowLoad);
  }, false);
}

window.onload = function () {
  if (!noticeSlow && window.location.origin != mainUrl) {
    if (lastNoticeTime == null || Math.floor(Date.now() / 1000) - parseInt(lastNoticeTime) > 60 * 60) {
      localStorage.setItem('lastNoticeTime', Math.floor(Date.now() / 1000));
      createSnackbar({
        message: "注意: 您正在访问镜像站点。前往主站？",
        actionText: "Go",
        action: function (e) { window.location = mainUrl + window.location.pathname },
        duration: 3000,
      });
    }
  }
}

function getFooter() {
  if (window.location.origin.search("zinglix.xyz") != -1) {
    return ` <a href="http://beian.miit.gov.cn">沪ICP备18012603号-1</a>
                    <img src="/img/beian.png" />
                    <a href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=31011002004677">沪公网安备
                        31011002004677 号
                    </a>`
  } else {
    return `注意！你正在访问镜像站点！<a href="https://zinglix.xyz${window.location.pathname}">前往主站</a>`
  }
}
