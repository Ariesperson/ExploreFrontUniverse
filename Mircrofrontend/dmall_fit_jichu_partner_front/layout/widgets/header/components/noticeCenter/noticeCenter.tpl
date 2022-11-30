<div class="notice-content">
    <div class="notice-content-tabs">
        <div class="notice-content-tabs-loading" v-if="showNoticeLoading">
            <img src="https://img.dmallcdn.com/dshop/202112/273f7b9e-8c3d-4df2-8825-9e55fd077d37" alt="">
        </div>
        <div class="tabs-title" @click="checkTabs">
            <div v-for="item in noticeTabs" :data-id="item.id" :key="item.id" :class="['tabs-pannel-title']">
                <div :class="['pannel-title-notce',{'notice-active':activeNoticeTab==item.id}]" :data-id="item.id">
                    {{item.name}}</div>
            </div>
            <div class="checkAll" @click="checkAll">
                <span>更多</span>
                <i class="x-icon-directive-rightarrow"></i>
            </div>
        </div>
        <!-- 消息tab -->
        <div class="tabs-pannel-content" v-show="activeNoticeTab==='info'">
            <!-- 轮播图区域 -->

            <div class="info-banners" v-if="bannerData.length>0">
                    <div v-for="(item, index) in bannerData" :key="index">
                        <transition>
                          <div
                            class="banner-component"
                            @click="jumpToDetail(item.url)"
                            :style="`background: no-repeat url(${item.imgUrl}) center center ; `"
                            v-if="index === currentIndex"
                          >
                            <span class="banner-component-title">{{ item.title }}</span>
                          </div>
                        </transition>
                      </div>
                      <div class="indicator-list" v-if="bannerData.length > 1">
                        <div
                          :class="{
                            'indicator-item': true,
                            'checked-item': currentIndex === index,
                          }"
                          v-for="(item, index) in bannerData"
                          :key="item.msgId"
                          @click.stop="chooseItem(index)"
                        ></div>
                      </div>

            </div>
           


            <div v-if="infoList.length>0" class="info-list">
                <div v-for="item in infoList" @click="readMsg(item)" :key="item.msgDataId" class="info-item">
                    <template v-if="item.summaryType===1">
                        <div class="title">
                            <img class="info-list-icon title-icon" :src="item.groupIconUrl" />
                            <div class="title-comp">
                                <span class="title-title">{{item.title}}</span>
                                <span v-if="item.importantStatus===1" class="title-important">重要</span>
                            </div>
                            <span class="title-time">{{item.createTimeStr}}</span>
                        </div>
                        <div class="content" v-html="item.summary">
                        </div>
                    </template>
                    <template v-if="item.summaryType===2">
                        <div class="title">
                            <img class="info-list-icon title-icon" :src="item.groupIconUrl"  />
                            <div class="title-comp">
                                <span class="title-title">{{item.title}}</span>
                                <span v-if="item.importantStatus===1" class="title-important">重要</span>
                            </div>
                            <span class="title-time">{{item.createTimeStr}}</span>
                        </div>
                        <div class="content">
                            <div v-for="item1 in item.summaryArr" style="display:flex">
                                <div>{{item1[0]}}:</div>
                                <div>{{item1[1]}}</div>
                            </div>

                        </div>
                    </template>

                </div>
            </div>
            <div v-else class="info-blank">
                <img src="https://img.dmallcdn.com/dshop/202112/94d6fe26-fd90-4484-8664-bda255dd0953" class="pic"
                    alt="">
                <div class="first">暂无消息</div>
                <div class="second">当你有新的消息时</div>
                <div class="second">你将会在这里收到通知</div>
            </div>
        </div>
        <!-- 审批tab -->
        <div class="tabs-pannel-content" v-show="activeNoticeTab==='auth'">
            <div v-if="authList.length>0" class="info-list">
                <div v-for="item in authList" @click="goAuth(item)" :key="item.msgDataId" class="info-item">
                    <div class="title">
                        <div class="auth-list-icon"></div>
                        <span class="title-title" style="margin-right:4px">{{item.templateName}}</span>
                        <div v-html="item.tags"></div>
                    </div>
                    <div class="content">
                        <div class="info-content-item">
                            <div class="content-item-key">发起人:</div>
                            <div>{{item.creatorName}}</div>
                        </div>
                        <div class="info-content-item">
                            <div class="content-item-key">发起时间:</div>
                            <div>{{item.createTime}}</div>
                        </div>
                        <div class="info-content-item">
                            <div class="content-item-key">当前节点:</div>
                            <div>{{item.nodeName}}</div>
                        </div>
                        <div v-for="item1 in item.customFields" class="info-content-item">
                            <div class="content-item-key">{{item1.key}}:</div>
                            <div>{{item1.value}}</div>
                        </div>

                    </div>
                </div>
            </div>
            <div v-else class="info-blank">
                <img src="https://img.dmallcdn.com/dshop/202112/94d6fe26-fd90-4484-8664-bda255dd0953" class="pic"
                    alt="">
                <div class="first">暂无审批</div>
                <div class="second">当你有审批事项需要处理的时候</div>
                <div class="second">你将会在这里收到通知</div>
            </div>
        </div>

        <div class="notice-function" v-show="activeNoticeTab==='info'&&infoList.length>0" @click="markAllRead">
            <div class="markDone" >
                <i class="x-icon-notice-correct" style="color:#0F62FE;margin-right: 8px;margin-top:4px"></i>
                <span>标记已读</span>
            </div>

        </div>
    </div>
</div>