import React, { Component } from 'react'
import TicketReassign from './operate/reassign'
import TicketRollBack from './operate/rollBack'
import ReviewModal from './operate/review'
import SeniorJump from './operate/seniorJump'
import { Modal } from '@uyun/components'
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 }
}
export default class DetailModal extends Component {
    _renderTitle = () => {
      const { visible } = this.props
      switch (visible) {
        case 'rollback' : return i18n('globe.rollback', '回退')
        case 'abolish' : return i18n('globe.abolish', '废除')
        case 'close' : return i18n('globe.close', '关闭')
        case 'reassign' : return i18n('ticket.detail.assignment', '工单改派')
      }
    }

    render () {
      const { visible, formList, loading, activityData } = this.props
      const dilver = {
        visible,
        formItemLayout,
        modelType: activityData.modelType,
        id: formList.ticketId,
        caseId: formList.caseId,
        tacheId: formList.tacheId,
        modelId: formList.subModelId || formList.modelId,
        ressignAndCountersign: formList.isCountersign,
        orgId: formList.currDepart,
        isManager: formList.isManager,
        wrappedComponentRef: inst => { this.modal = inst }
      }
      return (
        <Modal
          visible={!!visible}
          maskClosable={false}
          confirmLoading={loading}
          title={this._renderTitle()}>
          {visible === 'reassign' && <TicketReassign {...dilver} />}
          {_.includes(['rollback', 'abolish', 'close', 'retrieve'], visible) && <TicketRollBack {...dilver} />}
          {visible === 'review' && <ReviewModal {...dilver} />}
          {visible === 'jump' && <SeniorJump {...dilver} />}
        </Modal>
      )
    }
}
