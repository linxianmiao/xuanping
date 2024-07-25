import React from 'react'
import { InboxOutlined } from '@uyun/icons'
import { Upload } from '@uyun/components'
import styles from './index.module.less'

const Dragger = (props) => {
  const { fieldType, modelCode, sandboxId, onUpload, redundantAttribute, ticketId, fieldId } = props
  const isAssetAdd = _.isNumber(redundantAttribute?.isAssetAdd) ? redundantAttribute?.isAssetAdd : 1
  let url = `/asset/api/v1/sandbox/ticket/batch/import?sandboxId=${sandboxId}&fieldType=${fieldType}&modelCode=${modelCode}`
  url += `&isAssetAdd=${isAssetAdd}&ticketId=${ticketId}&fieldId=${fieldId}`
  const uploadProps = {
    name: 'file',
    // multiple: true,
    showUploadList: false,
    action: url,
    onChange: onUpload
  }

  return (
    <div className={styles.draggerWrap}>
      <p>
        {i18n(
          'asset-batch-import-tip',
          '您是否有资产录入的Excel模板，需要依照模板导入，否则会失败。'
        )}
      </p>
      <Upload.Dragger {...uploadProps}>
        <p>
          <InboxOutlined />
        </p>
        <p>{i18n('asset-upload-tip', '点击或者拖拽文件到这个区域进行上传')}</p>
        <p>{i18n('asset-upload-tip-2', '已经按照模板制定好')}</p>
      </Upload.Dragger>
      <p>
        <span>{i18n('resource.upload.tip', '一次最多上传500条')}</span>
        <a onClick={() => props.onShowTemplates()}>
          {i18n('asset-tmp-download-tip', '还没有资产类型Excel模板？请下载模板')}
        </a>
      </p>
    </div>
  )
}

Dragger.defaultProps = {
  sandboxId: '',
  modelCode: '',
  onShowTemplates: () => {},
  onUpload: () => {}
}

export default Dragger
