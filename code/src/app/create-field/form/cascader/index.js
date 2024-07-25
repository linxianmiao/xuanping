import React, { Component } from 'react'
import { Form, Button, Radio, Checkbox } from '@uyun/components'
import { toJS } from 'mobx'
import ItemWrap from './itemWrap'
import uuidv4 from 'uuid/v4'
import '../style/cascader.less'
const FormItem = Form.Item
const RadioGroup = Radio.Group
const radioGroupOptions = [
  { label: i18n('create.field.cascader.cascader', '单选'), value: 'cascader' },
  { label: i18n('create.field.cascader.treeSel', '多选'), value: 'treeSel' }
]
class Index extends Component {
  state = {
    data: this.props.defaultValue || []
  }

  onAdd = (level, parantIndex, index, item) => {
    const { data } = this.state
    if (level === 0) {
      data.push({
        label: '',
        value: uuidv4(),
        select: 0,
        children: [
          {
            label: '',
            value: uuidv4(),
            select: 0,
            children: [
              {
                label: '',
                value: uuidv4(),
                select: 0,
                children: [
                  {
                    label: '',
                    value: uuidv4(),
                    select: 0,
                    children: [
                      {
                        label: '',
                        value: uuidv4(),
                        select: 0,
                        children: [
                          {
                            label: '',
                            value: uuidv4(),
                            select: 0,
                            children: null
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      })
    }

    if (level === 1) {
      data[parantIndex].children.push({ label: '', value: uuidv4(), select: 0, children: [] })
    }
    this.onParams(data)
  }

  onDelete = (index) => {
    const { data } = this.state
    data.splice(index, 1)
    this.onParams(data)
  }

  onChange = (item, i) => {
    const { data } = this.state
    data[i] = item
    this.onParams(data)
  }

  onValue = (value, index) => {
    const data = _.cloneDeep(this.state.data)
    data[index].label = value
    this.onParams(data)
  }

  onParams = (data) => {
    const { setFieldsValue } = this.props
    this.setState({ data }, () => {
      setFieldsValue && setFieldsValue({ cascaderData: data })
    })
  }

  cascaderORtreeSel = (e) => {
    this.props.setFieldsValue && this.props.setFieldsValue({ type: e.target.value })
  }

  render() {
    const { formItemLayout, item, fieldData, getFieldDecorator, getFieldValue } = this.props
    const { data } = this.state
    const typeValue = (getFieldValue && getFieldValue('type')) || item.type
    // const code = typeValue === 'cascader' ? 'cascade' : 'treeVos'
    // 字典数据只能单选
    const tabStatus = toJS(this.props.store.fieldData.tabStatus)
    return (
      <div>
        <FormItem {...formItemLayout} label={i18n('create.field.cascader.type', '选择类型')}>
          {getFieldDecorator('type', {
            initialValue: typeValue,
            rules: [{ required: true }]
          })(
            <RadioGroup onChange={this.cascaderORtreeSel}>
              {radioGroupOptions.map((item) => (
                <Radio key={item.value} value={item.value}>
                  {item.label}
                </Radio>
              ))}
            </RadioGroup>
          )}
        </FormItem>
        {/* {
            typeValue === 'treeSel' && (
              <FormItem {...formItemLayout} label={i18n('select.range')}>
                {
                  getFieldDecorator('onlyLeafNode', {
                    initialValue: !!fieldData.onlyLeafNode,
                    valuePropName: 'checked'
                  })(
                    <Checkbox>{i18n('only.select.last.option')}</Checkbox>
                  )
                }
              </FormItem>
            )
          } */}
        <FormItem {...formItemLayout} label={i18n('select.range')}>
          {getFieldDecorator('onlyLeafNode', {
            initialValue: !!fieldData.onlyLeafNode,
            valuePropName: 'checked'
          })(<Checkbox>{i18n('only.select.last.option')}</Checkbox>)}
        </FormItem>

        <FormItem {...formItemLayout} style={{ marginBottom: 0 }}>
          {getFieldDecorator('cascaderData', {
            initialValue: data,
            rules: [{ required: true }]
          })}
        </FormItem>
      </div>
    )
  }
}

export default Form.create()(Index)
{
  /* <Row>
<Col span={3} className='ant-form-item-label'>
  <label>
    选择方式
  </label>
</Col>
<Col span={12} style={{ lineHeight: '30px' }}>

</Col>
</Row> */
}
