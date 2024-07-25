import React, { Component } from 'react'
import ConditionItem from './conditionItem'

class ConditionWrap extends Component {
  render () {
    return <ConditionItem {...this.props} />
  }
}

export default ConditionWrap
