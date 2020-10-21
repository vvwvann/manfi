<template>
  <fragment>
    <div class="wrapper">
      <header class="search-panel" style="width: 105px">
        <router-link to="/countries">
          <img src="@/assets/images/settings/prev.png" alt="Previous" />
          <h6>Назад</h6>
        </router-link>
      </header>
    </div>

    <div v-if="info" class="content2" style="height: 540px">
      <div class="content-title"><h3>Мои посылки</h3></div>
      <div class="content2-text">
        <p><strong>Трек-номер:</strong> {{ $route.query.barcode }}</p>
        <!-- <p><strong>Почтовая служба:</strong> upu</p> -->
        <p><strong>Дней в пути:</strong> {{ info.days ? info.days : "-" }}</p>
        <p><strong>Страна отправления:</strong> {{ info.from }}</p>
        <p><strong>Страна назначения:</strong> {{ info.to }}</p>
        <p>
          <strong>Вес посылки (кг):</strong>
          {{ info.weight ? info.weight : "-/-" }}
        </p>
        <p>
          <strong>Статус отправления:</strong> <span>{{ info.status }}</span>
        </p>
      </div>
      <vue-scroll :ops="ops">
        <div class="content2-table">
          <div
            v-for="(item, index) in info.events"
            :key="index"
            class="content2-table-blok"
          >
            <div class="content2-table-blok-b1">
              <h3>{{ item.date }}</h3>
              <p>в {{ item.time }}</p>
              <img
                v-if="index == 0"
                class="img-circle1"
                src="@/assets/images/countries/circle-empty-green.png"
              />

              <img
                v-else
                class="img-circle1"
                src="@/assets/images/countries/circle-empty.png"
              />

              <img
                v-if="index == 0"
                class="img-circle2"
                src="@/assets/images/countries/circle-green.png"
              />
              <img
                v-else
                class="img-circle2"
                src="@/assets/images/countries/circle-grey.png"
              />
            </div>
            <div class="content2-table-blok-b2">
              <h3>{{ item.type }}</h3>
              <p>{{ item.address }}</p>
            </div>
          </div>
        </div>
      </vue-scroll>
    </div>
    <!-- <script src="../assets/scripts/profile.js"></script> -->
  </fragment>
</template>

<script>
import * as Api from "@/api";

export default {
  name: "Countries",
  data: function() {
    return {
      info: undefined,
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
          maxHeight: 300,
        },
        vuescroll: {
          wheelScrollDuration: 0,
          wheelDirectionReverse: false,
        },
      },
    };
  },
  mounted() {
    setTimeout(() => {
      document.querySelector("a.countries").classList.add("active");
    }, 100);
  },
  async created() {
    console.log(this);
    let res = await Api.track(this.$route.query.barcode);
    this.info = res;
  },
  destroyed() {
    document.querySelector("a.countries").classList.remove("active");
  },
};
</script>

<style scoped src="@/assets/styles/countries/index.css"></style>
<style scoped>
.img-circle1 {
  left: 128px;
}

.content2-table-blok-b1 {
  width: 132px;
}

.img-circle2 {
  left: 114px;
}

.content2-text {
  margin-left: 22px;
}

.content2 {
  overflow: hidden !important;
}

.wrapper {
  border-bottom: 0.5px solid #b1b1b1;
  height: 56px;
}

header > a {
  width: 85px;
  height: 10px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  text-decoration: none;
}

.container h6 {
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 16px;
  color: #6f6e88;
}

.search-panel {
  height: 56px;
  border-bottom: none;
}
</style>
