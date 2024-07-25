import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import PolicyTable from './policyTable'
import PolicyHeader from './policyHeader'

@inject('policyStore', 'globalStore')
@observer
class PolicyIndex extends Component {
  componentDidMount () {
    this.props.policyStore.getPolicyList()
  }

  render () {
    const { onRecordsView } = this.props
    const { slaInsert, slaModify, slaDelete, slaRecord } = this.props.globalStore.configAuthor
    return (
      <React.Fragment>
        <PolicyHeader slaStrategyInsert={slaInsert} />
        <PolicyTable
          slaStrategyModify={slaModify}
          slaStrategyDelete={slaDelete}
          slaStrategyRecord={slaRecord}
          onRecordsView={onRecordsView}
        />
      </React.Fragment>
    )
  }
}

export default PolicyIndex
