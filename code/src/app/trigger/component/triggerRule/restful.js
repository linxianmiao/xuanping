import React, { Component } from 'react'
import { Form, Input, Select, Button, Row, Col, Radio, Checkbox } from '@uyun/components'
const FormItem = Form.Item
const Option = Select.Option
const OptGroup = Select.OptGroup

class Restful extends Component {
  constructor (props) {
    super(props)
    this.state = {
      type: 'formData'
    }
  }

    addHeader = () => {
      const headers = this.props.trigger.headers || []
      headers.push({ paramName: '', paramValue: '' })
      this.props.setTriggerData(this.props.triggerIndex, 'headers', headers)
    }

    delHeader = index => {
      const headers = this.props.trigger.headers || []
      headers.splice(index, 1)
      this.props.setTriggerData(this.props.triggerIndex, 'headers', headers)
    }

    render () {
      const { type } = this.state
      const { formItemLayout, fullParams, builtinParams, defineParams, trigger } = this.props
      return (<div>
        <FormItem {...formItemLayout} label="URL">
          <Input value={trigger['url'] || ''} />
        </FormItem>
        <FormItem {...formItemLayout} label="URL">
          <Select value={trigger.type || ''} onChange={this.handleChange}>
            <Option value="get">GET</Option>
            <Option value="post">POST</Option>
            <Option value="delete">DELETE</Option>
            <Option value="put">PUT</Option>
            <Option value="patch">PATCH</Option>
          </Select>
        </FormItem>
        <FormItem {...formItemLayout} label="URL">
          {
            trigger.headers && trigger.headers.map((header, index) => {
              const len = trigger.headers.length
              return (
                <Row key={index}>
                  <Col span={8}><Input value={header.paramName} /></Col>
                  <Col span={15}><Input value={header.paramValue} /></Col>
                  {len !== 1 && <Col span={1}><i onClick={() => { this.delHeader(index) }} className="iconfont icon-shanchu" /></Col>}
                </Row>
              )
            })
          }
          <Button type="primary" onClick={this.addHeader}>{i18n('add_options', '添加选项')}</Button>
        </FormItem>
        <p>输入参数</p>
        <div className="clearfix">
          <div className="fl"><Radio />form-data</div>
          <div className="fl"><Radio />raw</div>
        </div>
        {
          type === 'formData' && (<div>
            {trigger.formData && trigger.formData.map(item => {
              return (
                <Row>
                  <Col span={1}><Checkbox /></Col>
                  <Col span={4}><Input /></Col>
                  <Col span={6}><Input /></Col>
                  <Col span={5}>
                    <Select>
                      <OptGroup label={i18n('system_attr', '系统属性')}>
                        {fullParams.map(item => {
                          return (<Option value={item.code}>{item.name}</Option>)
                        })}
                      </OptGroup>
                      <OptGroup label={i18n('builtin_field', '内置字段')}>
                        {builtinParams.map(item => {
                          return (<Option value={item.code}>{item.name}</Option>)
                        })}
                      </OptGroup>
                      <OptGroup label={i18n('custom_field', '自定义字段')}>
                        {defineParams.map(item => {
                          return (<Option value={item.code}>{item.name}</Option>)
                        })}
                      </OptGroup>
                    </Select>
                  </Col>
                  <Col span={8}><Input /></Col>
                </Row>
              )
            })}
            <Button type="primary">{i18n('add_options', '添加选项')}</Button>
          </div>)
        }
      </div>)
    }
}

export default Restful
