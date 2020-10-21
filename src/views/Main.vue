<template>
  <div class="container">
    <div class="small">
      <img src="@/assets/images/main/small-gray.png" alt="Small Logo" />
      <img src="@/assets/images/main/small-green.png" alt="Small Logo" />
    </div>
    <div class="middle">
      <img src="@/assets/images/main/middle-gray.png" alt="Middle logo" />
      <img src="@/assets/images/main/middle-green.png" alt="Middle logo" />
    </div>
    <div class="large">
      <img src="@/assets/images/main/large-gray.png" alt="Large logo" />
      <img src="@/assets/images/main/large-green.png" alt="Large logo" />
    </div>
  </div>
</template>

<script>
export default {
  name: "Main",

  created() {
    setTimeout(() => {
      this.$router.push("/index");
    }, 2000);
  },

  destroyed() {},
};
</script>

<style scoped src="@/assets/styles/main/main.css"></style>
