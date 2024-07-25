import React from 'react'
import { Steps, Modal } from '@uyun/components'
import ParallelGroup from './ParallelGroup'
import { counterSingArray, getClassAndState, getAutoClassAndState } from './util'
import { withRouter } from 'react-router-dom'
import ProcessMessage from './ProcessMessage'
import './style/process.less'
import classnames from 'classnames'
const Step = Steps.Step

@withRouter
export default class Process extends React.Component {
    LinkTo = item => {
      this.props.history.push({
        pathname: `/ticket/detail/${item.id}`,
        state: {
          from: location.hash,
          title: item.title
        }
      })
    }

    render () {
      const { visible } = this.props
      const { processList, detail } = this.props
      return (
        <Modal className="detail-process-modal" visible={visible} onCancel={this.props.hideModal} footer={null}>
          {detail && detail.father
            ? <div style={{ width: '40%', margin: '0 auto' }}>
              <a onClick={() => this.LinkTo(detail.father)}>
                <div className="circle"><span className="name">{i18n('ticket.detail.main_process', '主流程')}</span></div>
                <div className="bottom">
                  <i className="iconfont icon-lianjiexian" />
                </div>
              </a></div> : null
          }
          <Steps iconPrefix="uy" direction="vertical">
            {processList && processList.map((li, index) => {
              const {
                name, exector, counterSign, status, activityModels, parallelismNode,
                hasChildTicket, child_ticket, child_status, tacheType, autoUrl, jobStatus
              } = li
              // 状态对应类名及名称
              const { statusClass, statusName } = tacheType === 3 ? getAutoClassAndState(jobStatus) : getClassAndState(status)
              // 是否含有子流程对应class
              const cls = classnames({
                spead: activityModels.length > 0 && status === 10,
                'desc-sub-model': activityModels.length > 0
              })
              // 流程标题
              const title = tacheType === 1 ? `${name}(${i18n('ticket.detail.parallel', '并行')})` : name + (counterSign ? `(${counterSingArray[counterSign]})` : '')
              return <Step
                key={index}
                status={statusClass}
                className={cls}
                title={<ParallelGroup title={title} tacheType={tacheType} parallelismNode={parallelismNode} />}
                description={<ProcessMessage
                  autoUrl={autoUrl}
                  status={statusName}
                  exucuter={exector}
                  tacheType={tacheType}
                  hasChild={!!(activityModels && activityModels.length > 0)}
                  hasChildTicket={hasChildTicket}
                  childTicket={child_ticket}
                  childStatus={child_status}
                  index={index} />} />
            })}
          </Steps>
        </Modal>
      )
    }
}
