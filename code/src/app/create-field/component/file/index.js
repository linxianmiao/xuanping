import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { CloseOutlined, PaperClipOutlined, UploadOutlined } from '@uyun/icons'
import { Form, Upload, Button, message, Checkbox, Tooltip, Modal } from '@uyun/components'
import { toJS } from 'mobx'
import FileConfig from './fileConfig'
import { Common } from '../index'
import { Browser } from '../../../utils'
import '../../style/file.less'
const reg = /(.*)\.(jpg|bmp|gif|ico|pcx|jpeg|tif|png|raw|tga)$/
const FormItem = Form.Item

@inject('globalStore')
@observer
class File extends Component {
  state = {
    currentUrl: '',
    previewVisible: false
  }

  handlePreview = (currentUrl) => {
    this.setState({
      currentUrl,
      previewVisible: true
    })
  }

  handleCancel = () => {
    this.setState({
      previewVisible: false
    })
  }

  // 上传前操作
  beforeUpload = (info) => {
    const { size, name } = info
    if (size > 20 * 1024 * 1024) {
      message.error(`${name}${i18n('upload_file_too_big', '文件过大')}`)
      return false
    }
  }

  renderUploadData = (info) => {
    const { name, size, type } = info
    const data = {
      fileName: encodeURIComponent(name),
      fileLength: size,
      contentType: type
    }
    if (type === '' || type == null) {
      data.contentType = '*/*'
    }
    if (Browser.isIE9()) {
      if (name.match(/.jpg|.jpeg/i)) {
        data.contentType = 'image/jpeg'
      } else if (name.match(/.gif/i)) {
        data.contentType = 'image/gif'
      } else if (name.match(/.png/i)) {
        data.contentType = 'image/png'
      } else if (name.match(/.bmp/i)) {
        data.contentType = 'image/bmp'
      }
    }
    return data
  }

  normFile = (e) => {
    const { file } = e
    const { getFieldValue } = this.props.form
    let fileList = getFieldValue('fileTemplate') || []
    if (file.percent === 100 && file.response) {
      const data = file.response.data
      if (data) {
        fileList = [
          ...fileList,
          {
            id: data.fileId,
            uploadTime: data.uploadTime,
            uploadUser: data.uploadUser,
            uid: file.uid,
            name: file.name,
            status: 'done',
            url: `${API.DOWNLOAD}/${data.fileId}/${encodeURIComponent(file.name)}`,
            thumbUrl: `${API.DOWNLOAD}/${data.fileId}/${encodeURIComponent(file.name)}`
          }
        ]
      } else {
        message.error(i18n('w1023'))
      }
    }
    return fileList
  }

  onRemove = (id) => {
    const { getFieldValue, setFieldsValue } = this.props.form
    const fileList = getFieldValue('fileTemplate') || []
    setFieldsValue({
      fileTemplate: _.filter(fileList, (file) => file.id !== id)
    })
  }

  validatorUploadMode = (rule, value, callback) => {
    if (_.isEmpty(value)) {
      callback('上传模式不能为空')
    } else {
      callback()
    }
  }

  renderTitle = (uploadUser, uploadTime) => {
    const formItemLayout = { labelCol: { span: 9 }, wrapperCol: { span: 15 } }
    return (
      <div className="file-tooltip">
        <FormItem {...formItemLayout} label={i18n('ticket.form.uploadUser', '上传人')}>
          {uploadUser}
        </FormItem>
        <FormItem {...formItemLayout} label={i18n('ticket.form.uploadTime', '上传时间')}>
          {uploadTime}
        </FormItem>
      </div>
    )
  }

  handleDownFile = (e, url, name) => {
    e.stopPropagation()
    if (url) {
      const a = document.createElement('a')
      a.href = url
      a.target = '_blank'
      a.download = name

      const xhr = new XMLHttpRequest()
      xhr.responseType = 'blob'

      xhr.onload = function () {
        a.href = URL.createObjectURL(xhr.response)

        document.body.appendChild(a)
        a.click()
        a.remove()
      }

      xhr.open('GET', a.pathname)
      xhr.send()
    }
  }

  render() {
    const { getFieldDecorator, setFieldsValue, getFieldValue } = this.props.form
    const { formItemLayout } = this.props
    const { previewVisible, currentUrl } = this.state
    const { fileTemplate, uploadMode } = this.props.store.fieldData
    const { fileAccept } = this.props.globalStore
    const accept = fileAccept ? fileAccept.join(',') : ''
    const fileList = getFieldValue('fileTemplate') || fileTemplate
    const diliver = _.merge({}, this.props, {
      getFieldDecorator,
      setFieldsValue,
      config: FileConfig,
      type: 'attachfile'
    })
    const fileListProps = {
      accept,
      action: API.UPLOAD,
      beforeUpload: this.beforeUpload,
      data: (info) => this.renderUploadData(info),
      multiple: true,
      showUploadList: false
    }
    const options = [
      { label: i18n('ticket-field-attachFile-itsm', '本地上传'), value: 'local' },
      { label: i18n('ticket-field-attachFile-ufs', 'UFS选择文件'), value: 'ufs' }
    ]
    return (
      <Common {...diliver}>
        <FormItem {...formItemLayout} label="上传模式">
          {getFieldDecorator('uploadMode', {
            initialValue: uploadMode,
            rules: [
              {
                required: true,
                validator: this.validatorUploadMode
              }
            ]
          })(<Checkbox.Group options={options} />)}
        </FormItem>
        <FormItem {...formItemLayout} label={i18n('attachment.template', '附件模板')}>
          {getFieldDecorator('fileTemplate', {
            initialValue: toJS(fileTemplate),
            getValueFromEvent: this.normFile
          })(
            <Upload {...fileListProps}>
              <Button>
                <UploadOutlined /> {i18n('ticket.from.upload', '选择文件')}
              </Button>
              <span onClick={(e) => e.stopPropagation()} className="create-field-upload-btn-tip">
                {i18n(
                  'ticket.from.upload.tip',
                  '建议规范命名附件，方便处理人员使用（单个文件不能超过20M）'
                )}
              </span>
            </Upload>
          )}
          <div className="u4-upload-list u4-upload-list-text create-field-file-list">
            {_.map(fileList, (file) => {
              const { id, name, uploadUser, uploadTime } = file
              const url = `${API.DOWNLOAD}/${id}/${encodeURIComponent(name)}`
              return (
                <div className="u4-upload-list-item u4-upload-list-item-done" key={id}>
                  <Tooltip title={this.renderTitle(uploadUser, uploadTime)}>
                    <div className="u4-upload-list-item-info">
                      <PaperClipOutlined />
                      {reg.test(name) ? (
                        <a
                          onClick={() => {
                            this.handlePreview(url)
                          }}
                          className="u4-upload-list-item-name"
                        >
                          {name}
                        </a>
                      ) : (
                        <a
                          // href={url}
                          // target="_blank"
                          onClick={(e) => this.handleDownFile(e, url, name)}
                          className="u4-upload-list-item-name"
                        >
                          {name || ''}
                        </a>
                      )}
                    </div>
                    <CloseOutlined
                      onClick={() => {
                        this.onRemove(id)
                      }}
                    />
                  </Tooltip>
                </div>
              )
            })}
          </div>
        </FormItem>
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel} size="large">
          <img style={{ width: '100%' }} src={currentUrl} />
        </Modal>
      </Common>
    )
  }
}

export default Form.create({
  onValuesChange: (props) => {
    props.onValuesChange && props.onValuesChange()
  }
})(File)
