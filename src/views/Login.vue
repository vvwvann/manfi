<template>
  <div class="container">
    <div class="logo">
      <img src="@/assets/images/logo.png" alt="Manfi logo" />
    </div>
    <div class="content1">
      <h2>Войти</h2>
      <input
        type="text"
        v-model="login"
        size="40"
        class="field"
        placeholder="Введите Email"
      />
      <input
        type="password"
        v-model="password"
        size="40"
        class="field"
        placeholder="Введите пароль"
      />
      <button @click="loginUser" class="magazine-cash-back-button">
        <a href="#">Войти</a>
      </button>
      <p>
        <a
          href="#"
          @click="
            openNewTab('https://manfi.ru/index.php?option=com_users&view=reset')
          "
          >Забыли пароль?</a
        >
      </p>
    </div>
    <div class="content2">
      <p class="text1">Вход через соцсети</p>
      <div class="block_image">
        <a
          href="#"
          @click="
            openNewTab(
              'https://manfi.ru/component/slogin/provider/vkontakte/auth'
            )
          "
          ><img src="@/assets/images/autotification/vk.png" alt="vk"
        /></a>
        <a
          href="#"
          @click="
            openNewTab(
              'https://manfi.ru/component/slogin/provider/odnoklassniki/auth'
            )
          "
          ><img
            src="@/assets/images/autotification/odnaklasniki.png"
            alt="odnaklasniki"
        /></a>
        <a
          href="#"
          @click="
            openNewTab('https://manfi.ru/component/slogin/provider/google/auth')
          "
          ><img src="@/assets/images/autotification/gog.png" alt="google"
        /></a>
        <a
          href="#"
          @click="
            openNewTab(
              'https://manfi.ru/component/slogin/provider/facebook/auth'
            )
          "
          ><img src="@/assets/images/autotification/facebook.png" alt="facebook"
        /></a>
      </div>
      <p class="text1">Еще не зарегестрированы?</p>
      <p class="text2">
        <a href="#" @click="openNewTab('https://manfi.ru/join')"
          >Зарегистрироваться?</a
        >
      </p>
    </div>
  </div>
</template>

<script>
import * as Api from "@/api";
import * as Utils from "@/utils";
import { setAsync, getAsync, sendMessage } from "@/utils";
import { init, mutations } from "@/store";
import Notify from "@/notify";

export default {
  name: "Login",
  data() {
    return {
      // login: "testapi@manfi.ru",
      // password: "OSkd38299ll",
      login: "",
      password: "",
    };
  },
  methods: {
    openNewTab(url) {
      chrome.tabs.create({ url });
      return false;
    },
    async loginUser() {
      const response = await Api.login(this.login, this.password);

      if (response) {
        const first = true || !(await getAsync("first"));

        Api.init(response);

        let user = await Api.userInfo();

        if (!user) return;
        user = user.user;

        let partners = await Utils.updatePartners();

        if (!partners) return;

        mutations.updatePartners(partners);

        init();

        await setAsync("auth", response);
        if (first) {
          sendMessage({
            type: "notification",
            options: Notify.welcome,
          });
        }

        sendMessage({
          type: "api",
          auth: response,
        });

        sendMessage({
          type: "login",
          auth: response,
        });

        this.$router.push({
          path: "/index",
          query: { email: user.name },
        });
      }
    },
  },
};
</script>

<style scoped src="@/assets/styles/autotification/index.css"></style>
