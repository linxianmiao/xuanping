import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TriggerIncident from '../../../../trigger/component/triggerIncident'
import TriggerAction from '../../../../trigger/component/triggerAction'
import * as mobx from 'mobx'
import { observer } from 'mobx-react'
import TriggerRules from '~/components/triggerRules'
import Input from '~/public/input'
import '../../../../trigger/style/panelContent.less'
import IndexStore from '../../../../trigger/store/indexStore'
import { Form, message } from '@uyun/components'
const indexStore = new IndexStore()
@observer
class PanelContent extends Component {
  static contextTypes = {
    modelId: PropTypes.string
  }

    static defaultProps = {
      store: indexStore
    }

    handleCheckSingleRowText = (item, rule, value, callback) => {
      const { nameList, errMes } = this.props
      const reg = new RegExp('[|;&$%><`\\!]')
      if (!value) {
        callback(`${i18n('ticket.forms.pinput', '请输入')}${item.name}`)
      }
      if (value && reg.test(value)) {
        callback(i18n('conf.model.cannot.teshuchar', '名称不能包含特殊字符'))
      }
      if (!_.isEmpty(nameList) && nameList.includes(value)) {
        callback(errMes)
      }
      if (value && rule.max && value.length > rule.max) {
        callback(`${i18n('ticket.forms.beyond', '不能高于')}${rule.max}${i18n('ticket.forms.character', '字符')}`)
      } else if (value && rule.min && value.length < rule.min) {
        callback(`${i18n('ticket.forms.below', '不能低于')}${rule.min}${i18n('ticket.forms.character', '字符')}`)
      } else {
        callback()
      }
    }

    componentDidMount() {
      this.props.store.getActionTypes()
      this.props.store.getFieldParams()
      this.props.store.getAssignUsers(this.context.modelId)
    }

    handleOk = (callback) => {
      this.panelContent.validateFieldsAndScroll((errors, values) => {
        if (errors) {
          callback(errors, values)
        } else {
          const { triggerData } = this.props
          let tmp = _.isEmpty(triggerData) || _.isEmpty(triggerData.params)

          _.forEach(triggerData.params, param => {
            if (_.isEmpty(param.executeParamPos)) {
              tmp = true
              return
            }
            _.map(param.executeParamPos, executeParamPo => {
              // type为6，7的时候不必填（6."第三方类的全路径名"，7."第三方jar包"）
              if (![6, 7].includes(executeParamPo.type)) {
                if (_.isEmpty(executeParamPo.value) || (param.type === 'configTicket' && !executeParamPo.code)) {
                  tmp = true
                }
              }
            })
          })
        }
      })
    }

    setTriggerData = (triggerIndex, value) => {
      const { triggerData } = this.props
      triggerData.params = value
      this.props.setTriggerData(this.props.panelIndex, value, 'params')
    }

    handleContitionChange = value => {
      this.props.setTriggerData(this.props.panelIndex, value, 'triggerConditions')
    }

    handleIncidentChange = value => {
      this.props.setTriggerData(this.props.panelIndex, value, 'double')
    }

    render () {
      const { modelId, panelIndex, triggerData, store } = this.props
      const titleParams = mobx.toJS(store.titleParams)
      const fullParams = mobx.toJS(store.fullParams)
      const builtinParams = mobx.toJS(store.builtinParams)
      const defineParams = mobx.toJS(store.defineParams)
      const ticketParams = mobx.toJS(store.ticketParams)
      const actionTypes = mobx.toJS(store.actionTypes)
      const departList = mobx.toJS(store.departList)
      const fieldUsers = mobx.toJS(store.fieldUsers)
      const variableUsers = mobx.toJS(store.variableUsers)
      const fieldsData = {
        titleParams,
        fullParams,
        builtinParams,
        defineParams,
        ticketParams
      }
      const { getFieldDecorator } = this.props.form
      const dilver = {
        formItemLayout: { labelCol: { span: 24 }, wrapperCol: { span: 12 } },
        item: {
          required: 1,
          code: 'name',
          minLength: 4,
          maxLength: 20,
          name: i18n('trigger_name', '策略名称')
        },
        defaultValue: triggerData.name,
        getFieldDecorator: getFieldDecorator
      }
      return (
        <div>
          {
            document.getElementById('notification-wrap') // 为了渲染好父组件再渲染子组件
              ? <div className="panel-content" style={{ paddingRight: 30 }}>
                <Input {...dilver} style={{ wdith: '224px' }} />
                <p className="require">{i18n('trigger_event', '触发事件')}</p>
                <TriggerIncident incident={triggerData.incident} taskEndIncident={triggerData.taskEndIncident} onChange={this.handleIncidentChange} />
                <p>{i18n('trigger_condition', '触发条件')}</p>
                <TriggerRules
                  value={triggerData.triggerConditions}
                  onChange={this.handleContitionChange}
                  modelId={this.context.modelId}
                  excludeCodes={['activity', 'status', 'modelId']}
                />
                <p className="require">{i18n('action', '动作')}</p>
                <TriggerAction
                  store={store}
                  modelId={modelId}
                  panelIndex={panelIndex}
                  triggers={triggerData.params}
                  incidents={triggerData.incident || []}
                  setTriggerData={this.setTriggerData}
                  fieldsData={fieldsData}
                  actionTypes={actionTypes}
                  departList={departList}
                  fieldUsers={fieldUsers}
                  variableUsers={variableUsers}
                />
              </div> : null
          }
        </div>
      )
    }
}

export default Form.create()(PanelContent)
