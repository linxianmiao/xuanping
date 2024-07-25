import React, { Component } from 'react'
import { Tag } from '@uyun/components'
import _ from 'lodash'
import LazySelect from './components/lazyLoadSelect'
import FormItem from '../../../../ticket/forms/components/formItem'
import Secrecy from '../../../../ticket/forms/components/Secrecy'
import { i18n } from '../utils'
import RelateTicketStore from './stores/relateTicketStore'

export class RelaleTicketNum extends Component {
  constructor (props) {
    super(props)
    this.relateTicketStore = new RelateTicketStore()
  }

  static defaultProps = {
    value: undefined, // 当前字段的value,格式不定
    onChange: () => {}, // 修改字段的value方法
    field: {}, // 字段的对象
    forms: {}, // 工单得对象，可以获取工单id，模型id，处理人等信息
    preview: false, // 是否时预览，部分字段预览时不可编辑
    allValue: {}, // 表单中所有字段得值，为{[code]:value}模式
    setFieldsValue: () => {} // 同 antd 的 setFieldsValue ，用来修改表单中其他的值 请勿乱用
  }

  onChange = (val) => {
    const { field, form } = this.props
    const { setFieldsValue } = form
    setFieldsValue && setFieldsValue({ [field.code]: val })
    this.props.onChange(val)
  }

  validator = (rules, value, callback) => {
    // const reg = new RegExp('(https?|ftp|file)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]')
    if (rules.required && _.isEmpty(value)) {
      callback(`请输入${this.props.field.name}`)
    } else {
      console.log('成功')
      callback()
    }
  }

  getList = async (query, callback) => {
    const { pageNo, pageSize, kw } = query
    const params = { pageNum: pageNo, pageSize, kw }
    const res = await this.relateTicketStore.getAllTicketListData(params)
    let list = res.list || []
    list = list.map(item => ({ id: item.ticketNum, name: item.ticketName, ticketId: item.ticketId }))
    callback(list)
  }

  render () {
    const { field, value, disabled, getFieldDecorator, initialValue, fieldMinCol, form, forms, type, secrecy } = this.props
    const { setFieldsValue, getFieldsValue } = form

    let prevValue = null
    let allValue = getFieldsValue()
    return (
      <FormItem field={field} fieldMinCol={fieldMinCol}>
        {getFieldDecorator(field.code, {
          initialValue: initialValue,
          rules: [{
            required: +field.isRequired === 1,
            validator: this.validator
          }],
          // validateTrigger: _.get(customField, 'validateTrigger') || 'onChange',
          normalize: (value, prevVal, allValues) => {
            prevValue = prevVal
            allValue = _.assign({}, allValue, allValues)
            return value
          }
        })(
          secrecy ? <Secrecy />
            : <div>
              {disabled ? (
                value && value.length > 0 && value.map(d => {
                  return (
                    <Tag key={d.label}>
                      {d.label}
                    </Tag>
                  )
                })
              )
                : <LazySelect
                    placeholder={`${i18n('ticket.create.select', '请选择')}`}
                    value={value || undefined}
                    mode="multiple"
                    labelInValue
                    getList={this.getList}
                    onChange={this.onChange} />
              }
            </div>
        )}
      </FormItem>

    )
  }
}

export default RelaleTicketNum
