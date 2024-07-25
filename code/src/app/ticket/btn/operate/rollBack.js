import React, { Component } from 'react'
import { Form, Radio, Select } from '@uyun/components'
import Editor from '../../mention/MentionWithOption'
import { ApiFilled } from '@uyun/icons'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const Option = Select.Option

class Rollback extends Component {
  static defaultProps = {
    btnInfo: {}
  }

  state = {
    value: '',
    remoteRollBackTaches: []
  }

  componentDidMount() {
    const { btnInfo } = this.props
    const { rollbackWay, btnType } = btnInfo
    if (rollbackWay === 1 && btnType === 'remote_roll_back') {
      this.getTaches()
    }
  }

  getTaches = () => {
    axios.get(API.getRemoteTicketTaches(this.props.id)).then((res) => {
      if (res) {
        this.setState({ remoteRollBackTaches: res })
      }
    })
  }

  handleSubmit = (e) => {
    e.preventDefault()
  }

  validate = () => {
    return new Promise((resolve, reject) => {
      this.props.form.validateFields((errors, values) => {
        if (errors) {
          reject(errors)
        } else {
          resolve(values)
        }
      })
    })
  }

  handleChange = (val) => {
    this.setState({ value: val })
    this.props.form.setFieldsValue({ message: val })
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.visible !== nextProps.visible) {
      this.setState({ value: '' })
    }
  }

  _render = () => {
    const { btnInfo } = this.props
    const { getFieldDecorator, setFieldsValue } = this.props.form
    const { messageName, messageStatus, rollbackResumeType, rollbackWay, btnType } = btnInfo
    const { remoteRollBackTaches } = this.state
    return (
      <Form className="double-line" layout="vertical">
        {rollbackWay === 1 && btnType === 'remote_roll_back' && (
          <FormItem label="回退环节">
            {getFieldDecorator('rollbackActivityId', {
              rules: [
                {
                  required: true,
                  message: `${i18n('ticket.create.select', '请选择')}回退环节}`
                }
              ]
            })(
              <Select>
                {_.map(remoteRollBackTaches, (tache) => (
                  <Option key={tache.tacheId}>{tache.tacheName}</Option>
                ))}
              </Select>
            )}
          </FormItem>
        )}
        {rollbackResumeType === 2 && (
          <FormItem label={i18n('quickly.rollback.option.label5', '回退之后提交的方式')}>
            {getFieldDecorator('rollbackResumeType', {
              initialValue: 0
            })(
              <RadioGroup>
                <Radio style={{ display: 'block', lineHeight: '30px' }} value={0}>
                  {i18n('quickly.rollback.option.label3', '回退之后提交按照正常流转顺序')}
                </Radio>
                <Radio style={{ display: 'block', lineHeight: '30px' }} value={1}>
                  {i18n('quickly.rollback.option.label4', '回退之后直接提交到回退的环节')}
                </Radio>
              </RadioGroup>
            )}
          </FormItem>
        )}
        {messageStatus === 2 ? null : (
          <FormItem label={messageName || i18n('ticket.detail.opinion', '意见')}>
            {getFieldDecorator('message', {
              initialValue: undefined,
              rules: [
                {
                  min: 0,
                  max: 2000,
                  message: i18n('ticket.most_200', '最多2000字')
                },
                {
                  required:
                    +messageStatus === 1 ||
                    btnInfo.name === '确认不通过' ||
                    btnInfo.name === '撤回',
                  message: i18n('please-input', '请输入')
                }
              ],
              getValueFromEvent: function (data) {
                return data
              }
            })(
              <Editor
                setFieldsValue={setFieldsValue}
                val={this.state.value}
                handleChange={this.handleChange}
                btnInfo={btnInfo}
              />
            )}
          </FormItem>
        )}
      </Form>
    )
  }

  render() {
    return this.props.visible && this._render()
  }
}

export default Form.create()(Rollback)
