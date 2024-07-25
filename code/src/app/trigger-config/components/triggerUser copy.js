import React, { Component } from 'react'
import userTypes from '~/trigger/config/userTypes'
import ITSMUser from '~/components/itsmUsers'
import { PlusOutlined } from '@uyun/icons'
import { Select, Icon } from '@uyun/components'
import '../style/triggerUser.less'
import * as R from 'ramda'

const { Option } = Select

const userTypeValues = R.pluck('value', userTypes)

const isIncludeInUserTypes = R.includes(R.__, userTypeValues)

const getUserTypes = R.filter(isIncludeInUserTypes)

const getUserIds = R.filter(R.complement(isIncludeInUserTypes))

export default class TriggerUser extends Component {
  constructor(props) {
    super(props)
    this.state = {
      userIds: getUserIds(props.value),
      userTypes: getUserTypes(props.value)
    }
  }

  handleUserTypeChange = (value) => {
    this.setState({ userTypes: value })
    this.props.onChange([...value, ...this.state.userIds])
  }

  handleUserIdChange = (value) => {
    this.setState({ userIds: value })
    this.props.onChange([...this.state.userTypes, ...value])
  }

  render() {
    return (
      <Select
        mode="multiple"
        onChange={this.handleUserTypeChange}
        value={this.state.userTypes}
        dropdownClassName="trigger-user-dropdown"
        dropdownRender={(options) => (
          <div>
            {options}
            <ITSMUser
              tabs={['1']}
              viewType="custom"
              value={this.state.userIds}
              isString
              onChange={this.handleUserIdChange}
            >
              <div className="custom-wrapper">
                <PlusOutlined /> {i18n('customer_user', '自定义人员')}
              </div>
            </ITSMUser>
          </div>
        )}
      >
        {userTypes.map(({ name, value }) => (
          <Option key={value} value={value}>
            {name}
          </Option>
        ))}
      </Select>
    )
  }
}
