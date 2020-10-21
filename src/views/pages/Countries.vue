<template>
  <fragment>
    <header class="search-panel">
      <img
        src="@/assets/images/third-page/search-disabled.png"
        alt="Search icon"
      />
      <input
        type="text"
        @input="find"
        placeholder="Укажите трек-номер посылки"
      />
    </header>

    <div v-if="parcels && parcels.length > 0" class="content2">
      <div class="content-title"><h3>Мои посылки</h3></div>
      <vue-scroll style="height: 400px" class="scroll-area" :ops="ops">
        <div
          v-for="(item, index) in parcels"
          :key="index"
          class="content2-block1"
        >
          <div
            @click="
              $router.push({
                path: '/percel',
                query: { barcode: item.track_id },
              })
            "
            class="content2-block1-1"
          >
            <p>
              <b>{{ item.name || item.track_id }}</b>
            </p>
            <p class="text-size1 text-color">{{ item.status }}</p>
            <p class="text-size1">{{ item.lastStatus }} {{ item.OperDate }}</p>
          </div>
          <div class="content2-block1-2">
            <div class="content2-button-block">
              <img
                @click="refresh"
                src="@/assets/images/countries/button1.png"
                alt="refresh"
              />
              <img
                @click="rename(item)"
                src="@/assets/images/countries/button2.png"
                alt="setting"
              />
              <img
                v-if="item.id"
                @click="remove(item.id)"
                src="@/assets/images/countries/button3.png"
                alt="delete"
              />
            </div>
          </div>
        </div>
      </vue-scroll>
    </div>

    <div v-else class="content">
      <img src="@/assets/images/countries/earth.png" alt="Earth" />
      <p>Здесь вы можете отследить международные почтовые отправления</p>
    </div>

    <transition name="modal" v-if="showModal">
      <div class="modal-mask">
        <div class="modal-wrapper">
          <div class="modal-container">
            <div class="modal-header">
              <slot name="header">
                <h3>Перименование посылки</h3>
              </slot>
            </div>

            <div class="modal-body">
              <slot name="body">
                <input
                  type="text"
                  v-model="currName"
                  class="field"
                  placeholder="Введите название посылки"
                />
              </slot>
            </div>

            <div class="modal-footer">
              <slot name="footer">
                <button
                  v-if="currName && currName != ''"
                  class="default-button"
                  @click="renameConfirm"
                >
                  Применить
                </button>
                <button
                  class="modal-default-button default-button"
                  @click="showModal = false"
                >
                  Отменить
                </button>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </fragment>
</template>

<script>
import * as Api from "@/api";
import * as Utils from "@/utils";

let _prev = [];

export default {
  name: "Countries",
  data() {
    return {
      showModal: false,
      currName: "",
      currPercel: undefined,
      parcels: [],
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
        },
        vuescroll: {
          wheelScrollDuration: 0,
          wheelDirectionReverse: false,
        },
      },
    };
  },
  methods: {
    async find(evt) {
      let value = evt.target.value;
      console.log("val: " + value);
      if (value == "") {
        this.parcels = this.parcels.slice(0, 0);
        this.parcels.push(..._prev);
        this.refresh();
        return;
      }

      for (let i in this.parcels) {
        const item = this.parcels[i];

        if (item && item.track_id == value && item.id) {
          _prev = [...this.parcels];
          this.parcels = this.parcels.slice(0, 0);
          this.parcels.push(item);
          return;
        }
      }

      const res = await Api.track(value);
      if (res) {
        let last = res.events[0];

        _prev = [...this.parcels];
        this.parcels = this.parcels.slice(0, 0);
        this.parcels.push({
          track_id: value,
          status: res.status,
          lastStatus: last.type,
          OperDate: last.date + " " + last.time,
        });
        //LC222113849CN
        Api.addPercel(value);
      } else {
        this.parcels = [];
      }
    },

    async refresh() {
      let parcels = (await Api.percelsAsync()) || [];

      let saves = await Utils.getAsync("percels");

      if (saves) {
        for (let i in parcels) {
          let item = parcels[i];
          let prev = saves[item.track_id];
          if (prev) {
            item.name = prev;
          }
        }
      }

      this.parcels = this.parcels.slice(0, 0);
      this.parcels.push(...parcels);
    },

    async remove(id) {
      await Api.removePercel(id);

      let index = -1;

      for (let i in this.parcels) {
        const item = this.parcels[i];

        if (item && item.id == id) {
          index = i;
          break;
        }
      }

      if (index != -1) {
        this.parcels.splice(index, 1);
      }

      await this.refresh();
    },

    rename(item) {
      this.currName = item.name || item.track_id;
      this.currPercel = item;
      this.showModal = true;
    },

    async renameConfirm() {
      this.currPercel.name = this.currName;
      this.showModal = false;

      let saves = await Utils.getAsync("percels");

      if (saves == undefined) saves = {};

      saves[this.currPercel.track_id] = this.currName;
      await Utils.setAsync("percels", saves);
    },
  },
  async created() {
    await this.refresh();
  },
};
</script>

<style scoped src="@/assets/styles/countries/index.css"></style>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 300px;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
}

.default-button {
  background: #59c059;
  border-radius: 20px;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 5px;
  align-items: center;
  text-align: center;
  color: #ffffff;
  padding: 15px 19px;
  justify-content: center;
  cursor: pointer;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

.field {
  width: 300px;
  border: 1px #9e9e9e solid;
  border-radius: 10px;
  height: 35px;
  padding: 0 0 0 15px;
}
</style>
