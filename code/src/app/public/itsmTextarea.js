import React, { Component } from 'react'
import { Input } from '@uyun/components'
const { TextArea } = Input;
import './itsmInput.less'
class ITSMInput extends Component {
  render () {
    const {maxLength , className , onChange , ...dilver} = this.props
    const placeholder = this.props.value ? maxLength - this.props.value.length : maxLength
    return (
        <div className={`${className} itsm-textarea`} placeholder={placeholder}>
            <TextArea {...dilver} maxLength={maxLength} onChange={(e) => { onChange(e) }}/>
        </div>
    )
  }
}

export default ITSMInput
