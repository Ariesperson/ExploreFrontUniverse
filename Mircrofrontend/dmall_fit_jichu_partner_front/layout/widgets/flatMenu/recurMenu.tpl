<div class="recur-menu">
  <div v-for="item in localList" @click="handleItemClick(item)" @mouseenter="handleItemOver(item)"
    @mouseleave="handleItemLeave(item)">
    <div :class="['recur-menu-item',rootMenu.activedMenu && item.id === rootMenu.activedMenu.id?'active-item':'']" :router="item.router">
      <div :class="[!(item.children &&item.children.length)?'menu-level-last':'menu-level-sub', rootMenu.activedMenu && item.id === rootMenu.activedMenu.id?'active-child-item':'']" >{{ item.name }}</div>
      <i v-if="item.id === currentItemId && item.isCollected===false" class="menu-item-logo x-icon-notice-Star"
        title="收藏" @click.stop="addToCollection(item)"></i>
      <i v-if="item.isCollected" class="menu-item-logo x-icon-notice-wujiaoxing"
        title="取消收藏" style="color:#ffc900" @click.stop="deleteCollection(item)"></i>
    </div>

    <recur-menu v-if="item.children &&item.children.length && level< 1" :list="item.children"
      :className="'menu-level-'+(level+1)" :level="level+1">
    </recur-menu>
  </div>
</div>