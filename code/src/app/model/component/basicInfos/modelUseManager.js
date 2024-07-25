import React, { Component } from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Form } from '@uyun/components'
import UserPicker from '~/components/userPicker'

const FormItem = Form.Item

@inject('basicInfoStore')
@observer
class ModelUseManager extends Component {
  render() {
    const { formItemLayout, item, basicInfoStore, getFieldDecorator } = this.props
    const modelUseManager = toJS(basicInfoStore.modelData.modelUseManager)
    return (
      <FormItem {...formItemLayout} label={item.name}>
        {getFieldDecorator('modelUseManager', {
          initialValue: modelUseManager || []
        })(<UserPicker tabs={[1, 3]} showTypes={['users', 'roles_custom']} />)}
      </FormItem>
    )
  }
}

export default ModelUseManager
