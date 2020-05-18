<template>
  <div
    :class="$style.input"
    :contenteditable="!disabled"
    :disabled="disabled"
    :data-placeholder="!value && placeholder"
    @input="$emit('input', $event.target.innerText)"
    @keydown="$emit('keydown', $event)"
    @paste="paste"
  />
</template>

<script>
export default {
  props: {
    value: {
      type: String
    },
    placeholder: {
      type: String
    },
    disabled: {
      type: Boolean
    }
  },
  watch: {
    value(newValue) {
      if(this.$el.innerText !== newValue){
        if(this.$el.innerText.trim()){
          this.saveRangePosition();
        }
        this.$el.innerText = newValue;
        this.$el.focus();
        if(newValue.trim()){
          this.restoreRangePosition()
        }
      }
    }
  },
  methods: {
    paste(e) {
      e.preventDefault();
      var text = e.clipboardData.getData("text/plain");
      document.execCommand("insertHTML", false, text);
    },
    saveRangePosition(){
      var range=window.getSelection().getRangeAt(0);
      var startContainer=range.startContainer,endContanier=range.endContainer;
      const starts=[];while(startContainer!==this.$el){starts.push(this.getNodeIndex(startContainer));startContainer=startContainer.parentNode}
      const  ends=[];while(endContanier!==this.$el){ends.push(this.getNodeIndex(endContanier));endContanier=endContanier.parentNode}
      this.rangePosition ={"startContainer":starts,"startOffset":range.startOffset,"endContanier":ends,"endOffset":range.endOffset};
    },
    restoreRangePosition() {
      this.$el.focus();
      const selection=window.getSelection(),range=selection.getRangeAt(0);
      var x,C,startContainer=this.$el,endContanier=this.$el;

      C=this.rangePosition.startContainer;x=C.length;while(x--)startContainer=startContainer.childNodes[C[x]];
      C=this.rangePosition.endContanier;x=C.length;while(x--)endContanier=endContanier.childNodes[C[x]];

      range.setStart(startContainer,this.rangePosition.startOffset);
      range.setEnd(endContanier,this.rangePosition.endOffset);
      selection.removeAllRanges();
      selection.addRange(range)
    },
    getNodeIndex(n){let i=0;while(n=n.previousSibling)i++;return i}
  },
  style({ className, mediaQuery }) {
    return [
      className("input", {
        // borderRadius: '8px',
        border: `solid 2px ${this.$root.theme.borderColor}`,
        backgroundColor: this.$root.theme.backgroundColor,
        color: this.$root.theme.fillColor,
        padding: "10px 8px 8px",
        minHeight: "48px",
        maxHeight: "40vh",
        overflowY: "auto",
        fontSize: "1em",
        display: "block",
        width: "100%",
        "&[disabled]": {
          background: "#fff",
          cursor: "not-allowed"
        },
        "&:focus": {
          outline: "none",
          border: `solid 2px ${this.$root.theme.primaryColor}`
        },
        "&:after": {
          content: "attr(data-placeholder)",
          pointerEvents: "none",
          userSelect: "none",
          opacity: 0.7
        }
      })
    ];
  }
};
</script>
