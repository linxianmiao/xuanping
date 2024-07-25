import React from 'react'
import { Popover, Steps } from '@uyun/components'
import ExucuterList from './ExucuterList'
import { withRouter } from 'react-router-dom'

const Step = Steps.Step

@withRouter
export default class ProcessMessage extends React.Component {
    LinkTo = item => {
      this.props.history.push({
        pathname: `/ticket/detail/${item.ticket_id}`,
        state: {
          from: location.hash,
          title: item ? item.subject : ''
        }
      })
    }

    handleLinkToAuto = autoUrl => {
      window.open(window.location.origin + autoUrl)
    }

    render () {
      const { status, exucuter, hasChild, hasChildTicket, childStatus, tacheType, autoUrl } = this.props
      const subModel = (
        this.props.childTicket
          ? _.map(this.props.childTicket, (item, i) => {
            return (
              <div className="prop-content" key={i}>
                <p className="prop-content-title">
                  <a key={item.ticket_id} onClick={() => this.LinkTo(item)}>{item ? item.subject : ''}</a>
                </p>
                <p className="prop-content-status">
                  {item.cur_status === 1 || item.cur_status === 2
                    ? i18n('ticket.detail.unfinish', '未完成')
                    : item.cur_status === 7
                      ? i18n('ticket.detail.cloesd', '已关闭')
                      : item.cur_status === 11
                        ? i18n('ticket.detail.abolished', '已废除')
                        : i18n('ticket.detail.finished', '已完成')}
                </p>
                <p className="prop-content-executor" style={{ maxWidth: '152px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.executor
                    ? i18n('ticket.list.excutors', '处理人') + ': ' + item.executor.userName
                    : ''}
                </p>
                <p className="prop-content-executor" style={{ maxWidth: '152px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.userGroup
                    ? i18n('ticket.list.screen.executGroup', '处理组') + ': ' + item.userGroup
                    : ''}
                </p>
              </div>
            )
          }) : null
      )
      return (
        <div className="desc-sub-model">
          <div className="desc">
            <p>{status}</p>
            {
              autoUrl
                ? <a onClick={() => this.handleLinkToAuto(autoUrl)}
                >{i18n('ticket.detail.history', '作业历史')}</a>
                : tacheType !== 1 && <ExucuterList users={exucuter} />
            }
          </div>

          {hasChild
            ? <div className="subProcess">
              { subModel
                ? <Popover
                  overlayClassName="sub-node-desc-pro"
                  content={subModel}
                  trigger="hover"
                  placement="topLeft"
                >
                  <Steps>
                    <Step title={i18n('ticket.list.SubProcess', '子流程')}
                      status="finish"
                      className={hasChildTicket ? 'hasticket' : 'noticket'}
                      icon={
                        hasChildTicket
                          ? childStatus === 1 || childStatus === 2
                            ? 'clock-circle-o'
                            : 'check-circle'
                          : 'minus-circle-o'
                      }
                    />
                    {/* 不能删除，setp至少要两步 横向的， 不然会报错 */}
                    <Step className="hide" title={i18n('ticket.list.thirdStep', '第三步')} />
                  </Steps>
                </Popover>
                : <Steps>
                  <Step title={i18n('ticket.list.SubProcess', '子流程')}
                    className={hasChildTicket ? 'hasticket' : 'noticket'}
                    icon={
                      hasChildTicket
                        ? childStatus === 1
                          ? 'clock-circle-o'
                          : 'check-circle'
                        : 'minus-circle-o'
                    }
                  />
                  {/* 不能删除，setp至少要两步 横向的， 不然会报错 */}
                  <Step className="hide" title={i18n('ticket.list.thirdStep', '第三步')} />
                </Steps>
              }
            </div> : null
          }
        </div>
      )
    }
}
