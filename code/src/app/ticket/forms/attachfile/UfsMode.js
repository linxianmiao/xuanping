import React, { Component } from 'react'
import FilePicker from '@uyun/ec-file-picker'

export default class UfsMode extends Component {
  getFilePickerValue = () => {
    const { value } = this.props
    const files = _.chain(value)
      .filter((item) => item.source === 'ufs')
      .map((item) => ({ id: item.id, name: item.name, hubType: item.hubType }))
      .value()
    return files
  }

  onChange = (files) => {
    const { value } = this.props
    this.props.onChange([
      ..._.filter(value, (item) => item.source !== 'ufs'),
      ..._.map(files, (file) => _.assign({}, file, { source: 'ufs' }))
    ])
  }

  render() {
    const { canUpload, canDownload } = this.props
    const values = this.getFilePickerValue()
    return (
      <FilePicker
        buttonStyle={!canUpload ? { display: 'none' } : {}}
        download={canDownload}
        product="itsm"
        disabled={!canUpload}
        onChange={this.onChange}
        value={values}
      />
    )
  }
}
