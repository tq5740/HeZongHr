<template>
  <div>
    <el-form label-width="110px">
      <el-form-item :label="titleName">
        <div contenteditable="true" class="text-box" id="textbox"></div>
        <!-- <EditDivComponent v-model='inputValue'></EditDivComponent> -->
        <p>
          快捷运算符：
          <el-button-group class="btn">
            <el-button @click="btnFn('+')">+</el-button>
            <el-button @click="btnFn('-')">-</el-button>
            <el-button @click="btnFn('*')">*</el-button>
            <el-button @click="btnFn('/')">/</el-button>
            <el-button @click="btnFn('>')">&gt;</el-button>
            <el-button @click="btnFn('<')">&lt;</el-button>
            <el-button @click="btnFn('>=')">&gt;=</el-button>
            <el-button @click="btnFn('<=')">&lt;=</el-button>
            <el-button @click="btnFn('=')">=</el-button>
          </el-button-group>
        </p>
        <p>
          常用函数：
          <el-button type="text" @click="btnFn('IF(,)', -2)">IF</el-button>
          <el-button type="text" @click="btnFn('Σ()', -1)">Σ</el-button>
          <!-- <el-button type="text" @click="btnFn('AVERAGE()', -1)">AVERAGE</el-button> -->
        </p>
      </el-form-item>
      <template v-for="(item, index) in dataArr">
        <el-form-item :label="item.label + '：'" :key="index">
          <template v-for="(el, ind) in item.children">
            <el-button v-if="el.value !== queryData.itemCode" @click="btnFn(el)" :key="ind" class="btnclass">{{el.label}}</el-button>
          </template>
        </el-form-item>
      </template>
      <el-form-item style="text-align: right">
        <el-button type="primary" @click="save" :loading="loading">保存</el-button>
        <el-button @click="$emit('close')">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import All from "@api/all";
export default {
  props: {
    queryData: Object
  },
  data() {
    return {
      titleName: "",
      inputValue: "",
      dataArr: [],
      inputText: "",
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.titleName = this.queryData.itemName + "=";
      let box = document.getElementById("textbox");
      box.innerHTML = "";
      box.innerHTML = this.queryData.exprDescription;
      this.getData();
    },
    getData() {
      All.postAPI({
        method: All.templateAllByGroup(),
        params: {
          id: this.queryData.id
        }
      }).then(res => {
        this.dataArr = res;
      });
    },
    save() {
      let box = document.getElementById("textbox");
      this.inputValue = "";
      for (let i = 0; i < box.childNodes.length; i++) {
        let node = box.childNodes[i];
        if ("getAttribute" in node) {
          this.inputValue += node.getAttribute("datacode");
        } else {
          this.inputValue += node.nodeValue;
        }
      }
      this.inputText = box.innerHTML;
      if (this.inputValue === "") {
        this.$Notif({
          type: "error",
          title: "提示",
          message: "公式不能为空！"
        });
        return;
      }
      this.$emit('save',this.inputText, this.inputValue)
    },
    btnFn(html) {
      if (typeof html === "object") {
        html = `<a href="" class="datatag" contentEditable="false" datacode="${html.value}">#${html.label}#</a>`;
      }
      var box = document.getElementById("textbox");
      box.focus();
      var sel, range;
      if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
          range = sel.getRangeAt(0);
          range.deleteContents();
          var el = document.createElement("div");
          el.innerHTML = html;
          var frag = document.createDocumentFragment(),
            node,
            lastNode;
          while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node);
          }
          range.insertNode(frag);
          if (lastNode) {
            range = range.cloneRange();
            range.setStartAfter(lastNode);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      } else if (document.selection && document.selection.type != "Control") {
        document.selection.createRange().pasteHTML(html);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.btn {
  /deep/ {
    .el-button {
      padding: 0;
      width: 30px;
      height: 30px;
      line-height: 30px;
      border-radius: 50% !important;
      margin-right: 10px;
    }
  }
}
.btnclass {
  margin: 0 10px 10px 0;
}
</style>