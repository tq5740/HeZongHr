<template>
  <div id="manList">
    <div class="left">
      <el-tree :data="deptTreeData" :props="{children: 'children', label: 'name'}" @node-click="handleNodeClick" :expand-on-click-node="false" default-expand-all highlight-current></el-tree>
    </div>
    <div class="right">
      <el-form :inline="true">
        <el-form-item>
          <el-button type="primary" @click="createBtn">新增人员</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="deleteBtn()">批量删除</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="update()">批量离职</el-button>
        </el-form-item>
        <el-form-item style="float: right; margin-right: 0">
          <el-button @click="exportBtn">导出</el-button>
        </el-form-item>
        <el-form-item style="float: right;">
          <el-button @click="importBtn">导入</el-button>
        </el-form-item>
        <el-form-item style="float: right;">
          <el-input style="display:none"></el-input>
          <el-input v-model="searchWord" placeholder="搜索姓名" clearable @keyup.13.native="searchBtn">
            <el-button @click="searchBtn" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-form-item>
      </el-form>
      <div v-loading="tableLoading">
        <tableComponent :dataList="dataList" :headTable="headTable" :btnTable="btnTable" @clickBtn="clickBtn" border isSelect></tableComponent>
      </div>
    </div>
    <el-dialog v-if="showUpload" title="导入" :visible.sync="showUpload">
      <uploadComponent :action="All.http + All.manImport"></uploadComponent>
    </el-dialog>
    <el-dialog v-if="showMan" :title="titleText" :visible.sync="showMan" :before-close="closeBefore">
      <createEditMan @close="closeBefore" :queryData="queryData"></createEditMan>
    </el-dialog>
  </div>
</template>

<script>
import All from "@api/all";
import tableComponent from "@c/TableComponent.vue";
import uploadComponent from "@c/UploadComponent";
import createEditMan from "../dialog/createEditMan";
export default {
  components: {
    tableComponent,
    uploadComponent,
    createEditMan
  },
  data() {
    return {
      All: All,
      deptTreeData: [],
      dataList: [],
      headTable: [],
      pageSize: 10,
      pageNum: 1,
      total: 0,
      eg: "",
      searchWord: "",
      tableLoading: false,
      showUpload: false,
      showMan: false,
      btnTable: undefined,
      selectListData: [],
      titleText: "",
      deptId: "",
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
      this.getDeptCode();
      this.headTable = [
        { text: "姓名", field: "name" },
        { text: "部门", field: "department" },
        {
          text: "绩效基数",
          field: "performanceCardinalNum",
          sortable: "performanceCardinalNum"
        },
        { text: "销售指标", field: "saleQuota", sortable: "saleQuota" },
        {
          text: "状态",
          field: "statusStr",
          filters: [
            { text: "正常", value: "正常" },
            { text: "离职", value: "离职" }
          ],
          prop: "statusStr"
        }
      ];
      this.btnTable = function(row) {
        return [
          { text: "编辑", prm: true },
          { text: "离职", prm: row.statusStr !== "离职" },
          { text: "删除", prm: true }
        ];
      };
    },
    getDeptCode() {
      All.postAPI({
        method: All.deptTreeData(),
        params: {
          status: ""
        }
      }).then(res => {
        this.deptTreeData = res;
      });
    },
    getTable() {
      this.tableLoading = true;
      All.postAPI({
        method: All.manList(),
        params: {
          eg: this.eg,
          departmentId: this.deptId,
          keywrod: this.searchWord,
          pageNum: this.pageNum,
          pageSize: this.pageSize
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
      this.titleText = "新增人员";
      this.queryData = "";
      this.showMan = true;
    },
    closeBefore() {
      this.showMan = false;
      this.getTable();
    },
    importBtn() {
      this.showUpload = true;
    },
    exportBtn() {
      window.open("baidu.com");
    },
    searchBtn() {
      this.getTable();
    },
    handleNodeClick(node) {
      if (this.deptId === node.id) {
        this.deptId = "";
      } else {
        this.deptId = node.id;
      }
      this.getTable();
    },
    selectChange(select) {
      this.selectListData = select;
    },
    clickBtn({ row, btn }) {
      if (btn.text === "删除") {
        this.deleteBtn(row);
      } else if (btn.text === "离职") {
        this.update(row);
      } else if (btn.text === "编辑") {
        this.titleText = "编辑人员";
        this.queryData = row;
        this.showMan = true;
      }
    },
    deleteBtn(row) {
      let id = [];
      if (row) {
        id = [row.id];
      } else {
        if (!this.selectListData.length) {
          this.$Notif({
            type: "error",
            title: "提示",
            message: "请在列表勾选"
          });
          return;
        }
        this.selectListData.forEach(item => {
          id.push(item.id);
        });
      }
      All.postAPI({
        method: All.manDelete(),
        params: {
          staffIds: id
        }
      }).then(res => {
        if (res) {
          this.getTable();
        }
      });
    },
    update(row) {
      let id = [];
      if (row) {
        id = [row.id];
      } else {
        if (!this.selectListData.length) {
          this.$Notif({
            type: "error",
            title: "提示",
            message: "请在列表勾选"
          });
          return;
        }
        this.selectListData.forEach(item => {
          id.push(item.id);
        });
      }
      All.postAPI({
        method: All.manResign(),
        params: {
          staffIds: id
        }
      }).then(res => {
        if (res == 1) {
          this.getTable();
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
#manList {
  overflow: hidden;
  /deep/.el-tree-node__expand-icon {
    font-size: 16px;
  }
  .left {
    padding: 20px;
    width: 20%;
    margin-right: 3%;
    background: #fff;
  }
  .right {
    width: 77%;
  }
}
</style>