import React, { Component } from 'react'
import { Form } from '@uyun/components'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import { cascade, treeSel } from './cascaderConfig'
import { Common } from '../index'
import CasExternal from '../../form/casExternal'
@observer
class Index extends Component {
  onChange = fieldData => {
    this.props.store.setFieldData(fieldData)
  }

  render () {
    const { getFieldDecorator, setFieldsValue, getFieldValue } = this.props.form
    const diliver = _.merge({}, this.props, {
      getFieldDecorator,
      setFieldsValue,
      getFieldValue,
      config: this.props.type === 'treeSel' ? treeSel : cascade
    })
    // 设置整体字段信息值
    const { fieldData } = toJS(this.props.store)
    const item = _.filter(diliver.config, conf => { return conf.type === this.props.type })[0]
    const defaultValue = (fieldData && fieldData[item.code]) ? fieldData[item.code] : item.defaultValue || undefined
    return (
      <div>
        <Common {...diliver}>
          <CasExternal {...diliver} store={this.props.store} onChange={this.onChange} defaultValue={defaultValue} fieldData={fieldData} />
        </Common>
      </div>
    )
  }
}

export default Form.create({
  onValuesChange: props => {
    props.onValuesChange && props.onValuesChange()
  }
})(Index)
