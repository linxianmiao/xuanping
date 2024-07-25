import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import DefinitionHeader from './definitionHeader'
import DefinitionList from './definitionList'
import '../styles/definition.less'
@inject('definitionStore', 'globalStore')
@observer
class DefinitionIndex extends Component {
  componentDidMount () {
    this.props.definitionStore.getSLACount()
    this.props.definitionStore.getSlaDefinitionList()
  }

  render () {
    const { slaInsert, slaModify, slaDelete } = this.props.globalStore.configAuthor
    return (
      <React.Fragment>
        <DefinitionHeader />
        <DefinitionList slaModify={slaModify} slaDelete={slaDelete} slaInsert={slaInsert} />
      </React.Fragment>
    )
  }
}

export default DefinitionIndex
