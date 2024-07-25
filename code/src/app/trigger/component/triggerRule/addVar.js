import React, { Component } from 'react'
import { Row, Col, Input, Popover } from '@uyun/components'
import ParamsSelect from '../paramSelect'
import '../../style/add-var.less'
const { TextArea } = Input

class AddVar extends Component {
  constructor (props) {
    super(props)
    this.state = { }
  }

    setTriggerData = (triggerIndex, paramIndex, value) => {
      this.props.setTriggerData(triggerIndex, paramIndex, value)
    }

    handleClick = (key, fieldType) => {
      const { item, triggerIndex, paramIndex } = this.props
      let value = item.value || ''
      if (fieldType === 'modelParams') {
        value += '${ticket.modelField.' + key + '}'
      } else {
        value += '${ticket.' + key + '}'
      }
      this.setTriggerData(triggerIndex, paramIndex, value)
    }

    render () {
      const { modelId, titleParams, item, triggerIndex, paramIndex, type, triggerNode } = this.props
      const fieldParamsType = [
        { code: 'fieldparamlist', name: i18n('system_attr', '系统属性'), list: titleParams },
        { code: 'builtinParams', name: i18n('builtin_field', '内置字段') }
      ]
      if (modelId) {
        fieldParamsType.push({ code: 'modelParams', name: '模型字段' })
      }
      fieldParamsType.push({ code: 'defineParams', name: i18n('custom_field', '自定义字段') })
      const id = `${triggerIndex}${item.code}`
      return (
        <Row className="add-var" id={id}>
          <Col span={20} className="add-var-input">
            {type === 'input' && <Input value={item.value || ''} onChange={e => { this.setTriggerData(triggerIndex, paramIndex, e.target.value) }} />}
            {type === 'textarea' && <TextArea rows={4} value={item.value || ''} onChange={e => { this.setTriggerData(triggerIndex, paramIndex, e.target.value) }} />}
          </Col>
          <Col span={4} className="add-var-dropdown">
            <ParamsSelect
              modelId={modelId}
              paramsType={fieldParamsType}
              onChangeParam={this.handleClick}
            >
              <span className="add-var-dropdown-btn"><i className="icon-code iconfont" /></span>
            </ParamsSelect>
          </Col>
        </Row>
      )
    }
}

export default AddVar
