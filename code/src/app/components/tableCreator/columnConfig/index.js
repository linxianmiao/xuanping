import React, { Component, Fragment } from 'react'
import { PlusOutlined } from '@uyun/icons'
import { Modal, Button, message, Input, Select, Checkbox } from '@uyun/components'
import Table from './Table'
import { columnTypes } from './config'
import uuid from '~/utils/uuid'

class ColumnConfig extends Component {
  static defaultProps = {
    visible: false,
    data: [],
    value: [],
    onChange: () => {}
  }

  constructor(props) {
    super(props)

    this.state = {
      data: this.initialData(props.value),
      optionsOfType: {},
      visible: false
    }
  }

  componentDidMount() {
    const { value = [] } = this.props
    const types = new Set()
    value.forEach((item) => types.add(item.type))

    if (types.size > 0) {
      this.queryFields([...types])
    }
  }

  componentDidUpdate(prevProps) {
    const { value } = this.props

    // 表格拖拽列宽会改变列的colWidth属性值
    if (value !== prevProps.value) {
      const nextData = this.initialData(value)

      this.setState({ data: nextData })
    }
  }

  queryFields = (types = []) => {
    const params = {
      fieldTypes: types.join(','),
      modelId: this.props.modelId
    }
    axios.get(API.query_field_with_type, { params }).then((res) => {
      this.setState((prevState) => {
        return { optionsOfType: { ...prevState.optionsOfType, ...(res || {}) } }
      })
    })
  }

  initialData = (propData) => {
    const data = _.cloneDeep(propData) || []
    // 初始至少一条数据
    if (data.length === 0) {
      data[0] = { descEnable: 1 }
    }

    // 增加唯一标识
    data.forEach((item) => {
      if (!item.rowKey) {
        item.rowKey = uuid()
      }
    })

    return data
  }

  handleChange = (value, field, rowKey) => {
    const { data } = this.state
    const record = data.find((item) => item.rowKey === rowKey)

    if (!record) {
      return
    }

    record[field] = value

    // 切换列类型时，重置默认值
    if (field === 'type') {
      record.source = undefined

      if (!this.state.optionsOfType[value]) {
        this.queryFields([value])
      }
    }

    // type为嵌套表格nestedTable时，选择数据源的时候将tableCode和inlineName赋值给data
    if (record.type === 'nestedTable' && field === 'source') {
      const table = this.state.optionsOfType['nestedTable'].find((item) => item.code === value)
      record.tableCode = table.tableCode
      record.inlineName = table.inlineName
    }
    this.setState({ data })
  }

  handleAdd = () => {
    const { data } = this.state

    data.push({ rowKey: uuid(), descEnable: 1 })
    this.setState({ data })
  }

  handleDelete = (record) => {
    const { data } = this.state
    const newData = data.filter((item) => item.rowKey !== record.rowKey)

    this.setState({ data: newData })
  }

  handleRowDrag = (dropIndex, dragIndex) => {
    const newData = this.state.data.slice()
    const dragItem = newData[dragIndex]

    // 往下拖是放在目标元素下方，往上拖是放在目标元素上方
    if (dropIndex > dragIndex) {
      newData.splice(dropIndex + 1, 0, dragItem)
      newData.splice(dragIndex, 1)
    } else {
      newData.splice(dragIndex, 1)
      newData.splice(dropIndex, 0, dragItem)
    }

    this.setState({ data: newData })
  }

  handleOk = () => {
    // 校验数据，必填项不能为空
    const { data } = this.state
    let msg = ''
    let error = data.some((item) => {
      if (!item.label) {
        msg = i18n('col_mame_isnot_empty', '列名称不能为空')
        return true
      }
      if (!item.value) {
        msg = i18n('col_code_isblienot_empty', '列编码不能为空')
        return true
      }
      if (!item.type) {
        msg = i18n('col_type_isnot_empty', '列类型不能为空')
        return true
      }
    })

    if (error) {
      message.error(msg)
      return
    }

    // 列编码不能重复
    data
      .map((item) => item.value)
      .reduce((prev, item) => {
        if (prev === item) {
          error = true
          msg = i18n('col_code_isblienot_repeat', '列编码不能重复')
        }
        return item
      }, '')

    if (error) {
      message.error(msg)
      return
    }

    // 数据源不能为空
    error = data.some((item) => {
      if (item.type !== 'normal' && item.type !== 'singleRowText' && !item.source) {
        msg = i18n('col_talble_sourcce_isnot_empty', '数据源不能为空')
        return true
      }
    })

    if (error) {
      message.error(msg)
      return
    }

    // this.props.onChange(
    //   _.map(data, item => _.omit(item, ['rowKey']))
    // )
    this.props.onChange(_.cloneDeep(data))
    this.setState({ visible: false })
  }

  handleCancel = () => {
    this.setState({ data: this.initialData(this.props.value), visible: false })
  }

  getColumns = () => {
    const { value: columns } = this.props

    return [
      {
        title: <label className="label-required">{i18n('col_name', '列名称')}</label>,
        dataIndex: 'label',
        render: (value, record) => (
          <Input
            size="small"
            value={value}
            onChange={(e) => {
              this.handleChange(e.target.value, 'label', record.rowKey)
            }}
          />
        )
      },
      {
        title: <label className="label-required">{i18n('col_code', '列编码')}</label>,
        dataIndex: 'value',
        render: (value, record) => {
          // 编辑过的列编码不允许修改
          const disabled =
            record.color !== undefined || columns.some((col) => record.rowKey === col.rowKey)
          return (
            <Input
              size="small"
              value={value}
              disabled={disabled}
              onChange={(e) => {
                this.handleChange(e.target.value, 'value', record.rowKey)
              }}
            />
          )
        }
      },
      {
        title: <label className="label-required">{i18n('col_type', '列类型')}</label>,
        dataIndex: 'type',
        width: 90,
        render: (value, record) => (
          <Select
            size="small"
            allowClear
            showSearch
            value={value}
            optionFilterProp="children"
            dropdownMatchSelectWidth={false}
            placeholder={i18n('globe.select', '请选择')}
            notFoundContent={i18n('globe.notFound', '无法找到')}
            onChange={(val) => this.handleChange(val, 'type', record.rowKey)}
          >
            {_.map(columnTypes, (item) => (
              <Select.Option key={item.value}>{item.name}</Select.Option>
            ))}
          </Select>
        )
      },
      {
        title: i18n('col_source', '默认值/数据源'),
        dataIndex: 'source',
        render: (value, record) => {
          let options = this.state.optionsOfType[record.type] || []
          options = options.map((o) => ({ name: o.name, value: o.code }))

          if (record.type === 'normal') {
            return (
              <Input
                size="small"
                value={value}
                onChange={(e) => {
                  this.handleChange(e.target.value, 'source', record.rowKey)
                }}
              />
            )
          }
          return (
            <Select
              size="small"
              allowClear
              showSearch
              style={{ width: '100%' }}
              value={value}
              optionFilterProp="children"
              dropdownMatchSelectWidth={false}
              placeholder={i18n('globe.select', '请选择')}
              notFoundContent={i18n('globe.notFound', '无法找到')}
              onChange={(val) => this.handleChange(val, 'source', record.rowKey)}
            >
              {_.map(options, (item) => (
                <Select.Option key={item.value}>{item.name}</Select.Option>
              ))}
            </Select>
          )
        }
      },
      {
        title: i18n('col_desc', '列说明'),
        dataIndex: 'description',
        render: (value, record) => (
          <Input.TextArea
            size="small"
            rows={1}
            value={value}
            onChange={(e) => {
              this.handleChange(e.target.value, 'description', record.rowKey)
            }}
          />
        )
      },
      {
        title: i18n('col_desc_enable', '使用说明'),
        dataIndex: 'descEnable',
        width: 50,
        render: (text, record) => (
          <Checkbox
            checked={text === 1}
            onChange={(e) => {
              const value = e.target.checked ? 1 : 0
              this.handleChange(value, 'descEnable', record.rowKey)
            }}
          />
        )
      },
      {
        title: i18n('conf.model.field.required'),
        dataIndex: 'isRequired',
        width: 50,
        render: (text, record) => (
          <Checkbox
            checked={text === 1}
            onChange={(e) => {
              const value = e.target.checked ? 1 : 0
              this.handleChange(value, 'isRequired', record.rowKey)
            }}
          />
        )
      },
      {
        title: i18n('conf.model.field.read-only', '只读'),
        dataIndex: 'readOnly',
        width: 50,
        render: (text, record) => (
          <Checkbox
            checked={text === 1}
            onChange={(e) => {
              const value = e.target.checked ? 1 : 0
              this.handleChange(value, 'readOnly', record.rowKey)
            }}
          />
        )
      }
    ]
  }

  render() {
    const { data, visible } = this.state

    return (
      <Fragment>
        <Button style={{ width: 108 }} onClick={() => this.setState({ visible: true })}>
          {i18n('define_columns', '定义列')}
        </Button>
        <Modal
          visible={visible}
          title={i18n('column.config.function', '列设置功能')}
          width={900}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Table
            className="column-config-table"
            rowKey="rowKey"
            columns={this.getColumns()}
            data={data}
            onDelete={this.handleDelete}
            onRowDrag={this.handleRowDrag}
          />
          <Button icon={<PlusOutlined />} style={{ marginTop: 10 }} onClick={this.handleAdd}>
            {i18n('add_column', '添加列')}
          </Button>
        </Modal>
      </Fragment>
    )
  }
}

export default ColumnConfig
