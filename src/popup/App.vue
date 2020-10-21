<template>
  <router-view></router-view>
</template>

<script>
import * as Api from "@/api";
import { init, store } from "@/store";

import * as Utils from "@/utils.js";

export default {
  name: "App",
  async created() {
    let auth = await Utils.getAsync("auth");

    let url = "/login";

    if (auth) {
      await init(); // initialize store
      if (!store.isActivate) await Utils.tryActivateSpec(store.currStore);

      Api.init(auth);
      Utils.sendMessage({
        type: "api",
        auth,
      });

      url = "/home";
    } else {
      url = "/login";
    }

    this.$router.push(url);
  },
};
</script>

<style>
html {
  width: 420px;
  height: 600px !important;
}

body {
  height: 600px !important;
  width: 420px;
  display: flex;
}
.container {
  height: 554px !important;
}
</style>
