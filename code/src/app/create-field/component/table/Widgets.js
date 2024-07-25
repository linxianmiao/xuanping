import React, { Component } from 'react'
import StrategyConst from './StrategyConst'
import StrategyApi from './StrategyApi'
import StrategyHide from './StrategyHide'
import { getConstValue, getApiValue, getHideValue } from './config'
export default class Widgets extends Component {
  onAdd = () => {
    const { visible, value } = this.props
    let item
    switch (visible) {
      case 'const' : item = getConstValue(); break
      case 'api' : item = getApiValue(); break
      case 'hide' : item = getHideValue(); break
    }
    this.props.onChange([
      ...value,
      item
    ])
  }

  onDel = (index) => {
    const { value } = this.props
    if (value.length === 1) {
      return false
    }
    this.props.onChange(
      _.filter(value, (_, idx) => idx !== index)
    )
  }

  onChange = (item, index) => {
    const { value } = this.props
    this.props.onChange(
      _.map(value, (data, idx) => idx === index ? item : data)
    )
  }

  _render() {
    const { visible, onChange: _, value, ...rest } = this.props
    const dilver = {
      ...rest,
      list: value,
      onChange: this.onChange,
      onDel: this.onDel,
      onAdd: this.onAdd
    }
    switch (visible) {
      case 'const' : return <StrategyConst {...dilver} />
      case 'api' : return <StrategyApi {...dilver} />
      case 'hide' : return <StrategyHide {...dilver} />
      default : return null
    }
  }

  render() {
    return this._render()
  }
}