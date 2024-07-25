import React, { Component } from 'react'
import ChangeList from './changeList'
import moment from 'moment'
import { PaperClipOutlined } from '@uyun/icons'
import { Timeline, Tooltip, Row, Col, Empty } from '@uyun/components'
import DetailDrawer from '~/details/DetailDrawer'
import ApproveUserList from './ApproveUserList'
import UserNameWithTip from './UserNameWithTip'

class RecordList extends Component {
  state = {
    subDetailRoute: null,
    subDetailTitle: ''
  }

  handleSubDetailShow = (item) => {
    const { title, ticketId, activityId, caseId } = item
    const subDetailRoute = {
      location: {
        pathname: `/ticket/detail/${ticketId}`,
        search: `?tacheId=${activityId}&caseId=${caseId}`
      },
      match: {
        params: { id: ticketId }
      }
    }
    this.setState({
      subDetailRoute,
      subDetailTitle: title
    })
  }

  handleSubDetailClose = () => {
    this.setState({
      subDetailRoute: null,
      subDetailTitle: ''
    })
  }

  getReviewersInfo = (reviewers) => {
    if (_.isEmpty(reviewers)) {
      return []
    }
    return this.props.userInfos
      .map((user) => {
        const reviewer = reviewers.find((v) => v.reviewer === user.userName)
        if (reviewer) {
          return {
            ...user,
            state: reviewer.state
          }
        }
        return null
      })
      .filter(Boolean)
  }

  renderTooltip = (exectorName = {}) => {
    // return email
    //   ? <div>
    //     <div><i className="iconfont icon-idcard iClass" />{department}</div>
    //     <div><i className="iconfont icon-phone iClass" />{mobilePhone}</div>
    //     <div><i className="iconfont icon-mail iClass" />{email}</div>
    //   </div> : null
    return (
      <p>
        {exectorName.userName} :{' '}
        {_.compact([
          exectorName.isCustomer === 1 ? '客户人员' : null,
          exectorName.mobilePhone,
          exectorName.email
        ]).join('  |  ')}
      </p>
    )
  }

  renderContent = (record) => {
    const {
      actionType,
      showToUser,
      ticketAdvice,
      simpleTicketInfos,
      toUserList,
      approver,
      addSignNode,
      toUser,
      fileName,
      crossRemoteTicket = '',
      toUserNames,
      actionTypeOriginal
    } = record
    const { userInfos } = this.props
    // const users = _.filter(userInfos, user => (toUserList || []).indexOf(user.userId) > -1)
    const users = _.map(toUserList, (userId) => userInfos.find((user) => user.userId === userId))
    const exectorName = _.find(
      userInfos,
      (user) => user.userName === record.exectorName || user.userName === approver
    ) || { userName: record.exectorName || approver || i18n('ticket.log.system', '系统') }

    if (actionType === '定时器' || actionType === 'actiontype.timing') {
      return <div>{ticketAdvice}</div>
    }

    if (
      actionType === '合并工单' ||
      actionType === 'merge ticket' ||
      actionType === '移除合并单' ||
      actionType === 'remove mergeTicket'
    ) {
      return (
        <span>
          {/* <Tooltip title={this.renderTooltip(exectorName)}>
            <span>{exectorName.userName}</span>
          </Tooltip> */}
          <UserNameWithTip
            user={exectorName}
            source="record"
            crossRemoteTicket={crossRemoteTicket}
          />
          {actionType}
          {simpleTicketInfos
            ? simpleTicketInfos.map((item, index) => {
                return (
                  <span>
                    {index > 0 && <span>{', '}</span>}
                    <a onClick={() => this.handleSubDetailShow(item)}>{item.title}</a>
                  </span>
                )
              })
            : null}
        </span>
      )
    }

    if (
      actionType === '被主单合并' ||
      actionType === 'merged by ticket' ||
      actionType === '被主单移除' ||
      actionType === 'removed by mergeTicket' ||
      actionType === '被主单关闭' ||
      actionType === 'closed by ticket' ||
      actionType === '被主单重开' ||
      actionType === 'reopened by ticket'
    ) {
      const mainTicket = simpleTicketInfos && simpleTicketInfos[0]
      if (!mainTicket) {
        return <span>{actionType}</span>
      }
      return (
        <span>
          {actionType}
          {!!mainTicket && (
            <span>
              (<a onClick={() => this.handleSubDetailShow(mainTicket)}>{mainTicket.title}</a>)
            </span>
          )}
        </span>
      )
    }

    if (
      actionType === '发起远程工单' ||
      actionType === 'create remote ticket request' ||
      actionType === '拒绝远程工单' ||
      actionType === 'reject remote ticket request' ||
      actionType === '完成远程工单' ||
      actionType === 'complete remote ticket request' ||
      actionType === '受理远程工单' ||
      actionType === 'accept remote ticket request'
    ) {
      return (
        <span>
          {/* <Tooltip title={this.renderTooltip(exectorName)}>
            <span>{exectorName.userName}</span>
          </Tooltip> */}
          <UserNameWithTip
            user={exectorName}
            source="record"
            crossRemoteTicket={crossRemoteTicket}
          />
          {actionType}
        </span>
      )
    }

    if (
      actionType === '上传附件' ||
      actionType === 'file upload' ||
      actionType === '删除附件' ||
      actionType === 'file delete'
    ) {
      return (
        <span>
          {/* <Tooltip title={this.renderTooltip(exectorName)}>
            <span>{exectorName.userName}</span>
          </Tooltip> */}
          <UserNameWithTip
            user={exectorName}
            source="record"
            crossRemoteTicket={crossRemoteTicket}
          />
          {fileName ? (
            <>
              {actionType} ：<PaperClipOutlined /> {fileName}
            </>
          ) : null}
        </span>
      )
    }

    /**
     * showToUser
     * 0:某人操作
     * 1:操作给某人
     * 2:接单，不需要后置某人
     */
    if (showToUser === 0) {
      return (
        <span style={{ wordBreak: 'break-all' }}>
          {/* <Tooltip title={this.renderTooltip(exectorName)}>
            <span>{exectorName.userName}</span>
          </Tooltip> */}
          <UserNameWithTip
            user={exectorName}
            source="record"
            crossRemoteTicket={crossRemoteTicket}
          />
          {(() => {
            if (actionType === '加签' || actionType === 'addSign') {
              return ` ${actionType}${i18n('ticket.record.node', '了环节 ')}${addSignNode}`
            } else if (
              actionType === '增加会签人' ||
              actionType === 'addSign' ||
              actionTypeOriginal === 36
            ) {
              return ' ' + actionType + ' ' + toUser
            } else if (actionType === '跳过自动节点') {
              return ' ' + actionType
            } else {
              return ' ' + actionType + i18n('ticket.record.over', '了工单')
            }
          })()}
        </span>
      )
    }
    if (showToUser === 1) {
      return (
        <span>
          {' ' + actionType + i18n('ticket.record.toOther', '了工单给 ')}
          {!!record.toGroup &&
            record.toGroup.split(',').map((groupName, index) => {
              return (
                <span>
                  {index > 0 ? ', ' : ''}
                  {groupName}
                </span>
              )
            })}
          {/* {!_.isEmpty(_.compact(users)) &&
            _.map(_.compact(users), (user, index) => (
              <UserNameWithTip user={user} source="record" record={record} index={index} />
            ))} */}
          {crossRemoteTicket === '1'
            ? !_.isEmpty(toUserNames) &&
              _.map(toUserNames, (name, index) => {
                return (
                  <span>
                    {index > 0 ? ', ' : ''}
                    {name}
                  </span>
                )
              })
            : !_.isEmpty(_.compact(users)) &&
              _.map(_.compact(users), (user, index) => (
                <UserNameWithTip
                  user={user}
                  source="record"
                  record={record}
                  index={index}
                  crossRemoteTicket={crossRemoteTicket}
                />
              ))}
        </span>
      )
    }
    if (showToUser === 2) {
      return (
        <span>
          {/* <Tooltip title={this.renderTooltip(exectorName)}>
            <span>{exectorName.userName}</span>
          </Tooltip> */}
          <UserNameWithTip
            user={exectorName}
            source="record"
            crossRemoteTicket={crossRemoteTicket}
          />
          {' ' + actionType}
        </span>
      )
    }

    return null
  }

  render() {
    const { subDetailRoute, subDetailTitle } = this.state
    const { showEditContent, onlyShowAdvice } = this.props
    let activityTaskVoList
    if (onlyShowAdvice) {
      activityTaskVoList = _.filter(this.props.activityTaskVoList, (item) => {
        return item.showAdvice === 1 && item.ticketAdvice
      })
    } else {
      activityTaskVoList = this.props.activityTaskVoList
    }
    if (_.isEmpty(activityTaskVoList)) {
      return <Empty type="table" />
    }

    return (
      <>
        <div className="record-list">
          <Timeline>
            {_.map(activityTaskVoList, (item, index) => {
              const exectorName = _.find(
                this.props.userInfos,
                (user) =>
                  (item?.exectorId
                    ? user.userId === item?.exectorId
                    : user.userName === item.exectorName) || user.userName === item.approver
              ) || { userName: item.exectorName || item.approver || '' }
              // 审阅人
              const reviewers = this.getReviewersInfo(item.approveVoList)
              return (
                <Timeline.Item key={index}>
                  <div className="record-wrap">
                    <div className="record-time">
                      <p>{moment(item.exectorTime).format('YYYY/MM/DD')}</p>
                      <p>{moment(item.exectorTime).format('HH:mm')}</p>
                    </div>
                    <div className="record-content">
                      <Row>
                        <Col span={4}>
                          <div className="record-name">
                            {item.remoteNodeName ? item.remoteNodeName + '-' : ''}
                            {item.activityName || item.tacheName}
                          </div>
                        </Col>
                        <Col span={2}>
                          <UserNameWithTip
                            user={exectorName}
                            crossRemoteTicket={item?.crossRemoteTicket || ''}
                          />
                          <ApproveUserList users={reviewers} renderNameTip={this.renderTooltip} />
                        </Col>
                        <Col span={2} style={{ marginTop: 1 }}>
                          {item.flowName ||
                            item.actionType ||
                            i18n('conf.model.proces.approval', '审批')}
                        </Col>
                        <Col span={5}>
                          {this.renderContent(item)}
                          {!_.isEmpty(item.approveVoList) ? (
                            <div className="approve-item">
                              <div className="approve-list">
                                {item.approveVoList.map((item1, index) => {
                                  return (
                                    <div key={index}>
                                      {item1.state === 1 ? (
                                        <div className="approve-rst">
                                          <span className="approve-suggestion">
                                            {`${i18n('review.comments', '审阅意见')} : ${
                                              item1.suggestion ? item1.suggestion : ''
                                            }`}
                                          </span>
                                        </div>
                                      ) : null}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          ) : null}
                        </Col>
                        <Col span={4}>
                          {item.showAdvice === 1 && item.ticketAdvice && (
                            <div className="row clearfix">
                              <div style={{ float: 'left' }}>
                                {/* {
                                      item.actionType === i18n('conf.model.proces.approval', '审批')
                                        ? `${i18n('ticket.record.approvalAdvice', '审批意见')} : `
                                        : `${i18n('ticket.record.advice', '处理意见')} : `
                                    } */}
                              </div>
                              <div
                                style={{ float: 'left' }}
                                className="ticketAdvice"
                                dangerouslySetInnerHTML={{ __html: item.ticketAdvice }}
                              />
                            </div>
                          )}
                        </Col>
                        <Col span={4}>{item.timeSpent}</Col>
                        <Col span={3}>
                          {showEditContent
                            ? item.containChange && (
                                <ChangeList record={item} ticketId={this.props.ticketId} />
                              )
                            : '--'}
                        </Col>
                      </Row>
                    </div>
                  </div>
                </Timeline.Item>
              )
            })}
          </Timeline>
        </div>

        <DetailDrawer
          visible={!!subDetailRoute}
          title={subDetailTitle}
          detailRoute={subDetailRoute}
          onClose={this.handleSubDetailClose}
        />
      </>
    )
  }
}

export default RecordList
