<template>
  <aside>
    <el-row class="tac menu_wrap">
      <el-col :span="12" class="menu">
        <el-menu
          :default-active="$route.meta.light || $route.path"
          class="el-menu-vertical-demo"
          router
        >
          <div v-for="(item, index) in $router.options.routes" :key="index">
            <!-- 仅一级菜单 -->
            <el-menu-item v-if="!item.children || (item.children && item.meta.showChildren === false)" :index="item.path">
              <i v-if="item.meta.icon" :class="'el-icon-' + item.meta.icon"></i>
              <span slot="title">{{item.meta.title}}</span>
            </el-menu-item>
            <!-- 有二级菜单时 -->
            <el-submenu v-else :index="(index + 1).toString()">
              <template slot="title">
                <i v-if="item.meta.icon" :class="'el-icon-' + item.meta.icon"></i>
                <span slot="title">{{item.meta.title}}</span>
              </template>
              <div v-for="(item1, index1) in item.children" :key="index1">
                <!-- 仅二级菜单 -->
                <el-menu-item v-if="!item1.meta.showChildren" :index="item1.path">
                  <i v-if="item1.meta.icon" :class="'el-icon-' + item1.meta.icon"></i>
                  <span slot="title">{{item1.meta.title}}</span>
                </el-menu-item>
                <!-- 有三级菜单时 -->
                <el-submenu v-else :index="'1-' + (index1 + 1)">
                  <template slot="title">
                    <i v-if="item1.meta.icon" :class="'el-icon-' + item1.meta.icon"></i>
                    <span slot="title">{{item1.meta.title}}</span>
                  </template>
                    <el-menu-item v-for="(item2, index2) in item1.children" :index="item2.path" :key="index2">
                      <i v-if="item2.meta.icon" :class="'el-icon-' + item2.meta.icon"></i>
                      <span slot="title">{{item2.meta.title}}</span>
                    </el-menu-item>
                </el-submenu>
              </div>
            </el-submenu>
          </div>
        </el-menu>
      </el-col>
    </el-row>
  </aside>
</template>

<style lang="less" scoped>
aside {
  width: 240px;
  @media screen and (min-width: 1440px) {
    width: 300px;
  }
}
.menu_wrap {
  width: 100%;
  height: 100%;
}
.menu {
  width: 100%;
  height: 100%;
  .el-menu {
    height: 100%;
    overflow-y: auto;
  }
  .link {
    text-decoration: none;
  }
}
</style>