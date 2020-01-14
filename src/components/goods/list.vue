<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与按钮（gutter设置两列之间的间距） -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区 -->
      <el-table :data="goodslist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="110px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="80px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="160px">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="120px;">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editListById(scope.row.goods_id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeListById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
    <!-- 修改商品弹框 -->
    <el-dialog
      title="修改商品"
      :visible.sync="editListDialogVisible"
      width="50%"
      @close="editListDialogClosed"
    >
      <el-form
        :model="editListForm"
        :rules="editListFormRules"
        ref="editListFormRef"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editListForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editListForm.goods_price" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editListForm.goods_weight" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="editListForm.goods_number" type="number"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editListDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editList">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询分页参数
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 5
      },
      // 商品列表
      goodslist: [],
      // 数据总条数
      total: 0,
      // 控制修改弹框的显示与隐藏
      editListDialogVisible: false,
      // 修改商品的表单对象
      editListForm: {},
      // 编辑商品的表单验证对象
      editListFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    // 获取商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("请求商品列表失败");
      }
      // this.$message.success("请求商品列表成功");
      // 请求成功后将请求到的数据保存到数组中，将数据总条数赋值给total
      this.goodslist = res.data.goods;
      this.total = res.data.total;
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    // 监听页码值改变的事件(将当前的页码值请求给接口，并获取数据)
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage;
      this.getGoodsList();
    },
    // 根据id删除商品列表的对话框
    async removeListById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该商品, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => {
        return err;
      });
      // 如果用户确认删除，则返回字符串confirm;如果用户取消了删除，则返回值为字符串cancel
      // console.log(confirmResult)
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete("goods/" + id);
      if (res.meta.status !== 200) {
        this.$message.error("删除失败");
      }
      //  删除成功后提示并刷新列表
      this.$message.success("删除成功");
      this.getGoodsList();
    },
    // 添加商品
    goAddpage() {
      this.$router.push("goods/add");
    },
    // 编辑商品
    async editListById(id) {
      this.editListDialogVisible = true;
      const { data: res } = await this.$http.get("goods/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("查询商品信息失败");
      }
      // 查询正确时，将查询到的数据展示到表单中
      this.editListForm = res.data;
      console.log(res.data)
    },
    // 修改商品弹框关闭时，重置表单
    editListDialogClosed() {
      this.$refs.editListFormRef.resetFields();
    },
    // 提交修改商品操作
    editList() {
      // 先预校验，校验成功再发起修改数据请求
      this.$refs.editListFormRef.validate(async valid => {
        if (!valid) return;
        // 发起修改商品信息的请求(因为修改后的数据绑定在editListForm对象中)
        const { data: res } = await this.$http.put(
          "goods/" + this.editListForm.goods_id,
          this.editListForm
        );
        if (res.meta.status !== 200) {
          return this.$message.error("更新商品信息失败");
        }
        // 请求成功后：关闭对话框，刷新数据列表，提示更新成功
        this.editListDialogVisible = false;
        this.getGoodsList();
        this.$message.success("更新商品信息成功");
      });
    }
  }
};
</script>

<style lang="less" scoped>
</style>