import React, { Component } from 'react'
import TriggerIncident from './triggerIncident'
import TriggerAction from './triggerAction'
import * as mobx from 'mobx'
import { observer } from 'mobx-react'
import TriggerRules from '~/components/triggerRules'
import '../style/panelContent.less'

@observer
class PanelContent extends Component {
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
      const { panelIndex, triggerData, store } = this.props
      const { titleParams, fullParams, builtinParams, defineParams, ticketParams, actionTypes, departList, fieldUsers, variableUsers } = mobx.toJS(store)
      const fieldsData = {
        titleParams,
        fullParams,
        builtinParams,
        defineParams,
        ticketParams
      }
      return (
        <div className="panel-content" style={{ paddingRight: 30 }}>
          <p className="require">{i18n('trigger_event', '触发事件')}</p>
          <TriggerIncident incident={triggerData.incident} taskEndIncident={triggerData.taskEndIncident} onChange={this.handleIncidentChange} />
          <p>{i18n('trigger_condition', '触发条件')}</p>
          <TriggerRules
            value={triggerData.triggerConditions}
            onChange={this.handleContitionChange}
            excludeCodes={['activity', 'status', 'modelId']}
          />
          <p className="require">{i18n('action', '动作')}</p>
          <TriggerAction
            store={store}
            panelIndex={panelIndex}
            triggers={triggerData.params}
            setTriggerData={this.setTriggerData}
            fieldsData={fieldsData}
            actionTypes={actionTypes}
            departList={departList}
            fieldUsers={fieldUsers}
            variableUsers={variableUsers}
          />
        </div>)
    }
}

export default PanelContent
