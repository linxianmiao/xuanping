import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Form, Select, Row } from '@uyun/components'
import Field from './Field'
import Executors from '../Executors'

const Option = Select.Option
const FormItem = Form.Item
const formShortItemLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 12 }
}

@inject('triggerStore')
@Form.create()
@observer
class TicketForm extends Component {
  static defaultProps = {
    value: {
      modelId: undefined,
      flowId: undefined,
      form: {}
    }
  }

  state = {
    formInfo: {}, // 当前模型表单信息
    flows: [] // 子流程迁出路径
  }

  componentDidMount() {
    const { value } = this.props

    if (value.modelId) {
      this.queryForm(value.modelId)
      this.queryFlows(value.modelId)
    }
  }

  handleModelChange = (modelId) => {
    const { setFieldsValue } = this.props.form
    if (modelId) {
      this.queryForm(modelId)
      this.queryFlows(modelId)
    } else {
      this.setState({ formInfo: {} })
    }
    setFieldsValue({ flowId: undefined })
  }

  queryForm = async (modelId) => {
    const res = (await axios.get(API.intoCreateTicket(modelId))) || {}
    // 去掉接口的fields，循环formLayoutVos获取全部数据
    let fields = []
    _.forEach(res.formLayoutVos, (d) => {
      if (d.type === 'group') {
        fields = [...d.fieldList, ...fields]
      } else {
        _.forEach(d.tabs, (tab) => {
          fields = [...fields, ...tab.fieldList]
        })
      }
    })
    res.fields = fields

    this.setState({ formInfo: res })
  }

  queryFlows = async (modelId) => {
    // 没有chartId就传空字符串
    const res = (await axios.get(API.get_model_start_flow(modelId, ''))) || {}
    const flows = Object.keys(res).reduce((result, key) => result.concat(res[key]), [])

    this.setState({ flows })
  }

  render() {
    const { value } = this.props
    const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form
    const { models } = this.props.triggerStore
    const { formInfo, flows } = this.state

    const { modelId, flowId, form, executorAndGroup } = value
    const { mode, fields } = formInfo

    const currentModelId = getFieldValue('modelId') || modelId
    const currentFlowId = getFieldValue('flowId') || flowId

    return (
      <Form>
        <FormItem {...formShortItemLayout} label="选择模型" required>
          {getFieldDecorator('modelId', {
            initialValue: modelId,
            rules: [
              {
                required: true,
                message: '请选择模型'
              }
            ],
            onChange: this.handleModelChange
          })(
            <Select
              placeholder="请选择模型"
              showSearch
              allowClear
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {models.map((item) => (
                <Option key={item.processId}>{item.processName}</Option>
              ))}
            </Select>
          )}
        </FormItem>
        {mode === 1 && (
          <FormItem {...formShortItemLayout} label="迁出路径" required>
            {getFieldDecorator('flowId', {
              initialValue: flowId,
              rules: [
                {
                  required: true,
                  message: '请选择迁出路径',
                  whitespace: true
                }
              ]
            })(
              <Select placeholder="请选择迁出路径">
                {flows.map((item) => (
                  <Option key={item.id}>{item.name}</Option>
                ))}
              </Select>
            )}
          </FormItem>
        )}
        {!!fields &&
          fields.length > 0 &&
          fields.map((field, index) => {
            return (
              <Row>
                <Field
                  getFieldValue={getFieldValue}
                  field={field}
                  index={index}
                  value={form[field.code]}
                  getFieldDecorator={getFieldDecorator}
                />
              </Row>
            )
          })}

        {getFieldValue('modelId') && (
          <Executors
            modelId={currentModelId}
            flowId={currentFlowId}
            getFieldDecorator={getFieldDecorator}
            value={executorAndGroup}
          />
        )}
      </Form>
    )
  }
}

export default TicketForm
