import React, { Component } from 'react'
import { Table, Modal, message, Tag, Input, Switch } from '@uyun/components'
import moment from 'moment'
import { observer, inject } from 'mobx-react'
import ModelGroupSelect from '~/components/modelGroupSelect'
import Layout from '../component/table/layout'
import Title from '../component/table/title'
import Operate from '../component/table/operate'
import ApprovalRecordTips from '../approvalRecordTips'
import { orLowcode } from '~/utils/common'

@inject('modelListStore', 'globalStore')
@observer
class ModelListTable extends Component {
  state = {
    modelVos: null,
    group: undefined, // 目标分组
    reason: ''
  }

  // 删除
  delRow = async (id) => {
    const res = (await this.props.modelListStore.checkDelModel(id)) || {}
    if (res.candel) {
      Modal.confirm({
        title: '删除模型，需要审核通过后，才能正式生效',
        content: '确定提交删除申请吗？',
        iconType: 'exclamation-circle',
        onOk: async () => {
          const res = await this.props.modelListStore.delModel(id)
          if (+res === 200) {
            message.success(i18n('delete_success', '删除成功'))
            const { confModelList } = this.props.modelListStore
            if (confModelList.length === 1) {
              this.props.modelListStore.setValue({
                query: {
                  pageNo: 1,
                  pageSize: 20,
                  kw: undefined,
                  layoutId: undefined,
                  classification: undefined
                }
              })
            }
            this.props.modelListStore.getConfModelList()
          }
        }
      })
    } else {
      Modal.warning({
        title: i18n('unable_to_delete', '无法删除'),
        content: i18n('waring_delete_tips', '该模型有未完成的工单或被其他工单和触发器引用')
      })
    }
  }

  // 改变状态
  changeStatus = async (record, applyType) => {
    this.setState({ reason: '' })
    const {
      layoutInfoVo: { id: layoutId, name: layoutName },
      name
    } = record
    // 开发中，可启用，可删除
    // 待审核，不可启用不可停用，可删除
    // 已发布，可停用，不可删除
    // modelStatus : 开发中：-1，待审核：0，已发布：1
    // applyType: 动作类型，启用：1，停用：2，发布：3，删除：4
    const applyTypeName =
      applyType === 1 ? '启用' : applyType === 2 ? '停用' : applyType === 4 ? '删除' : ''
    // 删除前先走一下是否可删除接口

    let res = { candel: true }
    if (applyType === 4) {
      res = (await this.props.modelListStore.checkDelModel(record.id)) || {}
    }
    if (res.candel) {
      // 需要走模型审批
      if (!this.props.globalStore.showStatusButton && !window.LOWCODE_APP_KEY) {
        Modal.confirm({
          title: `${applyTypeName}${name}模型，需要审核通过后，才能正式${applyTypeName}`,
          content: (
            <div>
              {applyType === 2 ? (
                <Input.TextArea
                  rows={2}
                  maxLength={100}
                  onChange={(e) => {
                    this.setState({ reason: e.target.value })
                  }}
                  placeholder="请输入原因"
                />
              ) : (
                <p>{`确定提交${applyTypeName}申请吗？`}</p>
              )}
            </div>
          ),
          onOk: async () => {
            const { reason } = this.state
            const data = {
              id: record.id,
              layoutId,
              layoutName,
              applyType,
              reason
            }
            const res = await this.props.modelListStore.changeStatus(data)
            if (res === '200') {
              message.success(i18n('w200'))
              this.props.modelListStore.getConfModelList()
            }
            //  else {
            //   Modal.error({
            //     title: i18n('confrim_to_enable_model1', '操作失败'),
            //     content: res
            //   })
            // }
          }
        })
      } else {
        const useable = record.useable === 1 ? 0 : 1
        const data = {
          type: 1,
          modelId: record.id,
          useable,
          doAuthParamsVos: {
            name: '',
            sorts: 1,
            doAuthParamsVoList: [
              {
                id: '',
                modelId: record.id,
                authStatus: 1,
                comment: ''
              }
            ]
          },
          modelAuthParamVo: {
            id: record.id,
            modelName: name,
            type: '',
            layoutId,
            layoutName,
            applyType,
            authStatus: 0,
            comment: '',
            reason: ''
          }
        }
        const res = await this.props.modelListStore.changeModelStatus(data)
        if (res === '200') {
          message.success(i18n('w200'))
          this.props.modelListStore.getConfModelList()
        }
      }
    } else {
      Modal.warning({
        title: i18n('unable_to_delete', '无法删除'),
        content: i18n('waring_delete_tips', '该模型有未完成的工单或被其他工单和触发器引用')
      })
    }
  }

  // 移动
  moveRow = (modelVos) => {
    this.setState({ modelVos, group: modelVos.layoutInfoVo })
  }

  onOk = async () => {
    const { modelVos, group } = this.state
    if (group) {
      const { id, layoutInfoVo } = modelVos
      const values = { modelId: id, fromLayoutId: layoutInfoVo.key, toLayoutId: group.id }
      const res = await this.props.modelListStore.moveModelLayout(values)
      if (+res === 200) {
        this.props.modelListStore.getConfModelList()
        this.onCancel()
      }
    } else {
      message.error(i18n('cannot_move_to_group', '不能移动到当前分组'))
    }
  }

  onCancel = () => {
    this.setState({ modelVos: null, group: undefined })
  }

  render() {
    const { confModelList, query, total, loading } = this.props.modelListStore
    const { modelExport, modelInsert, modelDelete, modelModify } =
      this.props.globalStore.configAuthor
    const { showStatusButton } = this.props.globalStore
    const { pageSize, pageNo } = query
    const { modelVos, group } = this.state
    let columns = [
      {
        title: '名称',
        dataIndex: 'name',
        width: '14%',
        render: (text, record) => {
          const { name, mode, childModel, id } = record
          return <Title name={name} id={id} mode={mode} childModel={childModel} />
        }
      },
      {
        title: '类型',
        dataIndex: 'modelTypeVo',
        width: '8%',
        render: (text) => (text ? text.name : '')
      },
      {
        title: i18n('conf.model.field.layoutId', '分组'),
        dataIndex: 'layoutInfoVo',
        width: '10%',
        render: (text) => <Layout text={text} />
      },
      {
        title: i18n('create_time', '创建时间'),
        dataIndex: 'createTime',
        width: '13%',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm') : '')
      }
      // {
      //   title: i18n('in.which.app', '所属应用'),
      //   dataIndex: 'appName',
      //   width: '8%'
      // }
    ]
    if (orLowcode(showStatusButton)) {
      columns = [
        ...columns,
        {
          title: i18n('use_status', '使用状态'),
          dataIndex: 'useable',
          width: '9%',
          render: (text, record) => (
            <Switch
              checked={Number(text) === 1}
              onChange={(checked) => {
                this.changeStatus(record, record.modelStatus === 1 ? 2 : 1)
              }}
            />
          )
        }
      ]
    } else {
      columns = [
        ...columns,
        {
          title: i18n('tip9', '状态'),
          dataIndex: 'modelStatus',
          width: '9%',
          render: (text, record) => <ApprovalRecordTips text={text} record={record} />
        }
      ]
    }
    if (orLowcode(modelExport, modelInsert, modelDelete, modelModify)) {
      columns = [
        ...columns,
        {
          title: i18n('operation'),
          width: '21%',
          render: (record) => (
            <Operate
              modelExport={modelExport}
              modelInsert={modelInsert}
              modelDelete={modelDelete}
              modelModify={modelModify}
              record={record}
              // delRow={this.delRow}
              moveRow={this.moveRow}
              changeStatus={this.changeStatus}
              showStatusButton={showStatusButton}
            />
          )
        }
      ]
    }

    const pagination = {
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: true,
      total: total,
      current: pageNo,
      pageSize: pageSize,
      onShowSizeChange: (pageNo, pageSize) => {
        this.props.onFilterChange({ pageNo, pageSize })
        this.props.onQuery()
      },
      onChange: (pageNo, pageSize) => {
        this.props.onFilterChange({ pageNo, pageSize })
        this.props.onQuery()
      }
    }
    const { id, name } = group || {}
    const defaultValue = id ? { key: id, label: name } : undefined
    return (
      <React.Fragment>
        <Table
          loading={loading}
          columns={columns}
          rowKey={(record) => record.id}
          dataSource={confModelList}
          pagination={pagination}
        />
        <Modal
          destroyOnClose
          title={i18n('move_field_to_group', '将资源类型移动至')}
          visible={Boolean(modelVos)}
          onOk={this.onOk}
          onCancel={this.onCancel}
        >
          <ModelGroupSelect
            labelInValue
            value={defaultValue}
            onChange={(value) => this.setState({ group: { id: value.key, name: value.label } })}
          />
        </Modal>
      </React.Fragment>
    )
  }
}

export default ModelListTable
