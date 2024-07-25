import React, { Component } from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import { CheckOutlined, CloseOutlined, EditOutlined } from '@uyun/icons'
import { Table, Switch, Input, Button, Modal, Form, message, Divider } from '@uyun/components'
import moment from 'moment'
import { orLowcode } from '~/utils/common'
import RelateSubModal from './RelateModal'
import MappingSubModal from './setMappingFields'
import styles from './index.module.less'

const Search = Input.Search
const FormItem = Form.Item
class AddModal extends React.Component {
  state = {
    confirmLoading: false
  }

  onOk = (e) => {
    e.preventDefault()
    this.setState({ confirmLoading: true })
    this.props.form.validateFields((err, values) => {
      this.setState({ confirmLoading: false })
      if (!err) {
        const { store, modelId, onShowModal, copy, copyId, copyVersion, onProcessChange } =
          this.props
        if (copy) {
          const params = {
            modelId,
            originChartId: copyId,
            processChartName: values.name,
            release: false,
            originChartVersion: copyVersion && +copyVersion.substr(1)
          }

          store.copySubFlow(params).then((res) => {
            if (res) {
              onShowModal(false, 'update')
              onProcessChange({ id: res.id, mainChart: 2 })
            }
          })
        } else {
          store.createSubProcess(values.name, modelId).then((res) => {
            if (res) {
              onShowModal(false, 'update')
              message.success(i18n('ticket.kb.success'))
            }
          })
        }
      }
    })
  }

  validateName = (rule, value, callback) => {
    this.timer = value
    const reg = /[|;#&$%><`\\!]/
    setTimeout(() => {
      if (this.timer === value) {
        if (value && reg.test(value)) {
          callback(i18n('ticket.true.name', '名称不能含有特殊字符'))
        } else {
          callback()
        }
      }
    }, 300)
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { visible, copy } = this.props
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 17 }
    }
    return (
      <Modal
        title={copy ? i18n('ticket.form.copy.submodel') : i18n('ticket.form.create.submodel')}
        visible={visible}
        onOk={this.onOk}
        onCancel={() => this.props.onShowModal(false)}
        size="small"
        confirmLoading={this.state.confirmLoading}
      >
        <Form>
          <FormItem {...formItemLayout} label={i18n('subprocess.name')}>
            {getFieldDecorator('name', {
              rules: [
                {
                  required: true,
                  message: i18n('please-input')
                },
                {
                  whitespace: /\s/,
                  pattern: /^[^\s]*$/,
                  message: i18n('conf.model.notblank')
                },
                {
                  validator: this.validateName
                }
              ]
            })(<Input placeholder={i18n('please-input')} maxLength={20} />)}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

@Form.create()
@inject('flowListStore', 'globalStore', 'basicInfoStore')
@observer
class FlowList extends Component {
  state = {
    visible: false,
    editingKey: '',
    copy: false,
    copyId: '',
    relateVisible: false,
    mappingVisible: false,
    submodal: {}
  }

  componentDidMount() {
    this.props.flowListStore.onFilterFieldChange(this.props.modelId, 'modelId', true)
  }

  onSearch = (e) => {
    this.props.flowListStore.onFilterFieldChange(e, 'name', true)
  }

  onShowModal = (visible, isUpdate) => {
    this.setState({ visible })
    if (!visible) {
      this.setState({ copy: false })
    }
    if (isUpdate) {
      this.props.flowListStore.onFilterFieldChange(this.props.modelId, 'modelId', true)
    }
    if (!visible) {
      this.props.form.resetFields()
    }
  }

  onShowRelateModal = (visible, isUpdate) => {
    this.setState({ relateVisible: true })
  }

  onDelete = (record) => {
    Modal.confirm({
      title: i18n('delete.subprocess.confirm.title', { name: record.name }),
      content: i18n('delete.subprocess.confirm.content'),
      iconType: 'question-circle',
      onOk: () => {
        this.props.flowListStore.deleteProcess(this.props.modelId, record.id).then((res) => {
          if (res) {
            message.success(i18n('delete_success'))
            this.props.flowListStore.onFilterFieldChange(this.props.modelId, 'modelId', true)
          }
        })
      },
      okText: i18n('delete')
    })
  }

  onEdit = (e, record) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.flowListStore.editProcessName(record.id, values.name).then((res) => {
          if (res) {
            this.setState({ editingKey: '' })
            message.success(i18n('ticket.from.update.sucess'))
            this.props.flowListStore.onFilterFieldChange(this.props.modelId, 'modelId', true)
          }
        })
      }
    })
  }

  onChange = (checked, record) => {
    const params = {
      modelId: this.props.modelId,
      chartId: record.id,
      status: checked ? 1 : 0
    }
    this.props.flowListStore.changeProcessStatus(params).then((res) => {
      if (res) {
        message.success(i18n('ticket.from.update.sucess'))
        this.props.flowListStore.onFilterFieldChange(this.props.modelId, 'modelId', true)
      }
    })
  }

  onProcessChange = (record) => {
    const chartId = record.id
    const chartType = record.mainChart ? 1 : 2
    this.props.flowListStore.getChartInfo(chartId, chartType)
  }

  copy = async (record) => {
    const { modelId } = this.props
    const data = {
      modelId,
      originChartId: record.id,
      processChartName: record.name,
      release: false,
      originChartVersion: record.version && +record.version.substr(1)
    }
    const res = await this.props.flowListStore.validateCopySubprocess(data)
    if (+res === 200) {
      this.setState({ visible: true, copy: true, copyId: record.id, copyVersion: record.version })
    }
  }

  setMapping = (record) => {
    this.setState({
      mappingVisible: true,
      submodal: { name: record.name, id: record.taskModelId, relationId: record.id }
    })
  }

  render() {
    const { data, total, current, pageSize, loading, filters, onPageChange, onShowSizeChange } =
      this.props.flowListStore
    const { showStatusButton } = this.props.globalStore
    const { modelStatus } = this.props.basicInfoStore
    const { getFieldDecorator } = this.props.form
    const {
      visible,
      editingKey,
      copy,
      copyId,
      copyVersion,
      relateVisible,
      mappingVisible,
      submodal
    } = this.state
    // 模型状态为开发中
    const canOperate = orLowcode(showStatusButton) || modelStatus === -1

    const columns = [
      {
        title: i18n('process.name'),
        dataIndex: 'name',
        key: 'name',
        render: (name, record) => {
          // record.type 1：主流程 2：新建的子模型 3：关联的子模型
          if (record.type === 3) {
            return <a className={styles.disabledLink}>{name}</a>
          }
          if (editingKey !== record.id) {
            return (
              <a className={styles.subProcessName} onClick={() => this.onProcessChange(record)}>
                {name}
                {!record.mainChart && canOperate && (
                  <EditOutlined
                    className={styles.edit}
                    onClick={(e) => {
                      e.stopPropagation()
                      this.setState({ editingKey: record.id })
                    }}
                  />
                )}
              </a>
            )
          } else {
            return (
              <Form layout="inline">
                <FormItem>
                  {getFieldDecorator('name', {
                    rules: [{ required: true, message: i18n('ticket.forms.pinputName') }],
                    initialValue: name
                  })(<Input maxLength={20} />)}
                </FormItem>
                <FormItem>
                  <>
                    <CheckOutlined
                      onClick={(e) => this.onEdit(e, record)}
                      style={{ fontSize: 14, marginRight: 10, color: '#3CD768', cursor: 'pointer' }}
                    />
                    <CloseOutlined
                      onClick={() => this.setState({ editingKey: '' })}
                      style={{ fontSize: 14, color: '#FF4848', cursor: 'pointer' }}
                    />
                  </>
                </FormItem>
              </Form>
            )
          }
        }
      },
      {
        title: i18n('type'),
        dataIndex: 'type',
        key: 'type',
        render: (text, record) => {
          switch (text) {
            case 1:
              return '主流程'
            case 2:
              return '子流程'
            case 3:
              return '任务流程'
          }
        }
      },
      {
        title: i18n('process.version'),
        dataIndex: 'version',
        key: 'version'
      },

      {
        title: i18n('last.update.time'),
        dataIndex: 'updateTime',
        key: 'updateTime',
        render: (time) => (time ? moment(time).format('YYYY-MM-DD HH:mm') : '-')
      },
      {
        title: i18n('operator'),
        dataIndex: 'operatorName',
        key: 'operatorName'
      },
      {
        title: i18n('is.enable'),
        dataIndex: 'using',
        key: 'using',
        render: (using, record) => (
          <Switch
            disabled={record.mainChart || !canOperate}
            checked={using}
            onChange={(e) => this.onChange(e, record)}
          />
        )
      },
      {
        title: i18n('operation'),
        dataIndex: 'operation',
        key: 'operation',
        render: (value, record) => (
          <>
            {!record.mainChart && record.type !== 3 && (
              <a onClick={() => this.copy(record)}>{i18n('copy', '复制')}</a>
            )}
            {record.type === 3 && (
              <a onClick={() => this.setMapping(record)}>{i18n('config', '配置')}</a>
            )}
            {!record.mainChart && <Divider type="vertical" />}
            <a
              disabled={record.using || record.mainChart || !canOperate}
              onClick={() => this.onDelete(record)}
            >
              {i18n('delete')}
            </a>
          </>
        )
      }
    ]

    const pagination = {
      current,
      pageSize,
      total,
      onChange: onPageChange,
      onShowSizeChange
    }

    return (
      <div className={styles.flowListWrapper}>
        <div style={{ marginBottom: 12 }}>
          <Search
            style={{ width: 198 }}
            enterButton
            placeholder={i18n('input_keyword')}
            value={filters.name}
            onChange={(e) => this.props.flowListStore.onFilterFieldChange(e.target.value, 'name')}
            onSearch={this.onSearch}
            onClear={() => this.onSearch()}
            allowClear
          />
          {orLowcode(canOperate) && (
            <Button
              type="primary"
              style={{ float: 'right' }}
              onClick={() => this.onShowRelateModal(true)}
            >
              {i18n('General_association_subProcess')}
            </Button>
          )}
          {orLowcode(canOperate) && (
            <Button
              style={{ float: 'right', marginRight: 5 }}
              onClick={() => this.onShowModal(true)}
            >
              {i18n('General_add_subProcess')}
            </Button>
          )}
        </div>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={toJS(data)}
          pagination={pagination}
        />
        <AddModal
          store={this.props.flowListStore}
          form={this.props.form}
          copy={copy}
          copyId={copyId}
          copyVersion={copyVersion}
          modelId={this.props.modelId}
          visible={visible}
          onProcessChange={this.onProcessChange}
          onShowModal={this.onShowModal}
        />
        <RelateSubModal
          visible={relateVisible}
          modelId={this.props.modelId}
          onCancel={() => this.setState({ relateVisible: false })}
          query={this.props.flowListStore.query}
        />
        <MappingSubModal
          submodal={submodal}
          visible={mappingVisible}
          modelId={this.props.modelId}
          onCancel={() => this.setState({ mappingVisible: false })}
        />
      </div>
    )
  }
}

export default FlowList
