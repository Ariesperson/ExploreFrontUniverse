<template>
  <div class="component-college">
    <module title="学么">
      <actions >
          <button status="ghost"  @click="goCollege"  text="更多" icon-right="x-icon-directive-rightarrow"></button>
      </actions>
      <tabs :value="currentTab" height="100%" @changed="tabChanged" >
        <pannel title="最新课程" name="newCourse">
          <div class="college-list" v-if="recentData.length > 0">
            <college-item
              v-for="(item, index) in recentData"
              @click.native="goDetail(item, 'last')"
              :key="index + item.cid"
              :title="item.ctTitle"
              :score="item.ctCredit"
              :peopleAmount="item.ctStudyNum"
              :courseCount="item.ctHourNum"
              :viewCount="item.ctViewNum"
              :imgUrl="item.ctPictureUrl"
              :ctCourseValidityDate="item.ctCourseValidityDate"
              :ctSpeaker="item.ctSpeaker"
            ></college-item>
          </div>
          <div v-else class="college-blank">
            <img
              src="https://img.dmallcdn.com/dshop/202112/94d6fe26-fd90-4484-8664-bda255dd0953"
              class="college-blank-img"
            />
            <div class="college-blank-text1">暂无数据</div>
          </div>
        </pannel>
        <pannel title="推荐课程" name="recommendCourse">
          <div class="college-list" v-if="recommendData.length > 0">
            <college-item
              v-for="(item, index) in recommendData"
              @click.native="goDetail(item, 'recommend')"
              :key="index + item.tcId"
              :title="item.tcTitle"
              :score="item.tcCredit"
              :peopleAmount="item.tcTopicNum"
              :courseCount="item.tcResourcesNum"
              :viewCount="item.tcViewNum"
              :imgUrl="item.tcPitcureUrl"
              :ctCourseValidityDate="item.tcCourseValidityDate"
              :ctSpeaker="item.tcManagerName"
            ></college-item>
          </div>
          <div v-else class="college-blank">
            <img
              src="https://img.dmallcdn.com/dshop/202112/94d6fe26-fd90-4484-8664-bda255dd0953"
              class="college-blank-img"
            />
            <div class="college-blank-text1">暂无数据</div>
          </div>
        </pannel>
      </tabs>
       <!-- <div  class="college-noauth">
        <img
          src="https://img.dmallcdn.com/dshop/202112/d9dbc0ca-cbdf-4140-9dfc-b44a9cf0f49f"
          class="college-noauth-img"
        />
        <div class="college-noauth-text1">未启用学么</div>
        <div class="college-noauth-text2">请联系管理员开启权限</div>
      </div> -->
    </module>
  </div>
</template>

<script>
import './college.scss';
import http from '@/common/http';
import collegeItem from './Item.vue';

export default SysComponent({
    components: {
        'college-item': collegeItem,
    },
    props: {
        userInfo: {
            type: Object,
        },
    },
    data() {
        return {
            currentTab: 'newCourse',
            listData: [],
            recentData: [], // 最新课程数据
            recommendData: [], // 推荐课程数据
        };
    },
    computed: {},
    watch: {

    },
    mounted() {
        this.fetchCourseData();
    },
    methods: {

        fetchCourseData() {
            switch (this.currentTab) {
                case 'newCourse':
                    this.fetchRecentData();
                    break;

                case 'recommendCourse':
                    this.fetchRecommendData();
                    break;
                default:
                    break;
            }
        },
        // 跳转学么首页
        goCollege() {
            let url;
            if (window.location.href.includes('test')) {
                url = 'https://testuat-xue.dmall.com/docking/dmallUser/goSsologinAdmin';
            } else {
                url = 'https://xue.dmall.com/docking/dmallUser/goSsologinAdmin';
            }
            // 埋点点击更多按钮
            window.xPartner_clickTrack('x_partner_home_collegeToMore', '首页-学么点击更多按钮');
            window.open(url);
        },
        tabChanged(val) {
            this.currentTab = val;
            this.fetchCourseData();
            // 埋点点击最新课程/推荐课程tab
            if (val === 'newCourse') {
                window.xPartner_clickTrack('x_partner_home_collegeToNewTab', '首页-学么切最新课程tab');
            } else {
                window.xPartner_clickTrack('x_partner_home_collegeToRecommendTab', '首页-学么切推荐课程tab');
            }
        },
        // 跳转至对应详情页
        goDetail(item, type) {
            switch (type) {
                case 'last':
                    if (window.location.href.includes('test')) {
                        window.open(
                            `https://testuat-xue.dmall.com/docking/dmallUser/goSsologinAdmin?type=C&ctId=${item.ctId}&cid=${item.cid}&registerId=${item.registerId}`,
                        );
                    } else {
                        window.open(
                            `https://xue.dmall.com/docking/dmallUser/goSsologinAdmin?type=C&ctId=${item.ctId}&cid=${item.cid}&registerId=${item.registerId}`,
                        );
                    }
                    break;

                case 'recommend':
                    if (window.location.href.includes('test')) {
                        window.open(
                            `https://testuat-xue.dmall.com/docking/dmallUser/goSsologinAdmin?type=T&tcId=${item.tcId}`,
                        );
                    } else {
                        window.open(
                            `https://xue.dmall.com/docking/dmallUser/goSsologinAdmin?type=T&tcId=${item.tcId}`,
                        );
                    }
                    break;
                default:
                    break;
            }
        },
        // 获取最新课程
        fetchRecentData() {
            http.get('getRecentCourse', '', true).then((res) => {
                if (res && res.resultCode === 200) {
                    this.recentData = res.success;
                    this.recentData.push(this.recentData[0]);
                }
            });
        },
        // 获取推荐项目
        fetchRecommendData() {
            http.get('getRecommendCourse', '', true).then((res) => {
                if (res && res.resultCode === 200) {
                    this.recommendData = res.success;
                }
            });
        },

    },
});
</script>
