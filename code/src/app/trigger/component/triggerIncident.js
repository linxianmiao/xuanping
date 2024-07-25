import React, { Component } from 'react'
import IncidentType from '../config/incidentType'
import { Select, TreeSelect } from '@uyun/components'
const TreeNode = TreeSelect.TreeNode
class TriggerIncident extends Component {
  constructor (props) {
    super(props)
    this.state = {
      typeValue: props.incident || [],
      classValue: props.taskEndIncident || []
    }
  }

  onChange = value => {
    const triggerClass = IncidentType.triggerClass.map(trigger => trigger.code)
    const triggerType = IncidentType.triggerType.map(trigger => trigger.code)
    const classValue = triggerClass.filter(code => value.indexOf(code) > -1)
    const typeValue = triggerType.filter(code => {
      return _.isEmpty(classValue) ? value.indexOf(code) > -1 && code !== 'end' : value.indexOf(code) > -1 || code === 'end'
    })
    this.setState({
      typeValue, classValue
    })
    this.props.onChange && this.props.onChange({ typeValue, classValue })
  }

  render () {
    const { triggerNode } = this.props
    const { typeValue = [], classValue = [] } = this.state
    let popupContainer = document.getElementById('notification-wrap')
    if (triggerNode) {
      popupContainer = document.getElementById(triggerNode)
    }
    return (
      <div>
        <TreeSelect
          showSearch
          style={{ width: 300 }}
          value={_.difference(_.concat(typeValue, classValue), ['end'])}
          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
          getPopupContainer={() => popupContainer}
          placeholder={`${i18n('globe.select', '请选择')}${i18n('trigger.incident', '触发事件')}`}
          allowClear
          multiple
          treeDefaultExpandAll
          onChange={this.onChange}
        >
          {
            _.map(IncidentType.triggerType, item => {
              return <TreeNode value={item.code} title={item.name} key={item.code} disabled={item.code === 'end'}>
                {item.code === 'end' && _.map(IncidentType.triggerClass, ite => {
                  return <TreeNode value={ite.code} title={`${item.name}/${ite.name}`} key={ite.code} type="class" />
                })}
              </TreeNode>
            })
          }
        </TreeSelect>
      </div>
    )
  }
}

export default TriggerIncident
