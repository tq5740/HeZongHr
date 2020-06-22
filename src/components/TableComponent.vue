<template>
  <div>
    <el-row class="main-body">
      <el-table @sort-change="sortChange" @selection-change="selectionChange" :border="border" :show-header="showHeader" header-row-class-name="thead" :max-height="height" :data="listData" :header-cell-style="headClass" :cell-style="bodyclass" stripe element-loading-text="加载中..." :row-key="rowKey">
        <el-table-column type="selection" width="55" v-if="isSelect" align="center"></el-table-column>
        <template v-for="(item, index) in headData">
          <el-table-column
            show-overflow-tooltip
            style="position: relative;"
            :sortable="item.sortable === true ? true : item.sortable ? 'custom' : false"
            :prop="item.sortable || item.prop"
            :key="item.text"
            :align="alignFn(item)"
            :min-width="item.minWidth"
            :width="item.width"
            :filters="item.filters"
            :filter-method="item.filters ? filterHandler : ''"
          >
            <template slot="header" slot-scope="scope">
              <span v-if="false">{{scope.$index}}</span>
              <template v-if="item.cascader">
                <span v-show="!item.cascader.isShowInput" @click.stop="headerClick(index)">
                  {{item.text}}
                  <svg style="width: 12px; height: 12px;" aria-hidden="true">
                    <use xlink:href="#icon-shaixuan" />
                  </svg>
                </span>
                <div v-show="item.cascader.isShowInput" style="height: auto;">
                  <el-cascader @visible-change="visibleChange($event, index)" clearable filterable style="position: absolute; height: 100%; z-index: 50000; top: 0px; left: -10px;" filterablev-model="value" :options="item.cascader.options" @change="item.cascader.changeFun" @expand-change="item.cascader.changeFun"></el-cascader>
                </div>
              </template>
              <template v-else>
                <span>{{item.text}}</span>
              </template>
            </template>
            <template slot-scope="scope">
              <template v-if="item.link">
                <el-link @click.native.stop="link(scope.row,item)">{{getField(scope.row, item)}}</el-link>
              </template>
              <template v-else>{{getField(scope.row, item)}}</template>
            </template>
          </el-table-column>
        </template>
        <el-table-column v-if="btnTable" prop label="操作" width="270">
          <template slot-scope="scope">
            <TableBtn @clickBtn="clickBtn" :data="scope.row" :list="getBtnListTow(scope.row)"></TableBtn>
          </template>
        </el-table-column>
      </el-table>
      <div class="page-num">
        <el-form :inline="true" class="pagination-text">
          <el-form-item>
            <span v-if="isSelect && selectNumber">
              已选择
              <span style="color: #FC703E;">{{selectNumber}}</span> 条，共
              <span class="total">{{$parent.total}}</span> 条
            </span>
            <span v-if="isSelect && selectNumber && showPage">，</span>
            <span v-if="showPage">
              每页显示
              <el-select placeholder v-model="$parent.pageSize" class="w65" @change="$parent.pageNum = 1;$parent.getTable()">
                <el-option label="10" value="10"></el-option>
                <el-option label="20" value="20"></el-option>
                <el-option label="50" value="50"></el-option>
              </el-select>条
            </span>
          </el-form-item>
        </el-form>
        <el-pagination v-if="showPage" class="pagination" :current-page.sync="$parent.pageNum" background @current-change="$parent.getTable()" :page-size="parseInt($parent.pageSize)" layout="prev, pager, next, jumper" :total="$parent.total"></el-pagination>
      </div>
    </el-row>
  </div>
</template>

<script>
import TableBtn from "@c/TableBtn";
export default {
  components: {
    TableBtn
  },
  props: {
    headTable: {
      type: Array,
      default: () => []
    },
    dataList: {
      type: Array,
      default: () => []
    },
    btnTable: {
      type: Function,
      default: null
    },
    showPage: {
      type: Boolean,
      default: true
    },
    height: {
      type: String,
      default: "100%"
    },
    border: {
      type: Boolean,
      default: false
    },
    from: {
      type: String,
      default: ""
    },
    rowKey: {
      type: String,
      default: "code"
    },
    autoSort: {
      type: Boolean,
      default: false
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    isSelect: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectNumber: 0,
      headData: [],
      listData: []
    };
  },
  watch: {
    headTable: {
      handler(newVal, oldVal) {
        this.headData = newVal;
      },
      deep: true,
      immediate: true
    },
    dataList: {
      handler(newVal, oldVal) {
        this.listData = newVal;
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    headClass() {
      return "background:rgb(249,249,249);color: #666";
    },
    bodyclass() {
      return "color: rgba(0,0,0,0.65)";
    },
    alignFn(item) {
      if (item.text.indexOf("元") !== -1) {
        return "right";
      } else if (item.field === "no") {
        return "center";
      } else {
        return "left";
      }
    },
    getField(row, item) {
      let field = item.field;
      return row[field];
    },
    selectionChange(select) {
      this.$parent.selectChange(select);
      this.selectNumber = select.length;
    },
    sortChange(sort) {
      if (this.autoSort) {
        console.log(sort);
        //获取字段名称和排序类型
        var fieldName = sort.prop;
        var sortingType = sort.order;

        let firstItem = this.listData.shift(); // 合计放第一行，不参与排序

        if (sortingType == "descending") {
          this.listData = this.listData.sort(
            (a, b) => b[fieldName] - a[fieldName]
          );
        } else {
          this.listData = this.listData.sort(
            (a, b) => a[fieldName] - b[fieldName]
          );
        }

        this.listData.unshift(firstItem);
      } else {
        console.log(sort);
        this.$parent.sortableChange(sort);
      }
    },
    headerClick(index) {
      if (this.headTable[index].cascader) {
        this.$set(this.$parent.headTable[index].cascader, "isShowInput", true);
      }
    },
    visibleChange(state, index) {
      if (this.headTable[index].cascader) {
        this.$set(this.$parent.headTable[index].cascader, "isShowInput", state);
      }
    },
    filterHandler(value, row, column) {
      const property = column["property"];
      return row[property] === value;
    },
    getBtnListTow(row) {
      let list = this.btnTable.bind(this.$parent)(row);
      return list;
    },
    clickBtn({ row, btn }) {
      this.$emit("clickBtn", { row, btn });
    },
    link(row, item) {
      this.$emit("link", row, item);
    }
  }
};
</script>
<style lang="scss">
.page-num {
  margin-top: 20px;
  overflow: hidden;
}
.pagination-text {
  float: left;
}
.pagination {
  float: right;
}
.cascader {
  position: absolute;
  z-index: 200;
  background-color: #fff;
  height: 220px;
}
// .total {
// color: $primary;
// }
// .el-table {
//   .cell {
//     overflow: hidden !important;
//   }
// }
// .el-table {
//   th {
//     div {
//       overflow: hidden !important;
//       padding-right: 0;
//     }
//   }
// }
// .tips_1 {
//   display: inline-block;
//   font-weight: bold;
//   height: 20px;
//   overflow: hidden;
//   text-overflow: ellipsis;
//   white-space: nowrap;
// }
</style>
