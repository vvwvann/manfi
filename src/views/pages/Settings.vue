<template>
  <fragment>
    <div class="container">
      <div class="wrapper">
        <header>
          <router-link to="/profile">
            <img src="@/assets/images/settings/prev.png" alt="Previous" />
            <h6>Назад</h6>
          </router-link>
        </header>
      </div>
      <vue-scroll :ops="ops" ref="vs">
        <fragment v-for="(item, i) in settings" :key="i">
          <h3>{{ item.name }}</h3>
          <div class="blocks">
            <div v-for="(opt, j) in item.items" :key="j" class="block">
              <div class="input">
                <label>
                  <input type="checkbox" v-model="opt.value" />
                  <span @click="change" class="check-mark"></span>
                </label>
              </div>
              <h6>
                {{ opt.text }}
              </h6>
            </div>
          </div>
        </fragment>
      </vue-scroll>
    </div>
  </fragment>
</template>

<script>
import { settings } from "@/settings";
import { store, mutations } from "@/store";

export default {
  data() {
    return {
      settings: [],
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
        },
        scrollButton: {
          enable: false,
          background: "#cecece",
        },
        scrollPanel: {
          easing: "easeInQuad",
          speed: 800,
          maxHeight: 544,
        },
        vuescroll: {
          wheelScrollDuration: 0,
          wheelDirectionReverse: false,
        },
      },
    };
  },
  created() {
    const curr = store.settings || {};

    for (const i in settings) {
      const item = settings[i];
      for (const j in item.items) {
        const opt = item.items[j];
        const value = curr[opt.id];
        opt.value = value !== undefined ? value : opt.default;
      }

      this.settings.push(item);
    }
  },
  methods: {
    change() {
      setTimeout(() => {
        console.log("change-set");
        const tmp = {};
        for (const i in this.settings) {
          const item = this.settings[i];
          for (const j in item.items) {
            const opt = item.items[j];
            tmp[opt.id] = opt.value;
          }
        }

        mutations.updateSettings(tmp);
      }, 200);
    },
  },
};
</script>

<style scoped src="@/assets/styles/settings/settings.css"></style>
<style scoped>
.container {
  height: 600px !important;
}
.container h6 {
  font-size: 16px !important;
}

.block h6 {
  font-weight: 600 !important;
  font-size: 14px !important;
}
</style>
