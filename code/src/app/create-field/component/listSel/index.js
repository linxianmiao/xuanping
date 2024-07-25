import React, { Component } from 'react'
import { Form } from '@uyun/components'
import { toJS } from 'mobx'
import { Common } from '../index'
import ListSelectConfig from './listSelectConfig'
import External from '../../form/external'
import configList from '../config'
import './style/index.less'

class Index extends Component {
  goHome = () => {
    this.props.history.push('/conf/field')
  }

  // 设置整体字段信息值
  onChange = (fieldData) => {
    this.props.store.setFieldData(fieldData)
  }

  render() {
    const { formItemLayout, source } = this.props
    const { getFieldDecorator, getFieldValue } = this.props.form
    const fieldData = toJS(this.props.store.fieldData)

    const diliver = _.merge({}, this.props, {
      getFieldDecorator,
      config: source === 'dataBase' ? configList(ListSelectConfig) : ListSelectConfig,
      type: 'listSel'
    })
    const props = {
      fieldData,
      formItemLayout,
      onChange: this.onChange,
      store: this.props.store,
      getFieldValue
    }
    return (
      <div>
        <Common {...diliver}>
          <External {...props} source={source} />
        </Common>
      </div>
    )
  }
}

export default Form.create({
  onValuesChange: (props) => {
    props.onValuesChange && props.onValuesChange()
  }
})(Index)
