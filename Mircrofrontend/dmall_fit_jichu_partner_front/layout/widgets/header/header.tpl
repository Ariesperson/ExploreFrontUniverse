<div class="partner-header clearfix" id="partner-header">
    <div class="title-area" @click="goHome">
        <img src="img/headerIcon.svg" alt="" width="104" height="40">
        <span style="margin-left: 8px;margin-right: 8px;">|</span>
        <span class="dmall-os-title">{{
                userInfo.tenantName ? userInfo.tenantName : ""
            }}</span>
    </div>
    <!-- 右侧功能区域 -->
    <div class="function-area">
        <!-- 搜索区域 -->
        <div class="search-input-box">
            <div :class="{'search-input-box-content':true,'display':true,'search-input-box-active':activedIcon=='search'}"
                @click.stop="headerIconClick($event,'search')" id="xpartner_header_input">
                <i class="x-icon-universally-serch"></i>
                <input ref="searchInput" class="header-search-input" type="text" placeholder="输入菜单名称"
                    v-model="searchMenuValue" @input="search" @focus="SearchInputFocus" />
                <i class="x-icon-notice-close" @click="clearSearchValue" v-if="searchMenuValue"></i>
            </div>
            <ul class="partner-pop search-menu-result"
                :class="{display:searchMenuValue&&searchList.length&&activedIcon=='search'&&searchList.some(item=>item.router)}">
                <li v-for="(item,index) in searchList"  v-if="item.router" :key="index" class="search-menu-item link"
                    @click.stop="menuClick(item)" :title="item.nodes.map(item=>item.pathName).join('-')">
                    <span  v-html="joinHtml(item)"></span>

                </li>

            </ul>
            <div class="partner-pop search-menu-result"
                :class="{display:searchMenuValue&&!searchList.some(item=>item.router)&&activedIcon=='search'}"
                style="height: 256px;height:40px;">
                暂无匹配结果
            </div>
            <!-- 搜索历史区域 -->
            <div class="search-history-box" v-show="!searchMenuValue&&activedIcon=='search'&&searchHistory.length>0">
                <div class="search-history-title">
                    搜索历史
                </div>
                <ul class="search-history-list" @click="searchGoDetail">
                    <li class="search-history-item" v-for="item in searchHistory" :data-item="JSON.stringify(item)"
                        :key="item.id">
                        <span :data-item="JSON.stringify(item)" :title="item.nodesStr" >{{item.name}}</span>
                    </li>
                </ul>
            </div>

        </div>
     
        <!-- 消息区域 -->
        <div id="xpartner_header_notice"
            :class="{'header-icon-box':true, 'notice-icon-box':true,actived:activedIcon==='notice', 'red-point':msgList&&msgList.length}"
            @click="headerIconClick($event,'notice')" 
            ref="noticePop"
            title="消息中心"
            >
            <div class="header-undones" v-if="totalNotice!==0">{{totalNotice}}</div>
            <i class="header-icon x-icon-notice-message"></i>
        </div>
        <!-- 帮助区域 -->
        <!-- <div :class="{'help-icon-box':true,'header-icon-box':true,actived:activedIcon==='help'}"
            @click="headerIconClick($event,'help')" 
            title="帮助"
            >
            <i class="header-icon x-icon-notice-help1"></i>
       
        </div> -->
        <!-- 个人中心区域 -->
        <div id="xpartner_header_center"
            :class="{'header-icon-box':true ,'user-icon-box':true,actived:activedIcon==='user'}"
            @click="headerIconClick($event,'user')"
            title="个人中心"
            >
            <div class="user-tag">
                {{ userInfo.userName && userInfo.userName.substr(-2) }}
            </div>
        </div>
    </div>
    <!-- 消息pop区域 -->
    <div :class="{'partner-pop':true,'notice-content-container':true,'display':activedIcon==='notice'}" @click.stop="">
        <notice-center ref="notice" @getTotalNotice="getTotalNotice"  @hideNoticeDrawer="hideNoticeDrawer" :active-icon="activedIcon"></notice-center>
    </div>
    <!-- 个人中心pop区域 -->
    <div class="partner-pop user-content-container" :class="{display:activedIcon==='user'}">
        <div class="user-content">
            <div class="user-info">
                <div class="user-avatar">
                    {{ userInfo.userName && userInfo.userName.substr(-2) }}
                </div>
                <div class="user-base-info">
                    <div class="user-name">{{ userInfo.userName }}</div>
                    <div class="user-mobile">{{ userInfo.cryptoPhone }}</div>
                </div>
            </div>
            <div class="user-normal">
                <div @click="goMyFile()" class="user-normal-item">
                    <span class="user-normal-label">我的文件</span>
                    <i class="user-normal-icon x-icon-directive-rightarrow"></i>
                </div>
                <div @click="goCenter()" class="user-normal-item">
                    <span class="user-normal-label">设置</span>
                    <i class="user-normal-icon x-icon-directive-rightarrow"></i>
                </div>
                <div @click="goDownLoad">
                    <span class="user-normal-label">下载OS应用</span>
                    <i class="user-normal-icon x-icon-directive-rightarrow"></i>
                </div>
            </div>
            <div class="user-normal">
                <div class="back-out" @click="backOut">退出登录</div>
            </div>
        </div>
    </div>
    <!-- 新消息未读提示pop -->
    <div class="newInfo-reminder" v-if="newMsg" @click.stop="checkNewMsg">
        <div class="title">
            <img src="https://img.dmallcdn.com/dshop/202112/f42682eb-8cc7-4276-ab94-adf6aaef5146"
                style="height: 20px;width: 20px;margin-right: 4px;" alt="">
            <span class="text">你有新消息未读</span>
            <div v-if="newMsg.importantStatus===1" class="newInfo-reminder-important">重要</div>
        </div>
        <div class="content">
            {{newMsg && newMsg.title}}
        </div>
    </div>
</div>