<template>
  <div id="deptList">
    <el-form :inline="true">
      <el-form-item label="部门名称">
        <el-input v-model="searchWord" placeholder="请输入部门名称" clearable style="width: 210px;"></el-input>
      </el-form-item>
      <el-form-item label="部门状态">
        <selectComponent v-model="selectValue" :options="[{label: '正常', value: 1}, {label: '停用', value: 2}]" placeholder="请选择部门状态" clearable></selectComponent>
      </el-form-item>
      <el-form-item>
        <el-button @click="searchBtn" type="primary" icon="el-icon-search">搜索</el-button>
      </el-form-item>
      <el-form-item>
        <el-button @click="createBtn" type="primary" icon="el-icon-plus">新增</el-button>
      </el-form-item>
    </el-form>
    <div v-loading="tableLoading">
      <tableComponent :dataList="dataList" :headTable="headTable" :btnTable="btnTable" @clickBtn="clickBtn" :showPage="false" rowKey="id" border></tableComponent>
    </div>
    <el-dialog v-if="showDept" :title="titleText" :visible.sync="showDept" :before-close="closeBefore">
      <createEditDept @close="closeBefore" :queryData="queryData"></createEditDept>
    </el-dialog>
  </div>
</template>

<script>
import All from "@api/all";
import tableComponent from "@c/TableComponent.vue";
import selectComponent from "@c/SelectComponent.vue";
import createEditDept from "../dialog/createEditDept";
export default {
  components: {
    tableComponent,
    selectComponent,
    createEditDept
  },
  data() {
    return {
      All: All,
      dataList: [],
      headTable: [],
      btnTable: undefined,
      searchWord: "",
      selectValue: "",
      showDept: false,
      titleText: "",
      queryData: {}
    };
  },
  computed: {},
  watch: {},
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.getData();
      this.getTable();
    },
    getData() {
      this.headTable = [
        {
          text: "部门名称",
          field: "name"
        },
        {
          text: "排序",
          field: "index"
        },
        {
          text: "状态",
          field: "status"
        },
        {
          text: "创建时间",
          field: "createTime"
        }
      ];
      this.btnTable = function(row) {
        return [
          { text: "修改", prm: true },
          { text: "新增", prm: true },
          { text: "删除", prm: true }
        ];
      };
    },
    getTable() {
      this.tableLoading = true;
      All.postAPI({
        method: All.deptTreeData(),
        params: {
          keywrod: this.searchWord,
          status: this.selectValue
        }
      })
        .then(res => {
          this.dataList = res;
          this.tableLoading = false;
        })
    },
    searchBtn() {
      this.getTable();
    },
    createBtn(row) {
      this.titleText = "新增部门";
      this.queryData = "";
      this.showDept = true;
    },
    clickBtn({ row, btn }) {
      if (btn.text === "删除") {
        this.deleteBtn(row);
      } else if (btn.text === "新增") {
        this.titleText = "新增部门";
        this.queryData = row;
        this.queryData.titleText = "新增部门";
        this.showDept = true;
      } else if (btn.text === "修改") {
        this.titleText = "修改部门";
        this.queryData = row;
        this.showDept = true;
      }
    },
    closeBefore() {
      this.showDept = false;
      this.getTable();
    },
  }
};
</script>
<style lang="scss" scoped>
</style>