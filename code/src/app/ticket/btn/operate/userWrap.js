import React, { Component } from 'react'
import User from './user'
import AdvancedUser from './advancedUser'
export default class UserWrap extends Component {
  render () {
    return (
      <span>
        {this.props.modelType === 1 ? <AdvancedUser {...this.props} /> : <User {...this.props} />}
      </span>
    )
  }
}
