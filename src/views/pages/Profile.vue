<template>
  <fragment>
    <vue-scroll style="height: 550px" class="scroll-area" :ops="ops" ref="vs">
      <div class="logo-and-settings">
        <img src="@/assets/images/logo.png" alt="Manfi logo" />
        <router-link to="/settings">
          <img src="@/assets/images/profile/settings.png" alt="settings"
        /></router-link>
      </div>
      <div class="user-content">
        <div v-if="info.profileImage" class="images">
          <img
            :src="
              `https://manfi.ru/${
                info.profileImage[0] == '/'
                  ? info.profileImage.substring(1)
                  : info.profileImage
              }`
            "
            width="100"
            height="100"
            alt="Profile"
          />
        </div>
        <div v-else class="images">
          <img src="@/assets/images/profile/profile.png" alt="Profile" />
          <img
            src="@/assets/images/profile/screen.png"
            alt="Screen"
            class="screen"
          />
        </div>
        <h3 id="mail">{{ info.name }}</h3>
        <!-- <h4>Уровень: <b>Новичок</b></h4> -->
        <h5>Вы сэкономили ${{ info.saved_amount }}</h5>
      </div>
      <div class="wrapper">
        <div class="money">
          <div class="money_b1">
            <div class="money_text">
              <p>На балансе</p>
              <h3>{{ info.balance || 0 }} USD</h3>
            </div>
            <div class="money_img">
              <img src="@/assets/images/profile/Ok.png" />
            </div>
          </div>
          <div class="money_b2">
            <div class="money_text">
              <p>Ожидает начисления</p>
              <h3>{{ info.p_balance || 0 }} USD</h3>
            </div>
            <div class="money_img">
              <img src="@/assets/images/profile/time.png" />
            </div>
          </div>
        </div>
      </div>
      <div class="friend">
        <img src="@/assets/images/third-page/friend.png" />
        <h3>Получи доход от друзей</h3>
        <h5>Пригласи друга и получай 50% <br />от суммы его Кэшбэка</h5>
        <div class="link">
          <input
            id="copy_link"
            type="text"
            :value="`https://manfi.ru/?ref=${userId}`"
          />
        </div>
        <button @click="copy">Скопировать ссылку</button>

        <div class="block_image">
          <h5>Поделитесь ссылкой для друга<br />в социальных сетях</h5>
          <a
            :href="
              `https://vk.com/share.php?url=https://manfi.ru/?ref=${userId}&title=Кэшбэк-сервис Manfi&utm_source=share2`
            "
            target="_blank"
            ><img src="@/assets/images/autotification/vk.png" alt="vk"
          /></a>
          <a
            :href="
              `https://connect.ok.ru/offer?url=https://manfi.ru/?ref=${userId}&utm_source=share2`
            "
            target="_blank"
            ><img
              src="@/assets/images/autotification/odnaklasniki.png"
              alt="odnaklasniki"
          /></a>
          <a
            :href="
              `https://twitter.com/intent/tweet?url=https://manfi.ru/?ref=${userId}&utm_source=share2`
            "
            target="_blank"
            ><img src="@/assets/images/autotification/twitter.png" alt="twitter"
          /></a>
          <a
            :href="
              `https://www.facebook.com/sharer.php?src=sp&u=https://manfi.ru/?ref=${userId}&utm_source=share2`
            "
            target="_blank"
            ><img
              src="@/assets/images/autotification/facebook.png"
              alt="facebook"
          /></a>
        </div>
      </div>
      <div class="question">
        <h3>Остались вопросы?</h3>
        <h5>
          Если нужна помощь, <br />перейди в раздел
          <a
            @click="
              openNewTab('https://manfi.ru/obrashchenie-v-sluzhbu-podderzhki')
            "
            href="#"
            >поддержки</a
          >
        </h5>
      </div>
    </vue-scroll>
  </fragment>
</template>

<script>
import { userInfo, U_ID } from "@/api";
import { store, mutations } from "@/store";

export default {
  name: "Profile",
  data() {
    return {
      userId: U_ID,
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
      info: {
        email: "",
        balance: 0,
        block: 0,
        profileImage: null,
      },
    };
  },

  methods: {
    copy() {
      let elem = document.getElementById("copy_link");
      elem.select();
      document.execCommand("copy");
      window.getSelection().removeAllRanges();
    },
    openNewTab(url) {
      chrome.tabs.create({ url });
      return false;
    },
  },

  async created() {
    // setExtState("/profile");
    const info = store.profile;

    if (info) {
      this.info = info;
    }

    let data = await userInfo();

    if (data) {
      data = data.user;
      this.info = data;
      mutations.updateProfile(data);
    }
  },
};
</script>

<style scoped src="@/assets/styles/profile/profile.css"></style>
