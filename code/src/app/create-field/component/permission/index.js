import React, { Component } from 'react'
import { Form, Checkbox } from '@uyun/components'
import AutoSizeSelect from './AutoSizeSelect'
import { toJS } from 'mobx'
import CommonConfig from '../../config/commonConfig'
import Common from '../common'

import styles from './index.module.less'

const FormItem = Form.Item

const scopeOptions = [
  { label: '加入用户组', value: '0' },
  { label: '退出用户组', value: '1' },
  { label: '新建用户组', value: '2' },
  { label: '编辑用户组', value: '3' }
]

class Permission extends Component {
  state = {
    apps: []
  }

  render() {
    const { formItemLayout, fieldData } = this.props
    const { getFieldDecorator, setFieldsValue } = this.props.form
    const { permissionServiceScope, permissionServiceCode, serviceRange } = toJS(fieldData)
    const diliver = _.merge({}, this.props, {
      getFieldDecorator,
      setFieldsValue,
      config: CommonConfig,
      type: 'permisssion'
    })
    // const initialValue = typeof permissionServiceScope === 'undefined' ? 0 : permissionServiceScope
    return (
      <Common {...diliver}>
        <FormItem {...formItemLayout} label={'服务权限'} className={styles.permissionFormItem}>
          {getFieldDecorator('permissionServiceCode', {
            initialValue: permissionServiceCode,
            rules: [
              { required: true, message: '请选择服务权限' }
            ]
          })(
            <Checkbox.Group options={scopeOptions} />
          )}
        </FormItem>

        <FormItem {...formItemLayout} label={'服务范围'}>
          {
            getFieldDecorator('serviceRange', {
              initialValue: serviceRange || undefined,
              rules: [
                { required: true, message: '请选择服务范围' }
              ]
            })(
              <AutoSizeSelect />
            )
          }
        </FormItem>
      </Common>
    )
  }
}

export default Form.create({
  onValuesChange: props => {
    props.onValuesChange && props.onValuesChange()
  }
})(Permission)