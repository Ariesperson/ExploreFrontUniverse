<div class="partner-menu" id="partner-menu">
  <div class="partner-menu-cover" v-if="isCollectFresh"></div>
  <div class="partner-menu-toast" v-show="menuToastText">
    <i
      class="x-icon-notice-succeed menu-toast-icon"
      style="color: #18c887; font-size: 16px"
    ></i>
    <span class="menu-toast-text">{{ menuToastText }}</span>
  </div>
  <div class="first-level-menu">
    <div class="level-menu-navwrapper">
      <div
        id="first-menu-id_-1"
        :data-id="-1"
        :class="{'first-level-menu-item':true,actived:activeFirstMenu.id===-1,hovered:hoveredFirstMenu.id===-1,'menu-content-mynav':true}"
        @mouseenter="firstMenuOver({id:-1})"
        @mouseleave="firstMenuLeave"
      >
        <i class="first-menu-icon x-icon-notice-Star"></i>
        <span class="first-menu-name">我的导航</span>
      </div>
    </div>
    <div class="level-menu-divider"></div>
    <ul class="first-level-menu-content" @mouseleave="firstMenuLeave">
      <li
        v-for="item in menuList"
        :key="item.id"
        :id="'first-menu-id_'+item.id"
        :class="{'first-level-menu-item':true,actived:item.id===activeFirstMenu.id,hovered:item.id==hoveredFirstMenu.id&&item.id!==activeFirstMenu.id}"
        :data-id="item.id"
        data-level="1"
        @mouseenter="firstMenuOver(item)"
        :title="item.name"
      >
        <i
          :class="['first-menu-icon', item.icon ? item.icon:'x-icon-notice-review1']"
        ></i>
        <span class="first-menu-name">{{ item.name }}</span>
      </li>
    </ul>
  </div>

  <transition enter-active-class="in" leave-active-class="out">
  <div
    class="menu-children"
    v-if="isHovered && showMenu.children && showMenu.children.length"
    @mouseenter="childrenOver(showMenu)"
    @mouseleave="childrenLeave"
  >
    <menu-item
      :list="showMenu.children"
      :title="showMenu.name"
    ></menu-item>
  </div>
  </transition>

  <!-- 我的导航pop -->
  <transition enter-active-class="in" leave-active-class="out">
  <div
    class="partner-menu-mynav"
    @mouseenter="myNavOver"
    @mouseleave="myNavLeave"
    v-if="showMyNav"
  >
    <div class="menu-mynav-title">我的导航</div>
    <div style="overflow: overlay; height: 100%">
      <div
        class="menu-mynav-recentuse"
        v-if="recentUseList&&recentUseList.length>0"
      >
        <div class="mynav-recentuse-title">最近使用</div>
        <ul class="mynav-recentuse-list" v-if="recentUseList.length>0">
          <li
            class="recentuse-list-item"
            v-for="item in recentUseList"
            @click="go(item.url,item,'recent')"
            :key="item.id"
          >
            <span class="list-item-text" :title="item.name">{{
              item.name
            }}</span>
          </li>
        </ul>
        <div v-else class="menu-mynav-blank">
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
      <div class="menu-mynav-collection">
        <div class="mynav-collection-title">
          <div class="collection-title-text1">收藏菜单</div>
          <div
            class="collection-title-text2"
            v-if="showClearBtn"
            @click="clearInvalid"
          >
            <i class="x-icon-action-delete"></i> <span>清空失效菜单</span>
          </div>
        </div>
        <div class="mynav-collection-list" v-if="collectionList.length>0">
          <!-- 每一列 -->
          <div
            class="collection-list-col"
            v-for="(item,index) in collectionCols"
            :key="index"
          >
            <!-- 每一列中的父 -->
            <div
              class="mynav-collection-firstmenu"
              v-for="item1 in item"
              :key="item1.id"
            >
              <div class="collection-firstmenu-title">
                {{ item1.name }}
              </div>
              <div class="collection-firstmenu-childmenu">
                <!-- 每一列中父下的子 -->
                <div
                  :class="{'firstmenu-childmenu-item':true,'cursor-banned':!item2.valid}"
                  v-for="item2 in item1.children"
                  @click="go(item2.url,item2)"
                  :key="item2.id"
                >
                  <div class="childmenu-item-delete">
                    <i
                      class="x-icon-notice-shixin"
                      @click.stop="deleteCollection(item2)"
                      @mouseenter="toggleRemoveNotice(item2.id)"
                      @mouseleave="toggleRemoveNotice"
                    ></i>
                  </div>
                  <span class="childmenu-item-title" :title="item2.name">{{
                    item2.name
                  }}</span>
                  <span v-if="!item2.valid" class="item-title-invalid"
                    >失效</span
                  >
                  <div
                    class="children-item-remove"
                    v-show="currentRemoveId==item2.id"
                  >
                    取消收藏
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="menu-mynav-blank" style="margin-top: 100px">
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
  </div>
  </transition>
  <div class="menu-toast" v-show="showToast">
    <div>{{ showToastText }}</div>
  </div>
  <!-- 收藏的新人引导 -->
  <div class="menu-fresh-collect" v-if="isCollectFresh">
    <div class="fresh-collect-title">
      <span>菜单收藏</span>
      <i
        class="x-icon-notice-shixin"
        style="font-size: 16px; cursor: pointer"
        @click="finishCollectFresh"
      ></i>
    </div>
    <div class="fresh-collect-pic">
      <img
        src="https://img.dmallcdn.com/dshop/202112/7f171b94-6c8f-4125-9ef5-c10cfba33e65"
        alt=""
        width="280px"
      />
    </div>
    <div class="fresh-collect-content">
      点击这里,可将常用的菜单收藏,以快捷访问
    </div>
    <div class="fresh-collect-btn" @click="finishCollectFresh">我知道了</div>
  </div>
</div>
