import React, { Component } from 'react'
import { Radio } from '@uyun/components'
import Config from './config'
import Customer from './customer'
import PortalStore from './store/portalStore'
import CustomerStore from './store/customerStore'
import './style/index.less'
const RadioGroup = Radio.Group
const RadioButton = Radio.Button

const portalStore = new PortalStore()
const customerStore = new CustomerStore()

class Index extends Component {
    state = {
      value: 1
    }

    handleRadioChange = e => {
      this.setState({ value: e.target.value })
    }

    render () {
      const { value } = this.state
      return (
        <div className="system-config-portal">
          <div className="system-config-portal-header">
            <RadioGroup size="large"
              defaultValue={1} onChange={this.handleRadioChange}>
              <RadioButton value={1}>{i18n('config', '配置')}</RadioButton>
              <RadioButton value={2}>{i18n('customer', '客户人员')}</RadioButton>
            </RadioGroup>
          </div>
          <div className="system-config-portal-body">
            { value === 1 && <Config store={portalStore} /> }
            { value === 2 && <Customer store={customerStore} /> }
          </div>
        </div>
      )
    }
}

export default Index
