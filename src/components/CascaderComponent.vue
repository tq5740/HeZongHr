<template>
  <div id="Cascader">
    <el-cascader v-model="selectValue" @change="changeSelect" :placeholder="placeholder" :options="options" :props="props" collapse-tags :multiple="multiple" :filterable="filterable" :show-all-levels="showAllLevels" :style="`width: ${width}`"></el-cascader>
  </div>
</template>

<script>
export default {
  props: {
    width: String,
    vmodel: [String, Array, Number],
    options: {
      type: Array,
      default: () => []
    },
    props: {
      type: Object,
      default: () => ({ label: "label", value: "value" })
    },
    placeholder: {
      type: String,
      default: "请选择"
    },
    multiple: {
      type: Boolean,
      default: false
    },
    firstOption: {
      // 选项放前面
      type: String,
      default: ""
    },
    filterable: {
      type: Boolean,
      default: false
    },
    showAllLevels: {
      type: Boolean,
      default: true
    },
  },
  watch: {
    vmodel: {
      handler: 'getValue',
      deep: true,
      immediate: true
    },
  },
  data() {
    return {
      selectValue: ""
    };
  },
  model: {
    prop: "vmodel",
    event: "change"
  },
  mounted() {
  },
  methods: {
    getValue() {
      this.selectValue = this.vmodel;
    },
    changeSelect(e) {
      this.$emit("change", e);
    }
  }
};
</script>
<style lang="scss">
#Cascader {
  display: inline-block;
  .el-cascader {
    width: 100%;
  }
}
</style>


