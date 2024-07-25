import React, { Component } from 'react'
import { Input } from '@uyun/components'
import './itsmInput.less'
class ITSMInput extends Component {
  render () {
    const {maxLength , className , onChange , ...dilver} = this.props
    const placeholder = this.props.value ? maxLength - this.props.value.length : maxLength
    return (
        <div className={`${className} itsm-input`} placeholder={placeholder}>
            <Input {...dilver} maxLength={maxLength} onChange={(e) => {
                onChange(e)
            }}/>
        </div>
    )
  }
}

export default ITSMInput
