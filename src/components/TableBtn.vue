<template>
  <div>
    <template v-for="(btn, index) in listBtn">
      <el-button :key="index" :disabled="!btn.prm" type="text" @click.native="clickBtn({ row: data, btn })">{{btn.text}}</el-button>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    list: {
      type: Array,
      default: function () {
        return []
      }
    },
    data: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  watch: {
    list: {
      handler: "init",
      immediate: true
    }
  },
  data() {
    return {
      listBtn: []
    }
  },
  methods: {
    init() {
      this.listBtn = this.list;
    },
    clickBtn({ row, btn }) {
      this.$emit("clickBtn", { row, btn })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
