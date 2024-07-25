import React, { Component } from 'react'
import { LowcodeWorkflow } from '~/index.js'
import styles from './workflow.module.less'

export class Workflow extends Component {
  render () {
    return (
      <div className={styles.itsmWorkflow} >
        <LowcodeWorkflow {...this.props} />
      </div>
    )
  }
}
