import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Dropdown } from '@uyun/components'
import Tab from './tab'

export default class ParamsSelect extends Component {
  static propTypes = {
    value: PropTypes.array,
    handleChange: PropTypes.func
  }

  state = {
    value: '',
    visible: false
  }

  handleChangeValueList = (value) => {
    this.setState({ value })
    this.props.handleChange(value)
  }

  onVisibleChange = (visible) => {
    this.setState({ visible })
  }

  render () {
    const { value, visible } = this.state
    const { getPopupContainer, children } = this.props
    return (
      <Dropdown
        visible={visible}
        onVisibleChange={this.onVisibleChange}
        placement="bottomCenter"
        getPopupContainer={getPopupContainer}
        overlay={
          <Tab
            {...this.props}
            value={value}
            handleChangeValueList={this.handleChangeValueList} />
        }
      >
        {children}
      </Dropdown>
    )
  }
}
