import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import { QuestionCircleOutlined } from '@uyun/icons'
import { Form, Input, InputNumber, Radio, message, Select, Button } from '@uyun/components'
import { i18n } from '@uyun/utils'
import FieldModal from './FieldModal'

const FormItem = Form.Item

@inject('formSetGridStore')
@observer
class RelateSubProcessSide extends Component {
  state = {
    subProcessList: [],
    visible: false,
    taskModelId: ''
  }

  async componentDidMount() {
    const { modelId } = this.props
    const params = {
      pageNum: 1,
      pageSize: 100,
      using: 1,
      type: 3,
      modelId: modelId
    }
    if (!modelId) return false
    const res = await axios.get(API.getProcessChartList, { params })
    this.setState({ subProcessList: res.list || [] })
  }

  handleCheckNum = (rules, value, callback) => {
    const { min, max } = rules
    if (value < min) {
      callback(`${i18n('ticket.forms.low', '不能低于')}100px`)
    } else if (value > max) {
      callback(`${i18n('ticket.forms.beyond', '不能超出')}1000px`)
    } else {
      callback()
    }
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form
    const iconStyle = {
      marginLeft: 5,
      cursor: 'pointer'
    }
    const { sideData, isInLayout } = this.props
    const {
      name,
      prefixProcessTask,
      styleAttribute,
      fold,
      height,
      taskModelIds,
      commonColumnList,
      isRequired,
      type
    } = sideData
    const { subProcessList, visible, taskModelId } = this.state
    const taskModelIdObj = toJS(taskModelIds) ? toJS(taskModelIds)[0] : {}
    const formatTaskModelId = {
      label: taskModelIdObj.modelName,
      key: taskModelIdObj.modelId,
      value: taskModelIdObj.modelId
    }

    return (
      <>
        <Form layout="vertical">
          {!isInLayout && (
            <>
              <FormItem label={i18n('ticket.relateTicket.title', '标题')}>
                {getFieldDecorator('name', {
                  initialValue: name || '关联任务流程',
                  rules: [
                    {
                      required: true,
                      message: `${i18n('ticket.forms.pinput', '请输入')}${i18n(
                        'ticket.relateTicket.title',
                        '标题'
                      )}`
                    }
                  ]
                })(
                  <Input
                    maxLength="32"
                    placeholder={`${i18n('ticket.forms.pinput', '请输入')}${i18n(
                      'ticket.relateTicket.title',
                      '标题'
                    )}`}
                  />
                )}
              </FormItem>
              {/* <FormItem label={i18n('ticket.control.style', '控件样式')}>
                {getFieldDecorator('styleAttribute', {
                  initialValue: styleAttribute === undefined ? 1 : styleAttribute
                })(
                  <Radio.Group>
                    <Radio.Button value={0}>
                      {i18n('ticket.control.noborder', '无边框')}
                    </Radio.Button>
                    <Radio.Button value={1}>
                      {i18n('ticket.control.hasborder', '有边框')}
                    </Radio.Button>
                  </Radio.Group>
                )}
              </FormItem> */}
              <FormItem label={i18n('default.state', '默认状态')}>
                {getFieldDecorator('fold', {
                  initialValue: fold === undefined ? 0 : fold
                })(
                  <Radio.Group>
                    <Radio.Button value={0}>{i18n('expand', '展开')}</Radio.Button>
                    <Radio.Button value={1}>{i18n('collapsed', '收起')}</Radio.Button>
                  </Radio.Group>
                )}
              </FormItem>
            </>
          )}
          {isInLayout && (
            <>
              <FormItem label={i18n('field_header_type', '字段名称')}>
                {getFieldDecorator('name', {})(<span>{name}</span>)}
              </FormItem>
              <FormItem label={i18n('field_header_type', '字段类型')}>
                {getFieldDecorator('typeDesc', {})(<span>{type}</span>)}
              </FormItem>
            </>
          )}
          <FormItem label={i18n('conf.model.basic.check', '基础校验')}>
            {getFieldDecorator('isRequired', {
              initialValue: isRequired === undefined ? 0 : isRequired
            })(
              <Radio.Group>
                <Radio.Button value={0}>{i18n('conf.model.field.optional', '选填')}</Radio.Button>
                <Radio.Button value={1}>{i18n('conf.model.field.required', '必填')}</Radio.Button>
                <Radio.Button value={2}>{i18n('conf.model.field.read-only', '只读')}</Radio.Button>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem label={i18n('model.controler.height', '控件高度')}>
            {getFieldDecorator('heightType', {
              initialValue: height === undefined ? 0 : Number(height) === 0 ? 0 : 1
            })(
              <Radio.Group>
                <Radio.Button value={0}>{i18n('self-adaption', '自适应')}</Radio.Button>
                <Radio.Button value={1}>{i18n('model.ticket.max.height', '设置上限')}</Radio.Button>
              </Radio.Group>
            )}
          </FormItem>
          {Number(height) !== 0 && (
            <FormItem label={i18n('model.ticket.max.height', '设置上限')}>
              {getFieldDecorator('height', {
                initialValue: height || 500
              })(
                <InputNumber
                  maxLength="32"
                  placeholder={`${i18n('ticket.forms.pinput', '请输入')}`}
                />
              )}
              {'  '}
              <span>px</span>
            </FormItem>
          )}

          {/* <FormItem label={i18n('semantics.name', '语义命名')}>
          {getFieldDecorator('prefixProcessTask', {
            initialValue: prefixProcessTask || ''
          })(
            <Input
              maxLength="32"
              placeholder={`${i18n('ticket.forms.pinput', '请输入')}${i18n(
                'semantics.name',
                '语义命名'
              )}`}
            />
          )}
        </FormItem> */}
          <FormItem label="关联任务流程">
            {getFieldDecorator('taskModelIds', {
              initialValue: formatTaskModelId,
              rules: [
                {
                  required: true,
                  message: `${i18n('ticket.forms.pinput', '请输入')}${i18n(
                    'ticket.relateTicket.title',
                    '标题'
                  )}`
                }
              ]
            })(
              <Select placeholder="请选择关联子流程" labelInValue>
                {_.map(subProcessList, (d) => (
                  <Select.Option key={d.taskModelId} value={d.taskModelId}>
                    {d.name}
                  </Select.Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem>
            <Button
              onClick={() => {
                if (getFieldValue('taskModelIds')) {
                  this.setState({ visible: true, taskModelId: getFieldValue('taskModelIds').value })
                } else {
                  message.error('请选择需要关联的任务流程')
                }
              }}
            >
              自定义列
            </Button>
          </FormItem>
        </Form>
        <FieldModal
          visible={visible}
          taskModelId={taskModelId}
          onCancel={() => this.setState({ visible: false })}
          onChange={this.props.handleChange}
          commonColumnList={commonColumnList}
        />
      </>
    )
  }
}

export default Form.create({
  onValuesChange: (props, changedValues, allValues) => {
    if (_.has(changedValues, 'taskModelIds')) {
      const obj = _.clone(changedValues.taskModelIds)
      changedValues.taskModelIds = [
        {
          modelId: obj.value,
          modelName: obj.label
        }
      ]
    }
    if (_.has(changedValues, 'heightType')) {
      changedValues.height =
        Number(changedValues.heightType) === 0
          ? 0
          : changedValues.height
          ? changedValues.height
          : 500
    }
    props.handleChange(changedValues)
  }
})(RelateSubProcessSide)
