<template>
  <div>
    <header>
      <el-button type="text" icon="el-icon-arrow-left" @click="$emit('close')">返回</el-button>
      <el-form :inline="true">
        <el-form-item label="选择时间 : ">
          <datePickerComponent v-model="fromDate"></datePickerComponent>
        </el-form-item>
        <el-form-item>
          <el-checkbox-group v-model="isType" @change="changeType">
            <el-checkbox-button :label="1">平均值</el-checkbox-button>
            <el-checkbox-button :label="2">标准值</el-checkbox-button>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" class="search-btn" @click="search" :loading="chartLoading && tableLoading">搜索</el-button>
        </el-form-item>
      </el-form>
    </header>
    <div class="main-box" v-loading="chartLoading">
      <div class="selectBox">
        <el-form :inline="true">
          <el-form-item label="指标显示">
            <selectComponent size="small" :options="chartDimensions" v-model="chartDimension" @change="refreshChart" width="130px"></selectComponent>
          </el-form-item>
        </el-form>
      </div>
      <echarts :option="chartOption" height="400px"></echarts>
    </div>
    <div class="main-box" v-loading="tableLoading">
      <tableComponent :headTable="headTable" :dataList="dataList" :showPage="false" border height="580px"></tableComponent>
    </div>
  </div>
</template>

<script>
import echarts from "@c/Echarts.vue";
import selectComponent from "@c/SelectComponent.vue";
import datePickerComponent from "@c/DatePickerComponent.vue";
import tableComponent from "@c/TableComponent.vue";
import All from "@api/all";

export default {
  components: {
    echarts,
    selectComponent,
    datePickerComponent,
    tableComponent
  },
  data() {
    return {
      All: All,
      pageSize: 10,
      pageNum: 1,
      total: 0,
      params: {},
      chartDimension: "",
      fromDate: [],
      chartOption: {},
      headTable: [],
      dataList: [],
      chartLoading: false,
      tableLoading: false,
      chartDimensions: [],
      chartData: {}
    };
  },
  props: {
    queryData: Object
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.initData();
      this.getChartTable();
    },
    initData() {
      this.headTable = [
        {
          text: "月份",
          field: "date"
        },
        {
          text: "姓名",
          field: "staffName"
        },
        {
          text: "组别",
          field: "deptName"
        }
      ];
      this.dataList = [];
      this.fromDate = this.$store.state.defaultTime1;
      this.chartOption = {
        tooltip: {
          trigger: "axis"
          // formatter: res => {
          //   return this.$ChartFormatter(res, true);
          // }
        },
        legend: {
          data: [],
          x: "center",
          y: "bottom"
        },
        title: {
          text: "员工绩效概况",
          left: "center"
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "10%",
          top: "24%",
          containLabel: true
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: []
        },
        yAxis: {
          type: "value"
        },
        series: []
      };
    },
    getChartTable() {
      this.params = {
        groupId: this.queryData.groupId,
        staffId: this.queryData.staffId,
        startDate: this.$GetApiTime(this.fromDate[0]),
        endDate: this.$GetApiTime(this.fromDate[1])
      };
      All.postAPI({
        method: All.empdataChart(),
        params: this.params
      })
        .then(res => {
          if (Object.keys(res).length) {
            this.chartData = res;
            this.chartDimensions = this.chartData.dimensions;
            this.chartDimension = this.chartDimensions[0].value;
            let result = this.chartData.result;
            let headTable = [];
            this.chartDimensions.forEach((item, index) => {
              let label = item.label,
                value = item.value;
              headTable.push({
                text: label,
                field: value
              });
            });
            result.forEach(item => {
              let arr = Object.keys(item.data);
              arr.forEach(el => {
                item[el] = item.data[el];
              });
            });
            this.headTable = this.headTable.concat(headTable);
            this.dataList = result;
            this.refreshChart();
          } else {
            this.$Notif({
              type: "error",
              title: "提示",
              message: "没有数据"
            });
          }
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },
    refreshChart() {
      let result = this.chartData.result;
      let xAxis = [];
      let series = [];
      let legend = [];
      let len = result.length;
      this.chartDimensions.forEach((item, index) => {
        let label = item.label,
          value = item.value;
        legend.push(label);
        let data = [];
        for (let i = len - 1; i >= 0; i--) {
          let el = result[i];
          if (index === 0) {
            xAxis.push(el.date);
          }
          data.push(el.data[value]);
        }
        let average = this.chartData.statValue[index].value;
        if (this.chartDimension === value) {
          series[index] = {
            name: label,
            type: "line",
            data: data,
            markLine: {
              data: [
                [
                  {
                    name: "标准值",
                    coord: [0, average]
                  },
                  {
                    coord: [xAxis.length - 1, average]
                  }
                ]
              ]
            }
          };
        }
      });
      this.chartOption.series = series;
      this.chartOption.legend.data = legend;
      this.chartOption.xAxis.data = xAxis;
    },
    search() {
      this.getChartTable();
    },
    downLoad() {
      let method;
      let params = {
        startDate: this.$GetApiTime(this.fromDate[0]),
        endDate: this.$GetApiTime(this.fromDate[1]),
        timeDimension: this.timeDimension,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        eg: this.eg
      };
      if (this.nowPageNum === 0) {
        method = All.wmsExport0();
      }
      this.$GetDownload(method, params);
    }
  }
};
</script>
<style lang="scss" scoped>
.main-box {
  position: relative;
  padding: 30px 20px;
  margin-top: 20px;
  background-color: #fff;

  .selectBox {
    position: absolute;
    top: 60px;
    left: 20px;
    z-index: 9;

    #Select {
      float: left;
    }
  }
}
</style>