import React, { Component } from 'react'
import { store as runtimeStore } from '@uyun/runtime-react'
import { Form, Select } from '@uyun/components'
import Editor from '../../mention/MentionWithOption'
import UserWrap from './userWrap'
const FormItem = Form.Item
const Option = Select.Option

class Reassign extends Component {
  state = {
    value: '',
    tache: {},
    tasks: [] // 改派任务
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.visible !== nextProps.visible) {
      this.setState({ value: '' })
    }
  }

  componentDidMount() {
    this.setState({
      tache: this.props.modelRule
    })

    // 弹窗关闭时会销毁此组件，所以放在DidMount中请求数据
    const { formList } = this.props
    const { ticketId, caseId, tacheId, modelId } = formList
    const params = { ticketId, caseId, activityId: tacheId, modelId }

    axios.get(API.getTicketTaskList, { params }).then((res) => {
      if (res && res.length > 0) {
        this.setState({ tasks: res })
      }
    })
  }

  handleChange = (val) => {
    this.setState({
      value: val
    })
    this.props.form.setFieldsValue({ message: val })
  }

  _render = () => {
    const formItemLayout = {
      labelCol: { span: 0 },
      wrapperCol: { span: 24 }
    }
    const { tasks } = this.state
    const { getFieldDecorator, setFieldsValue } = this.props.form
    const { formList, btnInfo } = this.props
    const { modalTitle, messageStatus, messageName } = btnInfo || {}
    const { isCountersign, isMultiCountersign, allGroupInfos } = formList
    const list = tasks.map((item) => ({ id: item.handleId, name: item.handleName }))

    // 判断 指定的人
    let filterUser = []
    if (this.state.tache.tacheType === 1) {
      // 如果是 并行组 下的会签 改派
      !_.isEmpty(this.state.tache.parallelismTaches) &&
        this.state.tache.parallelismTaches.map((item) => {
          if (item.tacheId === this.props.tacheId) {
            filterUser = item
          }
        })
    } else {
      // 正常 流程 改派
      filterUser = this.state.tache
    }
    return (
      <Form className="double-line" layout="vertical">
        {isCountersign === 1 && (
          <FormItem label="选择改派任务">
            {getFieldDecorator('counterSignTaskUserId', {
              initialValue: undefined,
              rules: [
                {
                  required: true,
                  message: '请选择改派任务'
                }
              ]
            })(
              <Select
                showSearch
                allowClear
                optionFilterProp="children"
                placeholder={i18n('globe.select', '请选择')}
                notFoundContent={i18n('globe.notFound', '无法找到')}
              >
                {_.map(list, (item) => (
                  <Option key={item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            )}
          </FormItem>
        )}
        <UserWrap
          item={{
            code: 'currexcutor',
            type: 'reassign',
            name: modalTitle || i18n('ticket.operate.same_group', '改派'),
            isRequired: 1,
            users: filterUser,
            showName: true
          }}
          modelId={this.props.modelId}
          ticketId={this.props.id}
          tacheId={this.props.tacheId}
          handleType="reassign"
          modelType={this.props.modelType}
          orgId={this.props.orgId || null} // 开启组织机构时  传 所属部门的id
          formItemLayout={formItemLayout}
          getFieldDecorator={getFieldDecorator}
          setFieldsValue={setFieldsValue}
          setFlowUser={this.props.setFlowUser}
          caseId={this.props.caseId}
          isMultiCountersign={isMultiCountersign === 1 && !_.isEmpty(allGroupInfos)}
          formList={this.state.formValue}
          reassign={runtimeStore.getState().user?.root ? 1 : 0}
          opt={1}
        />
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
                  required: +messageStatus === 1,
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

export default Form.create()(Reassign)
