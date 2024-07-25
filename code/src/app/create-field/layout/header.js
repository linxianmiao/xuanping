import React, { Component } from 'react'
import { Form } from '@uyun/components'
import { observer } from 'mobx-react'
import DataType from '../config/dataType'
import './style/header.less'
const FormItem = Form.Item

@observer
class Header extends Component {
  render() {
    const { store } = this.props
    let { type } = store
    if (type === 'treeSel') {
      type = 'cascader'
    }
    const formItemLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 22 }
    }
    const { fieldType } = DataType
    return (
      <div className="field-header-wrap">
        <FormItem {...formItemLayout} label={i18n('field_header_type', '字段类型')} required>
          <ul className="field-header-icon-wrap clearfix">
            {fieldType.map((value, index) => {
              const item = DataType[value]
              const cls = type === item.type ? 'field-type-selected' : ''
              return (
                <li
                  key={index}
                  className="field-header-icon"
                  onClick={() => {
                    this.props.store.changeType(item.type)
                  }}
                >
                  <div className={cls}>
                    <i className={item.icon} />
                  </div>
                  <span>{item.name}</span>
                </li>
              )
            })}
          </ul>
        </FormItem>
      </div>
    )
  }
}

export default Header
