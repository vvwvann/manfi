<template>
  <fragment>
    <header v-if="status">
      <div class="status">
        <div :class="status.cl">
          <p>{{ status.text }}</p>
        </div>
      </div>
    </header>
    <vue-scroll v-if="status" :ops="ops" :style="{ height: maxHeight + 'px' }">
      <div
        style="height: auto"
        class="magazines"
        v-if="info && info.description"
      >
        <div class="magazine2">
          <img
            v-if="info.img"
            :src="getImgUrl(info.img)"
            :alt="`${info.title} logo`"
          />
          <div v-if="info.percent">
            <h5>Ваш Кэшбэк</h5>
            <h3 v-if="info.percent">до {{ info.percent }}%</h3>
            <div class="magazine2_buttons" style="cursor: pointer">
              <h6 @click="openMore">Подробнее</h6>
            </div>
          </div>
          <div v-else class="magazine2_buttons">
            <div class="magazine2_buttons_b1" @click="hintInfo">
              <img src="@/assets/images/third-page/voskl-orandg.png" />
              <h5>Неаффилиатный товар</h5>
            </div>
            <div class="magazine2_buttons_b2">
              <h6 @click="openMore">Подробнее</h6>
            </div>
          </div>
        </div>
        <fragment v-if="hintActive">
          <div class="hint-treug"></div>
          <div class="hint">
            <p>
              Неаффилиатный товар – это товар, который не участвует в
              партнерской программе Aliexpress
            </p>
          </div>
        </fragment>
        <div v-if="info.description && more" class="magazine_item">
          <div class="magazine_item_b1">
            <img width="145" height="145" :src="info.image" />
          </div>
          <div class="magazine_item_b2">
            <p>
              {{ info.description }}
            </p>
            <div v-if="settings[2] && info.sum" class="cashback">
              <h3>Кэшбэк: {{ info.sum }}</h3>
            </div>
            <div v-if="settings[1] && info.rait" class="stars">
              <img
                v-for="index in 5"
                :key="index"
                :src="
                  index <= info.rait / 2
                    ? getImgUrl('images/third-page/star-green.png')
                    : getImgUrl('images/third-page/star-white.png')
                "
              />
              <p v-if="settings[1]">Рейтинг продавца: {{ info.rait }}</p>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="magazine">
        <img :src="info.partner.images" :alt="`${info.partner.title} logo`" />
        <h5 v-if="settings[3]">Ваш Кэшбэк</h5>
        <h3 v-if="settings[3]">
          до {{ info.partner.cashback }}{{ info.partner.dimension }}
        </h3>
        <!-- <h6>Подробнее</h6> -->
        <br />
        <button
          v-if="status && status.cl == 'status_red'"
          @click="activate(info.partner)"
        >
          Активировать Кэшбэк
        </button>
      </div>
      <div class="friend">
        <img src="@/assets/images/third-page/friend.png" />
        <h3>Кэшбэк-ссылка для друга</h3>
        <div v-if="link" class="link">
          <input id="copy_link" type="text" :value="link" />
        </div>
        <h5 v-else>
          Поделись ссылкой с другом <br />
          и получишь кэшбэк от его покупки
        </h5>
        <button @click="copy" v-if="link">Копировать ссылку</button>
        <button @click="generateUrl" v-else>
          Создать ссылку
        </button>
      </div>
    </vue-scroll>
    <div v-else style="z-index: 2002">
      <div class="logo">
        <img src="@/assets/images/logo.png" alt="Manfi logo" />
      </div>
      <div class="content">
        <h4>Упс! <br />На этом сайте нет Кэшбэка...</h4>
      </div>
      <div v-if="hintSearch" class="helper-text">
        <h3>
          Найдите магазин, в котором хотите совершить <br />
          покупку и получить Кэшбэк
        </h3>
        <img
          @click="hintSearch = false"
          src="@/assets/images/second-page/close.png"
          alt="Close icon"
        />
        <img
          src="@/assets/images/second-page/polygon.png"
          alt="Polygon"
          class="polygon"
        />
      </div>
    </div>
  </fragment>
</template>

<script>
import { store } from "@/store";
import * as Api from "@/api";
import * as Utils from "@/utils";

export default {
  name: "Home",

  data() {
    return {
      more: true,
      hintActive: false,
      maxHeight: 502,
      hintSearch: true,
      settings: {
        "1": true,
        "2": true,
        "3": true,
        "4": true,
        "5": true,
        "6": true,
      },
      link: undefined,
      ops: {
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
          // disable: true,
        },
        scrollButton: {
          enable: false,
          background: "#cecece",
        },
        scrollPanel: {
          easing: "easeInQuad",
          speed: 200,
          // maxHeight: 462,
        },
        vuescroll: {
          wheelScrollDuration: 0,
          wheelDirectionReverse: false,
        },
      },
    };
  },
  computed: {
    status() {
      return store.status;
    },
    info() {
      return store.currProduct;
    },
  },
  methods: {
    copy() {
      let elem = document.getElementById("copy_link");
      elem.select();
      document.execCommand("copy");
      window.getSelection().removeAllRanges();
    },
    openMore() {
      this.more = !this.more;
    },
    hintInfo() {
      this.hintActive = !this.hintActive;
    },
    getImgUrl(pic) {
      return require("@/assets/" + pic);
    },
    activate(partner) {
      Utils.activateStore(partner);
    },
    async generateUrl() {
      if (this.info) {
        if (this.info.url) {
          this.link = this.info.url;
        } else {
          let response = await Api.deplink(
            this.info.tabUrl,
            this.info.partner.pid
          );
          if (response) {
            this.link = response.url;
          }
        }
      }
    },
  },
  created() {
    let settings = store.settings;
    if (settings)
      for (let i in settings) {
        this.settings[i] = settings[i];
      }

    console.log("set:", settings);
  },
};
</script>

<style scoped src="@/assets/styles/profile/profile.css"></style>
<style scoped src="@/assets/styles/third-page/index.css"></style>
<style scoped>
.content {
  height: 442px;
}

.content > h4 {
  font-family: "Montserrat", Arial, sans-serif;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  padding-top: 85px;
}

.logo {
  width: 420px;
  padding: 21px 21px 0 21px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 20px;
}

.helper-text > h3 {
  font-family: "Montserrat", Arial, sans-serif;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  width: 420px;
}

.helper-text {
  display: flex;
  background: #e5e5e5;
  padding: 9.5px 0;
  z-index: 2001;
}

.helper-text img {
  cursor: pointer;
}

.polygon {
  position: absolute;
  top: 547px;
  left: 141px;
  z-index: 2002;
}

.magazine2 {
  height: auto !important;
  padding: 0 !important;
}

.magazine {
  height: auto !important;
}

.magazine2_buttons_b1,
.magazine2_buttons_b2 {
  cursor: pointer;
}
</style>
