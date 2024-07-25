import React from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
@inject('directoryStore')
@observer
class BottonWrap extends React.Component {
  render() {
    const { currentOrg = {} } = toJS(this.props.directoryStore)
    return (
      <div className="buttonWrap">
        <div className="system_org_title">
          {currentOrg.name}
        </div>
      </div>
    )
  }
}
export default BottonWrap