import React, { Component } from 'react'
import { Form, Select } from '@uyun/components'
import TopologyConfig from './topologyConfig'
import { Common } from '../index'
import { observer } from 'mobx-react'
const FormItem = Form.Item
const Option = Select.Option
@observer
class Topology extends Component {
  componentDidMount () {
    this.props.store.querySpecifyFields({
      isSingle: 0,
      typeList: 'resource'
    })
  }

  render () {
    const { getFieldDecorator, setFieldsValue, getFieldValue } = this.props.form
    const { specifyField, fieldData } = this.props.store
    const { formItemLayout } = this.props
    const diliver = _.assign({}, this.props, {
      getFieldDecorator,
      setFieldsValue,
      getFieldValue,
      config: TopologyConfig,
      type: 'topology'
    })

    return (
      <Common {...diliver}>
        <FormItem {...formItemLayout} label={i18n('bindField', '关联配置')}>
          {getFieldDecorator('bindField', {
            initialValue: fieldData.bindField || undefined
          })(
            <Select
              showSearch
              allowClear
              optionFilterProp="children"
              placeholder={i18n('ticket.create.select', '请选择')}
              notFoundContent={i18n('globe.notFound', '无法找到')}>
              { _.map(specifyField, param => <Option key={param.code} value={param.code}>{ param.name }</Option>) }
            </Select>
          )}
        </FormItem>
      </Common>
    )
  }
}

export default Form.create({
  onValuesChange: props => {
    props.onValuesChange && props.onValuesChange()
  }
})(Topology)
