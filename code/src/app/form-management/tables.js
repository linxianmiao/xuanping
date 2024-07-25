import React, { Component } from 'react'
import moment from 'moment'
import classnames from 'classnames'
import { toJS } from 'mobx'
import { Input, Button, Table, Modal, Switch } from '@uyun/components'
import AppDataTabs from '~/components/LowcodeLink/AppDataTabs'
import { observer, inject } from 'mobx-react'
import Edit from './Edit'
import SelectIndex from './SelectIndex'
// import Layout from './Layout'

const Search = Input.Search

const CURRENTMODEL = {
  name: undefined,
  description: undefined,
  fieldList: [],
  formLayoutVos: []
}

@inject('formSetGridStore')
@observer
export default class Tables extends Component {
  state = {
    visible: '',
    confirmLoading: false,
    currentModel: {},
    fieldsGroupData: {}
  }

  componentDidMount() {
    this.props.formSetGridStore.setData('template', 'type')
    this.handleQuery()
  }

  handleClick = (visible, currentModel = CURRENTMODEL) => {
    const { id } = currentModel
    switch (visible) {
      case 'add':
      case 'rename':
        this.setState({ visible, currentModel })
        break
      case 'copy':
        this.setState({ visible, currentModel: { id } })
        break
      default:
        this.setState({ visible, currentModel })
    }
  }

  handleOk = () => {
    this.cardModel.props.form.validateFieldsAndScroll(async (errors, values) => {
      if (errors) return false
      this.setState({ confirmLoading: true })
      const { visible, currentModel, fieldsGroupData } = this.state
      values.formLayoutVo =
        visible === 'rename' && _.isEmpty(fieldsGroupData)
          ? currentModel.formLayoutVo
          : fieldsGroupData
      values.layoutId = _.get(values, 'layoutId.key')
      const modelData = _.assign({}, currentModel, values)
      if (visible === 'rename') {
        await this.props.formSetGridStore.saveModelForm(modelData, 1)
        this.handleQuery()
      } else {
        this.handleChangeFieldType(modelData, this.state.visible)
      }

      this.setState({ confirmLoading: false, visible: '', currentModel: {} })
    })
  }

  onSelect = (record, option) => {
    const obj = option.props
    const fieldsGroupData = _.omit({ ...obj, name: obj.children, id: obj.value }, [
      'children',
      'value'
    ])
    fieldsGroupData.type = 'subForm'
    this.setState({
      fieldsGroupData
    })
  }

  handleChangeFieldType = async (currentModel, type) => {
    const { id } = currentModel
    if (type !== 'add') {
      await this.props.formSetGridStore.getModelForm(id, null, currentModel, type)
    } else {
      this.props.formSetGridStore.setData(currentModel, 'currentGrid')
    }
    this.props.handleChangeFieldType('formLayout')
  }

  handleChangeSize = (current, pageSize) => {
    const { query } = this.props.formSetGridStore
    this.props.formSetGridStore.setData(_.assign({}, query, { current, pageSize }), 'query')
    this.handleQuery()
  }

  handleChangeKw = (e) => {
    const { query } = this.props.formSetGridStore
    this.props.formSetGridStore.setData(
      _.assign({}, query, {
        current: 1,
        kw: e.target.value
      }),
      'query'
    )
  }

  handleChangeLayout = (value, option) => {
    const { query } = this.props.formSetGridStore
    this.props.formSetGridStore.setData(
      _.assign({}, query, {
        current: 1,
        layoutInfo: value ? { id: option.props.code, name: value.label } : undefined
      }),
      'query'
    )
    this.handleQuery()
  }

  handleChangeStatus = async (id, checked) => {
    const status = checked ? 1 : 0
    const res = await this.props.formSetGridStore.changeFormTemplateStatus(id, status)
    if (_.isEmpty(res)) {
      this.handleQuery()
    } else {
      Modal.error({
        title: i18n('system-matrix-list-status-tip', '操作失败,有模型引用')
      })
    }
  }

  handleQuery = () => {
    this.props.formSetGridStore.getGridList()
  }

  // 删除
  handleDel = (model) => {
    const { id, status } = model
    if (status === 1) {
      return false
    }
    const { query } = this.props.formSetGridStore
    Modal.confirm({
      title: i18n('conf.model.del.card', '确定要删除吗？'),
      onOk: () =>
        new Promise((resolve, reject) => {
          this.props.formSetGridStore.deleteGard(id).then((res) => {
            resolve()
            if (_.isEmpty(res)) {
              this.handleChangeSize(1, query.pageSize)
            } else {
              Modal.error({
                title: i18n('system-matrix-list-status-tip', '操作失败,有模型引用')
              })
            }
          })
        })
    })
  }

  render() {
    const { loading, gridList, count, query } = this.props.formSetGridStore
    const { visible, confirmLoading, currentModel } = this.state
    const { kw, current, pageSize } = query
    const { name, description, childCode, formLayoutVo, authorizedUsers } = currentModel

    const columns = [
      {
        title: i18n('conf.model.field.card.name', '名称'),
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => (
          <a
            onClick={() => {
              this.handleChangeFieldType(record, 'edit')
            }}
          >
            {text}
          </a>
        )
      },
      {
        title: i18n('conf.model.field.card.desc', '描述'),
        dataIndex: 'description',
        key: 'description'
      },
      {
        title: i18n('conf.model.field.layoutId', '分组'),
        dataIndex: 'formLayoutVo',
        key: 'formLayoutVo',
        render: (text) => (text ? text.name : '')
      },
      {
        title: i18n('conf.model.field.card.change.time', '修改时间'),
        key: 'updateTime',
        dataIndex: 'updateTime',
        render: (text) => moment(text).format('YYYY-MM-DD HH:mm')
      },
      {
        title: i18n('conf.model.field.card.change.user', '修改人'),
        dataIndex: 'modifier',
        key: 'modifier'
      },
      {
        title: i18n('process_status', '状态'),
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => (
          <Switch
            checked={text === 1}
            onChange={(checked) => {
              this.handleChangeStatus(record.id, checked)
            }}
          />
        )
      },
      {
        title: i18n('globe.opera', '操作'),
        render: (record) => (
          <span className="operation">
            <a
              onClick={() => {
                this.handleClick('copy', record)
              }}
            >
              {i18n('ticket.resource.copy', '复制')}
            </a>
            <a
              onClick={() => {
                this.handleClick('rename', record)
              }}
            >
              {i18n('edit', '编辑')}
            </a>
            <a
              className={classnames({
                disabled: record.status === 1
              })}
              onClick={() => {
                this.handleDel(record)
              }}
            >
              {i18n('delete', '删除')}
            </a>
          </span>
        )
      }
    ]
    const pagination = {
      total: count,
      current,
      pageSize,
      onChange: this.handleChangeSize,
      onShowSizeChange: this.handleChangeSize
    }
    const modalTitle =
      visible === 'rename'
        ? i18n('conf.model.fields.edit.field', '编辑表单')
        : i18n('conf.model.fields.new.field', '新建表单')
    return (
      <div>
        <header className="tables-header">
          <div>
            {!!window.LOWCODE_APP_KEY && <AppDataTabs style={{ marginRight: '10px' }} />}
            <Search
              placeholder={i18n('globe.keywords', '请输入关键字')}
              allowClear
              enterButton
              value={kw}
              style={{ width: 200 }}
              onChange={this.handleChangeKw}
              onSearch={() => this.handleQuery(true)}
              onClear={() => this.handleQuery(true)}
            />
            <SelectIndex
              onSelect={this.handleChangeLayout}
              placeholder={i18n('pls_select_group')}
              style={{ width: 240, marginLeft: 15, verticalAlign: 'top' }}
            />
          </div>
          <Button
            onClick={() => {
              this.handleClick('add', undefined)
            }}
            type="primary"
          >
            {i18n('conf.model.fields.new.field', '新建表单')}
          </Button>
        </header>
        <section className="tables-section">
          <Table
            pagination={pagination}
            loading={loading}
            dataSource={toJS(gridList)}
            columns={columns}
          />
        </section>
        <Modal
          title={modalTitle}
          visible={Boolean(visible)}
          confirmLoading={confirmLoading}
          destroyOnClose
          maskClosable={false}
          onOk={this.handleOk}
          onCancel={() => {
            this.handleClick('', undefined)
          }}
        >
          <Edit
            name={name}
            childCode={childCode}
            layoutInfo={formLayoutVo}
            authorizedUsers={authorizedUsers}
            description={description}
            handleClick={this.handleClick}
            disabled={visible === 'rename'}
            wrappedComponentRef={(inst) => {
              this.cardModel = inst
            }}
            onSelect={this.onSelect}
          />
        </Modal>
      </div>
    )
  }
}
