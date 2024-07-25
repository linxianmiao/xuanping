import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { withRouter } from 'react-router-dom'
import { Input, DatePicker, Form, Button, Radio } from '@uyun/components'
import moment from 'moment'
import PageHeader from '~/components/pageHeader'
import UserPicker from '~/components/userPicker'
import Models from './components/Model'
import Notify from './components/Notify'

const { TextArea } = Input
const { RangePicker } = DatePicker
const RadioGroup = Radio.Group

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 15 }
}

// 今天之前不能选择
const disabledDate = (current) => current && current < moment().add(-1, 'days').startOf('day')

@withRouter
@inject('entrustStore')
@observer
class AddEntrust extends Component {
  ifAudited = false

  state = {
    loading: false
  }

  componentDidMount() {
    this.props.entrustStore.getBaseActions()
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields(async (err, values) => {
      if (err) return false

      let { modelIds, time, consignee, entrustReason, auditor, ifAudited, notifyType, allModel } =
        values
      modelIds = _.map(modelIds, (item) => {
        if (item.type === 'model') {
          return { source: 'web', modelId: item.processId }
        }
        if (item.type === 'srvcat') {
          const ticket = JSON.parse(item.content) || {}
          return { source: 'srvcat', modelId: ticket.ticket }
        }
      })
      const data = {
        modelIds,
        consignee: _.map(consignee, (item) => item.id),
        entrustReason,
        auditor: _.get(auditor, '[0].id'),
        allModel,
        ifAudited,
        notifyType,
        beginTime: time[0].format('YYYY-MM-DD HH:mm:ss'),
        endTime: time[1].format('YYYY-MM-DD HH:mm:ss')
      }
      this.setState({ loading: true })
      const res = await this.props.entrustStore.addEntrust(data)
      this.setState({ loading: false })
      if (_.isArray(res)) {
        this.props.history.replace('/conf/entrust')
      }
    })
  }

  consigneeValidator = (rule, value, callback) => {
    if (_.isEmpty(value)) {
      callback('请选择被委托人')
    } else if (value.length > 10) {
      callback('被委托人不能超过10个')
    } else {
      callback()
    }
  }

  render() {
    const { actionList } = this.props.entrustStore
    const { getFieldDecorator, getFieldValue } = this.props.form
    const { loading } = this.state

    // sendSys类型的通知方式默认选中
    const initNotifyType = actionList.filter((item) => item.type === 'sendSys')

    return (
      <React.Fragment>
        <PageHeader
          customizeBreadcrumb={[{ name: '委托管理', path: '/conf/entrust' }, { name: '新增委托' }]}
        />
        <Form onSubmit={this.handleSubmit} className="add-form">
          <Form.Item {...formItemLayout} label="流程模型">
            {getFieldDecorator('allModel', {
              initialValue: 1,
              rules: [{ required: true, message: '请选择流程模型' }]
            })(
              <RadioGroup>
                <Radio value={1}>全部模型</Radio>
                <Radio value={0}>指定模型</Radio>
              </RadioGroup>
            )}
          </Form.Item>
          {!getFieldValue('allModel') && (
            <Form.Item {...formItemLayout} label="指定模型">
              {getFieldDecorator('modelIds', {
                initialValue: undefined,
                rules: [{ required: true, message: '请选择流程模型' }]
              })(<Models />)}
            </Form.Item>
          )}

          <Form.Item {...formItemLayout} label="被委托人">
            {getFieldDecorator('consignee', {
              initialValue: undefined,
              rules: [
                {
                  required: true,
                  validator: this.consigneeValidator
                }
              ]
            })(<UserPicker tabs={[1]} showTypes={['users']} placeholder="请选择被委托人" />)}
          </Form.Item>
          <Form.Item {...formItemLayout} label="通知方式">
            {getFieldDecorator('notifyType', {
              initialValue: initNotifyType
            })(<Notify />)}
          </Form.Item>
          <Form.Item {...formItemLayout} label="委托时间">
            {getFieldDecorator('time', {
              initialValue: undefined,
              rules: [{ required: true, message: '请选择委托时间' }]
            })(
              <RangePicker
                disabledDate={disabledDate}
                showTime={{
                  defaultValue: [moment().add(5, 'minutes'), moment().endOf('day')]
                }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder={['委托开始时间', '委托结束时间']}
                style={{ width: '450px' }}
              />
            )}
          </Form.Item>
          <Form.Item {...formItemLayout} label="委托理由">
            {getFieldDecorator('entrustReason', {
              initialValue: undefined,
              rules: [{ max: 500, message: '最多500个字符' }]
            })(<TextArea rows={4} />)}
          </Form.Item>
          <Form.Item {...formItemLayout} label="审批委托">
            {getFieldDecorator('ifAudited', {
              initialValue: false,
              rules: [{ required: true }],
              normalize: (value, prevValue, allValues) => {
                this.ifAudited = value
                if (value && value !== prevValue) {
                  this.auditor = _.get(allValues, 'consignee[0]')
                    ? [_.get(allValues, 'consignee[0]')]
                    : undefined
                }
                return value
              }
            })(
              <RadioGroup>
                <Radio value>是</Radio>
                <Radio value={false}>否</Radio>
              </RadioGroup>
            )}
          </Form.Item>
          {this.ifAudited && (
            <Form.Item {...formItemLayout} label="选择审批人">
              {getFieldDecorator('auditor', {
                initialValue: this.auditor || undefined,
                rules: [{ required: true, message: '请选择审批人' }]
              })(
                <UserPicker
                  tabs={[1]}
                  showTypes={['users']}
                  selectionType="radio"
                  placeholder="请选择审批人"
                />
              )}
            </Form.Item>
          )}
          <Form.Item {...formItemLayout} label="委托说明">
            <div style={{ marginTop: 7 }}>
              <p>
                1、委托生效前已生成的工单，不进行委托，建议委托人离岗前将处理中的工单解决或改派他人。
              </p>
              <p>
                2、委托生效期内生成的工单，默认在“委托待办”列表中显示；代理人首次打开工单后，工单会转移至被委托人“待办”列表。
              </p>
              <p>
                3、委托生效期内生成的工单，如未被打开过，则在委托生效期后，自动转移至委托人“待办”列表。
              </p>
            </div>
          </Form.Item>

          <Form.Item className="btn-box" wrapperCol={{ offset: 3 }}>
            <Button type="primary" htmlType="submit" loading={loading}>
              提交
            </Button>
          </Form.Item>
        </Form>
      </React.Fragment>
    )
  }
}

export default Form.create()(AddEntrust)
