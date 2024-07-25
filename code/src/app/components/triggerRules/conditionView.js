import React, { PureComponent } from 'react'
import classnames from 'classnames'
export default class ConditionView extends PureComponent {
  render () {
    const { children, header, extra, level } = this.props
    return (
      <div className={classnames('trigger-rule-condition-item', {
        'trigger-level': level !== 0
      })}>
        <header className="trigger-rule-condition-header">
          <div>{header}</div>
          <div>{extra}</div>
        </header>
        <section style={{ marginLeft: 30 }} className="trigger-rule-condition-section">
          {children}
        </section>
      </div>
    )
  }
}
