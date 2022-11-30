<template>
  <div class="component-helpCenter">
    <module title="帮助中心">
      <actions>
         <button status="ghost"  @click="goHelpCenter" v-if="helpAuth" text="更多" icon-right="x-icon-directive-rightarrow"></button>
      </actions>
      <tabs
        :value="activeTab"
        height="100%"
        @changed="tabChanged"
        v-if="helpAuth"
      >
        <pannel title="最新" name="recent">
          <div class="help-list" v-if="recentIssues.length > 0">
            <div
              v-for="item in recentIssues"
              :key="item.id"
              class="help-item"
              @click="itemClick(item.id)"
            >
              <div class="help-item-title">{{ item.title }}</div>
              <div class="help-item-time">{{ item.updateTime }}</div>
            </div>
          </div>
          <div v-else class="help-center-blank">
            <img
              src="https://img.dmallcdn.com/dshop/202112/94d6fe26-fd90-4484-8664-bda255dd0953"
              class="help-center-blank-img"
            />
            <div class="help-center-blank-text1">暂无数据</div>
          </div>
        </pannel>
        <pannel title="最热门" name="hot">
          <div class="help-list" v-if="hotIssues.length > 0">
            <div
              v-for="item in hotIssues"
              :key="item.id"
              class="help-item"
              @click="itemClick(item.id)"
            >
              <div class="help-item-title">{{ item.title }}</div>
              <div class="help-item-time">{{ item.updateTime }}</div>
            </div>
          </div>
          <div v-else class="help-center-blank">
            <img
              src="https://img.dmallcdn.com/dshop/202112/94d6fe26-fd90-4484-8664-bda255dd0953"
              class="help-center-blank-img"
            />
            <div class="help-center-blank-text1">暂无数据</div>
          </div>
        </pannel>
      </tabs>
      <div v-if="!helpAuth" class="help-center-noauth">
        <img
          src="https://img.dmallcdn.com/dshop/202112/d9dbc0ca-cbdf-4140-9dfc-b44a9cf0f49f"
          class="help-center-noauth-img"
        />
        <div class="help-center-noauth-text1">暂无权限</div>
        <div class="help-center-noauth-text2">请联系管理员开启权限</div>
      </div>
    </module>
  </div>
</template>

<script>
import './helpCenter.scss';
import http from '@/common/http';

export default SysComponent({
    components: {},
    props: {
        userInfo: {
            type: Object,
            default() {
                return {};
            },
        }, // 商家数据
    },
    data() {
        return {
            activeTab: 'recent', // 目前选中都tab
            hotIssues: [], // 最热的数据
            recentIssues: [], // 最新数据
            appKey: {
                appId: 'fdd802102ccd45b8bc84a2e86c9af83b', // 来客平台调用的appid和secret
                appSecret: '36B3AB1DCD2B16F31A5C893B3CF17058',
            },
            helpAuth: false,
        };
    },
    computed: {},
    watch: {
        userInfo(val) {
            if (!val) {

            }
            // this.fetchHotIssue(val);
            // this.fetchRecentIssue(val);
        },
    },
    mounted() {
        // TODO fetchHelpCenterAuth 临时关闭 FIT 未部署接口，部署后续打开
        // this.fetchHelpCenterAuth();
    },
    methods: {
    // 点击更多去帮助中心
        goHelpCenter() {
            // window.open("#index/help_center_new/HelpBook");
            window.xPartnerTabController.activeTab({
                path: '#index/help_center_new/index',
                name: '帮助中心',
            });
            // 埋点帮助中心更多按钮
            window.xPartner_clickTrack('x_partner_home_helpToMore', '首页-帮助中心点击更多按钮');
        },
        // 点击单条消息触发
        itemClick(id) {
            const { appId, appSecret } = this.appKey;

            window.xPartnerTabController.activeTab({
                path: `#index/help_center_new/HelpBook:appId=${appId}&appSecret=${appSecret}&id=${id}`,
                name: '帮助中心',
            });
        },
        // 获取最热数据
        fetchHotIssue(userInfo) {
            http
                .post('hotIssue', {
                    appId: this.appKey.appId,
                    appSecret: this.appKey.appSecret,
                    clientType: 1,
                    contentType: 0,
                    venderId: userInfo.venderId,
                })
                .then((res) => {
                    if (res && res.code === '0000') {
                        this.hotIssues = res.data;
                    }
                });
        },
        // 获取最新数据
        fetchRecentIssue(userInfo) {
            http
                .post('searchResult', {
                    appId: this.appKey.appId,
                    appSecret: this.appKey.appSecret,
                    keyWord: '',
                    orderType: 0,
                    clientType: 1,
                    contenType: 0,
                    pageNum: 1,
                    pageSize: 10,
                    venderId: userInfo.venderId,
                })
                .then((res) => {
                    if (res && res.code === '0000') {
                        this.recentIssues = res.data.list;
                    }
                });
        },
        // 切换tab栏触发
        tabChanged(val) {
            this.activeTab = val;
            this.fetchActiveData();
            // 埋点切换最新tab/最热门tab
            if (val === 'recent') {
                window.xPartner_clickTrack('x_partner_home_helpToRecentTab', '首页-帮助中心切换到最新tab');
            } else {
                window.xPartner_clickTrack('x_partner_home_helpToHotTab', '首页-帮助中心切换到最热门tab');
            }
        },
        // 更新当前tab的数据
        fetchActiveData() {
            if (this.activeTab == 'recent') {
                this.fetchRecentIssue(this.userInfo);
            } else {
                this.fetchHotIssue(this.userInfo);
            }
        },
        // 获取帮助中心权限
        fetchHelpCenterAuth() {
            http.post('helpCenter').then((res) => {
                if (res && res.code === '0000') {
                    if (res.data && res.data.length > 0) {
                        const helpCenterAuth = res.data.filter(
                            (item) => item.privilegeCode == 'partner_top_are_help_center_btn',
                        );
                        if (helpCenterAuth.length > 0) {
                            this.helpAuth = helpCenterAuth[0].hasPermission;
                        }
                    }
                }
            });
        },
    },
});
</script>
