import React, { Component } from 'react'
import PanelContent from './panelContent'
import { observer } from 'mobx-react'
import IndexStore from '../store/indexStore'
import getUid from '../../utils/uuid'
import { Collapse, Button, Form } from '@uyun/components'
const Panel = Collapse.Panel
const FormItem = Form.Item
const indexStore = new IndexStore()

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 21 }
}

@observer
class TriggerRule extends Component {
    static defaultProps = {
      store: indexStore
    }

    constructor (props) {
      super(props)
      this.state = {
        triggerData: this.props.triggerData || []
      }
    }

    componentDidMount () {
      this.props.store.getActionTypes()
    }

    setTriggerData = (index, value, type) => {
      const { triggerData } = this.state
      triggerData[index][type] = value
      this.setState({
        triggerData
      })
      this.props.getData && this.props.getData(triggerData)
    }

    add = () => {
      const { triggerData } = this.state
      const len = triggerData.length + 1
      triggerData.push({ key: getUid(), name: `${i18n('noti_rules', '通知策略')}${len}`, params: [], triggerConditions: [] })
      this.setState({
        triggerData
      })
    }

    render () {
      const { store } = this.props
      const { triggerData } = this.state
      return (
        <FormItem label={i18n('noti_rules', '通知策略')} {...formItemLayout}>
          <Button type="primary" onClick={this.add}>{i18n('add_notif_rules', '添加通知策略')}</Button>
          {triggerData.length > 0
            ? <Collapse defaultActiveKey={triggerData[0].key}>
              {
                triggerData.map((item, index) => {
                  return (
                    <Panel
                      header={item.name}
                      key={item.key}
                    >
                      <PanelContent
                        panelIndex={index}
                        triggerData={_.cloneDeep(item)}
                        store={store}
                        setTriggerData={this.setTriggerData}
                      />
                    </Panel>
                  )
                })
              }
            </Collapse> : null}
        </FormItem>
      )
    }
}

export default TriggerRule
