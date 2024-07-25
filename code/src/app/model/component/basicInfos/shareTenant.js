import React, { Component } from 'react'
import { Form, Radio } from '@uyun/components'
import LazySelect from '~/components/lazyLoad/lazySelect'

const FormItem = Form.Item
const RadioGroup = Radio.Group

/**
 * 选择共享租户
 */
class ShareTenant extends Component {
  handleRadioChange = flag => {
    const { value, onChange } = this.props
    const nextValue = { ...value }

    nextValue.sharedTenantFlag = flag
    onChange(nextValue)
  }

  handleSelectChange = tenants => {
    const { value, onChange } = this.props
    const nextValue = { ...value }

    nextValue.tenantInfoVoList = tenants.map(item => ({ tenantId: item.key, tenantName: item.label }))
    onChange(nextValue)
  }

  getList = async (query, callback) => {
    const res = await axios.get(API.queryAllTenantList, { params: query }) || {}
    let list = res.list || []

    callback(list)
  }

  render() {
    const { value } = this.props
    const { sharedTenantFlag, tenantInfoVoList } = value
    const tenants = tenantInfoVoList.map(item => ({ key: item.tenantId, label: item.tenantName }))

    return (
      <div>
        <RadioGroup
          value={sharedTenantFlag}
          onChange={e => this.handleRadioChange(e.target.value)}
        >
          <Radio value={0}>不共享</Radio>
          <Radio value={1}>共享</Radio>
        </RadioGroup>

        {
          sharedTenantFlag === 1 && (
            <LazySelect
              placeholder={`${i18n('ticket.create.select', '请选择')}`}
              mode="multiple"
              value={tenants}
              labelInValue
              getList={this.getList}
              onChange={this.handleSelectChange}
            />
          )
        }
      </div>
    )
  }
}

export default class ShareTenantField extends Component {
  render() {
    const { item, getFieldDecorator, formItemLayout, defaultValue } = this.props

    return (
      <FormItem {...formItemLayout} label={item.name}>
        {
          getFieldDecorator(item.code, {
            initialValue: defaultValue || { sharedTenantFlag: 0, tenantInfoVoList: [] },
            rules: [{
              validator: (rule, value, callback) => {
                if (value.sharedTenantFlag && value.tenantInfoVoList.length === 0) {
                  callback(i18n('please.select.tenant', '请选择租户'))
                } else {
                  callback()
                }
              }
            }]
          })(
            <ShareTenant />
          )
        }
      </FormItem>
    )
  }
}
