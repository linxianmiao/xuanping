import React, { Component } from 'react'
import { Checkbox, Title } from '@uyun/components'
import { observer } from 'mobx-react'
import * as mobx from 'mobx'

@observer
class GlobalSwitch extends Component {
    onChange = (type, e) => {
      const states = _.cloneDeep(mobx.toJS(this.props.store.states))
      states.filter(item => {
        if (item.value === type) {
          item.state = e.target.checked ? 1 : 0
        }
      })
      this.props.store.onChangeStates(states)
    }

    render () {
      const { states } = mobx.toJS(this.props.store)
      return (
        <div>
          <Title>{i18n('global_switch', '全局开关')}</Title>
          <div className="system-config-global-group">
            {states.map((item, i) => {
              return (
                <label className="global-checkbox-label" key={i}>
                  <span className="left">
                    <Checkbox checked={item.state === 1} onChange={e => { this.onChange(item.value, e) }} />
                  </span>
                  <span className="right">{item.label}</span>
                </label>
              )
            })}
          </div>
        </div>
      )
    }
}

export default GlobalSwitch
