import React, { Component } from 'react'
import { Table, Button, Modal, message, Pagination, Divider } from '@uyun/components'
import { PlusOutlined } from '@uyun/icons'
import '../style/params.less'
import AddParams from './addParam'
import { inject, observer } from 'mobx-react'
import { orLowcode } from '~/utils/common'

@inject('paramStore', 'globalStore', 'basicInfoStore')
@observer
class Param extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      data: {},
      order_by: null,
      order_rule: null
    }
  }

  editParam = async (id) => {
    const data = await this.props.paramStore.getParam(id)
    this.setState({
      data: data,
      visible: true
    })
  }

  delParam = (id) => {
    Modal.confirm({
      title: i18n('conf.fields.list.del.param', '您是否确认要删除该变量？'),
      content: null,
      iconType: 'exclamation-circle',
      okText: i18n('globe.ok', '确定'),
      cancelText: i18n('cancel', '取消'),
      onOk: async () => {
        const data = await this.props.paramStore.deleteParam({
          id: id,
          model_id: this.props.modelId
        })
        if (+data === 200) {
          message.success(i18n('delete_success', '删除成功'))
          this.props.paramStore.queryParamList({
            model_id: this.props.modelId,
            page_size: 10,
            page_num: 1
          })
        }
      }
    })
  }

  addParams = () => {
    this.setState({
      visible: true,
      data: {}
    })
  }

  handleSubmit = async (values = {}) => {
    values.model_id = this.props.modelId
    if (values.is_plugin && !values.plugin_map) {
      message.error(i18n('ticket.form.update.plugin', '请上传扩展插件'))
      return false
    }
    const data = await this.props.paramStore.saveParam(values)
    if (+data === 200) {
      if (this.props.modelId) {
        message.success(i18n('ticket.from.update.sucess', '更新成功'))
      } else {
        message.success(i18n('ticket.kb.success', '创建成功！'))
      }
      this.props.paramStore.queryParamList({
        model_id: this.props.modelId,
        page_size: 10,
        page_num: 1
      })
    }
    this.handleCancel()
  }

  handleCancel = () => {
    this.setState({
      visible: false
    })
  }

  pageChange = (page, pageSize) => {
    const { order_by, order_rule } = this.state
    this.props.paramStore.changeCurrent(page)
    this.props.paramStore.queryParamList({
      model_id: this.props.modelId,
      page_size: pageSize,
      page_num: page,
      order_by: order_by,
      order_rule: order_rule
    })
  }

  tableChange = (pagination, filters, sorter) => {
    const rule = sorter.order === 'descend' ? 'desc' : 'asc'
    this.setState({
      order_by: sorter.field,
      order_rule: rule
    })
    this.props.paramStore.changeCurrent(1)
    this.props.paramStore.queryParamList({
      model_id: this.props.modelId,
      page_size: 10,
      page_num: 1,
      order_by: sorter.field,
      order_rule: rule
    })
  }

  render() {
    const { paramStore } = this.props
    const { visible, data } = this.state
    const { current } = this.props.paramStore
    const { modelModify } = this.props.globalStore.configAuthor
    const { modelStatus } = this.props.basicInfoStore // 已发布模型禁止编辑
    const { showStatusButton } = this.props.globalStore
    const disabled = modelStatus !== -1 && !orLowcode(showStatusButton)
    const columns = [
      {
        title: i18n('name', '名称'),
        dataIndex: 'name'
      },
      {
        title: <p className="type-wrap">{i18n('ciModal.type', '类型')}</p>,
        dataIndex: 'type',
        align: 'center',
        sorter: true,
        render: (text) => {
          return (
            <div style={{ textAlign: 'center', marginLeft: '-18px' }}>
              {text === 1
                ? i18n('filed.personnel', '人员')
                : text === 0
                ? i18n('user_group', '用户组')
                : text === 2
                ? i18n('filed.department', '部门')
                : text === 3
                ? i18n('ticket-user-role', '角色')
                : text === 4
                ? i18n('param_text', '文本')
                : text === 5
                ? i18n('param_number', '数字')
                : text === 6
                ? i18n('param_time', '时间')
                : text === 7
                ? i18n('param_fieldLink', '环节')
                : ''}
            </div>
          )
        }
      },
      {
        title: i18n('field_code', '编码'),
        dataIndex: 'code'
      },
      {
        title: i18n('listSel.input_tips3', '描述'),
        dataIndex: 'description'
      },
      {
        title: i18n('ticket.list.creatPerson', '创建人'),
        dataIndex: 'creatorName'
      },
      {
        title: i18n('ticket.list.update_time', '更新时间'),
        dataIndex: 'update_time',
        key: 'updateTime'
      }
    ]
    // 模型修改权限
    if (modelModify) {
      columns.push({
        title: <div style={{ textAlign: 'center' }}>{i18n('operation', '操作')}</div>,
        key: 'action',
        align: 'center',
        render: (text, record) => {
          return (
            !record.is_builtin && (
              <div className="button-contentWrap">
                <a
                  disabled={disabled}
                  onClick={() => {
                    this.editParam(record.id)
                  }}
                >
                  {i18n('edit', '编辑')}
                </a>
                <Divider type="vertical" />
                <a
                  disabled={disabled}
                  onClick={() => {
                    this.delParam(record.id)
                  }}
                >
                  {i18n('delete', '删除')}
                </a>
              </div>
            )
          )
        }
      })
    }
    return (
      <div className="param-wrap">
        <div className="param-content">
          <p className="param-tips">
            {i18n(
              'add-param-tips',
              '流程变量可以被运用到流程设计的节点中，对流程的流转和处理起到关键作用'
            )}
          </p>
          {orLowcode(modelModify) && (
            <Button
              className="param-button"
              type="primary"
              onClick={this.addParams}
              disabled={disabled}
            >
              <PlusOutlined />
              {i18n('add-params', '新增变量')}
            </Button>
          )}
        </div>
        <Table
          rowKey="id"
          loading={paramStore.paramListLoading}
          columns={columns}
          dataSource={paramStore.paramList}
          pagination={false}
          onChange={this.tableChange}
        />
        <Pagination
          showSizeChanger={false}
          style={{ paddingTop: 10 }}
          onChange={this.pageChange}
          total={paramStore.count}
          current={current}
        />
        {visible ? (
          <AddParams
            data={data}
            visible={visible}
            handleCancel={this.handleCancel}
            handleSubmit={this.handleSubmit}
          />
        ) : null}
      </div>
    )
  }
}

export default Param
