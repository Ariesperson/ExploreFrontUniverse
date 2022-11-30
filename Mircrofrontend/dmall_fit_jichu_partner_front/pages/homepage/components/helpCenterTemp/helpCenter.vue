<template>
  <div class="component-helpCenter">
    <module title="帮助中心">
      <!-- <actions>
         <button status="ghost"  @click="goDetail"  text="更多" icon-right="x-icon-directive-rightarrow"></button>
      </actions> -->
      <div class="component-helpCenter-content">
          <div class="helpCenter-content-item" v-for="item in dataList" :key="item.id" @click="goDetail" :style="item.id===4?{'margin-right':0}:{}">
              <div class="content-item-left">
                  <img :src="item.imgUrl" alt="" width="50" height="50">
              </div>
              <div class="content-item-right">
                  <div class="item-right-title">
                    {{item.title}}
                  </div>
                  <div class="item-right-content" :title="item.content">
                    {{item.content}}
                  </div>
              </div>
          </div>
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
            dataList: [
                {
                    imgUrl: 'https://img.dmallcdn.com/dshop/202205/bd4aa692-7594-4b35-b552-e8a7fc19511a',
                    title: '语音通知',
                    content: '部分重要信息会通过语音播报方式传递，需要在设置中打开“新消息提醒”',
                    id: 1,
                },
                {
                    imgUrl: 'https://img.dmallcdn.com/dshop/202205/50b653dc-78d9-4976-9aff-a6d6c3f7620f',
                    title: '消息审批',
                    content: '当有新消息、新审批时，可点击右上角铃铛阅读消息、处理审批',
                    id: 2,
                },
                {
                    imgUrl: 'https://img.dmallcdn.com/dshop/202205/4018fa00-9937-4a16-8746-22f7540514c2',
                    title: '菜单搜索',
                    content: '想要快速查找菜单时，可点击右上角搜索输入关键字，便捷找到所需菜单，更有搜索历史支持快速跳转',
                    id: 3,
                }, {
                    imgUrl: 'https://img.dmallcdn.com/dshop/202205/dcd4c078-71aa-4c4f-8759-ee11e440dd50',
                    title: '菜单收藏',
                    content: '对于常用菜单，可通过在菜单栏将其收藏，将收藏菜单展示在首页，实现快速进入工作页面',
                    id: 4,
                }],
        };
    },
    computed: {},
    watch: {

    },
    mounted() {

    },
    methods: {
    // 点击更多去帮助中心
        goDetail() {

        },
    },
});
</script>
