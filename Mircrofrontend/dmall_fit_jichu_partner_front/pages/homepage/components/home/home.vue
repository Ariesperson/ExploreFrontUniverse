<template>
  <div class="home">
    <!-- 新人引导区域 -->
    <div class="home-fresh" v-if="this.freshStep && this.freshStep < 6">
      <!-- 新人引导动态border区域 -->
      <div class="home-fresh-border" id="home-fresh-border"></div>
      <div class="home-fresh-border" id="home-fresh-border2"></div>
      <!-- 新人引导提示框区域 -->
      <div class="home-fresh-pop" :style="freshPosition">
        <freshPop
          v-for="(item, index) in freshPopList"
          :key="index"
          v-bind="item"
          v-show="item.progress == freshStep"
          @changeStep="changeStep"
          :stepAmount="freshPopList.length"
          @finishStep="finishStep"
        ></freshPop>
      </div>
      <!-- 新人引导遮罩区域 -->
      <div class="home-fresh-cover" id="home-fresh-cover"></div>
    </div>
    <div class="home-wrapper">
      <div class="module1">
        <div class="banner">
          <banner></banner>
        </div>
        <div class="mynav" id="xpartner-home-mynav">
          <myNav :userInfo="userInfo"></myNav>
        </div>
      </div>
      <div class="module2">
        <!-- <div class="college">
          <college :userInfo="userInfo"></college>
        </div> -->
        <div class="home-help">
          <helpCenter :userInfo="userInfo"></helpCenter>
        </div>
        <div class="download">
          <module title="客户端下载">
            <actions>
              <!-- <div class="more" >
                <span>下载</span>
                <i class="x-icon-directive-rightarrow"></i>
              </div> -->
              <button status="ghost"  @click="goDownload" text="下载" icon-right="x-icon-directive-rightarrow"></button>
            </actions>
            <div class="download-list">
              <img
                class="download-item"
                v-for="item in downloadList"
                :key="item.id"
                :src="item.url"
                @click="goDownload"
              />
            </div>
          </module>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import http from '@/common/http';
import './home.scss';
import banner from '../banner/banner.vue';
import college from '../college/college.vue';
// import helpCenter from '../helpCenter/helpCenter.vue';
import helpCenter from '../helpCenterTemp/helpCenter.vue';
import myNav from '../myNav/myNav.vue';
import freshPop from '../freshPop/freshPop.vue';
import useJumpPublish from '@/common/hooks/useJumpPublish';

export default SysComponent({
    components: {
        banner, college, helpCenter, myNav, freshPop,
    },
    props: {},
    data() {
        return {
            isInit: true,
            userInfo: {}, // 获取当前登录者的信息，作为数据源传递给子组件使用
            downloadList: [
                {
                    url: 'https://img.dmallcdn.com/dshop/202209/f27c0db2-e4e2-4a75-bd7f-f0d4db674e92',
                    id: 1,
                },
            ], // 客户端下载列表中都每项
            freshStep: 0, // 用户新人引导进度
            freshPopList: [
                {
                    title: '菜单栏',
                    content: '这里可查看全部菜单，并且支持菜单收藏哦~',
                    progress: 1,
                },
                {
                    title: '我的导航',
                    content: '这里可查看最近使用和收藏的菜单',
                    progress: 2,
                },
                {
                    title: '搜索',
                    content: '这里可快速搜索你要使用的菜单',
                    progress: 3,
                },
                {
                    title: '通知中心',
                    content: '这里可查看未读消息，处理工单和任务',
                    progress: 4,
                },
                {
                    title: '个人中心',
                    content: '这里可进行密码修改，退出登录等操作',
                    progress: 5,
                },
            ],
        };
    },
    computed: {
        freshPosition() {
            switch (this.freshStep - 0) {
                case 1:
                    return { top: '248px', left: '83px' };
                case 2:
                    return { top: '64px', left: '83px' };
                case 3:
                    return { top: '45px', right: '440px' };
                case 4:
                    return { top: '56px', right: '445px' };
                case 5:
                    return { top: '56px', right: '416px' };
                default:
                    break;
            }
        },
    },
    watch: {
        freshStep(val) {
            if (!this.isInit) {
                this.initStep();
            }
            switch (val - 0) {
                case 1:
                    this.firstStep();
                    break;
                case 2:
                    this.secondStep();
                    break;
                case 3:
                    this.thirdStep();
                    break;
                case 4:
                    this.fourthStep();
                    break;
                case 5:
                    this.fifthStep();
                    break;
                default:
                    break;
            }
        },
    },

    created() {},
    async mounted() {
        await this.fetchVenderInfo();
        this.fetchFreshStatus();
    },
    methods: {
    // 获取登录用户新人引导标识
        fetchFreshStatus() {
            setTimeout(() => {
                const freshStatusStr = localStorage[`xPartnerFresh_${this.userInfo.userId}`];
                // 如果本地储存没有新人状态的话,新建一个并且直接开始第一步
                if (!freshStatusStr) {
                    localStorage[`xPartnerFresh_${this.userInfo.userId}`] = '{"main":false,"collect":false,"expand":false}';
                    this.freshStep = 1;
                    this.firstStep();
                    return;
                }
                // 如果已经完成了主流程,不进行新人教程
                if (
                    JSON.parse(localStorage[`xPartnerFresh_${this.userInfo.userId}`]).main
                ) {
                    return;
                }
                // 从第一步开始
                this.freshStep = 1;
            }, 200);
        },
        goDownload() {
            useJumpPublish();
            // 埋点客户端下载
            window.xPartner_clickTrack('x_partner_home_goDownload', '首页-点击客户端下载');
        },
        // 获取登录用户信息
        async fetchVenderInfo() {
            return http.get('getUserInfo').then((res) => {
                if (res && res.code === '0000') {
                    this.userInfo = res.data || {};
                }
            });
        },
        // 改变目前的阶段
        changeStep(value) {
            this.freshStep += value;
        },
        // 结束新人引导
        finishStep() {
            const obj = JSON.parse(localStorage[`xPartnerFresh_${this.userInfo.userId}`]);
            obj.main = true;
            localStorage[`xPartnerFresh_${this.userInfo.userId}`] = JSON.stringify(obj);
            this.freshStep = 6;
            document.getElementById('J_Partner_Header').style.zIndex = 1000;
            document.getElementById('J_Partner_Menu').style.zIndex = 1000;
        },
        // 获取初始化属性
        initStep() {
            document.getElementById('xpartner-home-mynav').style.zIndex = 'auto';
            document.getElementById('J_Partner_Menu').style.zIndex = 1000;
            document.getElementById('first-menu-id_-1').style.zIndex = '';
            document.getElementById('xpartner_header_input').style.zIndex = '';
            document.getElementById('xpartner_header_notice').style.zIndex = '';
            document.getElementById('xpartner_header_center').style.zIndex = '';
            document.getElementById('home-fresh-border2').style.cssText = 'border:none';
        },
        // 第一步
        firstStep() {
            this.$nextTick(() => {
                const JMenu = document.getElementById('J_Partner_Menu');
                JMenu.style.zIndex = 10000;
                document.getElementById('J_Partner_Header').style.zIndex = 'auto';
                const {
                    width, top, left, height,
                } = JMenu.getBoundingClientRect();
                const a = document.getElementById('home-fresh-border');
                document.getElementById(
                    'home-fresh-border',
                ).style.cssText = `width:${width}px;top:${top}px;left:${left}px;height:${height}px;position:'fixed'`;
            });
        },
        // 第二步
        secondStep() {
            this.isInit = false;
            const JMenu = document.getElementById('J_Partner_Menu');
            JMenu.style.zIndex = 10000;
            const menuCollect = document.getElementById('first-menu-id_-1');
            const {
                width, top, left, height,
            } = menuCollect.getBoundingClientRect();

            document.getElementById(
                'home-fresh-border',
            ).style.cssText = `width:${width}px;top:${top}px;left:${left}px;height:${height}px;position:'fixed'`;
            document.getElementById(
                'home-fresh-border2',
            ).style.cssText = `left:0px;top:48px;width:${
                `${JMenu.clientWidth}px`
            };height:${`${JMenu.clientHeight}px`};border:none`;
        },
        // 第三步
        thirdStep() {
            const headerInput = document.getElementById('xpartner_header_input');
            headerInput.style.zIndex = '10000';
            const {
                width, top, left, height,
            } = headerInput.getBoundingClientRect();
            document.getElementById(
                'home-fresh-border',
            ).style.cssText = `width:${width}px;top:${top}px;left:${left}px;height:${height}px;position:'fixed'`;
        },
        // 第四步
        fourthStep() {
            const headerNotice = document.getElementById('xpartner_header_notice');
            headerNotice.style.zIndex = '10000';
            const {
                width, top, left, height,
            } = headerNotice.getBoundingClientRect();
            document.getElementById(
                'home-fresh-border',
            ).style.cssText = `width:${width}px;top:${top}px;left:${left}px;height:${height}px;position:'fixed'`;
        },
        // 第五步
        fifthStep() {
            const headerCenter = document.getElementById('xpartner_header_center');
            headerCenter.style.zIndex = '10000';
            const {
                width, top, left, height,
            } = headerCenter.getBoundingClientRect();
            document.getElementById(
                'home-fresh-border',
            ).style.cssText = `width:${width}px;top:${top}px;left:${left}px;height:${height}px;position:'fixed'`;
        },
    },
});
</script>
