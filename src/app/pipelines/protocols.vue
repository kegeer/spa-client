<template>
<main>
  <div class="main-left">
    <el-menu default-active="/active" class="el-menu-vertical-demo" :router="true">
      <el-menu-item index="/active" :class="{'isActive': active}">技术路线管理</el-menu-item>
      <el-menu-item index="/active" :class="{'isActive': active}">实验方法管理</el-menu-item>
    </el-menu>
  </div>

  <div class="main-right">
    <breadcrumb></breadcrumb>
    <div class="filters">
      <div class="filter">
        关键词：
        <el-input placeholder="请输入关键词" v-model="name"></el-input>
      </div>
      <el-button-group style="display: inline-block;">
        <el-button type="primary" @click="search" icon="search">搜索</el-button>
        <el-button type="default" @click="add">新增</el-button>
      </el-button-group>
    </div>

    <el-table v-loading="fetching" :data="protocols" stripe border style="width: 100%;">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="procedure" label="所属流程"></el-table-column>
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column inline-template label="操作" width="180">
        <div>
          <el-button @click="edit($index)" type="default" icon="edit" size="mini">
          </el-button>
          <el-button @click="askRemove($index)" type="warning" icon="delete" size="mini">
          </el-button>
        </div>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination @current-change="navigate" :current-page="pagination.current_page" :page-size="pagination.per_page" layout="total, prev, pager, next, jumper" :total="pagination.total"></el-pagination>
    </div>

    <el-dialog :title="formTitle" v-model="isFormVisible" :close-on-click-modal="false" @close="close">
      <el-form :model="form" label-width="80px" :rules="formRules" ref="form">
        <el-form-item label="所属流程" ref="firstInput" prop="name">
          <el-input v-model="form.procedure" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="详细步骤" prop="content">
          <el-input v-model="form.content" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click.native.prevent="submit" :loading="formLoading">{{ fromButtonText }}</el-button>
      </div>
    </el-dialog>
  </div>
</main>
</template>

<script>
import { pick } from 'lodash'
import { mapState, mapActions } from 'vuex'
export default {
  data () {
    return {
      name: '',
      active: false,
      form: {
        id: 0,
        procedure: 0,
        name: '',
        content: ''
      },
      isFormVisible: false,
      formTitle: '编辑',
      fromButtonText: '保存',
      formLoading: false,
      formRules: {
        procedure: [
          {required: true, message: '请选择所属流程', trigger: 'blure'}
        ],
        name: [
          {required: true, message: '请输入名称', trigger: 'blure'}
        ]
      }
    }
  },
  mounted () {
    this.fetch()
  },
  computed: {
    ...mapState({
      protocols: state => state.Pipelines.protocols,
      pagination: state => state.Pipelines.protocols_pagination,
      fetching: state => state.fetching
    }),
    currentPage () {
      return parseInt(this.$route.query.page, 10) || 1
    },
    isEditing () {
      return this.form.id > 0
    }
  },
  watch: {
    currentPage: 'fetch'
  },
  methods: {
    ...mapActions(['setFetching', 'protocolsSetData']),
    fetch () {
      this.setFetching({
        fetching: true
      })
      this.$http.get(`protocols?page=${this.currentPage}`)
        .then(({
          data
        }) => {
          this.protocolsSetData({
            protocols: data.data,
            protocols_pagination: data.meta.pagination
          })
          this.setFetching({
            fetching: false
          })
        })
    },
    search () {
      console.log('search')
    },
    add () {
      this.isFormVisible = true
      this.formTitle = '新增'
      this.fromButtonText = '创建'
    },
    edit (index) {
      this.isFormVisible = true
      this.formTitle = '编辑'
      this.fromButtonText = '更新'
      const protocol = this.protocols[index]
      this.form = {...protocol}
    },
    askRemove (index) {
      const protocol = this.protocols[index]
      this.$confirm('确认删除记录吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.$http.delete(`protocols/${protocol.id}`)
          .then(() => {
            this.fetch()
            this.$notify({
              title: '成功',
              message: '删除成功',
              type: 'success'
            })
          })
          .catch((error) => {
            this.$notify({
              title: '糟糕',
              message: error.response.data.messages[0],
              type: 'error'
            })
          })
      })
    },
    submit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.setFetching({
            fetching: true
          })
          if (this.isEditing) {
            this.update()
          } else {
            this.save()
          }
        } else {
          this.$notify({
            title: '错误',
            message: '表单有错误，请检查后再提交',
            type: 'error'
          })
        }
      })
    },
    close () {
      this.$refs.form.resetFields()
      this.isFormVisible = false
    },
    update () {
      this.$http.put(`protocols/${this.form.id}`, this.form)
        .then(() => {
          this.close()
          this.fetch()
          this.setFetching({
            fetching: false
          })
          this.$notify({
            title: '成功',
            message: '更新成功',
            type: 'success'
          })
        })
    },
    save () {
      this.$http.post('protocols', pick(this.form, ['procedure', 'name', 'content'])).then(() => {
        this.close()
        this.fetch()
        this.setFetching({
          fetching: false
        })
        this.$notify({
          title: '成功',
          message: '创建成功',
          type: 'success'
        })
      })
    },
    navigate (page) {
      this.$router.push({
        name: 'protocols.index',
        query: {
          page
        }
      })
    }
  }
}
</script>
