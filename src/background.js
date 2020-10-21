import * as Api from "@/api";
import * as Utils from "@/utils";
import * as Shops from "@/helpers/shops";
import Notify from "@/notify";

let _isInit;
let _lastOrder;
let _sessionId;
let _lastActivateDate;
let _timerIcon;
let _tick = 0;
let _cache = {};

setInterval(() => {
  if (!_isInit) return;
  notifications();
  Utils.updatePartners();
}, 300000); // interval 5 min

// first notify after start
setTimeout(() => {
  if (!_isInit) return;
  notifications();
  Utils.updatePartners();
}, 5000);

chrome.storage.local.get(null, function(items) {
  // var allKeys = Object.keys(items);
  console.log("storage-exr:", items);
});

chrome.storage.local.get("auth", async (data) => {
  if (!data) return;
  initApi(data.auth);
});

chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
  if (_lastActivateDate && notifId == _lastActivateDate.id) {
    let partner = _lastActivateDate.partner;
    Utils.activateStore(partner, true).then((ok) => {
      if (ok) {
        chrome.notifications.create(new Date().getTime() + "", Notify.activate);
      }
    });
    // lastActivateDate = undefined;
  }
  Utils.getAsync("notifications").then((exist) => {
    if (!exist || btnIdx > 0) return;
    const notify = exist[notifId];
    if (notify) {
      window.open(notify.notification_url);
      window.focus();
    }
  });
});

chrome.runtime.onMessage.addListener((data, sender, response) => {
  switch (data.type) {
    case "notification":
      console.log("notify", data.options);
      chrome.notifications.create(new Date().getTime() + "", data.options);
      break;
    case "spec-activate":
      activateStore();
      break;
    case "api":
      initApi(data.auth);
      break;
    case "order": {
      console.log("last-order", _lastOrder);
      response(_lastOrder);
      break;
    }
    case "login": {
      afterLogin();
      break;
    }
  }
});

chrome.tabs.onUpdated.addListener(function(tabId, obj) {
  chrome.tabs.get(tabId, (tab) => {
    if (obj && obj.status === "loading") {
      checkUrl(tab.url, true);
    }
  });
});

chrome.tabs.onActiveChanged.addListener(function(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    console.log("active", tab.url);
    checkUrl(tab.url);
  });
});

function afterLogin() {
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    const t = tabs[0];
    chrome.tabs.get(t.id, (tab) => {
      requestPartner(tab.url, true);
    });
  });
}

function checkUrl(url, up) {
  // console.log("check", url);
  if (url.indexOf("https://") == 0 || url.indexOf("http://") == 0) {
    if (
      url.indexOf("https://manfi.ru/?option=com_slogin&task=check&plugin=") == 0
    ) {
      if (!_isInit) auth();
    } else requestPartner(url, up);
  }
}

function initApi(data) {
  if (!data) return;
  Api.init(data);
  _isInit = true;
}

async function notifications() {
  const list = (await Api.notifications()) || [];
  const exist = (await Utils.getAsync("notifications")) || {};

  for (const i in list) {
    const item = list[i];
    const prev = exist[item.id];

    if (prev) continue;

    chrome.notifications.create(item.id, {
      iconUrl: "icons/128.png",
      type: "image",
      imageUrl: item.notification_image,
      title: item.notification_title,
      message: item.notification_text,
      buttons: [{ title: "Открыть" }],
    });

    exist[item.id] = item;
  }

  await Utils.setAsync("notifications", exist);
}

async function activateStore() {
  clearInterval(_timerIcon);
  chrome.browserAction.setIcon({ path: "icons/middle-green.png" });
}

function noActiveStore() {
  if (_timerIcon) clearInterval(_timerIcon);
  _timerIcon = setInterval(() => {
    const path =
      _tick % 2 == 0 ? "icons/middle-red.png" : "icons/middle-gray.png";
    chrome.browserAction.setIcon({ path });

    _tick++;
  }, 1000);
}

function setNoAffStore() {
  chrome.browserAction.setIcon({ path: "icons/middle-orange.png" });
}

function auth() {
  chrome.cookies.get(
    { url: "https://manfi.ru", name: "mhsh" },
    async (cookie) => {
      if (cookie) {
        const auth = {
          auth: cookie.value,
        };
        Api.init(auth);

        let user = await Api.userInfo();

        if (!user) return;

        user = user.user;

        auth.id = user.id;

        Api.init(auth);
        _isInit = true;

        let partners = await Utils.updatePartners();
        if (!partners) return;

        await Utils.setAsync("auth", auth);

        const first = true || !(await Utils.getAsync("first"));

        if (first) {
          console.log("notify first");
          chrome.notifications.create(
            new Date().getTime() + "",
            Notify.welcome
          );
        }

        afterLogin();
      }
    }
  );
}

function clearCache() {
  let curr = new Date().getTime();
  for (let i in _cache) {
    let item = _cache[i];

    if (curr - item.time > 3600000) {
      delete _cache[i];
    }
  }
}

async function requestPartner(tabUrl, up) {
  _lastOrder = null;
  _sessionId = null;

  activateStore();
  clearCache();

  if (!_isInit) return;

  const store = await Utils.currStore();
  let partners = (await Utils.getAsync("partners")) || {};
  let partner = Utils.searchByKey(partners, store);

  console.log("specStore", partner);

  if (!partner) return;

  _lastOrder = {
    partner,
    tabUrl,
  };

  Utils.sendMessage({
    type: "order",
    order: _lastOrder,
  });

  let actives = (await Utils.getAsync("actives")) || {};
  let partnerActive = Utils.searchByKey(actives, store);
  let specStore = Utils.checkSpecStore(store);

  console.log("specStore", specStore);

  if (specStore) {
    if (partnerActive) {
      activateStore();
    } else {
      noActiveStore();
      Utils.setAsync("last", partner);
    }

    let currSessionId = new Date().getTime();
    let hash = Utils.urlWithoutQuery(tabUrl);
    let prev;

    _sessionId = currSessionId;

    if (hash) {
      prev = _cache[hash];
    }

    console.log("prev", prev);

    if (prev) {
      if (!prev.order.percent) {
        setNoAffStore();
        console.log("no cache aff: " + _lastOrder);
      }
      _lastOrder = prev.order;
      Utils.sendMessage({ type: "order", order: prev.order });
    } else {
      Shops.orderInfoAsync(partner.store, tabUrl, currSessionId).then(
        (orderInfo) => {
          if (orderInfo) {
            if (currSessionId == _sessionId) {
              if (!orderInfo.percent) {
                setNoAffStore();
                console.log("no aff: " + orderInfo);
              }
              _lastOrder = orderInfo;
              orderInfo.partner = partner;
              Utils.sendMessage({ type: "order", order: orderInfo });
            }

            if (hash) {
              _cache[hash] = {
                time: currSessionId,
                order: orderInfo,
              };
            }
          }
        }
      );
    }
  }

  if (partnerActive) return;

  console.log("no activate store:", { up, last: _lastActivateDate });

  if (
    !up ||
    (_lastActivateDate && _lastActivateDate.partner.store == partner.store)
  )
    return;

  _lastActivateDate = {
    id: new Date().getTime() + "",
    partner,
  };
  let settings = (await Utils.getAsync("settings")) || {};

  const notify = Notify.avaliable;

  notify.message = `За покупки в ${partner.title} магазине можно получить кэшбэк.`;

  if (Object.keys(settings).length === 0 || settings[5]) {
    chrome.notifications.create(_lastActivateDate.id, Notify.avaliable);
  }
  // else {
  //   chrome.notifications.create(lastActivateDate.id, Notify.avaliable);
  // }
}
