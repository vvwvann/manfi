<template>
  <div class="container">
    <router-view></router-view>
    <div class="menu">
      <router-link to="/home" active-class="active" class="home">
        <img
          v-if="active == 'home'"
          src="@/assets/images/second-page/home.png"
          alt="Home"
        />
        <img
          v-else
          src="@/assets/images/second-page/home-disabled.png"
          alt="Home"
        />
      </router-link>
      <router-link to="/search" active-class="active" class="search">
        <img
          v-if="active == 'search'"
          src="@/assets/images/second-page/search.png"
          alt="Search"
        />
        <img
          v-else
          src="@/assets/images/second-page/search-disabled.png"
          alt="Search"
        />
      </router-link>
      <router-link to="/countries" active-class="active" class="countries">
        <img
          v-if="active == 'countries' || active == 'percel'"
          src="@/assets/images/second-page/countries.png"
          alt="Countries"
        />
        <img
          v-else
          src="@/assets/images/second-page/countries-disabled.png"
          alt="Countries"
        />
      </router-link>
      <router-link to="/profile" active-class="active" class="profile">
        <img
          v-if="active == 'profile'"
          src="@/assets/images/second-page/profile.png"
          alt="Profile"
        />
        <img
          v-else
          src="@/assets/images/second-page/profile-disabled.png"
          alt="Profile"
        />
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "Main",
  data() {
    return {
      active: "home",
    };
  },
  created() {
    this.$router.afterEach((to) => {
      /* must call `next` */
      // console.log(from, to);

      this.active = to.name;
    });
  },
};
</script>

<style>
.menu {
  display: flex;
  height: 46px;
  width: 100%;
  position: fixed;
  bottom: 4px;
  background: #fff;
  border-top: 0.8px solid #b1b1b1;
  z-index: 2000;
}

.active {
  border-bottom: 4px solid #59b359;
}

.home,
.search,
.profile,
.countries {
  width: 25%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.container {
  width: 100%;
  height: 509px;
  padding: 0;
  margin: 0;
}

header {
  width: 100%;
  display: block;
  padding: 0;
}

.polygon {
  position: absolute;
  top: 0;
}

.search {
  position: relative;
  flex-direction: column;
}

#app {
  display: block !important;
}
</style>
