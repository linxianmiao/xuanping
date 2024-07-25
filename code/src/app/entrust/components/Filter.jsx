import React, { Component } from 'react'
import { inject } from 'mobx-react'
import { Form, Select } from '@uyun/components'
import LazySelect from '~/components/lazyLoad/lazySelect'
import UserPicker from '~/components/userPicker'

const { Option } = Select

@inject('modelListStore')
@Form.create({
  onValuesChange: (props, changedValues, allValues) => {
    const values = _.assign({}, allValues, changedValues)
    values.consignor = _.map(values.consignor, (d) => d.id) || undefined
    values.consignee = _.map(values.consignee, (d) => d.id) || undefined
    props.getList(values)
  }
})
export default class Filter extends Component {
  getList = async (query, callback) => {
    const res = (await this.props.modelListStore.getConfModelList(query)) || {}
    const { list } = res
    callback(list)
  }

  render() {
    const { getFieldDecorator } = this.props.form
    if (this.props.currentTab !== 'Entrust-force') {
      return (
        <Form layout="inline">
          <Form.Item>
            {getFieldDecorator('entrust_status', {
              initialValue: undefined
            })(
              <Select allowClear placeholder="请选择委托状态" style={{ width: 200 }}>
                <Option value="0">未生效</Option>
                <Option value="1">有效</Option>
                <Option value="2">过期</Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('audit_status', {
              initialValue: undefined
            })(
              <Select allowClear placeholder="请选择审核状态" style={{ width: 200 }}>
                <Option value="0">待审核</Option>
                <Option value="1">通过</Option>
                <Option value="2">不通过</Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('processId', {
              initialValue: undefined
            })(
              <LazySelect
                labelInValue
                style={{ width: 256 }}
                getList={this.getList}
                placeholder={i18n('pls_select_modelType', '请选择模型类型')}
              />
            )}
          </Form.Item>
        </Form>
      )
    }

    return (
      <Form layout="inline">
        <Form.Item className="user-wrap">
          {getFieldDecorator('consignor', {
            initialValue: undefined
          })(
            <UserPicker
              placeholder="请选择委托人"
              tabs={[1]}
              showTypes={['users']}
              selectionType="radio"
            />
          )}
        </Form.Item>
        <Form.Item className="user-wrap">
          {getFieldDecorator('consignee', {
            initialValue: undefined
          })(
            <UserPicker
              placeholder="请选择被委托人"
              tabs={[1]}
              showTypes={['users']}
              style={{ width: 150 }}
              selectionType="radio"
            />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('entrust_status', {
            initialValue: undefined
          })(
            <Select allowClear placeholder="请选择委托状态" style={{ width: 150 }}>
              <Option value="0">未生效</Option>
              <Option value="1">有效</Option>
              <Option value="2">过期</Option>
            </Select>
          )}
        </Form.Item>
        、
        <Form.Item>
          {getFieldDecorator('processId', {
            initialValue: undefined
          })(
            <LazySelect
              labelInValue
              style={{ width: 150 }}
              getList={this.getList}
              placeholder={i18n('pls_select_modelType', '请选择模型类型')}
            />
          )}
        </Form.Item>
      </Form>
    )
  }
}
