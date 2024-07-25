import React, { useState, useEffect } from 'react'
import { Modal, Progress } from '@uyun/components'
import Dragger from './Dragger'
import Templates from './Templates'
import styles from './index.module.less'

const UploadModal = (props) => {
  const [templateVisible, setTemplateVisible] = useState(false)
  const [step, setStep] = useState(1)
  const [percent, setPercent] = useState(0)

  const handleProgress = (info) => {
    const { event, file, fileList = [] } = info || {}

    setStep(2)

    if (event) {
      setPercent(Math.floor(event.loaded / event.total) * 100)
    }

    if (fileList.every((item) => item.status === 'done' || item.status === 'error')) {
      props.onClose()

      if (!file.response.data || !file.response.success) {
        Modal.warning({
          title: i18n('import.error', '导入失败'),
          content: file.response.message
        })
        return
      }
      const { success, failure, path, fileName, uniques = [] } = file.response.data
      const successAmount = success || '0'
      const failAmount = failure || '0'

      Modal.warning({
        title: i18n(
          'upload.resource.result.msg',
          `导入成功${successAmount}条，失败${failAmount}条`,
          { successAmount, failAmount }
        ),
        content: (
          <div>
            {failAmount > 0 && (
              <p>
                {i18n('resource.upload.error.download.tip1', '下载')}
                &nbsp;
                <a
                  href={`/asset/api/v1/export/prompt?path=${path}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {fileName}
                </a>
                &nbsp;
                {i18n('resource.upload.error.download.tip2', '查看失败记录及原因')}
              </p>
            )}
          </div>
        ),
        onOk: () => {
          if (success > 0) {
            props.onComplete(uniques)
          }
        }
      })
    }
  }

  const { visible, sandboxId, fieldType, modelCode, redundantAttribute, ticketId, fieldId } = props
  const draggerWrapStyle = step !== 1 ? { visibility: 'hidden', height: 0, overflow: 'hidden' } : {}

  useEffect(() => {
    if (!visible) {
      setTemplateVisible(false)
      setStep(1)
      setPercent(0)
    }
  }, [visible])

  return (
    <Modal
      visible={visible}
      wrapClassName={styles.uploadModal}
      width={600}
      maskClosable={false}
      destroyOnClose
      title={i18n('import', '导入')}
      footer={false}
      onCancel={() => props.onClose()}
    >
      <div style={draggerWrapStyle}>
        <Dragger
          fieldType={fieldType}
          modelCode={modelCode}
          sandboxId={sandboxId}
          onShowTemplates={() => setTemplateVisible(true)}
          onUpload={handleProgress}
          redundantAttribute={redundantAttribute}
          ticketId={ticketId}
          fieldId={fieldId}
        />
        {templateVisible && <Templates />}
      </div>
      {step === 2 && (
        <div className={styles.progressWrap}>
          <p>{i18n('resource.uploading.tip', '文件上传中， 请稍等...')}</p>
          <Progress percent={percent} />
        </div>
      )}
    </Modal>
  )
}

UploadModal.defaultProps = {
  fieldType: '',
  modelCode: '',
  sandboxId: '',
  visible: false,
  onComplete: () => {}
}

export default UploadModal
