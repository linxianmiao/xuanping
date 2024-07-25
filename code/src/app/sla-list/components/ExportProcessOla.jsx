import React, { useState, useRef, useEffect } from 'react'
import { Button, Modal, Progress, Form, Radio } from '@uyun/components'
import { download } from '~/utils/common'
import _ from 'lodash'

const Export = ({ disabled = false, ids }) => {
  const [exportIng, setExportIng] = useState(false)
  const [visible, setVisible] = useState(false)
  const [exportType, setExportType] = useState(2)
  const [progress, setProgress] = useState(0)

  // 导出过程是否被取消
  const isCancel = useRef(false)

  const timer = useRef(null)

  const handleCancel = () => {
    setVisible(false)
    setExportIng(false)
    setProgress(0)

    isCancel.current = false

    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }

  const handleDownload = (exportId) => {
    let url = API.getOlaExportExcel
    url += `?exportId=${exportId}`

    Modal.success({
      title: i18n('ticket.list.export.tip4', '导出成功，正在下载文件...'),
      content: (
        <div>
          <p>{i18n('ticket.list.export.tip5', '如未自动下载，请手动点击文件名下载')}</p>
          <a onClick={() => download(url)}>ola处理人统计.xlsx</a>
        </div>
      )
    })

    download(url)
  }

  const getExportProgress = async (exportId) => {
    const url = API.getOlaProcessExportProgress
    const newProgress = await axios.get(url, { params: { exportId } })

    if (newProgress && !isCancel.current) {
      setProgress(Number(newProgress))

      if (Number(newProgress) < 100) {
        timer.current = setTimeout(() => {
          getExportProgress(exportId)
        }, 0.5 * 1000)
      } else {
        handleCancel()
        handleDownload(exportId)
      }
    } else {
      handleCancel()
    }
  }

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current)
      }
    }
  }, [])

  const handleExport = async () => {
    isCancel.current = false
    setExportIng(true)

    const url = API.getOlaProcessExport
    const params = window.OLA_PROCESS_LIST_FILTERS
    const exportId = await axios.post(
      url,
      _.assign(params, {
        exportType,
        ids
      })
    )

    if (exportId) {
      getExportProgress(exportId)
    }
  }

  return (
    <>
      <Button type="primary" onClick={() => setVisible(true)} disabled={disabled}>
        {i18n('export', '导出')}
      </Button>

      <Modal
        title="导出工单"
        visible={visible}
        okButtonProps={{
          disabled: exportIng
        }}
        onOk={handleExport}
        onCancel={handleCancel}
      >
        {exportIng ? (
          <Progress percent={progress} />
        ) : (
          <Form>
            <Form.Item label="导出内容">
              <Radio.Group value={exportType} onChange={(e) => setExportType(e.target.value)}>
                <Radio disabled={ids.length === 0} value={1}>
                  已经勾选内容
                </Radio>
                <Radio value={2}>所有内容</Radio>
              </Radio.Group>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  )
}

export default Export
