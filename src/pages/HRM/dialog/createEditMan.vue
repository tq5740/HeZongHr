<template>
  <div>
    <el-form label-position="right" label-width="30%">
      <el-form-item label="姓名 : ">
        <el-input v-model="params.name" placeholder="请输入姓名" clearable class="w50per"></el-input>
        <span class="required">* 必填</span>
      </el-form-item>
      <el-form-item label="部门 : ">
        <cascaderComponent v-model="departmentId" :options="deptTreeData" :props="{ label: 'name', value: 'id', checkStrictly: true }" class="w50per"></cascaderComponent>
        <span class="required">* 必填</span>
      </el-form-item>
      <el-form-item label="性别 : ">
        <el-radio-group v-model="params.gender">
          <el-radio :label="1">男</el-radio>
          <el-radio :label="2">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="绩效基数 : ">
        <el-input v-model="params.performanceCardinalNum" type="number" placeholder="请输入绩效基数" clearable class="w50per"></el-input>
      </el-form-item>
      <el-form-item label="绩效指标 : ">
        <el-input v-model="params.saleQuota" type="number" placeholder="请输入绩效指标" clearable class="w50per"></el-input>
      </el-form-item>
      <el-form-item label="等级工资 : ">
        <el-input v-model="params.levelSalary" type="number" placeholder="请输入等级工资" clearable class="w50per"></el-input>
      </el-form-item>
      <el-form-item label="基本工资 : ">
        <el-input v-model="params.baseSalary" type="number" placeholder="请输入基本工资" clearable class="w50per"></el-input>
      </el-form-item>
      <el-form-item label="绩效 : ">
        <el-input v-model="params.performanceNum" type="number" placeholder="请输入绩效" clearable class="w50per"></el-input>
      </el-form-item>
      <el-form-item label="状态 : ">
        <el-radio-group v-model="params.status">
          <el-radio :label="1">在职</el-radio>
          <el-radio :label="2">离职</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <el-form :inline="true" style="text-align: center">
      <el-form-item>
        <el-button type="primary" @click="saveBtn" :loading="loading">保存</el-button>
      </el-form-item>
      <el-form-item>
        <el-button @click="$emit('close')">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import All from "@api/all";
import cascaderComponent from "@c/CascaderComponent.vue";
import { getPathByKey } from "@utils/index";
export default {
  components: {
    cascaderComponent
  },
  props: {
    queryData: Object
  },
  data() {
    return {
      All: All,
      params: {
        name: "",
        departmentId: "",
        gender: 1,
        performanceCardinalNum: "",
        saleQuota: "",
        levelSalary: "",
        baseSalary: "",
        // performanceNum: "",
        status: 1,  
      },
      departmentId: [],
      deptTreeData: [],
      loading: false,
      id: ""
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.clearData();
      this.getDeptCode();
    },
    clearData() {
      this.params = {
        name: "",
        departmentId: "",
        gender: 1,
        performanceCardinalNum: "",
        saleQuota: "",
        levelSalary: "",
        baseSalary: "",
        // performanceNum: "",
        status: 1,  
      };
      this.id = "";
    },
    getDeptCode() {
      All.postAPI({
        method: All.deptTreeData(),
        params: {
          status: ""
        }
      }).then(res => {
        this.deptTreeData = res;
        if (this.queryData) {
          this.getData();
        }
      })
    },
    getData() {
      All.postAPI({
        method: All.manQuery(),
        params: {
          id: this.queryData.id
        }
      }).then(res => {
        for (let item in this.params) {
          this.params[item] = res[item]
        }
        let id = res.departmentId;
        this.departmentId = getPathByKey(id, "id", this.deptTreeData);
        this.id = res.id;
      })
    },
    saveBtn() {
      this.loading = true;
      this.params.departmentId = this.departmentId[this.departmentId.length - 1];
      if (this.id) {
        this.params.id = this.id;
      }
      for(let item in this.params) {
        if (this.params[item] === "") {
          this.$Notif({
            type: "error",
            title: "提示",
            message: "请填写所有必填项"
          })
          this.loading = false;
          return;
        }
      }
      All.postAPI({
        method: this.id ? All.manUpdate() : All.manSave(),
        params: this.params
      }).then(res => {
        if (res) {
          this.$Notif({
            type: "success",
            title: "提示",
            message: "操作成功！"
          })
          this.$emit('close');
        } else {
          this.$Notif({
            type: "error",
            title: "错误",
            message: "操作失败！"
          })
        }
      }).finally(() => {
        this.loading = false;
      });
    },
    close() {
      this.$parent.showMan = false;
    }
  }
};
</script>
<style lang="scss" scoped>
</style>