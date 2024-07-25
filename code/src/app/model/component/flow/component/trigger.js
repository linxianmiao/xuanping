import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PanelContent from '../../../../trigger/component/panelContent'
import { observer } from 'mobx-react'
import IndexStore from '../../../../trigger/store/indexStore'
import getUid from '../../../../utils/uuid'
import { Collapse, Button } from '@uyun/components'
import { PlusOutlined } from '@uyun/icons'
const Card = Collapse.Card
const indexStore = new IndexStore()

@observer
class TriggerRule extends Component {
  static defaultProps = {
    store: indexStore
  }

  static contextTypes = {
    modelId: PropTypes.string
  }

  componentDidMount() {
    this.props.store.getActionTypes()
    this.props.store.getFieldParams()
    this.props.store.getAssignUsers(this.context.modelId)
  }

  setTriggerData = (index, value, type) => {
    const { defaultValue } = this.props
    if (type === 'double') {
      defaultValue[index].incident = value.typeValue
      defaultValue[index].taskEndIncident = value.classValue
    } else {
      defaultValue[index][type] = value
    }
    this.props.getData && this.props.getData(defaultValue)
  }

  add = () => {
    const { defaultValue } = this.props
    const len = defaultValue.length + 1
    defaultValue.push({
      id: getUid(),
      name: `${i18n('noti_rules', '通知策略')} ${len}`,
      params: [],
      incident: ['start'],
      triggerConditions: {
        when: 'all',
        conditionExpressions: [],
        nestingConditions: []
      }
    })
    this.props.getData && this.props.getData(defaultValue)
  }

  delTrigger = (index) => {
    const { defaultValue } = this.props
    defaultValue.splice(index, 1)
    this.props.getData && this.props.getData(defaultValue)
  }

  render() {
    const { store, defaultValue } = this.props
    return (
      <div className="notification-wrap" id="notification-wrap">
        {defaultValue.length > 0 ? (
          <Collapse accordion defaultActiveKey={this.props.ruleId}>
            {defaultValue.map((item, index) => {
              return (
                <Card
                  header={item.name}
                  extra={
                    <div
                      className="fr header-del"
                      onClick={() => {
                        this.delTrigger(index)
                      }}
                    >
                      <i className="iconfont icon-shanchu" />
                    </div>
                  }
                  key={item.id}
                >
                  <PanelContent
                    key={item.id}
                    panelIndex={index}
                    triggerData={item}
                    store={store}
                    setTriggerData={this.setTriggerData}
                  />
                </Card>
              )
            })}
          </Collapse>
        ) : null}
        <Button
          type="primary"
          className="add-trigger-btn"
          onClick={this.add}
          style={{ marginTop: '5px' }}
        >
          <PlusOutlined />
          {i18n('add_rule', '添加策略')}
        </Button>
      </div>
    )
  }
}

export default TriggerRule
