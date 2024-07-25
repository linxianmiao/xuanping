import React, { Component } from 'react'
import UserPicker from '~/components/userPicker'
class UserAndGroupList extends Component {
  onChange = (selectedData, useVariable) => {
    const { dataKeyName } = this.props
    this.props.onChange({ [dataKeyName]: selectedData, useVariable })
  }

  render() {
    const { value, modelId, tabs, dataKeyName, showTypes } = this.props
    const { useVariable } = value
    return (
      <UserPicker
        extendQuery={{
          modelId
        }}
        tabs={tabs || [0, 1, 2, 3, 4, 5]}
        showTypes={showTypes}
        value={value[dataKeyName]}
        useVariable={useVariable}
        onChange={this.onChange}
      />
    )
  }
}

UserAndGroupList.defaultProps = {
  dataKeyName: 'userAndGroupList' // 数据的key名称，按规则选处理人时需要单独选变量，数据key为variableList
}

export default UserAndGroupList
