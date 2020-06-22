<template>
  <div id="manList">
    <div class="left">
      <el-form :inline="true">
        <el-form-item>
          <el-button type="primary" @click="createBtn1">新增薪资组</el-button>
        </el-form-item>
      </el-form>
      <div class="tree">
        <el-tree :data="salarygroupTree" :props="{children: 'children', label: 'label'}" @node-click="handleNodeClick" :expand-on-click-node="false" default-expand-all highlight-current></el-tree>
      </div>
    </div>
    <div class="right">
      <el-form :inline="true">
        <el-form-item>{{allData.name}}（{{total}}人）</el-form-item>
        <el-form-item label="绩效周期 : ">{{allData.calcStartDate}} 至 {{allData.calcEndDate}}</el-form-item>
        <el-form-item>
          <el-button type="text" @click="updateDateBtn">设置</el-button>
        </el-form-item>
        <el-form-item style="float:right">
          <el-button type="primary" @click="templatesBtn">批量设置绩效模板</el-button>
        </el-form-item>
        <el-form-item style="float:right">
          <el-button type="primary" @click="deleteBtn()">批量删除员工</el-button>
        </el-form-item>
        <el-form-item style="float:right">
          <el-button type="primary" @click="createBtn2">添加员工</el-button>
        </el-form-item>
      </el-form>
      <div v-loading="tableLoading">
        <tableComponent :dataList="dataList" :headTable="headTable" :btnTable="btnTable" @clickBtn="clickBtn" @link="link" :showPage="false" border isSelect></tableComponent>
      </div>
    </div>
    <el-dialog v-if="showAddGroup" :title="titleText" :visible.sync="showAddGroup" :before-close="closeGroupBefore">
      <el-form label-position="right" label-width="30%">
        <el-form-item label="上级薪资组 : ">
          <cascaderComponent v-model="salarygroupPid" :options="salarygroupTreeOption" :props="{ checkStrictly: true }" class="w50per"></cascaderComponent>
          <span class="required">* 必填</span>
        </el-form-item>
        <el-form-item label="薪资组 : ">
          <el-input v-model="salarygroupName" placeholder="请输入薪资组名称" clearable class="w50per"></el-input>
          <span class="required">* 必填</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="salarygroupBtn">确定</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog v-if="showDate" title="设置绩效周期" :visible.sync="showDate">
      <el-form label-position="right" label-width="30%">
        <el-form-item label="绩效周期 : ">
          {{allData.calcStartDate.substr(0, 8)}}
          <selectComponent v-model="dateDay" :options="dateDayOption" style="width: 65px;display: inline-block"></selectComponent>日
          至 {{allData.calcEndDate}}
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="dateBtn">确定</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog v-if="showStaff" title="请选择使用该绩效模板的员工" :visible.sync="showStaff">
      <el-form label-position="right" label-width="30%">
        <el-form-item label="员工 : ">
          <cascaderComponent v-model="staffId" :options="staffTree" :props="{ label: 'staffName', value: 'staffId' ,multiple: true }" class="w50per"></cascaderComponent>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="staffBtn">确定</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog v-if="showTemplate" title="设置绩效模板" :visible.sync="showTemplate">
      <el-form label-position="right" label-width="30%">
        <el-form-item label="绩效模板 : ">
          <selectComponent v-model="templateId" :options="templateCode" class="w50per"></selectComponent>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="templateBtn">确定</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog v-if="showCreateEdit" :title="titleText" :visible.sync="showCreateEdit" :before-close="closeTemplate" fullscreen :show-close="false" :modal="false">
      <createEditTemplate @close="closeTemplate" :queryData="queryData"></createEditTemplate>
    </el-dialog>
  </div>
</template>

<script>
import All from "@api/all";
import tableComponent from "@c/TableComponent.vue";
import selectComponent from "@c/SelectComponent.vue";
import cascaderComponent from "@c/CascaderComponent.vue";
import createEditTemplate from "../dialog/createEditTemplate";
export default {
  components: {
    tableComponent,
    cascaderComponent,
    selectComponent,
    createEditTemplate
  },
  data() {
    return {
      All: All,
      total: 0,
      salarygroupTree: [],
      salarygroupTreeOption: [],
      dataList: [],
      headTable: [],
      tableLoading: false,
      showAddGroup: false,
      btnTable: undefined,
      selectListData: [],
      titleText: "",
      salarygroupId: "",
      salarygroupPid: [0],
      salarygroupName: "",
      allData: {},
      dateDay: "",
      dateDayOption: [],
      showDate: false,
      showStaff: false,
      showTemplate: false,
      staffId: [],
      staffTree: [],
      templateCode: [],
      templateId: "",
      nowRow: {},
      showCreateEdit: false
    };
  },
  computed: {},
  watch: {},
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.clearData();
      this.getData();
    },
    clearData() {
      this.salarygroupPid = [0];
      this.salarygroupName = "";
    },
    getData() {
      this.getDeptCode();
      this.headTable = [
        { text: "姓名", field: "staffName" },
        { text: "部门", field: "deptName" },
        { text: "生效的绩效模板", field: "templateName", link: true}
      ];
      this.btnTable = function(row) {
        return [
          { text: "设置绩效模板", prm: true },
          { text: "删除", prm: true }
        ];
      };
    },
    getDeptCode() {
      All.postAPI({
        method: All.salarygroupTree(),
        params: {}
      }).then(res => {
        this.salarygroupTree = res;
        this.salarygroupTreeOption = [
          {
            label: "顶层",
            value: 0
          },
          ...res
        ];
        let groupId = this.$GetStorage("salaryGroupId");
        groupId ? this.salarygroupId = groupId : this.salarygroupId = this.salarygroupTree[0].value;
        this.getTable();
      });
    },
    getTable() {
      this.tableLoading = true;
      All.postAPI({
        method: All.salarygroupQuery(),
        params: {
          id: this.salarygroupId
        }
      })
        .then(res => {
          this.allData = res;
          this.dataList = this.allData.children;
          this.total = this.allData.staffNum;
          this.dateDay = this.allData.calcStartDate.substr(8, 11);
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },
    createBtn1() {
      this.titleText = "新增薪资组";
      this.showAddGroup = true;
    },
    closeGroupBefore() {
      this.showAddGroup = false;
      this.getDeptCode();
    },
    closeBefore() {
      this.showDate = false;
      this.getTable();
    },
    salarygroupBtn() {
      if (!(this.salarygroupPid.length && this.salarygroupName)) {
        this.$Notif({
          type: "error",
          title: "提示",
          message: "请填写所有必填项！"
        });
      }
      All.postAPI({
        method: All.salarygroupSave(),
        params: {
          pid: this.salarygroupPid[this.salarygroupPid.length - 1],
          name: this.salarygroupName
        }
      }).then(res => {
        if (res) {
          this.$Notif({
            type: "success",
            title: "提示",
            message: "操作成功！"
          });
          this.closeGroupBefore();
        } else {
          this.$Notif({
            type: "error",
            title: "错误",
            message: "操作失败！"
          });
        }
      });
    },
    handleNodeClick(node) {
      this.salarygroupId = node.value;
      this.getTable();
    },
    selectChange(select) {
      this.selectListData = select;
    },
    clickBtn({ row, btn }) {
      // console.log(row)
      if (btn.text === "删除") {
        this.deleteBtn(row);
      } else if (btn.text === "设置绩效模板") {
        this.nowRow = row;
        this.getCode();
        this.templateId = row.templateId || "";
        this.showTemplate = true;
      } else if (btn.text === "编辑") {
        this.titleText = "编辑人员";
        this.showAddGroup = true;
      }
    },
    deleteBtn(row) {
      let id = [];
      if (row) {
        id = [row.staffId];
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
          id.push(item.staffId);
        });
      }
      All.postAPI({
        method: All.salarygroupDeleteemployee(),
        params: {
          id: this.salarygroupId,
          staffIds: id
        }
      }).then(res => {
        this.notif(res);
      });
    },
    updateTemplate(row) {
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
        this.notif(res);
      });
    },
    getCode() {
      All.postAPI({
        method: All.templateCode()
      }).then(res => {
        this.templateCode = res;
      });
    },
    updateDateBtn() {
      this.showDate = true;
      let num = +this.allData.calcEndDate.substr(8, 11);;
      let arr = [];
      for (let i = 1; i < num + 1; i++) {
        if (i.toString().length < 2) {
          i = "0" + i;
        }
        arr.push({
          label: i + "",
          value: i + ""
        });
      }
      this.dateDayOption = arr;
    },
    dateBtn() {
      let startDate =
        this.$store.state.newDate(1).toString() +
        this.$store.state.newDate(2) +
        this.dateDay;
      let endDate =
        this.$store.state.newDate(1).toString() +
        this.$store.state.newDate(2) +
        this.$store.state.newDate(3);
      All.postAPI({
        method: All.salarygroupCycleUpdate(),
        params: {
          id: this.salarygroupId,
          startDate: startDate,
          endDate: endDate
        }
      }).then(res => {
        this.notif(res);
      });
    },
    createBtn2() {
      this.staffId = [];
      this.showStaff = true;
      this.getStaffCode();
    },
    getStaffCode() {
      All.postAPI({
        method: All.empdataStaffTree()
      }).then(res => {
        this.staffTree = res;
        this.getTree(this.staffTree);
      });
    },
    getTree(res) {
      res.forEach(item => {
        if ("deptName" in item) {
          item.staffName = item.deptName;
          item.staffId = item.deptName;
        }
        if (item.children) {
          this.getTree(item.children);
        }
      });
      return res;
    },
    staffBtn() {
      let arr = [];
      this.staffId.forEach(item => {
        let id = item[item.length - 1];
        if (typeof id !== "string") {
          arr.push(id);
        }
      });
      if (!arr.length) {
        this.$Notif({
          type: "error",
          title: "提示",
          message: "请选择至少一个人员"
        });
        return;
      }
      All.postAPI({
        method: All.salarygroupStaffAdd(),
        params: {
          id: this.salarygroupId,
          staffIds: arr
        }
      }).then(res => {
        if (res) {
          this.$Notif({
            type: "success",
            title: "提示",
            message: "操作成功！"
          });
          this.showStaff = false;
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
    templatesBtn() {
      this.nowRow = {};
      if (!this.selectListData.length) {
        this.$Notif({
          type: "error",
          title: "提示",
          message: "请在列表勾选"
        });
        return;
      } else {
        this.getCode();
        this.showTemplate = true;
      }
    },
    templateBtn() {
      let id = [];
      console.log(this.nowRow)
      if (Object.keys(this.nowRow).length !== 0) {
        id = [this.nowRow.staffId];
      } else {
        this.selectListData.forEach(item => {
          id.push(item.staffId);
        });
      }
      All.postAPI({
        method: All.salarygroupTemplateUpdate(),
        params: {
          id: this.salarygroupId,
          staffIds: id,
          templateId: this.templateId
        }
      }).then(res => {
        if (res) {
          this.$Notif({
            type: "success",
            title: "提示",
            message: "操作成功！"
          });
          this.showTemplate = false;
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
    notif(res) {
      if (res) {
        this.$Notif({
          type: "success",
          title: "提示",
          message: "操作成功！"
        });
        this.closeBefore();
      } else {
        this.$Notif({
          type: "error",
          title: "错误",
          message: "操作失败！"
        });
      }
    },
    link(row, item) {
      this.titleText = "编辑模板";
      this.queryData = row.templateId;
      this.showCreateEdit = true;
    },
    closeTemplate() {
      this.showCreateEdit = false;
    },
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
    width: 20%;
    margin-right: 3%;
    .tree {
      padding: 20px;
      background: #fff;
    }
  }
  .right {
    width: 77%;
  }
}
</style>