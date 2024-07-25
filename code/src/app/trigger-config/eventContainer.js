import React, { Component, Fragment } from 'react'
import TriggerEvent from './triggerEvent'
// import EventAction from './eventAction'

export default class EventContainer extends Component {
  render() {
    const { form } = this.props

    return (
      <Fragment>
        <TriggerEvent form={form} />
        {/* <EventAction form={form} /> */}
      </Fragment>
    )
  }
}
