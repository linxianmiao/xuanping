import React from 'react'
import { Modal, Radio, Row, Col } from '@uyun/components'
import FieldMapping from './FieldMapping'
import './index.less'

const RadioGroup = Radio.Group
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 }
}

class DetailRemoteMap extends React.Component {
  render() {
    const { data, detailVisible, cancelModal, currentWriteBack } = this.props
    const {
      currentNodeId,
      targetNodeId,
      currentModelId,
      targetModelId,
      currentNodeName,
      currentModelName,
      targetNodeName,
      targetModelName,
      targetModelConfirmTacheName,
      writeBack
    } = data

    return (
      <Modal
        wrapClassName="detai-remote-modal"
        visible={detailVisible}
        title={i18n('layout.detail')}
        footer={null}
        onCancel={cancelModal}
      >
        <Row>
          <Col span={6}>{i18n('config.mapping.currentTenant')}:</Col>
          <Col span={12}>{currentNodeName}</Col>
        </Row>
        <Row>
          <Col span={6}>{i18n('config.mapping.currentModel')}:</Col>
          <Col span={12}>{currentModelName}</Col>
        </Row>
        <Row>
          <Col span={6}>{i18n('config.mapping.targetTenant')}:</Col>
          <Col span={12}>{targetNodeName}</Col>
        </Row>
        <Row>
          <Col span={6}>{i18n('config.mapping.targetModel')}:</Col>
          <Col span={12}>{targetModelName}</Col>
        </Row>
        <Row>
          <Col span={6}>目标模型等待确认环节:</Col>
          <Col span={12}>{targetModelConfirmTacheName}</Col>
        </Row>
        <Row>
          <Col span={6}>查看映射字段:</Col>
          <Col span={12}>
            <FieldMapping
              buttonTxt="查看映射字段"
              type={1}
              parNodeId={currentNodeId}
              subNodeId={targetNodeId}
              parModelId={currentModelId}
              subModelId={targetModelId}
              onModelMiss={(type) => {}}
            />
          </Col>
        </Row>

        <Row>
          <Col span={6}>是否回写:</Col>
          <Col span={12}>{writeBack ? '是' : '否'}</Col>
        </Row>
        {currentWriteBack && (
          <Row>
            <Col span={6}>查看映射字段:</Col>
            <Col span={12}>
              <FieldMapping
                buttonTxt="查看映射字段"
                type={2}
                parNodeId={targetNodeId}
                subNodeId={currentNodeId}
                parModelId={targetModelId}
                subModelId={currentModelId}
                onModelMiss={(type) => {}}
              />
            </Col>
          </Row>
        )}
      </Modal>
    )
  }
}

export default DetailRemoteMap
