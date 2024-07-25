import React, { Component } from 'react'
import UploadIcon from '~/model/config/uploadIcon'
import { DeleteOutlined, PlusOutlined } from '@uyun/icons'
import { Upload, message } from '@uyun/components'

export default class FileView extends Component {
  constructor(props) {
    super(props)
    this.paramData = {}
  }

  handleClick = (data, fileId, fileName) => {
    this.props.setFormsValue({
      iconName: data.key,
      fileId,
      fileName
    })
  }

  // 过大或者图片不能上传
  beforeUpload = (file) => {
    const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
    const isLt2M = file.size / 1024 < 100
    if (!isJPG) {
      message.error(i18n('config.model.fileFormat', '只能上传JPG或PNG格式'))
    }
    if (!isLt2M) {
      message.error(i18n('config.model.sizeError', '文件大小不得超过100kb'))
    }
    this.paramData.fileName = file.name
    this.paramData.fileLength = file.size
    this.paramData.contentType = file.type
    return isJPG && isLt2M
  }

  handleChange = (info) => {
    if (info.file.status === 'done') {
      const { fileId, fileName } = info.file.response.data
      this.props.setFormsValue({
        iconName: 'define',
        fileId,
        fileName
      })
    }
  }

  removeImg = () => {
    this.props.setFormsValue({
      iconName: 'alter',
      fileId: '',
      fileName: ''
    })
  }

  render() {
    const { iconName, fileId, fileName } = this.props.value
    return (
      <div className="config-model-basic-upload-wrap">
        <div className="config-model-basic-upload-built-icon">
          {UploadIcon.map((data) => {
            return (
              <div
                className={`${iconName === data.key ? 'active' : ''}`}
                onClick={() => {
                  this.handleClick(data, fileId, fileName)
                }}
                key={data.key}
              >
                <i className={'iconfont ' + data.name} />
              </div>
            )
          })}
        </div>
        <div className="config-model-basic-upload-define-icon">
          {fileId ? (
            <div
              className={`config-model-basic-upload-define-icon-img-wrap ${
                iconName === 'define' ? 'active' : ''
              }`}
            >
              <img
                src={`${API.DOWNLOAD}/${fileId}/${fileName}`}
                onClick={() => {
                  this.handleClick({ key: 'define' }, fileId, fileName)
                }}
              />
              <DeleteOutlined className="delete-icon" onClick={this.removeImg} />
            </div>
          ) : (
            <Upload
              multiple={false}
              showUploadList={false}
              action={API.SAVE_ICON}
              listType="picture-card"
              data={this.paramData}
              beforeUpload={this.beforeUpload}
              onChange={this.handleChange}
            >
              <PlusOutlined />
            </Upload>
          )}
        </div>
      </div>
    )
  }
}
