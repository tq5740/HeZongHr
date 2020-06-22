<template>
  <div>
    <el-form label-position="right" label-width="30%">
      <el-form-item label="上级部门 : ">
        <cascaderComponent v-model="parentId" :options="deptTreeData" :props="{ label: 'name', value: 'id', checkStrictly: true }" class="w50per"></cascaderComponent>
        <span class="required">* 必填</span>
      </el-form-item>
      <el-form-item label="部门名称 : ">
        <el-input v-model="params.departmentName" placeholder="请输入部门名称" clearable class="w50per"></el-input>
        <span class="required">* 必填</span>
      </el-form-item>
      <el-form-item label="显示排序 : ">
        <el-input v-model="params.index" type="number" placeholder="请输入排序" clearable class="w50per"></el-input>
        <span class="required">* 必填</span>
      </el-form-item>
      <el-form-item label="负责人 : ">
        <selectComponent v-model="params.leader" :options="deptLeaderCode" placeholder="请选择负责人" clearable class="w50per"></selectComponent>
      </el-form-item>
      <el-form-item label="联系电话 : ">
        <el-input v-model="params.leaderPhone" type="number" placeholder="请输入联系电话" clearable class="w50per"></el-input>
      </el-form-item>
      <el-form-item label="邮箱 : ">
        <el-input v-model="params.leaderEmail" placeholder="请输入邮箱" clearable class="w50per"></el-input>
      </el-form-item>
      <el-form-item label="部门状态 : ">
        <el-radio-group v-model="params.status">
          <el-radio :label="1">正常</el-radio>
          <el-radio :label="2">停用</el-radio>
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
import selectComponent from "@c/SelectComponent.vue";
import { getPathByKey } from "@utils/index";
export default {
  components: {
    cascaderComponent,
    selectComponent
  },
  props: {
    queryData: Object
  },
  data() {
    return {
      All: All,
      params: {
        departmentName: "",
        parentId: "",
        index: "",
        leader: "",
        leaderPhone: "",
        leaderEmail: "",
        status: 1
      },
      parentId: [0],
      deptTreeData: [],
      deptLeaderCode: [],
      loading: false,
      departmentId: ""
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.clearData();
      this.getDeptCode();
      this.getLeaderCode();
    },
    clearData() {
      this.params = {
        departmentName: "",
        parentId: "",
        index: "",
        leader: "",
        leaderPhone: "",
        leaderEmail: "",
        status: 1
      };
      this.departmentId = "";
    },
    getDeptCode() {
      All.postAPI({
        method: All.deptTreeData(),
        params: {
          status: ""
        }
      }).then(res => {
        this.deptTreeData = res;
        this.deptTreeData.unshift({
          name: "顶层",
          id: 0
        });
        if (this.queryData) {
          this.getData();
        }
      });
    },
    getLeaderCode() {
      All.postAPI({
        method: All.deptLeaderCode()
      }).then(res => {
        this.deptLeaderCode = res;
      });
    },
    getData() {
      All.postAPI({
        method: All.deptQuery(),
        params: {
          departmentId: this.queryData.id
        }
      }).then(res => {
        let id;
        if (this.queryData.titleText === "新增部门") {
          id = this.queryData.id;
        } else {
          for (let item in this.params) {
            this.params[item] = res[item];
          }
          this.params.leader = +this.params.leader;
          id = res.parentId;
          this.departmentId = res.departmentId;
        }
        this.parentId = id ? getPathByKey(id, "id", this.deptTreeData) : [0];
      });
    },
    saveBtn() {
      this.loading = true;
      this.params.parentId = this.parentId[this.parentId.length - 1];
      if (this.departmentId) {
        this.params.departmentId = this.departmentId;
      }
      for (let item in this.params) {
        if (this.params[item] === "") {
          this.$Notif({
            type: "error",
            title: "提示",
            message: "请填写所有必填项"
          });
          this.loading = false;
          return;
        }
      }
      All.postAPI({
        method: All.deptSave(),
        params: this.params
      })
        .then(res => {
          if (res == 1) {
            this.$Notif({
              type: "success",
              title: "提示",
              message: "操作成功！"
            });
            this.$emit("close");
          } else {
            this.$Notif({
              type: "error",
              title: "错误",
              message: "操作失败！"
            });
          }
        })
        .finally(() => {
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