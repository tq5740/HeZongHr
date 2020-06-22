<template>
  <div id="createEditTemplate">
    <el-button type="text" icon="el-icon-arrow-left" @click="$emit('close')">返回</el-button>
    <el-form>
      <el-form-item label="复制模板 : " v-if="!this.queryData">
        <selectComponent v-model="copyId" :options="copyOptions" @change="change" style="width: 210px; float:left"></selectComponent>
      </el-form-item>
      <el-form-item label="模板名称 : ">
        <el-input v-model="params.name" placeholder="请输入模板名称" clearable style="width: 210px;"></el-input>
        <span class="required">* 必填</span>
      </el-form-item>
      <el-form-item label="执行时间 : ">
        <el-radio-group v-model="params.effectiveMonth">
          <el-radio-button :label="0">本月生效</el-radio-button>
          <el-radio-button :label="1">下月生效</el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <el-button type="primary" @click="createGroupBtn">新增分组</el-button>
    <el-row class="title-table">
      <el-col :span="6">
        <b>绩效项</b>
      </el-col>
      <el-col :span="6">
        <b>规则</b>
      </el-col>
      <el-col :span="6">
        <b style="margin-right: 20px">试算示例</b>
        {{testText}}
      </el-col>
      <el-col :span="6">
        <el-button type="text" @click="testToggleBtn">{{testText ? "切换" : "选择试算示例"}}</el-button>
      </el-col>
    </el-row>
    <template v-for="(item, index) in groupArr">
      <el-row :key="index">
        <el-row class="title-table">
          <el-col :span="18">{{item.groupName}}</el-col>
          <el-col :span="6">
            <el-button type="text" @click="updateGroupBtn(item)">修改</el-button>
            <el-button type="text" @click="deleteGroupBtn(item)">删除</el-button>
          </el-col>
        </el-row>
        <el-row class="content-table" v-for="(el, ind) in item.item" :key="ind">
          <el-col :span="6">{{el.itemName}}</el-col>
          <el-col :span="el.testValue ? 6 : 12">
            {{el.calcType === 1 ? "每月手动导入" : el.calcType === 2 ? "每月自动提取" : "通过公式计算"}}
            <el-button type="text" @click="expressionBtn(el)">#{{el.itemName}}#</el-button>
          </el-col>
          <el-col :span="6">{{el.testValue}}</el-col>
          <el-col :span="6">
            <el-button type="text" @click="updateItemBtn(el)">修改</el-button>
            <el-button type="text" @click="deleteItemBtn(el)">删除</el-button>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" class="content-table">
            <el-button type="text" @click="createItemBtn(item)">添加绩效项</el-button>
          </el-col>
        </el-row>
      </el-row>
    </template>
    <el-form :inline="true" style="text-align: center; margin-top: 10px;">
      <el-form-item>
        <el-button type="primary" @click="saveBtn(false)" :loading="loading">保存</el-button>
      </el-form-item>
      <el-form-item>
        <el-button @click="$emit('close')">取消</el-button>
      </el-form-item>
    </el-form>
    <el-dialog v-if="showGroup" :title="groupTitle" :visible.sync="showGroup" append-to-body width="50%">
      <el-form label-width="110px">
        <el-form-item label="分组名称 : ">
          <el-input v-model="groupName" placeholder="请输入分组名称" clearable style="width: 210px;"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="groupBtn" style="float: right">确定</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog v-if="showItem" :title="itemTitle" :visible.sync="showItem" append-to-body width="50%">
      <el-form label-width="110px">
        <el-form-item label="绩效项名称 : " v-if="itemTitle !== '数据设置'">
          <el-input v-model="params1.itemName" placeholder="请输入绩效项名称" clearable style="width: 210px;"></el-input>
        </el-form-item>
        <el-form-item label="计算类型 : ">
          <el-radio-group v-model="params1.calcType">
            <el-radio :label="1">手动导入</el-radio>
            <el-radio :label="3">公式计算</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="计算公式 : " v-if="params1.calcType === 3">
          <div class="text-box" id="textbox1" @click="formulaBtn"></div>
        </el-form-item>
        <el-form-item label="统计设置 : " v-if="itemTitle !== '数据设置'">
          <el-checkbox-group v-model="params1.statType">
            <el-checkbox :label="1">组平均值</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="标准值 : ">
          <el-input v-model="params1.statValue" placeholder="请输入标准值" clearable style="width: 210px;"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="itemBtn" style="float: right">确定</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog v-if="showTest" title="选择试算示例" :visible.sync="showTest" append-to-body width="50%">
      <el-form label-width="110px">
        <el-form-item label="试算示例 : ">
          <selectComponent v-model="params.testStaffId" :options="testOptions" style="width: 210px;"></selectComponent>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="testBtn" style="float: right">确定</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog v-if="showFormula" title="公式设置" :visible.sync="showFormula" append-to-body width="50%">
      <formula :queryData="formulaData" @close="closeFormula" @save="saveFormula"></formula>
    </el-dialog>
  </div>
</template>
<script>
import All from "@api/all";
import selectComponent from "@c/SelectComponent.vue";
import formula from "../dialog/formula";
export default {
  components: {
    selectComponent,
    formula
  },
  props: {
    queryData: String
  },
  data() {
    return {
      All: All,
      params: {
        name: "",
        effectiveMonth: 0,
        creator: "",
        testStaffId: ""
      },
      groupName: "",
      id: "",
      userId: "",
      showGroup: false,
      showTest: false,
      showItem: false,
      loading: false,
      copyId: 0,
      copyOptions: [],
      testOptions: [],
      testText: "",
      groupArr: [],
      groupTitle: "",
      groupId: "",
      itemTitle: "",
      params1: {
        itemName: "",
        calcType: 1,
        exprDescription: "",
        expression: "",
        statType: [],
        statValue: ""
      },
      itemCode: "",
      itemName: "",
      showFormula: false,
      formulaData: {}
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.clearData();
      let _this = this;
      window.addEventListener("message", function(e) {
        if (e && e.userId) {
          this.userId = userId;
          console.log("userId:" + this.userId);
        }
      });
      this.params.creator = this.userId || 1;
      if (this.queryData) {
        this.id = this.queryData;
        this.getDetail(this.id);
      } else {
        this.getCode();
      }
    },
    clearData() {
      this.params = {
        name: "",
        effectiveMonth: 0,
        creator: "",
        testStaffId: ""
      };
      this.id = "";
    },
    getDetail(value) {
      if (value) {
        All.postAPI({
          method: All.templateDetail(),
          params: {
            id: value
          }
        }).then(res => {
          for (let item in this.params) {
            if (item in res) {
              this.params[item] = res[item];
            }
          }
          this.params.testStaffId = res.staffId;
          this.id = res.id;
          let date = new Date();
          let year = date.getFullYear();
          let month = date.getMonth();
          if (month === 0) {
            month = 12;
            year = year - 1;
          }
          if (month.toString().length > 1) {
            month = "" + month;
          } else {
            month = "0" + month;
          }
          if (res.staffName) {
            this.testText = res.staffName + " " + year + "年" + month + "月";
          } else {
            this.testText = "";
          }
          if (res.group && res.group.length) {
            this.groupArr = res.group;
          }
        });
      } else {
        this.clearData();
      }
    },
    getCode() {
      All.postAPI({
        method: All.templateCode()
      }).then(res => {
        this.copyOptions = res;
        this.copyOptions.unshift({ label: "空白模板", value: 0 });
      });
    },
    getTestCode() {
      All.postAPI({
        method: All.templateTestCode()
      }).then(res => {
        this.testOptions = res;
        if (!this.params.testStaffId) {
          this.params.testStaffId = res[0].value;
        }
      });
    },
    saveBtn(refresh = false) {
      this.loading = true;
      if (this.copyId) {
        this.id = "";
      }
      if (this.id) {
        this.params.id = this.id;
        delete this.params.creator;
      }
      if (this.params.name === "") {
        this.$Notif({
          type: "error",
          title: "提示",
          message: "请填写模板名称"
        });
        this.loading = false;
        return;
      }
      All.postAPI({
        method: this.id ? All.templateUpdate() : All.templateSave(),
        params: this.params
      })
        .then(res => {
          if (res) {
            this.id = res;
            this.$Notif({
              type: "success",
              title: "提示",
              message: "操作成功！"
            });
            if (refresh) {
              this.getDetail(this.id);
            }
          } else {
            this.$Notif({
              type: "error",
              title: "错误",
              message: "已保存！"
            });
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    createGroupBtn() {
      if (this.id) {
        this.groupName = "";
        this.groupTitle = "新增分组";
        this.showGroup = true;
      } else {
        this.$Confirm("新增分组前须保存当前模板，是否保存？").then(() => {
          this.saveBtn(false);
        });
      }
    },
    closeGroupBefore() {
      this.showGroup = false;
    },
    change(value) {
      console.log(value);
      this.getDetail(value);
    },
    testToggleBtn() {
      if (this.id) {
        this.getTestCode();
        this.showTest = true;
      } else {
        this.$Confirm("选择示例前须保存当前模板，是否保存？").then(() => {
          this.saveBtn(false);
        });
      }
    },
    testBtn() {
      this.showTest = false;
      this.saveBtn(true);
    },
    groupBtn() {
      let isCreate;
      this.groupTitle === "修改分组" ? (isCreate = false) : (isCreate = true);
      let key = isCreate ? "templateId" : "groupId";
      let id = isCreate ? this.id : this.groupId;
      All.postAPI({
        method: isCreate ? All.templateGroupSave() : All.templateGroupUpdate(),
        params: {
          name: this.groupName,
          [key]: id
        }
      }).then(res => {
        this.notif(res);
        this.showGroup = false;
      });
    },
    updateGroupBtn(item) {
      this.groupId = item.groupId;
      this.groupName = item.groupName;
      this.groupTitle = "修改分组";
      this.showGroup = true;
    },
    deleteGroupBtn(item) {
      this.$Confirm(`确认删除分组：${item.groupName}？`).then(() => {
        All.postAPI({
          method: All.templateGroupDelete(),
          params: {
            groupId: item.groupId,
            templateId: this.id
          }
        }).then(res => {
          this.notif(res);
        });
      });
    },
    updateItemBtn(item) {
      this.showItem = true;
      for (let el in this.params1) {
        if (el in item) {
          this.params1[el] = item[el];
        }
      }
      this.params1.statType = [this.params1.statType];
      this.itemCode = item.itemCode;
      this.itemName = item.itemName;
      this.itemTitle = "修改绩效项";
      if (this.params1.calcType === 3) {
        this.$nextTick(() => {
          let box = document.getElementById("textbox1");
          box.innerHTML = this.params1.exprDescription;
        });
      }
    },
    deleteItemBtn(item) {
      this.$Confirm(`确认删除绩效项：${item.itemName}？`).then(() => {
        All.postAPI({
          method: All.templateItemDelete(),
          params: {
            templateId: this.id,
            itemCode: item.itemCode
          }
        }).then(res => {
          this.notif(res);
        });
      });
    },
    createItemBtn(el) {
      this.groupId = el.groupId;
      if (this.id) {
        this.params1 = {
          itemName: "",
          calcType: 1,
          expression: "",
          exprDescription: "",
          statType: [],
          statValue: ""
        };
        this.itemTitle = "添加绩效项";
        this.showItem = true;
      } else {
        this.$Confirm("新增绩效项须保存当前模板，是否保存？").then(() => {
          this.saveBtn();
        });
      }
    },
    itemBtn() {
      let isCreate;
      this.itemTitle === "添加绩效项" ? (isCreate = true) : (isCreate = false);
      let key = isCreate ? "groupId" : "itemCode";
      let id = isCreate ? this.groupId : this.itemCode;
      if (this.params1.itemName === "") {
        this.$Notif({
          type: "error",
          title: "提示",
          message: "请填写绩效项名称"
        });
        return;
      }
      let params = {
        [key]: id,
        templateId: this.id,
        ...this.params1
      };
      params.statType = params.statType[0];
      All.postAPI({
        method: isCreate ? All.templateItemSave() : All.templateItemUpdate(),
        params: params
      }).then(res => {
        this.notif(res);
        this.showItem = false;
      });
    },
    expressionBtn(el) {
      // console.log(el);
      this.params1 = {
        calcType: el.calcType,
        expression: el.expression,
        exprDescription: el.exprDescription,
        itemName: el.itemName
      };
      this.itemCode = el.itemCode;
      this.itemName = el.itemName;
      this.itemTitle = "数据设置";
      this.showItem = true;
      this.$nextTick(() => {
        let box = document.getElementById("textbox1");
        box.innerHTML = this.params1.exprDescription;
      });
    },
    notif(res) {
      if (res) {
        this.$Notif({
          type: "success",
          title: "提示",
          message: "操作成功！"
        });
        this.getDetail(this.id);
      } else {
        this.$Notif({
          type: "error",
          title: "错误",
          message: "已保存！"
        });
      }
    },
    formulaBtn() {
      if (!this.params1.itemName) {
        this.$Notif({
          type: "error",
          title: "错误",
          message: "请先填写绩效项名称！"
        });
        return;
      }
      this.formulaData.itemName = this.itemName || this.params1.itemName;
      this.formulaData.itemCode = this.itemCode;
      this.formulaData.id = this.id;
      this.formulaData.exprDescription = this.params1.exprDescription;
      this.showFormula = true;
    },
    closeFormula() {
      this.showFormula = false;
    },
    saveFormula(inputText, inputValue) {
      this.showFormula = false;
      this.params1.expression = inputValue;
      this.params1.exprDescription = inputText;
      let box = document.getElementById("textbox1");
      box.innerHTML = this.params1.exprDescription;
    }
  }
};
</script>
<style lang="scss" scoped>
.title-table {
  background: #fafafa;
  border: 1px solid #dcdfe6;
  margin-top: 20px;
  line-height: 40px;
  padding-left: 20px;
}
.content-table {
  background: #fff;
  border: 1px solid #dcdfe6;
  margin-top: -1px;
  line-height: 40px;
  padding-left: 20px;
}
.text-box {
  cursor: pointer;
}
</style>