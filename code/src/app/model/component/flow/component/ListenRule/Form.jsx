import React from 'react'
import { Input, Form, Radio, TreeSelect } from '@uyun/components'
import { toJS } from 'mobx'
import IncidentType from '~/trigger/config/incidentType'
import TriggerIncident from '~/trigger/component/triggerIncident'
import TriggerRules from '~/components/triggerRules'
import IndexStore from '~/trigger/store/indexStore'
import CodeEditor from '~/trigger/component/codeEditor'

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 21 }
}

const FormItem = Form.Item

const RadioGroup = Radio.Group
const TreeNode = TreeSelect.TreeNode

const indexStore = new IndexStore()

@Form.create()
class ListenRuleForm extends React.Component {
  componentDidMount() {
    indexStore.getActionTypes()
    indexStore.getFieldParams()
    indexStore.getAssignUsers(this.context.modelId)
  }

  handleContitionChange = (value) => {
    this.props.setTriggerData(value, 'triggerConditions')
  }

  handleActionChange = (value) => {
    const { setIncidentError } = this.props
    if (_.isEmpty(value)) {
      setIncidentError(true)
    } else {
      setIncidentError(false)
    }
    this.props.setTriggerData(value, 'incident')
  }

  handleNameChange = (e) => {
    const { setNameError } = this.props
    if (!e.target.value) {
      setNameError(true)
    } else {
      setNameError(false)
    }
    this.props.setTriggerData(e.target.value, 'name')
  }

  handleScriptChange = (i, i2, val) => {
    this.props.setTriggerData(val, 'params')
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { modelId, isNameError, triggerData, isIncidentError } = this.props
    const titleParams = toJS(indexStore.titleParams)
    const fullParams = toJS(indexStore.fullParams)
    const builtinParams = toJS(indexStore.builtinParams)
    const defineParams = toJS(indexStore.defineParams)
    const ticketParams = toJS(indexStore.ticketParams)
    const actionTypes = toJS(indexStore.actionTypes)
    const departList = toJS(indexStore.departList)
    const fieldUsers = toJS(indexStore.fieldUsers)
    const variableUsers = toJS(indexStore.variableUsers)
    const scriptValue =
      Array.isArray(triggerData.params) && triggerData.params.length > 0
        ? triggerData.params[0].executeParamPos[0].value
        : ''
    const diliver = {
      modelId,
      titleParams,
      builtinParams,
      defineParams,
      fullParams,
      ticketParams,
      value: scriptValue,
      store: indexStore
    }
    return (
      <Form id="listen-form-wrap">
        <FormItem
          {...formItemLayout}
          label="策略名称"
          required
          validateStatus={isNameError ? 'error' : 'success'}
          help={isNameError ? '输入策略名称' : ''}
        >
          <Input
            value={triggerData.name}
            placeholder="请输入策略名称"
            style={{ width: 300 }}
            onChange={(e) => this.handleNameChange(e)}
          />
        </FormItem>
        {/* <FormItem
          {...formItemLayout}
          label="触发事件"
          required
          validateStatus={isIncidentError ? 'error' : 'success'}
          help={isIncidentError ? '请选择触发事件' : ''}
        >
          <TreeSelect
            showSearch
            style={{ width: 300 }}
            value={triggerData.incident}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            getPopupContainer={() => document.getElementById('listen-form-wrap')}
            placeholder={`${i18n('globe.select', '请选择')}${i18n('trigger.incident', '触发事件')}`}
            allowClear
            multiple
            treeDefaultExpandAll
            onChange={this.handleActionChange}
          >
            {_.map(IncidentType.triggerType, (item) => {
              return (
                <TreeNode
                  value={item.code}
                  title={item.name}
                  key={item.code}
                  disabled={item.code === 'end'}
                >
                  {item.code === 'end' &&
                    _.map(IncidentType.triggerClass, (ite) => {
                      return (
                        <TreeNode
                          value={ite.code}
                          title={`${item.name}/${ite.name}`}
                          key={ite.code}
                          type="class"
                        />
                      )
                    })}
                </TreeNode>
              )
            })}
          </TreeSelect>
        </FormItem> */}
        <FormItem {...formItemLayout} label="触发条件">
          <TriggerRules
            onChange={this.handleContitionChange}
            value={triggerData.triggerConditions}
          />
        </FormItem>
        <FormItem {...formItemLayout} label="脚本动作" required>
          <CodeEditor {...diliver} setTriggerData={this.handleScriptChange} />
        </FormItem>
      </Form>
    )
  }
}

export default ListenRuleForm
