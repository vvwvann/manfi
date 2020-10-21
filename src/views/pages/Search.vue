<template>
  <fragment>
    <header class="search-panel">
      <img
        src="@/assets/images/third-page/search-disabled.png"
        alt="Search icon"
      />
      <input type="text" placeholder="Найти магазин с Кэшбэком" @input="find" />
    </header>
    <section class="categories" :class="{ openCategories: searchOpen }">
      <div v-if="searchOpen" class="wrap" @click="searchOpen = false">
        <h4>
          Выберите категорию магазина
        </h4>
        <img
          src="@/assets/images/third-page/close-white.png"
          alt="Open categories"
        />
      </div>
      <div v-else class="wrap" @click="searchOpen = true">
        <h4>
          Выберите категорию магазина
        </h4>
        <img
          src="@/assets/images/third-page/downside.png"
          alt="Open categories"
        />
      </div>
      <div v-if="searchOpen" class="wrapper" @click="searchOpen = false">
        <!-- <vue-scroll :ops="ops1"> -->
        <div class="block" @click="selectCat()">
          <p class="text">Все магазины</p>
          <p class="number">{{ Object.keys(partners).length }}</p>
        </div>
        <div
          v-for="(item, key) in categorys"
          :key="key"
          class="block"
          @click="selectCat(item)"
        >
          <p class="text">{{ item[Object.keys(item)[0]].cat_title }}</p>
          <p class="number">{{ Object.keys(item).length }}</p>
        </div>
        <!-- </vue-scroll> -->
      </div>
    </section>
    <!-- <section class="categories">
      <div class="wrap" @click="openSearch">
        <h4>
          Выберите категорию магазина
        </h4>
        <img
          src="@/assets/images/third-page/downside.png"
          alt="Open categories"
          id="open"
        />
      </div>
    </section> -->
    <div v-if="!searchOpen" class="magazines">
      <div v-if="status" class="status">
        <div :class="status.cl">
          <p>{{ status.text }}</p>
        </div>
      </div>
      <vue-scroll :ops="ops2" ref="vs" :style="{ height: maxHeight + 'px' }">
        <div v-for="(item, index) in partners" :key="index" class="magazine">
          <img :src="item.images" :alt="`${item.title} logo`" />
          <h5>Ваш Кэшбэк</h5>
          <h3>до {{ item.cashback }}{{ item.dimension }}</h3>
          <!-- <h6>Подробнее</h6> -->
          <br />
          <button @click="activate(item)">Активировать Кэшбэк</button>
        </div>
      </vue-scroll>
    </div>
  </fragment>
</template>

<script>
import * as Utils from "@/utils";
import { store, mutations } from "@/store";

export default {
  name: "Search",
  data() {
    return {
      maxHeight: 380,
      searchOpen: false,
      ops1: {
        rail: {
          opacity: "0.2",
          background: "#cecece",
          border: "0px solid #cecece",
          size: "5px",
          keepShow: false,
        },
        bar: {
          background: "#cecece",
          keepShow: false,
          size: "5px",
          minSize: 0.2,
        },
        scrollButton: {
          enable: false,
          background: "#cecece",
        },
        scrollPanel: {
          easing: "easeInQuad",
          speed: 800,
          maxHeight: 390,
        },
        vuescroll: {
          wheelScrollDuration: 0,
          wheelDirectionReverse: false,
        },
      },
      ops2: {
        rail: {
          opacity: "0.2",
          background: "#cecece",
          border: "0px solid #cecece",
          size: "5px",
          keepShow: false,
        },
        bar: {
          background: "#cecece",
          keepShow: false,
          size: "5px",
          minSize: 0.2,
        },
        scrollButton: {
          enable: false,
          background: "#cecece",
        },
        scrollPanel: {
          easing: "easeInQuad",
          speed: 800,
        },
        vuescroll: {
          wheelScrollDuration: 0,
          wheelDirectionReverse: false,
        },
      },
      total: 0,
      partners: store.partners,
    };
  },
  computed: {
    categorys() {
      return store.categorys;
    },
    status() {
      return store.status;
    },
  },
  methods: {
    find(evt) {
      let value = evt.target.value;
      if (value == "") {
        this.searchOpen = false;
        this.partners = store.partners;
        return;
      }
      if (value.length == 1) {
        this.searchOpen = false;
      }
      value = value.toLowerCase();
      let res = {};

      for (let i in store.partners) {
        let item = store.partners[i];
        if (item.title.toLowerCase().indexOf(value) > -1) {
          res[item.store] = item;
        }
      }

      this.partners = res != {} ? res : store.partners;
    },
    selectCat(items) {
      this.partners = items || store.partners;
    },
    activate(partner) {
      Utils.activateStore(partner);
    },
  },
  mounted() {
    this.maxHeight = store.status ? 400 : 450;
    Utils.updatePartners().then((partners) => {
      mutations.updatePartners(partners);
    });
  },
};
</script>

<style scoped src="@/assets/styles/third-page/index.css"></style>
<style scoped>
.openCategories {
  height: 495px;
}
</style>
