<template>
  <div>
    <el-form :inline="true">
      <el-form-item>
        <el-button type="primary" @click="createBtn">新增模板</el-button>
      </el-form-item>
    </el-form>
    <div v-loading="tableLoading">
      <tableComponent :dataList="dataList" :headTable="headTable" :btnTable="btnTable" @clickBtn="clickBtn" border></tableComponent>
    </div>
    <el-dialog v-if="showCreateEdit" :title="titleText" :visible.sync="showCreateEdit" :before-close="closeBefore" fullscreen :show-close="false" :modal="false">
      <createEditTemplate @close="closeBefore" :queryData="queryData"></createEditTemplate>
    </el-dialog>
  </div>
</template>

<script>
import All from "@api/all";
import tableComponent from "@c/TableComponent.vue";
import createEditTemplate from "../dialog/createEditTemplate";
export default {
  components: {
    tableComponent,
    createEditTemplate
  },
  data() {
    return {
      All: All,
      dataList: [],
      headTable: [],
      pageSize: 10,
      pageNum: 1,
      total: 0,
      eg: "",
      tableLoading: false,
      showCreateEdit: false,
      btnTable: undefined,
      titleText: "",
      queryData: {}
    };
  },
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
        { text: "序号", field: "index" },
        { text: "名称", field: "name" },
        {
          text: "创建人",
          field: "creator",
        },
        { text: "创建时间", field: "createTime" }
      ];
      this.btnTable = function(row) {
        return [
          { text: "编辑", prm: true },
          { text: "删除", prm: true }
        ];
      };
    },
    getTable() {
      this.tableLoading = true;
      All.postAPI({
        method: All.templateList(),
        params: {
          pageSize: this.pageSize,
          pageNum: this.pageNum
        }
      })
        .then(res => {
          this.total = res.total;
          this.dataList = res.list;
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },
    createBtn() {
      this.titleText = "新增模板";
      this.queryData = "";
      this.showCreateEdit = true;
    },
    closeBefore() {
      this.showCreateEdit = false;
      this.getTable();
    },
    clickBtn({ row, btn }) {
      if (btn.text === "删除") {
        this.deleteBtn(row);
      } else if (btn.text === "编辑") {
        this.titleText = "编辑模板";
        this.queryData = row.id;
        this.showCreateEdit = true;
      }
    },
    deleteBtn(row) {
      All.postAPI({
        method: All.templateDelete(),
        params: {
          id: row.id
        }
      }).then(res => {
        if (res) {
        this.$Notif({
          type: "success",
          title: "提示",
          message: "操作成功！"
        });
        this.getTable();
      } else {
        this.$Notif({
          type: "error",
          title: "错误",
          message: "操作失败！"
        });
      }
      });
    },
  }
};
</script>
<style lang="scss" scoped>
</style>