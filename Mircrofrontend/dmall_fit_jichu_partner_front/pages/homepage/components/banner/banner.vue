<template>
  <div class="banner-component">
    <div class="banner-component-group">
      <div v-for="(item, index) in bannerData" :key="index">
        <transition>
          <div
            class="banner-component-item"
            @click="jumpToDetail(item.url)"
            :style="`background: no-repeat url(${item.imgUrl}) center center ; `"
            v-if="index === currentIndex"
          >
            <span class="component-item-title">{{ item.title }}</span>
          </div>
        </transition>
      </div>
      <div class="indicator-list" v-if="bannerData.length > 1">
        <div
          :class="{
            'indicator-item': true,
            'checked-item': currentIndex === index,
            'last-item': index === bannerData.length - 1,
          }"
          v-for="(item, index) in bannerData"
          :key="item.msgId"
          @click.stop="chooseItem(index)"
        ></div>
      </div>
      <div
        @click="goDownload"
        v-if="bannerData.length === 0"
        class="banner-component-item"
        :style="`background: no-repeat url(${defaultBanner.imgUrl}) center center ; `"
      >
        <span class="component-item-title">{{ defaultBanner.title }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import "./banner.scss";
import http from "@/common/http";
import jumpToPublish from "@/common/hooks/useJumpPublish";

export default SysComponent({
    components: {},
    props: {},
    data() {
        return {
            bannerData: [],
            defaultBanner: {
                imgUrl:
          "https://img.dmallcdn.com/dshop/202112/ed9c9595-f723-43d3-8d9d-90c97cfdb730",
                title: "数字零售，引领未来",
                url: "",
            },
            currentIndex: 0,
        };
    },
    computed: {},
    watch: {},
    created() {
        this.fetchBannerData();
    },
    mounted() {
        addEventListener('hashchange', () => {
            if (window.location.hash === '#index/dmall_fit_jichu_partner_front/homepage') {
                this.fetchBannerData();
            }
        });
    },
    beforeDestroy() {
        clearInterval(this.timer);
    },
    methods: {
    // 从接口取轮播图是信息
        fetchBannerData() {
            // 重新取的时候，把指针所以归0
            this.currentIndex = 0;
            http.post("getNoticeInfo", { source: 2, type: 1 }).then((res) => {
                if (res && res.code === "0000") {
                    this.bannerData = res.data.slice(0, 5).map((item) => ({
                        msgId: item.msgId,
                        imgUrl: item.bannerImagePath,
                        url: item.actionUrl,
                        title: item.title,
                    }));
                    this.bannerMove();
                }
            });
        },
        // 让轮播图动起来
        bannerMove() {
            if (this.timer) {
                clearInterval(this.timer);
            }
            this.timer = setInterval(() => {
                // eslint-disable-next-line no-plusplus
                this.currentIndex++;
                if (this.currentIndex === this.bannerData.length) {
                    this.currentIndex = 0;
                }
            }, 3000);
        },
        jumpToDetail(url) {
            if (!url) {
                return;
            }
            window.xPartnerTabController.activeTab({
                path: url,
                name: "消息通知",
            });
        },
        chooseItem(index) {
            this.currentIndex = index;
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = setInterval(() => {
                    // eslint-disable-next-line no-plusplus
                    this.currentIndex++;
                    if (this.currentIndex === this.bannerData.length) {
                        this.currentIndex = 0;
                    }
                }, 3000);
            }
            window.xPartner_clickTrack(
                "x_partner_home_changeBanner",
                "首页-手动切换商家轮播图",
            );
        },
        goDownload() {
            jumpToPublish();
        },
    },
});
</script>
