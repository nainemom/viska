<template>
  <div
    :class="$style.input"
    contenteditable
    @input="$emit('input', $event.target.innerText)"
    @keydown="$emit('keydown', $event)"
    :data-placeholder="!value && placeholder"
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
    }
  },
  watch: {
    value(newValue) {
      if (!newValue || !newValue.trim()) {
        this.$el.innerText = newValue;
        // Move cursor to the last line
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(this.$el.childNodes[this.$el.childNodes.length - 1], 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  },
  methods: {
    paste(e) {
      e.preventDefault();
      var text = e.clipboardData.getData("text/plain");
      document.execCommand("insertHTML", false, text);
      this.$emit("input", text);
    }
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
