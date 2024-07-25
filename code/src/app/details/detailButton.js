import React, { Component } from 'react'
import LookBtns from '../ticket/btn/LookBtn'
import CommonButton from '../ticket/btn/Comment'
class DetailButton extends Component {
  state = {
    isReceiveTicket: this.props.formList.isReceiveTicket || 0
  }

  changeReceiveTicket = (isReceiveTicket) => {
    this.setState({ isReceiveTicket })
  }

  componentWillReceiveProps = (nextProps) => {
    if (
      this.props.formList.tacheId !== nextProps.formList.tacheId ||
      this.props.formList.ticketId !== nextProps.formList.ticketId ||
      this.props.formList.caseId !== nextProps.formList.caseId
    ) {
      this.setState({
        isReceiveTicket: nextProps.formList.isReceiveTicket
      })
    }
    if (this.props.formList.ticketId === nextProps.formList.ticketId) {
      if (this.state.isReceiveTicket !== nextProps.formList.isReceiveTicket) {
        this.setState({
          isReceiveTicket: nextProps.formList.isReceiveTicket
        })
      }
    }
  }

  render() {
    const { ticketSource, formList, btnCanClick } = this.props
    // shieldFlag 是否是屏蔽人员 , 1 是 ， 0 否 ，被屏蔽的人员不能操作工单
    // archived   是否归档， true 归档  ， 已归档的不能操作工单
    // mergeTicketFlag 是否是合并子单 1:是 2:否
    const { archived, shieldFlag, ticketId, mergeTicketFlag } = formList || {}

    const isShow =
      !_.isEmpty(formList) &&
      Boolean(mergeTicketFlag === 0 && btnCanClick && !archived && !shieldFlag)
    return (
      <>
        <CommonButton ticketId={ticketId} />
        {isShow && (
          <LookBtns
            {...this.props}
            isReceiveTicket={this.state.isReceiveTicket}
            changeReceiveTicket={this.changeReceiveTicket}
          />
        )}
      </>
    )
  }
}

export default DetailButton
