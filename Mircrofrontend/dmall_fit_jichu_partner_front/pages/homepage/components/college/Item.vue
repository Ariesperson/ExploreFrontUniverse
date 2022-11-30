<template>
  <div class="component-college-item">
    <div class="left">
      <img :src="imgUrl" width="100%" height="100%" alt="" />
    </div>
    <div class="center">
      <div class="center-title">{{ title }}</div>
      <div class="center-time">{{ ctSpeaker }}{{ ctCourseValidityDate }}</div>
      <div class="other">
        <div class="other-score">学分&nbsp;{{ score }}</div>
        <div class="other-other">
          <div>
            <i class="x-icon-universally-dialogue"></i>
            <span class="changeable">话题</span>
            <span>{{ peopleAmount }}</span>
          </div>
          <div>
            <i class="x-icon-universally-coverage"></i>
            <span class="changeable">资源</span>
            <span>{{ courseCount }}</span>
          </div>
          <div>
            <i class="x-icon-action-eyes-open1"></i>
            <span class="changeable">浏览</span>
            <span>{{ viewCount }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="right">

    </div> -->
  </div>
</template>

<script>
export default SysComponent({
    components: {},
    props: {
        title: {
            type: String,
            // default: "跨部门沟通",
        },
        ctSpeaker: {
            type: String,
        },
        ctCourseValidityDate: {
            type: String,
        },
        score: {
            type: [String, Number],
            // default: '30',
        },
        peopleAmount: {
            type: [String, Number],
            // default: '10',
        },
        courseCount: {
            type: [String, Number],
            // default: '10',
        },
        viewCount: {
            type: [String, Number],
            // default: '10',
        },
        imgUrl: {
            type: String,
        },
    },
    data() {
        return {};
    },
    computed: {},
    watch: {},
    mounted() {},
    methods: {},
});
</script>
<style lang="scss" scope>
.component-college-item {
  @media screen and (max-width: 1400px) {
    .changeable {
      display: none;
    }
  }
  &:hover{
    cursor: pointer;
  }
  padding: 5px;
  font-size: 14px;
  width: 100%;
  display: flex;
  box-shadow: inset 0px -1px 0px #ebebeb;
  margin-bottom: 8px;
  align-items: center;
  .left {
    width: 72px;
    height: 70px;
    margin-right: 8px;
    flex-shrink: 0;
  }
  .center {
    flex-grow: 1;
    display: flex;
    flex-wrap: wrap;
    .center-title {
      width: 100%;
      color: #191919;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 8px;
    }
    .center-time {
      width: 100%;
      color: rgba(0, 0, 0, 0.4);
      margin-bottom: 8px;
    }
    .other {
      width: 100%;
      display: flex;
      .other-score {
        color: #333333;
        font-size: 12px;
        width: 50px;
        flex-shrink: 0;
      }
      .other-other {
        flex: 1;
        display: flex;
        justify-content: flex-end;

        color: rgba(0, 0, 0, 0.4);
        font-size: 12px;
        & > div {
          margin-right: 26px;
          i {
            margin-right: 6px;
          }
        }
      }
    }
  }
}
</style>
