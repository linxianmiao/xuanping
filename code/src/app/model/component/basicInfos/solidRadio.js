import React, { Component } from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Form, Row, Col, Radio } from '@uyun/components'
const FormItem = Form.Item
const RadioGroup = Radio.Group

@inject('basicInfoStore')
@observer
class SolidRadio extends Component {
  onChange = e => {
    this.props.basicInfoStore.setShared(e.target.value)
  }

  render () {
    const { item, getFieldDecorator, defaultValue } = this.props
    const isChildModel = toJS(this.props.basicInfoStore.childModel)
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 }
    }
    return (
      <Row>
        <Col span={12} >
          <FormItem label={item.name} {...formItemLayout}>
            {
              getFieldDecorator(item.code, {
                initialValue: defaultValue || 0
              })(
                <RadioGroup buttonStyle="solid" onChange={this.onChange} disabled={Boolean(isChildModel)}>
                  <Radio.Button value={1} key={1}>{i18n('yes', '是')}</Radio.Button>
                  <Radio.Button value={0} key={0}>{i18n('no', '否')}</Radio.Button>
                </RadioGroup>
              )
            }
          </FormItem>
        </Col>
      </Row>
    )
  }
}

export default SolidRadio
