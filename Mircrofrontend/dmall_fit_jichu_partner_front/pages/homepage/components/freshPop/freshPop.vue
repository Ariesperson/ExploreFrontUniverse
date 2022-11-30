<template>
  <div class="components-fresh-pop">
    <div
      :class="{
        'fresh-pop-arrow1': progress == 1,
        'fresh-pop-arrow2': progress == 2,
        'fresh-pop-arrow3': progress == 3,
        'fresh-pop-arrow4': progress == 4,
        'fresh-pop-arrow5': progress == 5,
      }"
    ></div>
    <div class="fresh-pop-title">
      <span> {{ title }}</span>
      <span @click="finishStep">
        <i class="x-icon-notice-shixin" style="font-size: 18px;"></i>
      </span>
    </div>
    <div class="fresh-pop-content">
      {{ content }}
    </div>
    <div class="fresh-pop-bottom">
      <div class="pop-bottom-progress">
        <div>{{ progress }}/{{ stepAmount }}</div>
      </div>
      <div class="pop-bottom-btn">
        <button
          text="上一步"
          v-if="progress > 1"
          @click="changeStep(-1)"
          size="small"
        ></button>
        <button
          text="下一步"
          status="primary"
          v-if="progress != stepAmount"
          @click="changeStep(1)"
          size="small"
        ></button>
        <button
          text="我知道了"
          status="primary"
          v-if="progress == stepAmount"
          @click="finishStep"
          size="small"
        ></button>
      </div>
    </div>
  </div>
</template>

<script>
export default SysComponent({
    components: {},
    props: {
        title: {
            type: String,
        },
        content: {
            type: String,
        },
        // 第几步
        progress: {
            type: String | Number,
        },
        // 总共几步
        stepAmount: {
            type: Number,
        },
    },
    data() {
        return {};
    },
    computed: {},
    watch: {},
    mounted() {},
    methods: {
    // 修改步骤数
        changeStep(value) {
            this.$emit("changeStep", value);
        },
        // 结束新人引导
        finishStep() {
            this.$emit("finishStep");
        },
    },
});
</script>
<style lang="scss" scoped>
.components-fresh-pop {
  width: 362px;
  height: 90px;
  background: #ffffff;
  border-radius: 2px;
  z-index: 10005;
  position: fixed;
  padding: 16px 24px;
  box-sizing: content-box;
  .x-icon-notice-shixin{
    &:hover{
      cursor: pointer;
    }
  }
  .fresh-pop-title {
    color: rgba(0, 0, 0, 0.9);
    font-weight: 600;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .fresh-pop-content {
    color: rgba(0, 0, 0, 0.6);
    margin-bottom: 16px;
  }
  .fresh-pop-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .pop-bottom-progress{
      color: rgba(0, 0, 0, 0.4);;
    }
  }
  .fresh-pop-arrow1 {
    width: 8px;
    height: 8px;
    background: #ffffff;
    border-radius: 0.3px;
    transform: rotate(-39deg);
    position: absolute;
    left: -4px;
    top: 50px;
  }
   .fresh-pop-arrow2 {
    width: 8px;
    height: 8px;
    background: #ffffff;
    border-radius: 0.3px;
    transform: rotate(-39deg);
    position: absolute;
    left: -4px;
    top: 30px;
  }
  .fresh-pop-arrow3 {
    width: 8px;
    height: 8px;
    background: #ffffff;
    border-radius: 0.3px;
    transform: rotate(-39deg);
    position: absolute;
    left: 170px;
    top: -3px;
  }
  .fresh-pop-arrow4 {
    width: 8px;
    height: 8px;
    background: #ffffff;
    border-radius: 0.3px;
    transform: rotate(-39deg);
    position: absolute;
    left: 336px;
    top: -3px;
  }
   .fresh-pop-arrow5 {
    width: 8px;
    height: 8px;
    background: #ffffff;
    border-radius: 0.3px;
    transform: rotate(-39deg);
    position: absolute;
    left: 385px;
    top: -3px;
  }
}
</style>
