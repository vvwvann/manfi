<template>
  <div class="container">
    <div class="logo">
      <img src="@/assets/images/logo.png" alt="Manfi logo" />
    </div>
    <div class="cash-back">
      <img
        src="@/assets/images/first-page/cash-back-program.png"
        alt="Cash Back program image"
      />
    </div>
    <div class="content">
      <h2>Добро пожаловать!</h2>
      <h3>
        Ты сделал правильный выбор. <br />
        {{ $route.query.email }} - это твой следующий шаг в мир экономных и
        безопасных покупок
      </h3>
    </div>
    <button @click="$router.push('/search')" class="magazine-cash-back-button">
      <a href="#">Найти магазин с Кэшбэком</a>
      <!-- <router-link to="/search">Найти магазин с Кэшбеком</router-link> -->
    </button>
  </div>
</template>

<script>
export default {
  name: "Index",
};
</script>

<style scoped src="@/assets/styles/first-page/index.css"></style>
