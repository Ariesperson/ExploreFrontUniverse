<div>
    <div class="fit-modal-cover">
    
    </div>
    <div class="fit-partner-modal"  v-if="visible">
       
        <div class="partner-modal-title">
            <div class="modal-title-text">{{title}}</div>
            <i class="modal-title-icon x-icon-notice-shixin" @click="closeModal" v-if="showClose"></i>
        </div>
        <div class="partner-modal-content">
            {{content}}
        </div>
      <div class="partner-modal-btns">
           <div @click="cancel" class="modal-btn modal-btns-cancel" v-if="showCancel">
            {{cancelBtnText}}
           </div>
           <div @click="confirm" class="modal-btn modal-btns-confirm">
            {{confirmBtnText}}
           </div>
      </div>
    </div>
</div>