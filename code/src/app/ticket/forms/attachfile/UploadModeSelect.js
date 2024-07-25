import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Radio } from '@uyun/components'
import UploadMode from './UploadMode'
import UfsMode from './UfsMode'
import styles from './index.module.less'

@inject('globalStore')
@observer
class UploadModeSelect extends Component {
  static defaultProps = {
    canUpload: true,
    canDownload: true
  }

  state = {
    mode: 'local',
    previewVisible: false
  }

  componentDidMount() {
    const { ufs } = this.props.globalStore.productNum || {}
    const { uploadMode = [] } = this.props.field
    if (uploadMode.length === 1 && ufs && _.head(uploadMode) === 'ufs') {
      this.setState({ mode: 'ufs' })
    }
  }

  handleChange = (e) => {
    this.setState({ mode: e.target.value })
  }

  render() {
    const { ufs } = this.props.globalStore.productNum || {}
    const { disabled } = this.props
    const { uploadMode = [] } = this.props.field
    const { mode } = this.state
    const canUpload = !disabled && this.props.canUpload
    const canDownload = this.props.canDownload
    if (_.isEmpty(uploadMode)) {
      return null
    }
    return (
      <div className={styles.filedAttachfile}>
        <header>
          {canUpload && uploadMode.length === 2 && ufs === 1 && (
            <Radio.Group
              value={mode}
              onChange={this.handleChange}
              style={{ marginBottom: 16, marginRight: 10 }}
              disabled={disabled}
            >
              <Radio.Button value="local">
                {i18n('ticket-field-attachFile-itsm', '本地上传')}
              </Radio.Button>
              <Radio.Button value="ufs">
                {i18n('ticket-field-attachFile-ufs', 'UFS选择文件')}
              </Radio.Button>
            </Radio.Group>
          )}
        </header>
        <div id={this.props.field.code}>
          {mode === 'local' && (
            <UploadMode {...this.props} canUpload={canUpload} canDownload={canDownload} />
          )}
          {mode === 'ufs' && (
            <UfsMode {...this.props} canUpload={canUpload} canDownload={canDownload} />
          )}
        </div>
      </div>
    )
  }
}
export default UploadModeSelect
