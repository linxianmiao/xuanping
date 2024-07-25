import React, { Component } from 'react'
import {
  CloseCircleFilled,
  InfoCircleFilled,
  FullscreenExitOutlined,
  FullscreenOutlined
} from '@uyun/icons'
import { Modal, Button, Fullscreen } from '@uyun/components'

class RetryJob extends Component {
  static defaultProps = {
    visible: false,
    loading: false,
    failRes: {},
    detailForms: {},
    onCancel: () => {},
    onOk: () => {},
    handleModifyTicket: () => {}
  }

  state = {
    enableFullscreen: false
  }

  toggle = () => {
    this.setState({
      enableFullscreen: !this.state.enableFullscreen
    })
  }

  exitFullscreen = () => {
    this.setState({
      enableFullscreen: false
    })
  }

  render() {
    const { enableFullscreen } = this.state
    const { visible, onCancel, onOk, failRes, loading, destroy, handleModifyTicket, detailForms } =
      this.props
    const { executeResult, message, requestParams } = failRes
    const failCode = executeResult === 0
    const destroyOnClose = failCode && !destroy
    return (
      <Modal
        visible={visible}
        title="生成作业"
        wrapClassName="retry-job-modal"
        className={`${destroyOnClose ? 'u4-modal-confirm-error' : ''} u4-modal-confirm-confirm`}
        onCancel={() => onCancel()}
        onOk={() => onOk()}
        footer={
          destroyOnClose ? (
            <>
              {detailForms.isExcutor ? (
                <Button onClick={() => handleModifyTicket()}>{'修改工单'}</Button>
              ) : null}
            </>
          ) : (
            <>
              <Button key="submit" type="primary" loading={loading} onClick={() => onOk()}>
                {'生成'}
              </Button>
              <Button key="back" onClick={() => onCancel()}>
                {'取消'}
              </Button>
            </>
          )
        }
      >
        {destroyOnClose ? (
          <div className="u4-modal-confirm-body">
            <div className="u4-modal-confirm-title">
              <CloseCircleFilled />
              {'生成作业失败'}
            </div>
            <div className="u4-modal-confirm-content" style={{ textAlign: 'left' }}>
              <Fullscreen enable={enableFullscreen} onExit={this.exitFullscreen}>
                <div style={{ textAlign: 'right', margin: '5px 0' }}>
                  <Button
                    className="full"
                    icon={enableFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                    size="small"
                    onClick={this.toggle}
                  />
                </div>
                {'错误信息：'}
                <br />
                {message}
                <br />
                <br />
                {'请求参数：'}
                <br />
                {requestParams}
              </Fullscreen>
            </div>
          </div>
        ) : (
          <div className="u4-modal-confirm-body">
            <span className="u4-modal-confirm-title">
              <InfoCircleFilled />
              {'作业未关联到工单'}
            </span>
            <div className="u4-modal-confirm-content">{'建议重新生成，确保工单流程正常执行'}</div>
          </div>
        )}
      </Modal>
    )
  }
}

export default RetryJob
