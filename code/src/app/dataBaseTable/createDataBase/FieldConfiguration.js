import {
  Table,
  Input,
  Button,
  Switch,
  Popconfirm,
  Popover,
  Drawer,
  message,
  Tag
} from '@uyun/components'
import { HolderOutlined } from '@uyun/icons'
import React from 'react'
import { DndProvider, DragSource, DropTarget } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import update from 'immutability-helper'
import { inject, observer } from 'mobx-react'
import DataType from '~/create-field/config/dataType'
import CreateStore from '~/create-field/store/createStore'
import ModelFieldListStore from '~/model/store/ModelFieldListStore'
import CreateField from '~/create-field/layout/index'
import QuoteFields from './quoteFields'

const createStore = new CreateStore()
const modelFieldListStore = new ModelFieldListStore()

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 }
}

let dragingIndex = -1
const { Search } = Input

class BodyRow extends React.Component {
  render() {
    const { isOver, connectDragSource, connectDropTarget, moveRow, ...restProps } = this.props
    const style = { ...restProps.style }

    let { className } = restProps
    if (isOver) {
      if (restProps.index > dragingIndex) {
        className += ' drop-over-downward'
      }
      if (restProps.index < dragingIndex) {
        className += ' drop-over-upward'
      }
    }

    return connectDragSource(
      connectDropTarget(<tr {...restProps} className={className} style={style} />)
    )
  }
}

const rowSource = {
  beginDrag(props) {
    dragingIndex = props.index
    return {
      index: props.index
    }
  }
}

const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index
    const hoverIndex = props.index

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return
    }

    // Time to actually perform the action
    props.moveRow(dragIndex, hoverIndex)

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex
  }
}

const DragableBodyRow = DropTarget('sort', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver()
}))(
  DragSource('sort', rowSource, (connect) => ({
    connectDragSource: connect.dragSource()
  }))(BodyRow)
)

class DragSortingTable extends React.Component {
  state = {
    page: {
      pageNo: 1,
      pageSize: 10
    },
    wd: '',
    visible: false,
    open: false,
    field: {},
    confirmLoading: false,
    queryType: '',
    loading: false,
    fieldsList: [],
    quoteVisible: false,
    type: 'new',
    code: ''
  }

  components = {
    body: {
      row: DragableBodyRow
    }
  }

  moveRow = (dragIndex, hoverIndex) => {
    const { fieldsList } = this.state
    const dragRow = fieldsList[dragIndex]

    this.setState(
      update(this.state, {
        fieldsList: {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragRow]
          ]
        }
      }),
      async () => {
        const { dataSetId } = this.props
        let list = _.map(this.state.fieldsList, (item) => item.id)
        let res = await this.props.dataBaseStore.updateQuoteFieldSort(
          _.assign({}, { dataSetId, idList: list })
        )
        if (res === '200') {
          message.success('排序成功')
        }
      }
    )
  }

  getFieldsList = async () => {
    const { page, wd } = this.state
    this.setState({ loading: true })
    let res = await this.props.dataBaseStore.listDataFieldWithPage(
      _.assign({}, page, { wd, dataSetId: this.props?.dataSetId })
    )
    this.setState({ loading: false, fieldsList: res })
  }
  getColumn = () => {
    const columns = [
      {
        dataIndex: 'sort',
        width: 15,
        className: 'drag-visible',
        render: () => <HolderOutlined />
      },
      {
        title: '字段名称',
        dataIndex: 'name',
        key: 'name',
        width: 148,
        render: (text, record) => {
          return (
            <a
              onClick={() => {
                if (record.relationType === 1) {
                  this.setState({ visible: false, queryType: '' }, () => {
                    this.handleFieldsChange(true, 'edit', record.code)
                  })
                } else {
                  this.setState({ visible: true, queryType: record.code }, () => {
                    this.handleFieldsChange(false)
                  })
                }
              }}
            >
              {text}
            </a>
          )
        }
      },
      {
        title: '编码',
        dataIndex: 'code',
        key: 'code',
        width: 148
      },
      {
        title: '字段类型',
        dataIndex: 'type',
        key: 'type',
        width: 148,
        render: (text) => {
          const item = DataType[text]
          return (
            <>
              <i className={item.icon} /> <span>{item.name}</span>
            </>
          )
        }
      },
      {
        title: '默认值',
        dataIndex: 'defaultValue',
        key: 'defaultValue',
        width: 150,
        render: (text, record) => {
          if (['int', 'singleRowText'].includes(record.type)) {
            return text || '--'
          } else if (['listSel'].includes(record.type)) {
            const list = record.params
            list.params = Array.isArray(list.params) ? list.params : JSON.parse(list.params)
            let finalValue = '--'
            if (list.isSingle === '0' && list.params && !record.defaultValue) {
              finalValue = _.find(list.params, (d) => d.select)?.label || '--'
            } else if (list.isSingle === '1' && list.params && !record.defaultValue) {
              finalValue =
                _.chain(list.params)
                  .filter((d) => d.select)
                  .map((d) => d.label)
                  .value() || '--'

              finalValue = Array.isArray(finalValue) ? finalValue.join(',') : finalValue
            }
            return finalValue
          } else {
            return '--'
          }
        }
      },
      {
        title: '基础校验',
        dataIndex: 'isRequired',
        key: 'isRequired',
        width: 100,
        render: (text) => {
          switch (text) {
            case 0:
              return <Tag>选填</Tag>
            case 1:
              return <Tag>必填</Tag>
            case 2:
              return <Tag>只读</Tag>
            default:
              return null
          }
        }
      },
      {
        title: '关键属性',
        dataIndex: 'isKeyAttribute',
        key: 'isKeyAttribute',
        width: 100,
        render: (text, record) => (
          //  0非 1 是
          <Switch
            checked={Number(text) === 1}
            onChange={(checked) => {
              this.handleChange(checked, record)
            }}
          />
        )
      },
      {
        title: '是否为展示列',
        dataIndex: 'isShowColumn',
        key: 'isShowColumn',
        width: 120,
        render: (text, record) => <div>{text === 1 ? '是' : '否'}</div>
      },
      {
        title: '关联类型',
        dataIndex: 'relationType',
        key: 'relationType',
        width: 115,
        render: (text, record) => <div>{text === 1 ? '表单字段' : '数据表字段'}</div>
      },
      {
        title: '操作',
        key: 'operation',
        width: 80,
        render: (text, record) => {
          return (
            <Popconfirm
              title={i18n('conf.model.del.card', '确定要删除吗？')}
              onConfirm={() => this.handleDelete(record.id)}
            >
              <a>删除</a>
            </Popconfirm>
          )
        }
      }
    ]

    // const width = document.querySelector('#database')?.getBoundingClientRect().width || 1000 // 内容区域的宽度不包含padding
    // let scrollXWidth = columns.map((item) => item.width).reduce((sum, item) => sum + item, 0)
    // console.log(scrollXWidth, width, '----scrollXWidth---')

    return columns
  }

  handleChange = async (checked, record) => {
    const { dataSetId } = this.props
    const res = await this.props.dataBaseStore.switchKeyAttribute({
      fieldId: record?.id,
      isKeyAttribute: checked ? 1 : 0,
      dataSetId: dataSetId
    })
    if (res) {
      message.success('操作成功')
      this.getFieldsList()
    }
  }

  handleDelete = (id) => {
    const { dataSetId } = this.props
    modelFieldListStore.onDeleteField(id, dataSetId).then((res) => {
      if (+res === 200) {
        message.success(i18n('delete_success', '删除成功'))
        this.getFieldsList()
      }
    })
  }

  onSearch = (value) => {
    this.setState(
      {
        wd: value
      },
      () => {
        this.getFieldsList()
      }
    )
  }

  handleChangeVisible = (visible, val = undefined, item = {}) => {
    this.setState({ visible, field: item, open: false, queryType: '' }, async () => {
      await createStore.setFieldData({})
      await createStore.changeType(val)
    })
  }

  handleOk = async () => {
    this.setState({ confirmLoading: true })
    const { dataSetId } = this.props
    const result = await this.createField.saveField(dataSetId)
    this.setState({ confirmLoading: false })
    if (!_.isEmpty(result)) {
      this.handleChangeVisible(false)
      this.getFieldsList()
    }
  }

  componentDidMount() {
    this.getFieldsList()
  }

  handleFieldsChange = (value, type = '', code = '') => {
    this.setState({ quoteVisible: value, type, code })
  }

  handledFieldsOk = async (data) => {
    const { type } = this.state
    const { dataSetId } = this.props
    let res =
      type === 'edit'
        ? await this.props.dataBaseStore.updateQuoteField(_.assign({}, data, { dataSetId }))
        : await this.props.dataBaseStore.saveQuoteField(_.assign({}, data, { dataSetId }))
    if (res === '200') {
      message.success('操作成功')
      this.handleFieldsChange(false)
      this.getFieldsList()
    } else {
      message.error('操作失败')
    }
  }

  render() {
    const {
      visible,
      field,
      open,
      confirmLoading,
      queryType,
      loading,
      quoteVisible,
      type,
      code,
      fieldsList
    } = this.state
    const { dataSetId } = this.props
    const fieldType = ['singleRowText', 'listSel', 'int', 'userGroup', 'department', 'user']

    const diliver = {
      formItemLayout,
      queryType: queryType,
      store: createStore,
      userType: 'model',
      source: 'dataBase',
      useScene: 1,
      dataSetId: dataSetId
    }

    const content = (
      <div className="field-header" onMouseLeave={() => this.setState({ open: false })}>
        {fieldType.map((value, index) => {
          const item = DataType[value]
          return (
            <div
              className="field-header-item"
              onClick={() => this.handleChangeVisible(true, value, item)}
            >
              <i className={item.icon} /> <span>{item.name}</span>
            </div>
          )
        })}
      </div>
    )
    return (
      <div>
        <div className="dataBase-search">
          <Search
            allowClear
            style={{ width: 220 }}
            placeholder="请输入关键字"
            onSearch={this.onSearch}
          />
          <div>
            <Button
              style={{ marginRight: 10 }}
              onClick={() => this.handleFieldsChange(true, 'new')}
            >
              引用字段
            </Button>
            <Popover content={content} trigger="click" placement="bottomRight" open={open}>
              <Button type="primary" onClick={() => this.setState({ open: !open })}>
                新建字段
              </Button>
            </Popover>
          </div>
        </div>
        <DndProvider backend={HTML5Backend}>
          <Table
            loading={loading}
            columns={this.getColumn()}
            dataSource={fieldsList || []}
            pagination={false}
            components={this.components}
            onRow={(record, index) => ({
              index,
              moveRow: this.moveRow
            })}
            style={{ marginTop: 10 }}
          />
        </DndProvider>
        <Drawer
          title={queryType ? '编辑字段' : `新建${field?.name}`}
          onClose={() => this.handleChangeVisible(false)}
          open={visible}
          destroyOnClose
          zIndex={999}
          outerClose={false}
          footer={
            <div className="drawer-btn">
              <Button type="primary" onClick={this.handleOk} loading={confirmLoading}>
                确定
              </Button>
              <Button onClick={() => this.handleChangeVisible(false)}>取消</Button>
            </div>
          }
        >
          <div className="database-fields">
            <CreateField
              wrappedComponentRef={(node) => {
                this.createField = node
              }}
              {...diliver}
              btnCancel={true}
            />
          </div>
        </Drawer>

        <QuoteFields
          visible={quoteVisible}
          handleFieldsChange={this.handleFieldsChange}
          handledFieldsOk={this.handledFieldsOk}
          type={type}
          dataSetId={dataSetId}
          code={code}
        />
      </div>
    )
  }
}

export default inject('dataBaseStore')(observer(DragSortingTable))
