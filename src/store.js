import Vue from 'vue';

import * as Utils from '@/utils';

export const store = Vue.observable({
  settings: {},
  actives: {},
  partners: {},
  categorys: {},
  profile: {},
  status: undefined,
  currProduct: undefined,
  currStore: undefined,
  isActivate: false,
});

export const mutations = {
  updateSettings(settings) {
    store.settings = settings;

    Utils.setAsync('settings', settings);
  },
  updatePartners(partners) {
    if (!partners) return;

    const map = {};

    for (const i in partners) {
      let item = partners[i];
      let prev = map[item.cat_id];

      if (prev) {
        prev[item.store] = item;
      } else {
        let tmp = {};
        tmp[item.store] = item;
        map[item.cat_id] = tmp;
      }
    }

    // this.total = partners.length;
    store.partners = partners;
    store.categorys = map;
  },
  updateProfile(profile) {
    store.profile = profile;
    Utils.setAsync('profile', profile);
  },
  updateProduct(product) {
    if (status) {
      if (product.aff) {
        store.status = {
          text: 'Кэшбэк активирован',
          cl: 'status_green',
        };
      } else {
        store.status = {
          text: 'Неафиалитный товар',
          cl: 'status_orange',
        };
      }
    }
    store.currProduct = product;
  },
};

export async function init() {
  store.currStore = await Utils.currStore();
  store.actives = (await Utils.getAsync('actives')) || {};
  store.settings = (await Utils.getAsync('settings')) || {};
  store.profile = (await Utils.getAsync('profile')) || {};
  let partners = await Utils.getAsync('partners');

  mutations.updatePartners(partners);

  let storeObj = Utils.searchByKey(store.actives, store.currStore);
  let currActive = storeObj;

  if (storeObj) {
    store.currStore = storeObj.store;
  }

  if (currActive && currActive > new Date().getTime()) {
    store.status = {
      text: 'Кэшбэк активирован',
      cl: 'status_green',
    };
    store.isActivate = true;
  } else {
    storeObj = Utils.searchByKey(partners, store.currStore);
    if (storeObj) {
      store.currStore = storeObj.store;
      store.status = storeObj
        ? {
            text: 'Кэшбэк неактивизирован',
            cl: 'status_red',
          }
        : undefined;
    }
  }

  chrome.runtime.onMessage.addListener((data) => {
    switch (data.type) {
      case 'order':
        if (data.order) mutations.updateProduct(data.order);
        break;
    }
  });

  let last = await Utils.sendMessageAsync({ type: 'order' });
  if (last) {
    mutations.updateProduct(last);
  }

  // let timerId = setInterval(async () => {
  //   if (!store.status) return;
  //   let last = await Utils.getAsync("lastOrder");

  //   if (last) {
  //     mutations.updateProduct(last);
  //     clearInterval(timerId);
  //   }
  // }, 1000);
}
