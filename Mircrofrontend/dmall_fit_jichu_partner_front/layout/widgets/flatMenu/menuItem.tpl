<div class="x-parter-menu-item">
  <div class="x-parter-menu-item__content">
    <div class="x-parter-menu-item__content__title">{{ title }}</div>
    <div class="x-parter-menu-item__content__list">
      <div
        class="collection-cols"
        v-for="(item,index) in collectionCols"
        :key="index"
      >
        <!-- 每一个二级菜单数据 -->
        <div v-for="item1 in item" :key="item1.id" class="collection-cols__list">
          <div
            :class="['collection-cols__list__title',item1.id===currentAnchorId?'collection-cols__list__title--active':'']"
          >
            {{ item1.name }}
          </div>
          <recur-menu :list="item1.children"></recur-menu>
        </div>
      </div>
    </div>
  </div>
  <!-- <div class="x-parter-menu-item__anchor">
    <div
      :class="['x-parter-menu-item__anchor__item',item.id===currentAnchorId?'x-parter-menu-item__anchor__item--active':'']"
      v-for="item in list"
      :key="item.id"
    >
      <div @click="anchorToItem(item)">{{ item.name }}</div>
    </div>
  </div> -->
</div>
