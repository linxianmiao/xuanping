import React, { Component } from 'react'
import { Form, Row, Col } from '@uyun/components'

import Editor from '../../mention/MentionWithOption'
import User from './user'

const FormItem = Form.Item

class Submit extends Component {
    state = {
      value: ''
    }

    handleSubmit = e => {
      e.preventDefault()
    }

    handleChange = val => {
      this.setState({ value: val })
      this.props.form.setFieldsValue({ message: val })
    }

    _render = () => {
      const { getFieldDecorator, setFieldsValue } = this.props.form
      const { nextActivity } = this.props
      const formItemLayout = {
        labelCol: { span: 0 },
        wrapperCol: { span: 24 }
      }

      let j = 0

      return (
        <Form className="double-line" layout="vertical">
          {
            (() => {
              if (!_.isEmpty(nextActivity) && nextActivity.length === 1 && nextActivity[0].policy === 1 && nextActivity[0].tacheType !== 2) {
                const dilver = {
                  type: 'normal',
                  code: 'submit',
                  name: i18n('ticket.detail.specify', '下一阶段处理人'),
                  isRequired: 1,
                  users: nextActivity[0],
                  showName: true
                }
                return (
                  <User
                    item={dilver}
                    orgId={this.props.orgId || null} // 开启组织机构时  传 所属部门的id
                    formItemLayout={formItemLayout}
                    getFieldDecorator={getFieldDecorator}
                    setFlowUser={this.props.setFlowUser}
                    setFieldsValue={setFieldsValue} />
                )
              } else if (!_.isEmpty(nextActivity)) {
                return (
                  _.map(nextActivity, item => {
                    j = j + 1
                    return (
                      item.policy === 1
                        ? <div className="check-user-wrap" key={item.tacheId}>
                          <Row className="line32">
                            <Col span={24} style={{ display: j > 1 ? 'none' : 'block' }}>
                              <label className="ant-form-item-required">{i18n('ticket.operate.Choose_executor', '处理人')}</label>
                            </Col>
                            <Col span={24} className="user-wrap-col">
                              <div className="tache-name">
                                {item.tacheName}
                              </div>
                              <User item={{ code: item.tacheId,
                                type: 'parallel',
                                name: i18n('ticket.operate.select_jump', '该阶段人员'),
                                isRequired: 1,
                                users: item,
                                showName: false }}
                              orgId={this.props.orgId || null} // 开启组织机构时  传 所属部门的id
                              getFieldDecorator={getFieldDecorator}
                              setFieldsValue={setFieldsValue}
                              caseId={this.props.caseId}
                              setFlowUser={this.props.setFlowUser} />
                            </Col>
                          </Row>
                        </div>
                        : null
                    )
                  }))
              }
            })()
          }
          {
            +this.props.isRequiredHandingSuggestion !== 2 &&
            <FormItem label={i18n('ticket.detail.opinion', '意见')} >
              {getFieldDecorator('message', {
                initialValue: undefined,
                rules: [{
                  min: 0,
                  max: 2000,
                  message: i18n('ticket.create.most_opinion', '处理意见最多2000字')
                }, {
                  required: +this.props.isRequiredHandingSuggestion === 1,
                  message: i18n('please-input', '请输入')
                }],
                getValueFromEvent: function (data) {
                  return data
                }
              })(
                <Editor
                  handleChange={this.handleChange}
                  setFieldsValue={setFieldsValue}
                  val={this.state.value} />
              )}
            </FormItem>
          }
        </Form>
      )
    }

    componentWillReceiveProps (nextProps) {
      if (this.props.visible !== nextProps.visible) {
        this.setState({ value: '' })
      }
    }

    render () {
      return this.props.visible && this._render()
    }
}

export default Form.create()(Submit)
