<template>
  <div>
    <el-button type="text" icon="el-icon-arrow-left" @click="$emit('close')">返回</el-button>
    <el-form :inline="true">
      <el-form-item>
        <cascaderComponent v-model="groupValue" :options="groupOptions" @change="changeGroup" :props="{ checkStrictly: true }" :showAllLevels="false"></cascaderComponent>
      </el-form-item>
      <el-form-item>
        <el-radio-group v-model="isType" @change="changeType">
          <el-radio-button :label="1">平均值</el-radio-button>
          <el-radio-button :label="2">标准值</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-input style="display:none"></el-input>
        <el-input v-model="keyword" placeholder="搜索姓名" clearable @keyup.13.native="searchBtn" style="width: 200px">
          <el-button @click="searchBtn" slot="append" icon="el-icon-search"></el-button>
        </el-input>
      </el-form-item>
      <el-form-item style="float: right">
        <el-button type="text" @click="calcExec(true)">计算绩效</el-button>
        <el-button type="text" @click="calcLock(true)">锁定绩效</el-button>
        <el-button type="text" @click="updateBtn">修改绩效规则</el-button>
        <el-button type="text" @click="importBtn">导入绩效数据</el-button>
        <el-button type="text" @click="exportBtn">导出绩效</el-button>
      </el-form-item>
    </el-form>
    <div v-loading="tableLoading">
      <tableComponent :dataList="dataList" :headTable="headTable" :btnTable="btnTable" @clickBtn="clickBtn" @link="link" :showPage="false" isSelect border></tableComponent>
    </div>
    <el-dialog v-if="showUpload" title="导入绩效数据" :visible.sync="showUpload" append-to-body>
      <uploadComponent :action="All.http + All.calcImport"></uploadComponent>
    </el-dialog>
    <el-dialog v-if="showDetail" :title="'员工绩效主页：' + staffName" :visible.sync="showDetail" fullscreen :show-close="false" :modal="false" append-to-body>
      <staffDetail :queryData="staffDetailData" @close="closeDetail"></staffDetail>
    </el-dialog>
    <el-dialog v-if="showEdit" title="手动调整" :visible.sync="showEdit" append-to-body>
      <el-form label-width="200px">
        <template v-for="(item, index) in nowrowArr">
          <el-form-item :key="index" :label="getLabel(item) + ' : '">
            <el-input v-model="updateRow[item]" style="width: 200px"></el-input>
          </el-form-item>
        </template>
        <el-form-item>
          <el-button type="primary" @click="saveBtn">确定</el-button>
          <el-button @click="closeBtn">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import All from "@api/all";
import tableComponent from "@c/TableComponent.vue";
import uploadComponent from "@c/UploadComponent";
import selectComponent from "@c/SelectComponent.vue";
import staffDetail from "./staffDetail";
import cascaderComponent from "@c/CascaderComponent.vue";
import { getPathByKey } from "@utils/index";
export default {
  components: {
    tableComponent,
    uploadComponent,
    staffDetail,
    cascaderComponent
  },
  props: {
    queryData: Object
  },
  data() {
    return {
      All: All,
      dataList: [],
      headTable: [],
      btnTable: undefined,
      tableLoading: false,
      keyword: "",
      isType: 1,
      showUpload: false,
      showDetail: false,
      groupValue: "",
      groupOptions: [],
      staffName: "",
      staffDetailData: {},
      staffId: "",
      selectListData: [],
      showEdit: false,
      nowrowArr: [],
      updateRow: {},
      dimensions: []
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.clearData();
      this.getData();
      this.getDeptCode();
    },
    clearData() {},
    getData() {
      this.btnTable = function(row) {
        return [
          { text: "计算", prm: true },
          { text: "手动调整", prm: true },
          { text: "锁定", prm: row.lock === 0 },
          { text: "删除", prm: true }
        ];
      };
    },
    selectChange(select) {
      this.selectListData = select;
    },
    getTable() {
      this.headTable = [
        {
          text: "姓名",
          field: "staffName",
          link: true
        },
        {
          text: "组别",
          field: "deptName",
          link: true
        }
      ];
      this.tableLoading = true;
      All.postAPI({
        method: All.dataQuerypage(),
        params: {
          keywrod: this.keyword,
          id: this.groupValue[this.groupValue.length - 1]
        }
      })
        .then(res => {
          if (res.length) {
            let dataList = res[0].children;
            let headTable = [];
            dataList.forEach(el => {
              let arr = Object.keys(el.data);
              arr.forEach(i => {
                el[i] = el.data[i];
              });
            });
            this.dataList = dataList;
            this.dimensions = res[0].dimensions;
            this.dimensions.forEach(item => {
              headTable.push({
                text: item.label,
                field: item.value
              });
            });
            headTable.push({
              text: "状态",
              field: "status"
            });
            this.headTable = this.headTable.concat(headTable);
          }
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },
    getLabel(row) {
      for (let i = 0, len = this.nowrowArr.length; i < len; i++) {
        let item = this.nowrowArr[i];
        if (item === row) {
          return this.$MapStr(row, this.dimensions);
        }
      }
    },
    getDeptCode() {
      All.postAPI({
        method: All.salarygroupTree(),
        params: {}
      }).then(res => {
        this.groupOptions = res;
        this.groupValue = getPathByKey(
          this.queryData.id,
          "value",
          this.groupOptions
        );
        this.getTable();
      });
    },
    changeGroup() {
      this.getTable();
    },
    changeType() {
      this.getTable();
    },
    clickBtn({ row, btn }) {
      if (btn.text === "计算") {
        this.staffId = row.staffId;
        this.calcExec();
      } else if (btn.text === "手动调整") {
        this.staffId = row.staffId;
        this.updateRow = row.data;
        this.nowrowArr = Object.keys(row.data);
        this.showEdit = true;
      } else if (btn.text === "锁定") {
        this.staffId = row.staffId;
        this.calcLock();
      } else if (btn.text === "删除") {
        this.deleteBtn(row);
      }
    },
    calcExec(all = false) {
      let params = {
        groupId: this.groupValue[this.groupValue.length - 1],
        staffIds: [this.staffId]
      };
      if (all) {
        delete params.staffIds;
      }
      All.postAPI({
        method: All.calcExec(),
        params: params
      }).then(res => {
        this.notif(res);
      });
    },
    calcLock(all = false) {
      let params = {
        groupId: this.groupValue[this.groupValue.length - 1],
        staffIds: [this.staffId]
      };
      if (all) {
        delete params.staffIds;
      }
      All.postAPI({
        method: All.calcLock(),
        params: params
      }).then(res => {
        this.notif(res);
      });
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
        method: All.dataDelete(),
        params: {
          groupId: this.groupValue[this.groupValue.length - 1],
          staffIds: id
        }
      }).then(res => {
        if (res) {
          this.getTable();
        }
      });
    },
    searchBtn() {
      this.getTable();
    },
    updateBtn() {},
    importBtn() {
      this.showUpload = true;
    },
    exportBtn() {},
    link(row, item) {
      this.staffDetailData.groupId = this.groupValue[
        this.groupValue.length - 1
      ];
      this.staffDetailData.staffId = row.staffId;
      this.staffDetailData.staffName = row.staffName;
      this.staffName = row.staffName;
      this.showDetail = true;
    },
    closeDetail() {
      this.showDetail = false;
    },
    saveBtn() {
      All.postAPI({
        method: All.dataUpdate(),
        params: {
          groupId: this.groupValue[this.groupValue.length - 1],
          staffId: this.staffId,
          data: this.updateRow
        }
      }).then(res => {
        this.notif(res);
        if (res) {
          this.showEdit = false;
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
        this.getTable();
      } else {
        this.$Notif({
          type: "error",
          title: "错误",
          message: "已保存！"
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
</style>