import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'
import ModeSelect from './ModeSelect'

@inject('globalStore')
@observer
class AttachFile extends Component {
  render() {
    const {
      field,
      getFieldDecorator,
      disabled,
      forms = {},
      initialValue,
      type,
      fieldMinCol,
      secrecy,
      formLayoutType
    } = this.props
    // 附件上传和下载的权限
    const { attachFileDownload, attachFileUpload } = this.props.globalStore.ticketListOperation
    const { fileAccept } = this.props.globalStore
    const accept = fileAccept ? fileAccept.join(',') : ''
    return (
      <FormItem
        field={field}
        fieldMinCol={fieldMinCol}
        fileAccept={accept}
        className={classnames({
          'table-style-item': formLayoutType
        })}
      >
        {getFieldDecorator(field.code, {
          initialValue: initialValue || [],
          rules: [
            {
              required: +field.isRequired === 1,
              message: `${i18n('globe.select', '请选择')}${field.name}`
            }
          ]
        })(
          secrecy ? (
            <Secrecy />
          ) : (
            <ModeSelect
              type={type}
              field={field}
              ticketId={forms.ticketId}
              tacheId={forms.tacheId}
              disabled={disabled}
              canUpload={attachFileUpload}
              canDownload={attachFileDownload}
              mode="dragger"
            />
          )
        )}
      </FormItem>
    )
  }
}

export default AttachFile
