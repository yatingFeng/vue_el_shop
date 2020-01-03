<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleVisible =true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <!-- expand展开列  index索引列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- (给每一行加个下边框,如果是第一行再加个上边框)  -->
            <el-row
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
              :class="['borderBot', i1 === 0 ?  'borderTop' : '' , 'vcenter']"
            >
              <!-- 渲染一级权限-->
              <el-col :span="5">
                <el-tag
                  :closable="true"
                  @close="removeRightById(scope.row,item1.id)"
                >{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限(又分为左右) -->
              <el-col :span="19">
                <el-row
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                  :class="[ i2 === 0 ? '' : 'borderTop' , 'vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      :closable="true"
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      v-for="(item3,i3) in item2.children"
                      :key="item3.id"
                      type="warning"
                      :closable="true"
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRoleById(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色弹框 -->
    <el-dialog title="添加角色" :visible.sync="addRoleVisible" width="50%" @close="addRoleClosed">
      <el-form
        :model="addRoleForm"
        :rules="addRoleFormRules"
        ref="addRoleFormRef"
        label-width="90px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色弹框 -->
    <el-dialog title="修改角色" :visible.sync="editRoleVisible" width="50%" @close="editRoleClosed">
      <el-form
        :model="editRoleForm"
        :rules="editRoleFormRules"
        ref="editRoleFormRef"
        label-width="90px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClose"
    >
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        :default-expand-all="true"
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roleList: [],
      // 添加角色弹框的消失与隐藏
      addRoleVisible: false,
      // 添加角色的表单数据
      addRoleForm: {
        roleName: "",
        roleDesc: ""
      },
      // 添加表单的验证规则对象
      addRoleFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ]
      },
      // 修改角色弹框的消失与隐藏
      editRoleVisible: false,
      // 查询到的角色信息对象(用来展示)
      editRoleForm: {},
      // 修改角色表单的验证规则对象
      editRoleFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ]
      },
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 存放所有权限的数据对象(树形展示)
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        children: "children", //父子节点通过哪个属性实现嵌套的
        label: "authName" //label代表的是看到的是哪个属性的值
      },
      // 默认选中的节点的id值数组
      defKeys: [],
      // 当前即将分配权限的角色的id
      roleId: ""
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }
      this.roleList = res.data;
      // console.log(this.roleList);
    },
    // 监听添加角色对话框的关闭事件
    addRoleClosed() {
      this.$refs.addRoleFormRef.resetFields();
    },
    // 点击按钮，添加新角色
    addRole() {
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return;
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post("roles", this.addRoleForm);
        if (res.meta.status !== 201) {
          this.$message.error("添加角色失败！");
        }
        this.$message.success("添加角色成功！");
        //  隐藏添加角色的对话框
        this.addRoleVisible = false;
        //  重新获取用户列表数据
        this.getRolesList();
      });
    },
    // 点击按钮，修改角色(根据id修改角色)
    async showEditDialog(id) {
      this.editRoleVisible = true;
      const { data: res } = await this.$http.get("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("查询角色信息失败");
      }
      // 查询正确时，将查询到的数据展示到表单中
      this.editRoleForm = res.data;
    },
    // 监听修改角色对话框的关闭事件
    editRoleClosed() {
      this.$refs.editRoleFormRef.resetFields();
    },
    // 修改角色信息并提交
    editRole() {
      // 先预校验，校验成功再发起修改数据请求
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return;
        // 发起修改角色信息的请求(因为修改后的数据绑定在editRoleForm对象中)
        const { data: res } = await this.$http.put(
          "roles/" + this.editRoleForm.roleId,
          {
            // 要提交的数据
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("更新角色信息失败");
        }
        // 请求成功后：关闭对话框，刷新数据列表，提示更新成功
        this.editRoleVisible = false;
        this.getRolesList();
        this.$message.success("更新角色信息成功");
      });
    },
    // 根据id删除角色的对话框
    async removeRoleById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
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
      const { data: res } = await this.$http.delete("roles/" + id);

      if (res.meta.status !== 200) {
        return this.$message.error("删除失败");
      }
      //  删除成功后提示并刷新列表
      this.$message.success("删除成功");
      this.getRolesList();
    },
    //根据id删除具体的权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (confirmResult !== "confirm") {
        this.$message.info("取消了删除！");
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        this.$message.error("删除失败");
      }
      this.$message.success("删除成功");
      // 不建议重新获取角色列表(重新渲染权限列表的值可避免刷新页面的bug)
      // this.getRolesList();
      role.children = res.data;
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      // 递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys);
      this.setRightDialogVisible = true;
      // 用来保存id,点击分配权限确定时用得到(分配权限接口用得到)
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error("获取数据失败");
      }
      // 将权限数据存放在数据对象中
      this.rightsList = res.data;
      // console.log(this.rightsList);
    },
    // 通过递归的形式获取角色下三级权限的id,并保存到数组defKeys中
    getLeafKeys(node, arr) {
      // 如果当前的节点node不包含chilidren,就证明是三级节点(就将他的id存放到数组中)
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr);
      });
    },
    // 关闭分配权限对话框时,重置存放三级id的数组
    setRightDialogClose() {
      this.defKeys = [];
    },
    // 点击确定时,为角色分配权限
    async allotRights() {
      // 获取所选权限的id,和父级半选的id
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];
      // 根据接口需求,将权限id用分号分隔开
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        {
          rids: idStr
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("分配权限失败");
      }
      this.$message.success("分配权限成功");
      this.getRolesList();
      this.setRightDialogVisible = false;
    }
  }
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.borderTop {
  border-top: 1px solid #eee;
}
.borderBot {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>