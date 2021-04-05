import * as Api from '@/api';
import Notify from '@/notify';

const paterns = {
  'aliexpress.com': /^((https?):\/\/)*([a-z0-9]+\.)*aliexpress/,
  'lamoda.com': /^(https?):\/\/([a-z0-9]+\.)*lamoda/,
};

export function delayAsync(timeout) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
}

export function getAsync(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (data) => {
      resolve(data[key]);
    });
  });
}

export function setAsync(key, value) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => {
      resolve();
    });
  });
}

export function checkSpecStore(url) {
  for (let i in paterns) {
    let p = paterns[i];

    if (p.test(url)) {
      return i;
    }
  }
}

export async function convertCurrency(base, val) {
  let data = await Api.curencyRate(base);

  if (!data) return undefined;

  return data.rates.USD * val;
}

export function currStore() {
  return new Promise((resolve) => {
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      let res = '';
      if (!tabs || tabs.length == 0 || !tabs[0]) return res;

      var t = tabs[0];

      chrome.tabs.get(t.id, (tab) => {
        let res;
        try {
          res = new URL(tab.url);
          if (res.protocol == 'https:' || res.protocol == 'http:')
            res = res.hostname;
          else res = '';
        } catch (error) {
          //
        }
        resolve(res);
      });

      // chrome.tabs.sendMessage(activeTab.id, { message: "start" });
    });
  });
}

export function searchByKey(items, value) {
  if (value == '') return;
  value = value.toLowerCase() + '.';

  let tmp = items[name];

  if (tmp) return tmp;

  for (let key in items) {
    let item = items[key];
    if (value.indexOf(key) > -1) {
      return item;
    }
  }
}

export function tabAccessUrl() {
  return new Promise((resolve) => {
    let res;
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      var t = tabs[0];

      chrome.tabs.get(t.id, (tab) => {
        for (let i in paterns) {
          let p = paterns[i];

          if (p.test(tab.url)) {
            res = tab.url;
            resolve(res);
            break;
          }
        }
      });
    });
  });
}

export function urlWithoutQuery(url) {
  try {
    url = new URL(url);
    return url.origin + url.pathname;
  } catch {
    //
  }
}

export function sendMessage(data) {
  chrome.runtime.sendMessage('', data);
}

export function sendMessageAsync(data) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage('', data, undefined, (response) => {
      resolve(response);
    });
  });
}

export async function updatePartners() {
  let partners = await Api.partnersList();

  if (partners) {
    let unordered = {};

    for (const i in partners) {
      let item = partners[i];
      let url = item['site-url'];
      if (url) {
        const arr = url.split('.');
        let i = arr[0] === 'www' ? 1 : 0;

        url = arr[i++];

        for (; i < arr.length - 1; i++) {
          url += '.' + arr[i];
        }
        url = url.toLowerCase();
        item.store = url;
        url += '.';
        unordered[url] = item;
      }
    }
    let map = {};
    Object.keys(unordered)
      .sort()
      .forEach((key) => {
        map[key] = unordered[key];
      });

    await setAsync('partners', map);
    return map;
  }
  return null;
}

export async function tryActivateSpec(store) {
  let last = await getAsync('last');

  console.log(last, store);

  let ok = last && checkSpecStore(store) && last.store == store;

  if (ok) {
    activateStore(last, true);
  }
}

export async function activateStore(partner, icon = false) {
  let actives = (await getAsync('actives')) || {};

  const days = parseInt(partner['cookie-lifetime'].split(' ')[0]);

  if (days > 0) {
    let date = new Date();
    date = date.setDate(date.getDate() + days);
    actives[partner.store] = date;

    await setAsync('actives', actives);

    sendMessage({
      type: 'notification',
      options: Notify.activate,
    });

    if (icon) {
      sendMessage({
        type: 'spec-activate',
      });
    }

    await wait(250);

    chrome.tabs.create({ url: partner.link });
    return true;
  }
  return false;
}

export function wait(timeout) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
}
