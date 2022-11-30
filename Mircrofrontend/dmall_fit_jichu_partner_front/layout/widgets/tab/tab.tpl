<div 
    class="partner-tab clearfix" 
    id="partner-tab"
    v-show="tabList.length > 1"
>
    <ul class="tab-index-content">
        <li 
            v-for="tab in tabList"
            v-if="tab.path === partnerIndexPath" 
            :key="tab.path"
            class="tab-index-content__item"
            :class="[
                tab.isActived ? 'tab-index-content__item--current' : '',
            ]"
        >
            <span 
                @click="activeTab(tab.path)" 
                class="tab-index-content__item__icon x-icon-universally-home"
            >
                <i class="tab-index-content__item__icon__div" v-if="!tab.isActived"></i>
            </span>
        </li>
    </ul>
    <div 
        class="tab-content-wrap J_Partner_Tab_Content"
        :class="isTabOverFlow ? 'tab-content-wrap--overflow' : ''"
    >
        <ul class="tab-content">
            <li 
                v-for="tab in tabVisibleList"
                v-if="tab.path !== partnerIndexPath"
                :key="tab.path"
                @contextmenu.prevent="setContextMenu(tab,$event)"
                class="tab-item"
                :class="[
                    tab.isActived ? 'tab-item--current' : '',
                ]"
            >
            <i class="tab-item-divider" v-if="tab.isActived"></i>

                <span 
                    class="tab-item-name" 
                    @click="activeTab(tab.path)" 
                    @dblclick="closeTab(tab.path)"
                    :tab-path="tab.path"
                >
                    <span class="tab-item-name__text" v-tips="tab.name">{{ tab.name }}</span>
                    <i class="tab-item-name__block"></i>
                </span>
                <em 
                    class="tab-item-action"
                >
                    <i class="tab-action-refresh"  @click="refreshTab(tab.path)">
                        <img src="img/Union.svg" height="10px" alt="" />
                    </i>
                    <i class="tab-action-close x-icon-notice-shixin" @click="closeTab(tab.path)"></i>
                    <i class="tab-action-div"></i>
                </em>
            </li>
        </ul>
    </div>
    <div 
        class="tab-overflow"
        v-show="isTabOverFlow"
        :class="isOverflowListShow ? 'tab-overflow--actived' : ''"
        
    >
        <div 
            class="tab-overflow-button" 
            @click.stop="toggleOverflowList"
        >
            <span class="x-icon-directive-rightd-arrow"></span>
        </div>
        <div 
            class="tab-overflow-content"
            :style="{maxHeight:overflowListMaxHeight}"
        >
            <ul class="tab-overflow-list">
                <li
                    v-for="tab in tabOverflowList"
                    v-if="tab.path !== partnerIndexPath"
                    class="tab-overflow-item"
                    :class="tab.isActived ? 'tab-overflow-item--current' : '' "
                >
                    <span class="tab-overflow-item-name" @click="activeTab(tab.path)">{{ tab.name }}</span>
                    <i ref="overflowCloseButton" class="tab-overflow-item-close x-icon-notice-shixin" @click="closeTab(tab.path)"></i>
                </li>
            </ul>
        </div>
    </div>
    <div class="menu-functions" v-show="curContextMenu" :style="{left:curContextMenu && curContextMenu.left,top:curContextMenu && curContextMenu.top}">
        <div  class="menu-functions-item" v-for="item in contextMenuFuncs" :key="item.name" @click="handleContextMenu(item)">
            {{item.name}}
        </div>
    </div>
</div>
