import React from 'react'
import { TeamOutlined } from '@uyun/icons'
import { Row, Col, Tooltip, Tag, Collapse, Popover } from '@uyun/components'
import UserContent from './UserContent'
import CurrentTache from './CurrentTache'
import AlertDetailDrawer from './AlertDetailDrawer'
import SrvCatInfo from './SrvcatInfo'
import { getStatusColor } from '../../ticket-list/others/component/common/util'
import moment from 'moment'
import { getOlaOverdueName, getSlaOverdueName, msToTime } from '~/logic/olaAndSla'
import UserNameWithTip from '~/ticket/log/UserNameWithTip'
import './index.less'
const Panel = Collapse.Panel
export default class DetailList extends React.Component {
  state = {
    userList: [],
    pageNum: 1,
    pageSize: 20,
    groupId: '',
    count: 0,
    canLoad: true,
    alertDetailVisible: false, // 告警详情侧滑
    counterSignUserAndGroups: []
  }

  handleCounterIconClick = async () => {
    if (this.state.counterSignUserAndGroups.length === 0) {
      const { caseId, tacheId } = this.props.formList
      const params = { caseId, activityId: tacheId }
      const res = await axios.get(API.queryCounterSignUserAndGroups, { params })

      this.setState({
        counterSignUserAndGroups: res || []
      })
    }
  }

  handleScroll = (e) => {
    const { count, pageNum, pageSize, canLoad } = this.state
    let scrollTop = 0
    let scrollHeight = 0
    let offsetHeight = 0
    scrollTop = e.srcElement.scrollTop
    scrollHeight = e.srcElement.scrollHeight
    offsetHeight = e.srcElement.offsetHeight
    if (
      offsetHeight + scrollTop + 100 >= scrollHeight &&
      (pageNum - 1) * pageSize <= count &&
      canLoad
    ) {
      this.timer && clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.getUserByGroupId()
      }, 500)
    }
  }

  onVisibleChange = (visible, id) => {
    if (visible) {
      this.setState(
        {
          groupId: id,
          pageNum: 1
        },
        () => {
          this.getUserByGroupId()
        }
      )
    } else {
      this.setState({
        pageNum: 1,
        groupId: '',
        userList: []
      })
    }
  }

  getUserByGroupId = () => {
    this.setState({
      canLoad: false
    })
    const { pageNum, pageSize, groupId } = this.state
    const data = {
      groupId,
      pageNum,
      pageSize
    }
    if (groupId) {
      axios.get(API.get_users_by_group_id, { params: data }).then((res) => {
        if (data.pageNum !== 1) {
          this.setState({
            canLoad: true,
            count: res.count,
            pageNum: pageNum + 1,
            userList: [...this.state.userList, ...res.list]
          })
        } else {
          this.setState({
            canLoad: true,
            count: res.count,
            pageNum: pageNum + 1,
            userList: res.list
          })
        }
      })
    }
  }

  changeGroup = (id) => {
    this.setState(
      {
        groupId: id,
        pageNum: 1,
        userList: []
      },
      () => {
        this.getUserByGroupId()
      }
    )
  }

  render() {
    const {
      modelName,
      createTime,
      ticketNum,
      tacheName,
      status,
      allUserInfos,
      currexcutor,
      userGroupList,
      viewAlertDetailUrl,
      modelDesc,
      source,
      activityType,
      ticketId,
      caseId,
      tacheId,
      isCountersign
    } = this.props.formList
    const { sla: slaInfo, ola: olaInfo } = this.props.olaAndSlaInfo || {}
    const users = _.filter(
      allUserInfos,
      (userInfo) => (currexcutor || '').indexOf(userInfo.userId) > -1
    ) // 用户信息
    const creatorName = _.find(
      allUserInfos,
      (userInfo) => userInfo.userId === this.props.formList.creatId
    )
    const customPanelStyle = {
      borderRadius: 4,
      marginBottom: 0,
      border: 0
    }
    const { userList, alertDetailVisible } = this.state
    const userAndGroup = [...(userGroupList || []), ...(users || [])]
    return (
      <div className="detail-list-wrap">
        <Row className="detail-looks-sheet">
          {/* <Col span={6}><span className="detail-looks-sheet-label">{i18n('tip17', '工单标题')}：</span>
              <div className="detail-looks-sheet-content">
                <Tooltip placement="topLeft" title={title}>{title}</Tooltip>
              </div>
            </Col> */}
          <Col span={6}>
            <span className="detail-looks-sheet-label">
              {i18n('ticket.list.ticketNum', '流水号')}：
            </span>
            <div className="detail-looks-sheet-content">
              <Tag>{ticketNum}</Tag>
            </div>
          </Col>
          <Col span={6}>
            <span className="detail-looks-sheet-label">
              {i18n('ticket.list.ticketProcessName', '工单模型')}：
            </span>
            <div className="detail-looks-sheet-content">
              {modelName}
              {modelDesc && (
                <Tooltip placement="bottomLeft" title={modelDesc}>
                  <i className="icon-jinggao iconfont" />
                </Tooltip>
              )}
            </div>
          </Col>
          <Col span={6}>
            <span className="detail-looks-sheet-label">
              {i18n('ticket.list.currStatus', '当前状态')}：
            </span>
            <div className="detail-looks-sheet-content">{getStatusColor(status).name}</div>
          </Col>
          <Col span={6}>
            <span className="detail-looks-sheet-label">
              {i18n('ticket.list.tacheName', '当前节点')}：
            </span>
            <div className="detail-looks-sheet-content detail-current-tache" id="tache1">
              <CurrentTache
                name={tacheName}
                type={activityType}
                params={{ ticketId, caseId, tacheId }}
              />
            </div>
          </Col>
        </Row>
        <Row className="detail-looks-sheet">
          <Col span={6}>
            <span className="detail-looks-sheet-label">
              {i18n('ticket.list.creatPerson', '创建人')}：
            </span>
            <div className="detail-looks-sheet-content">
              {creatorName ? (
                <UserNameWithTip user={creatorName} source="basic" />
              ) : (
                // ? <Tooltip placement="bottomRight"
                //   title={
                //     <p>
                //       {creatorName.userName} :  {_.compact([creatorName.isCustomer === 1 ? '客户人员' : null, creatorName.mobilePhone, creatorName.email]).join('  |  ')}
                //     </p>
                //   }
                // >
                //   <Tag >{creatorName.userName }</Tag >
                // </Tooltip>
                <div>{this.props.formList.creatorName}</div>
              )}
            </div>
          </Col>
          <Col span={6}>
            <span className="detail-looks-sheet-label">
              {i18n('ticket.list.create_time', '创建时间')}：
            </span>
            <div className="detail-looks-sheet-content">
              {moment(createTime).utc(moment(createTime).zone()).format('YYYY-MM-DD HH:mm:ss')}
            </div>
          </Col>
          <Col span={6}>
            <span className="detail-looks-sheet-label">
              {i18n('ticket.relateTicket.handle', '处理组/人')}：
            </span>
            <div className="detail-looks-sheet-content oldMode" style={{ whiteSpace: 'normal' }}>
              {_.map(userAndGroup, (item, index) => {
                if (index < 2) {
                  // 有userId是用户
                  return item.userId ? (
                    // <Tooltip
                    //   placement="bottomRight"
                    //   key={item.userId}
                    //   title={
                    //     <p>
                    //       {item.userName} :  {_.compact([item.department, item.mobilePhone, item.email]).join('  |  ')}
                    //     </p>
                    //   }
                    // >
                    //   <Tag >{item.userName}</Tag >
                    // </Tooltip>
                    <UserNameWithTip user={item} />
                  ) : (
                    <Popover
                      trigger="click"
                      placement="bottom"
                      overlayClassName="popoverClass"
                      key={item.id}
                      onVisibleChange={(visible) => {
                        this.onVisibleChange(visible, item.id)
                      }}
                      content={<UserContent userList={userList} handleScroll={this.handleScroll} />}
                    >
                      <Tag className="group-tag">{item.name}</Tag>
                    </Popover>
                  )
                } else if (index === 2) {
                  return (
                    <Tooltip
                      overlayClassName="collapseContent"
                      placement="bottomLeft"
                      key={item.id || item.userId}
                      trigger="click"
                      onVisibleChange={(visible) => {
                        if (!visible) {
                          this.setState({ userList: [] })
                        }
                      }}
                      title={
                        <Collapse accordion onChange={this.changeGroup}>
                          {_.map(userAndGroup, (item, ind) => {
                            if (ind > 1) {
                              return item.userId ? (
                                <React.Fragment key={item.userId}>
                                  <div style={{ padding: '0 10px' }}>
                                    <i className="iconfont icon-idcard iClass" />
                                    <span className="userNameClass">{item.userName}：</span>
                                    {item.department && (
                                      <span className="userNameClass">
                                        {item.department} <span className="userNameContent" />
                                      </span>
                                    )}
                                    {item.mobilePhone && (
                                      <span className="userNameClass">
                                        {item.mobilePhone}
                                        {item.email && <span className="userNameContent" />}
                                      </span>
                                    )}
                                    {item.email && (
                                      <span className="userNameClass">{item.email}</span>
                                    )}
                                  </div>
                                </React.Fragment>
                              ) : (
                                <Panel header={item.name} key={item.id} style={customPanelStyle}>
                                  <UserContent
                                    userList={userList}
                                    handleScroll={this.handleScroll}
                                  />
                                </Panel>
                              )
                            }
                          })}
                        </Collapse>
                      }
                    >
                      <Tag className="group-tag">...</Tag>
                    </Tooltip>
                  )
                }
              })}
              {isCountersign === 1 && (
                <Tooltip
                  title={
                    <div>
                      <div>当前会签人/组:</div>
                      {this.state.counterSignUserAndGroups.map((item) => item.name).join(', ')}
                    </div>
                  }
                  onVisibleChange={(v) => {
                    if (v) {
                      this.handleCounterIconClick()
                    }
                  }}
                >
                  <TeamOutlined style={{ cursor: 'pointer' }} />
                </Tooltip>
              )}
            </div>
          </Col>
        </Row>
        {!!viewAlertDetailUrl && (
          <Row className="detail-looks-sheet">
            <Col span={6}>
              <span className="detail-looks-sheet-label">{i18n('alert.detail', '告警详情')}：</span>
              <div className="detail-looks-sheet-content">
                <a onClick={() => this.setState({ alertDetailVisible: true })}>
                  {i18n('watch', '查看')}
                </a>
              </div>
            </Col>
          </Row>
        )}
        {source === 'srvcat' && <SrvCatInfo serviceData={this.props.serviceData} />}
        {!!slaInfo && slaInfo.overdueStatus !== 0 && (
          <Row className="detail-looks-sheet">
            <Col span={6}>
              <span className="detail-looks-sheet-label">SLA状态：</span>
              <div className="detail-looks-sheet-content">
                <span className="ticket-list-table-th-status">
                  <i style={{ background: slaInfo?.markColor }} />
                </span>
                <span className="overdue-message">
                  {`${getSlaOverdueName(slaInfo.overdueStatus)}: ${msToTime(slaInfo.overdueTime)}`}
                </span>
              </div>
            </Col>
          </Row>
        )}
        {!!olaInfo && olaInfo.overdueStatus === 2 && (
          <Row className="detail-looks-sheet">
            <Col span={6}>
              <span className="detail-looks-sheet-label">OLA状态：</span>
              <div className="detail-looks-sheet-content">
                <span className="ticket-list-table-th-status">
                  <i style={{ background: olaInfo?.markColor }} />
                </span>
                <span className="overdue-message">
                  {`${getOlaOverdueName(olaInfo.overdueStatus)}: ${olaInfo.overdueTime}`}
                </span>
              </div>
            </Col>
          </Row>
        )}

        <AlertDetailDrawer
          visible={alertDetailVisible}
          url={viewAlertDetailUrl}
          onClose={() => this.setState({ alertDetailVisible: false })}
        />
      </div>
    )
  }
}
