import React, { Component } from 'react'
import PanelContent from './component/panelContent'
import { PlusOutlined } from '@uyun/icons'
import { observer } from 'mobx-react'
import IndexStore from './store/indexStore'
import getUid from '../utils/uuid'
import { Collapse, Button, Form } from '@uyun/components'

const Panel = Collapse.Panel
const FormItem = Form.Item
const indexStore = new IndexStore()

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 20 }
}

@observer
class TriggerRule extends Component {
  static defaultProps = {
    store: indexStore
  }

  constructor(props) {
    super(props)

    this.state = {
      triggerData: props.defaultValue || []
    }
  }

  componentDidMount() {
    this.props.store.getActionTypes()
    this.props.store.getUserList()
    this.props.store.getDepartList()
    this.props.store.getFieldParams()
  }

  setTriggerData = (index, value, type) => {
    const { triggerData } = this.state
    if (type === 'double') {
      triggerData[index].incident = value.typeValue
      triggerData[index].taskEndIncident = value.classValue
    } else {
      triggerData[index][type] = value
    }
    this.setState({
      triggerData
    })
    this.props.getData && this.props.getData(triggerData)
  }

  add = () => {
    const { triggerData } = this.state
    const len = triggerData.length + 1
    triggerData.push({
      id: getUid(),
      name: `${i18n('noti_rules', '通知策略')} ${len}`,
      params: [],
      triggerConditions: {
        when: 'all',
        conditionExpressions: [],
        nestingConditions: []
      }
    })
    this.setState({
      triggerData
    })
    this.props.getData && this.props.getData(triggerData)
  }

  delTrigger = (index) => {
    const { triggerData } = this.state
    triggerData.splice(index, 1)
    this.setState({
      triggerData
    })
    this.props.getData && this.props.getData(triggerData)
  }

  render() {
    const { store } = this.props
    const { triggerData } = this.state
    return (
      <FormItem
        label={i18n('noti_rules', '通知策略')}
        {...formItemLayout}
        className="noti-label notification-wrap"
      >
        <div id="notification-wrap">
          <Button type="primary" className="add-trigger-btn" onClick={this.add}>
            <PlusOutlined />
            {i18n('add_rule', '添加策略')}
          </Button>
          {triggerData.length > 0 ? (
            <Collapse accordion>
              {triggerData.map((item, index) => {
                return (
                  <Panel
                    header={
                      <div className="clearfix">
                        <div className="fl header-name">{item.name}</div>
                        <div
                          className="fr header-del"
                          onClick={() => {
                            this.delTrigger(index)
                          }}
                        >
                          <i className="iconfont icon-shanchu" />
                        </div>
                      </div>
                    }
                    key={item.id}
                  >
                    <PanelContent
                      key={item.id}
                      panelIndex={index}
                      triggerData={_.cloneDeep(item)}
                      store={store}
                      setTriggerData={this.setTriggerData}
                    />
                  </Panel>
                )
              })}
            </Collapse>
          ) : null}
        </div>
      </FormItem>
    )
  }
}

export default TriggerRule
