import React, { Component } from 'react'
import { Form, Select, Input } from '@uyun/components'
import UserPicker from '~/components/userPicker'

const FormItem = Form.Item
const Option = Select.Option
class Endorsement extends Component {
  state = {
    stageList: []
  }

  componentDidMount() {
    const { formList } = this.props
    axios.get(API.getCanAddSignNodes(formList.ticketId)).then((data) => {
      this.setState({
        stageList: data
      })
      const currentStage = _.find(data, (item) => item.activityId === formList.tacheId) || {}
      this.props.form.setFieldsValue &&
        this.props.form.setFieldsValue({ sourceActivityId: currentStage.activityId })
    })
  }

  handleUserPickerChange = (userAndGroups) => {
    this.props.form.setFieldsValue({ userAndGroups })
  }

  onChangeStageName = () => {
    this.props.form.setFieldsValue({ sourceFlowId: undefined })
  }

  _render = () => {
    const { formList, btnInfo } = this.props
    const { messageName, messageStatus } = btnInfo || {}
    const { stageList } = this.state
    const { getFieldDecorator, getFieldValue } = this.props.form
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 15 }
    }
    const outFlowList = (
      _.find(stageList, (stage) => stage.activityId === getFieldValue('sourceActivityId')) || {}
    ).outFlows
    return (
      <Form>
        <FormItem label={i18n('config.process.stageName', '阶段名称')} {...formItemLayout}>
          {getFieldDecorator('sourceActivityId', {
            rules: [
              {
                required: true,
                message: `${i18n('globe.select', '请选择')}${i18n(
                  'config.process.stageName',
                  '阶段名称'
                )}`
              }
            ],
            onChange: this.onChangeStageName
          })(
            // 非管理员且非模型管理员 只能选当前阶段
            <Select disabled={Boolean(!formList.isAppManager && !formList.isModelManager)}>
              {_.map(stageList, (item) => (
                <Option key={item.activityId}>{item.activityName}</Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem label={i18n('config.process.outline', '出线')} {...formItemLayout}>
          {getFieldDecorator('sourceFlowId', {
            rules: [
              {
                required: true,
                message: `${i18n('globe.select', '请选择')}${i18n(
                  'config.process.outline',
                  '出线'
                )}`
              }
            ]
          })(
            <Select>
              {_.map(outFlowList, (item) => (
                <Option key={item.flowId}>{item.flowName}</Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem label={i18n('node_name', '节点名称')} {...formItemLayout}>
          {getFieldDecorator('newNodeName', {
            rules: [
              {
                required: true,
                whitespace: true,
                message: i18n('ticket.forms.pinputName', '请输入名称')
              },
              {
                max: 50,
                message: i18n('ticket.forms.NodeNameLength', '节点名称最长50个字符')
              },
              {
                pattern: /^((?!&|;|$|%|>|<|`|"|\\|!|\|).)*$/,
                message: i18n('ticket.true.name', '名称不能含有特殊字符')
              }
            ]
          })(<Input />)}
        </FormItem>
        <FormItem label={i18n('config.handle_user', '处理人员')} {...formItemLayout}>
          {getFieldDecorator('userAndGroups', {
            rules: [
              {
                required: true,
                message: `${i18n('globe.select', '请选择')}${i18n(
                  'config.handle_user',
                  '处理人员'
                )}`
              }
            ]
          })(
            <UserPicker
              tabs={[0, 1]}
              showTypes={['groups', 'users']}
              onChange={this.handleUserPickerChange}
              // mode={'approve'}
            />
          )}
        </FormItem>
        {messageStatus === 2 ? null : (
          <FormItem
            label={messageName || i18n('ticket.record.advice', '处理意见')}
            {...formItemLayout}
          >
            {getFieldDecorator('message', {
              rules: [
                {
                  min: 0,
                  max: 2000,
                  message: i18n('ticket.most_200', '最多2000字')
                },
                {
                  required: +messageStatus === 1,
                  message: i18n('please-input', '请输入')
                }
              ]
            })(<Input.TextArea autosize={{ minRows: 4, maxRows: 4 }} />)}
          </FormItem>
        )}
      </Form>
    )
  }

  render() {
    return this.props.visible && this._render()
  }
}

export default Form.create()(Endorsement)
