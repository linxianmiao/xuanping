import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import {
  Button,
  Cascader,
  Select,
  Modal,
  message,
  Form,
  Table,
  InputNumber
} from '@uyun/components'
import attribute, { SOTERFIELDTYPES, BUILTIN_MENUCODE } from '~/list/config/attribute'
import DragColumn from './dragColumn'
import AttrFieldPanelModal from '~/components/AttrFieldPanel'
const Option = Select.Option

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  changeCoumnsWidth,
  changeCoumnsWidthType,
  ...restProps
}) => {
  let disabled = false
  if (['status', 'priority', 'tacheName', 'activityStageName'].includes(record?.code)) {
    disabled = true
  }
  if (record?.type === 'dateTime') {
    disabled = true
  }
  const widthTypeOptios = [
    {
      value: 'fixed',
      label: '固定列宽',
      children: [
        {
          value: 'fixedWrap',
          label: '超出折行'
        },
        {
          value: 'fixedBreak',
          label: '超出截取'
        }
      ]
    },
    { value: 'auto', label: '自动列宽' }
  ]
  return (
    <td {...restProps}>
      {editing ? (
        <>
          <Form.Item name={dataIndex + 'type'} className="cascader-form">
            <Cascader
              size="small"
              defaultValue={record.width.widthType}
              disabled={disabled}
              options={widthTypeOptios}
              onChange={(e) => changeCoumnsWidthType(e, record.code)}
            />
          </Form.Item>
          {!_.isEqual(record.width.widthType, ['auto']) && (
            <Form.Item
              name={dataIndex}
              rules={[
                {
                  required: true
                }
              ]}
            >
              <InputNumber
                min={record === 'ticketName' ? 200 : 120}
                max={1000}
                size="small"
                disabled={disabled}
                defaultValue={record.width.widthNum}
                onChange={(e) => changeCoumnsWidth(e, record.code)}
              />
            </Form.Item>
          )}
        </>
      ) : (
        children
      )}
    </td>
  )
}
@inject('listStore')
@observer
class CustomColumn extends Component {
  static defaultProps = {
    setProps: () => {}
  }

  state = {
    columnWidthVisible: false
  }

  handleChange = (e) => {
    const { value, checked } = e.target
    const { attributeList } = this.props.listStore
    if (checked) {
      this.props.listStore.setAttributeList([...attributeList, value])
    } else {
      this.props.listStore.setAttributeList(_.filter(attributeList, (item) => item !== value))
    }
  }

  closeTag = (e, code) => {
    const { attributeList } = this.props.listStore
    this.props.listStore.setAttributeList(_.filter(attributeList, (item) => item !== code))
  }

  handleMoveColumn = (dragIndex, hoverIndex) => {
    // 不要直接修改store中的属性!
    const nextAttributeList = this.props.listStore.attributeList.slice()
    if (dragIndex > hoverIndex) {
      nextAttributeList.splice(hoverIndex, 0, nextAttributeList[dragIndex])
      nextAttributeList.splice(dragIndex + 1, 1)
    } else {
      nextAttributeList.splice(hoverIndex + 1, 0, nextAttributeList[dragIndex])
      nextAttributeList.splice(dragIndex, 1)
    }
    this.props.listStore.setAttributeList(nextAttributeList)
  }

  handleChangeAttrField = (value) => {
    const valueCode = value.map((item) => item.code)
    if (valueCode.length === 0) {
      message.info('定制列至少保留一项')
      return
    }
    this.props.listStore.setSelectedList(value, 'COLUMN')
    this.props.listStore.setAttributeList(valueCode)
  }

  showColumnWidth = () => {
    this.setState({ columnWidthVisible: true })
    let codes = _.map(this.props.listStore.columnSelectedList, (d) => d.code)
    this.props.listStore.queryFieldType(codes.join(','))
  }

  submitColumnWidth = () => {
    this.setState({ columnWidthVisible: false })
  }
  changeCoumnsWidthType = (e, code) => {
    const { columnsWidth, setColumnWidth } = this.props.listStore
    let newData = _.cloneDeep(columnsWidth)
    let Index = columnsWidth.findIndex((d) => d.code === code)
    newData[Index].width.widthType = e
    setColumnWidth(newData)
  }
  changeCoumnsWidth = (e, code) => {
    const { columnsWidth, setColumnWidth } = this.props.listStore
    let newData = _.cloneDeep(columnsWidth)
    let Index = columnsWidth.findIndex((d) => d.code === code)
    newData[Index].width.widthNum = e
    setColumnWidth(newData)
  }

  render() {
    const { orderField, menuCode } = this.props
    const { columnWidthVisible } = this.state
    const { attributeList, columnAttrList, columnSelectedList, columnsWidth } = this.props.listStore

    const list = _.map(attributeList, (code) => {
      const item = _.find(columnSelectedList, (column) => column.code === code)
      return item || { code: code, name: code }
    })
    const options = []
    _.forEach(attribute, (item) => {
      if (item.sortedField) {
        options.push(
          <Option key={item.code} value={item.code}>
            {item.name}
          </Option>
        )
      }
    })
    if (!BUILTIN_MENUCODE.has(menuCode)) {
      _.forEach(list, (item) => {
        if (SOTERFIELDTYPES.has(item.type)) {
          options.push(
            <Option key={item.code} value={item.code}>
              {item.name}
            </Option>
          )
        }
      })
    }
    const columnsTableWidth = [
      {
        title: '字段名称',
        dataIndex: 'name',
        width: 160
      },
      {
        title: '类型',
        dataIndex: 'typeDesc',
        width: 88
        // sorter: {
        //   compare: (a, b) => a.typeDesc.split('')[0].localeCompare(b.typeDesc.split('')[0])
        // }
      },
      {
        title: '宽度',
        dataIndex: 'width',
        editable: true,
        width: 270
      }
    ]
    const mergedColumns = columnsTableWidth.map((col) => {
      if (!col.editable) {
        return col
      }
      return {
        ...col,
        onCell: (record) => ({
          record,
          inputType: 'text',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: true,
          changeCoumnsWidth: this.changeCoumnsWidth,
          changeCoumnsWidthType: this.changeCoumnsWidthType
        })
      }
    })
    return (
      <React.Fragment>
        <div className="queryer-custom-column-title">
          <div>{i18n('ticket.list.custom.column', '定制列')}</div>
          <div>
            <label>默认排序:</label>
            <Select
              style={{ marginLeft: 10, width: 106, textAlign: 'center' }}
              value={orderField}
              onChange={(value) => {
                this.props.setProps({ orderField: value })
              }}
              getPopupContainer={(triggerNode) => triggerNode}
            >
              {options}
            </Select>
          </div>
        </div>
        <div className="query_form_filter_wrap">
          {_.map(toJS(columnSelectedList), (item, index) => {
            return (
              <DragColumn
                index={index}
                key={item.id || item.code}
                code={item.code}
                name={item.name}
                onClose={this.onClose}
                closeTag={this.closeTag}
                handleMoveColumn={this.handleMoveColumn}
              />
            )
          })}
          <div style={{ marginTop: 10 }}>
            <AttrFieldPanelModal
              title={i18n('custom.column', '自定义列')}
              attrList={toJS(columnAttrList)}
              selected={[...toJS(columnSelectedList)]}
              modelIds={this.props.modelIds}
              onChange={(value) => this.handleChangeAttrField(value)}
            >
              <Button>{i18n('custom.column', '自定义列')}</Button>
            </AttrFieldPanelModal>
            {columnsWidth.length > 0 && (
              <Button style={{ marginLeft: 8 }} onClick={this.showColumnWidth}>
                定义列宽
              </Button>
            )}
          </div>
        </div>
        <Modal
          title="定义列宽"
          visible={columnWidthVisible}
          className="column-width-config-modal"
          onCancel={() => {
            this.setState({ columnWidthVisible: false })
          }}
          onOk={this.submitColumnWidth}
        >
          <Table
            components={{
              body: {
                cell: EditableCell
              }
            }}
            rowKey={(record) => record.code}
            columns={mergedColumns}
            dataSource={columnsWidth}
            scroll={{ y: 280 }}
            pagination={{ size: 'small' }}
          />
        </Modal>
      </React.Fragment>
    )
  }
}
export default CustomColumn
