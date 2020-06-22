<template>
  <div>
    <header class="header">
      <div class="left">
        <div class="icon">{{month}}月</div>
        <div class="text">
          <el-form :inline="true">
            <el-form-item>
              <el-button @click="changeTime(1)" icon="el-icon-arrow-left"></el-button>
            </el-form-item>
            <el-form-item>
              <p>{{year}}年{{month}}月薪资表</p>
            </el-form-item>
            <el-form-item>
              <el-button @click="changeTime(2)" icon="el-icon-arrow-right" :disabled="changeTime()"></el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="right">
        <list-row :dataArr="arr"></list-row>
      </div>
    </header>
    <el-form :inline="true">
      <el-form-item>
        <el-button @click="addBtn">新增薪资组</el-button>
      </el-form-item>
      <el-form-item>
        <el-button @click="countBtn">计算绩效</el-button>
      </el-form-item>
      <el-form-item>
        <el-button @click="init">刷新</el-button>
      </el-form-item>
    </el-form>
    <main class="main">
      <div class="list-box" v-for="(item, index) in listData" :key="index">
        <div class="left">
          <div class="icon">
            <el-icon class="el-icon-s-promotion"></el-icon>
          </div>
          <div class="text">
            <div class="name">
              <p>{{item.name}}</p>
              <span class="state1">{{item.status === 1 ? "未计算" : item.status === 2 ? "部分计算" : item.status === 3 ? "计算完成" : ""}}</span>
            </div>
            <span class="sub">绩效计算周期：{{item.cycle}}</span>
            <div class="btn">
              <el-button type="text" @click="setBtn(item)">绩效组设置</el-button>
              <el-button type="text" @click="deleteBtn(item)">删除</el-button>
            </div>
          </div>
        </div>
        <div class="right">
          <list-row :dataArr="dataArr(item)" class="list-row" :key="index"></list-row>
          <el-button type="primary" class="main-btn" @click="lookBtn(item)">查看绩效</el-button>
        </div>
      </div>
    </main>
    <el-dialog v-if="showLook" :title="dialogTitle" :visible.sync="showLook" :before-close="closeLook" fullscreen :show-close="false" :modal="false">
      <deptPerformanceList :queryData="queryData" @close="closeLook"></deptPerformanceList>
    </el-dialog>
  </div>
</template>
<script>
import All from "@api/all";
import listRow from "@c/listRow.vue";
import deptPerformanceList from "../dialog/deptPerformanceList";
export default {
  components: {
    listRow,
    deptPerformanceList
  },
  data() {
    return {
      All: All,
      year: 2020,
      month: 3,
      loading: false,
      listData: [],
      arr: [],
      showLook: false,
      dialogTitle: "",
      queryData: {}
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.getData();
      this.getList();
    },
    getData() {
      this.arr = [
        {
          name: "计算部门",
          value1: "",
          value2: "",
          unit: "个"
        },
        {
          name: "计算人数",
          value1: "",
          value2: "",
          unit: "人"
        },
        {
          name: "绩效工资",
          value1: "",
          unit: "万元",
          change: ""
        }
      ];
      this.year = this.$store.state.newDate(1);
      this.month = this.$store.state.newDate(2);
    },
    getList() {
      this.loading = true;
      All.postAPI({
        method: All.salarygroupList(),
        params: {
          date: this.year + this.month
        }
      })
        .then(res => {
          this.arr[0].value1 = res.calcDeptNum;
          this.arr[0].value2 = res.deptNum;
          this.arr[1].value1 = res.calcStaffNum;
          this.arr[1].value2 = res.staffNum;
          this.arr[2].value1 = res.salary;
          this.arr[2].change = res.change + "";
          this.listData = res.children;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    dataArr(item) {
      return [
        {
          name: "计算部门",
          value1: item.calcDeptNum,
          value2: item.deptNum,
          unit: "个"
        },
        {
          name: "计算人数",
          value1: item.calcStaffNum,
          value2: item.staffNum,
          unit: "人"
        },
        {
          name: "绩效工资",
          value1: item.salary,
          unit: "万元",
          change: item.change + ""
        }
      ];
    },
    deleteBtn(item) {
      this.$Confirm(`确认删除薪资组：${item.name}？`).then(() => {
        All.postAPI({
          method: All.templateItemDelete(),
          params: {
            itemCode: item.id
          }
        }).then(res => {
          this.notif(res);
        });
      });
    },
    notif(res) {
      if (res) {
        this.$Notif({
          type: "success",
          title: "提示",
          message: "操作成功！"
        });
        this.getList();
      } else {
        this.$Notif({
          type: "error",
          title: "错误",
          message: "操作失败！"
        });
      }
    },
    addBtn() {
      this.$RemoveStorage("salaryGroupId");
      window.parent.postMessage({ url: "/hrm/salaryGroups" }, "*");
    },
    lookBtn(item) {
      this.queryData = item;
      this.showLook = true;
    },
    closeLook() {
      this.showLook = false;
      this.getList();
    },
    setBtn(row) {
      this.$SetStorage("salaryGroupId", row.id);
      window.parent.postMessage({ url: "/hrm/salaryGroups" }, "*");
    },
    countBtn() {
      All.postAPI({
        method: All.calcExec(),
        params: {
          groupId: this.queryData.id
        }
      }).then(res => {
        this.notif(res);
      });
    },
    changeTime(type = null) {
      let date = new Date();
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      if (type === 1) {
        this.month --;
        this.month = "" + this.month;
        if (this.month.length < 2) {
          this.month = "0" + this.month;
        }
        if (this.month === "00") {
          this.month = "12"
          this.year = "" + this.year --;
        }
        this.getList();
      } else if (type === 2) {
        this.month ++;
        this.month = "" + this.month;
        if (this.month.length < 2) {
          this.month = "0" + this.month;
        }
        if (this.month === "13") {
          this.month = "1"
          this.year = "" + this.year ++;
        }
        this.getList();
      } else {
        if (this.year == year && this.month == month) {
          return true;
        }
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.header {
  padding: 40px;
  background: #fff;
  overflow: hidden;
  margin-bottom: 30px;
  .left {
    width: 50%;
    float: left;
    overflow: hidden;
    .icon {
      color: #fff;
      width: 80px;
      height: 80px;
      line-height: 80px;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      border-radius: 50%;
      float: left;
      background: $primary;
      margin-right: 15px;
    }
    .text {
      display: flex;
      flex-wrap: wrap;
      margin-top: 21px;
      p {
        font-size: 22px;
        margin-bottom: 7px;
      }
      span {
        font-size: 14px;
        color: $font2;
      }
    }
  }
  .right {
    width: 50%;
    float: right;
  }
}
.main {
  .list-box {
    overflow: hidden;
    padding: 40px;
    background: #fff;
    margin-bottom: 20px;
    .left {
      width: 30%;
      .icon {
        background: rgb(168, 148, 246);
        width: 30px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        border-radius: 50%;
        color: #fff;
        float: left;
        margin-right: 20px;
      }
      .text {
        float: left;
        .name {
          margin-bottom: 5px;
          overflow: hidden;
          p {
            font-weight: bold;
            float: left;
            margin-right: 10px;
          }
          span {
            width: 5em;
            height: 2em;
            line-height: 2em;
            font-size: 12px;
            text-align: center;
            color: #fff;
            transform: scale(0.8);
            float: left;
          }
          .state1 {
            background: $state1;
          }
          .state2 {
            background: $state2;
          }
          .state3 {
            background: $state3;
          }
          .state4 {
            background: $state4;
          }
        }
        .sub {
          color: $font2;
          font-size: 14px;
        }
      }
    }
    .right {
      width: 70%;
      .list-row {
        float: left;
        width: 80%;
      }
      .main-btn {
        margin-top: 20px;
        float: right;
      }
    }
  }
}
</style>