import React, { Component } from 'react'
import ConditionItem from './conditionItem'

class ConditionWrap extends Component {
  render () {
    return (
      <div className="condition-wrap">
        <ConditionItem {...this.props} />
      </div>
    )
  }
}

export default ConditionWrap
