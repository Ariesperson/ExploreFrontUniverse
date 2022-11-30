<template>
  <div class="component-mynav">
    <module title="我的导航">
      <actions>
        <button
          status="ghost"
          @click="goMyNav"
          :text="subtitle"
          icon-right="x-icon-directive-rightarrow"
        ></button>
      </actions>
      <div class="component-mynav-remove" v-show="currentRemoveItem.style" :style="currentRemoveItem.style">
        取消收藏
      </div>
      <div class="mynav-wrapper">
        <div class="recent-wrapper" v-if="recentUse && recentUse.length > 0">
          <div class="recent-title">最近使用</div>
          <div class="recent-list">
            <div
              v-for="item in recentUse"
              :key="item.id"
              class="recent-item"
              @click="goRecentDetail(item)"
            >
              <span class="recent-item-title" :title="item.name">{{
                item.name
              }}</span>
            </div>
          </div>
          <div v-if="recentUse.length === 0" class="mynav-blank">
            <img
              src="https://img.dmallcdn.com/dshop/202112/94d6fe26-fd90-4484-8664-bda255dd0953"
              class="mynav-blank-img"
            />
            <div class="mynav-blank-text">
              <div class="first">暂无历史</div>
              <div class="second">你最近使用过的菜单将会展示在这里</div>
            </div>
          </div>
        </div>
        <div class="collect-wrapper">
          <div class="collect-title">
            <div>收藏菜单</div>
          </div>
          <div class="collect-list" v-if="collectionList.length > 0">
            <div
              v-for="item in collectionList"
              :key="item.id"
              class="collect-item"
            >
              <div class="collect-item-title">{{ item.name }}</div>
              <div class="collect-item-children">
                <div
                  :class="{
                    'collect-item-children-item': true,
                    'cursor-banned': !item1.valid,
                  }"
                  v-for="item1 in item.children"
                  :key="item1.id"
                  @click.stop="goDetail(item1)"
                >
                 <div class="item-children-delete">
                    <i
                      class="x-icon-notice-shixin "
                      @click.stop="deleteCollection(item1)"
                      @mouseenter="showRemoveNotice"
                      @mouseleave="hideRemoveNotice()"
                    ></i>
                 </div>
                  <span class="children-item-title" :title="item1.name">{{
                    item1.name
                  }}</span>
                  <span v-if="!item1.valid" class="item-title-invalid"
                    >失效</span
                  >
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="collectionList.length === 0"
            class="mynav-blank"
            style="margin-top: 46px"
          >
            <img
              src="https://img.dmallcdn.com/dshop/202112/94d6fe26-fd90-4484-8664-bda255dd0953"
              class="mynav-blank-img"
            />
            <div class="mynav-blank-text">
              <div class="first">暂无收藏</div>
              <div class="second">你收藏的菜单将会展示在这里</div>
            </div>
          </div>
        </div>
      </div>
    </module>
  </div>
</template>

<script>
import "./myNav.scss";
import http from "@/common/http";
import { getUserLocal, setUserLocal } from "@/common/utils";

export default SysComponent({
    components: {},
    props: {
        userInfo: {
            type: Object,
        },
    },
    data() {
        return {
            recentUse: [], // 最近使用数据
            collectionList: [], // 我的收藏列表
            collectionMap: {}, // 我的收藏map对象
            menuList: [], // 菜单数据
            showClearBtn: false, // 是否展示清除失效按钮
            subtitle: "更多", // 导航的副标题
            currentRemoveId: null,
            currentRemoveItem: { style: null }, // hover准备移除的收藏菜单
        };
    },
    computed: {},
    watch: {
        userInfo: {
            handler(val) {
                if (!val) {
                    return;
                }
                this.getRecentUse(val.userId);
                this.getMenuList(val);
            },
            immediate: true,

        },
    },
    mounted() {
        window.xPartnerMyNav = this.communicate;
        window.addEventListener('hashchange', () => {
            if (window.location.hash === '#index/dmall_fit_jichu_partner_front/homepage') {
                this.getRecentUse(this.userInfo.userId);
                this.fetchCollection();
            }
        });
    },
    methods: {
    // 绑定在window上与菜单的我的收藏通信
        communicate(type, param) {
            if (type == "changeSubTitle") {
                this.changeSubTitle(param);
                return;
            }
            this.fetchCollection();
        },
        // 获取菜单数据
        getMenuList() {
            http.get("getMenuData").then((res) => {
                if (res && res.code === "0000") {
                    this.menuList = res.data || [];
                    this.fetchCollection();
                }
            });
        },
        // 获取我的收藏数据
        fetchCollection() {
            http
                .get("fetchCollection")
                .then((res) => {
                    if (res && res.code === "0000") {
                        // collectionMap用于后续收藏删除,新增等
                        this.collectionMap = this.collectionToFlat(
                            JSON.parse(res.data || "[]"),
                        );
                        // collectionList用于渲染
                        this.collectionList = this.collectionToTree(this.collectionMap);
                        // 有失效的菜单显示失效按钮
                        let flag = false;
                        this.collectionList.forEach((item) => {
                            item.children.forEach((item1) => {
                                if (!item1.valid) {
                                    flag = true;
                                }
                            });
                        });
                        this.showClearBtn = flag;
                    }
                });
        },
        goDetail(item) {
            if (!item.valid) {
                return;
            }
            if (!item.url) {
                window.xPartnerMenu("goDetail", item);
                return;
            }
            this.saveRecent(item);

            window.xPartnerTabController.activeTab({
                path: item.url,
                name: item.name,
            });
        },

        // 点击更多触发
        goMyNav() {
            if (this.subtitle === "更多") {
                window.xPartnerMenu("openMyNav");
                this.subtitle = "收起";
            } else {
                window.xPartnerMenu("closeMyNav");
                this.subtitle = "更多";
            }
            // 埋点更多按钮点击事件
            window.xPartner_clickTrack(
                "x_partner_home_myNavToMore",
                "首页-我的收藏点击更多按钮",
            );
        },
        // 将我的导航副标题修改为更多
        changeSubTitle(subtitle) {
            this.subtitle = subtitle;
        },
        // 本地储存中取出最近使用
        getRecentUse(id) {
            const { recentHistory = [] } = JSON.parse(
                localStorage[`X_partner_${id}`] || "[]",
            );
            this.recentUse = recentHistory;
        },
        // 跳转最近使用详情页
        goRecentDetail(item) {
            this.saveRecent(item);
            window.xPartnerTabController.activeTab({
                path: item.url,
                name: item.name,
            });
            // CabinX.go(item.router)
        },
        // 将收藏数据平层化为map对象
        collectionToFlat(list) {
            const obj = new Map();
            list.forEach((item) => {
                item.children.forEach((item1) => {
                    item1.valid = false;
                    this.collectionJudge(item1.id, this.menuList, item1);
                    obj.set(item1.id, {
                        ...item1,
                        pData: {
                            icon: item.icon,
                            name: item.name,
                            url: item.router,
                            id: item.id,
                            level: 0,
                        },
                        pid: item.id,
                    });
                });
            });
            return obj;
        },
        // 判断是否为无效菜单,并且判断菜单名和路径有无变化
        collectionJudge(id, menuList, target) {
            menuList.forEach((item) => {
                if (item.id == id) {
                    // 如果在菜单中找到了这个id,则判断为有效的
                    target.valid = true;
                    // 对比菜单中该id的name和url和 collectionMap中是否有差异,有差异的话以菜单的为准
                    if (item.name != target.name) {
                        target.name = item.name;
                    }
                    if (item.router != target.url) {
                        target.url = item.router;
                    }
                } else if (item.children && item.children.length > 0) {
                    this.collectionJudge(id, item.children, target);
                }
            });
        },
        // 将对象map数据树状化为数组
        collectionToTree(mapObj) {
            const finalMenu = [];
            [...mapObj.entries()].forEach(([k, v]) => {
                const currentParent = finalMenu.find((m) => m.id === v.pData.id);
                if (currentParent) {
                    currentParent.children.push(v);
                } else {
                    finalMenu.push({
                        ...v.pData,
                        children: [v],
                    });
                }
            });
            console.log('收藏菜单的结构', finalMenu);
            return finalMenu;
        },
        // 取消收藏
        deleteCollection(item) {
            this.collectionMap.delete(item.id);
            const collectionList = this.collectionToTree(this.collectionMap);
            this.saveCollection(collectionList);
            CabinX.notice({ text: "已取消收藏", status: "success" });
            this.currentRemoveItem.style = null;
            // 埋点首页取消收藏
            window.xPartner_clickTrack(
                "x_partner_home_delCollection",
                "首页-取消收藏",
            );
        },
        // 保存我的收藏到后端
        saveCollection(collectionList) {
            http
                .post("saveCollection", {
                    venderId: this.userInfo.venderId,
                    json: JSON.stringify(collectionList),
                })
                .then((res) => {
                    if (res && res.code === "0000") {
                        if (res.success) {
                            this.fetchCollection();
                            window.xPartnerMenu("fetchCollection");
                        }
                    }
                });
        },
        // 我的收藏移除箭头hover
        showRemoveNotice(e) {
            this.currentRemoveItem.style = { top: `${e.clientY + 20}px`, left: `${e.clientX - 20}px` };
        },
        hideRemoveNotice() {
            this.currentRemoveItem.style = null;
        },
        // 加入到最近使用中
        saveRecent(item) {
            // 将跳转的页面保存到最近使用中
            const userHistory = getUserLocal(this.userInfo.userId);
            const { recentHistory } = userHistory;
            const recentItem = {
                name: item.name,
                url: item.url,
                id: item.id,
            };
            // 重复部分删除
            if (recentHistory.map((x) => x.id).includes(recentItem.id)) {
                const index = recentHistory
                    .map((x) => x.id)
                    .indexOf(recentItem.id);
                recentHistory.splice(index, 1);
            }
            recentHistory.unshift(recentItem);

            // 最长不超过9个数据
            if (recentHistory.length === 10) {
                recentHistory.pop();
            }
            userHistory.recentHistory = recentHistory;
            setUserLocal(this.userInfo.userId, userHistory);
        },
    },
});
</script>
