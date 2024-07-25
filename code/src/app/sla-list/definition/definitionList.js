import React, { Component } from 'react'
import classnames from 'classnames'
import { withRouter } from 'react-router-dom'
import { PlusOutlined } from '@uyun/icons'
import { Modal, Spin, Button, Tooltip } from '@uyun/components'
import { inject, observer } from 'mobx-react'
import { renderPriority, renderUnit, renderPriorityColor, renderPrioritytype } from '../common'
@inject('definitionStore')
@withRouter
@observer
class DefinitionIndex extends Component {
  handleDelete = (id) => {
    Modal.confirm({
      title: i18n('sla-delete-definition-tip', '您是否确认要删除该SLA协议？'),
      onOk: async () => {
        await this.props.definitionStore.deleteSlaDefinitionItem(id)
        this.props.definitionStore.getSLACount()
        this.props.definitionStore.getSlaDefinitionList()
      }
    })
  }

  enterDetail = (id) => {
    this.props.history.push(`/conf/sla/definition/detail/${id}`)
  }

  render() {
    const { list, loading } = this.props.definitionStore
    const { slaInsert, slaDelete } = this.props
    return (
      <Spin delay={300} spinning={loading}>
        {slaInsert ? (
          <div
            className="sla-definition-list-title"
            onClick={() => {
              this.props.history.push('/conf/sla/definition/create')
            }}
          >
            <PlusOutlined />
            <div>{i18n('sla_add_definition', '新增SLA')}</div>
          </div>
        ) : null}
        {_.map(list, (item) => {
          const { priority, time, unit, can_delete, name, id, isShared, sharedBusinessUnitName } =
            item
          return (
            <div className="sla-definition-list-wrap" key={id} onClick={() => this.enterDetail(id)}>
              <div className="top">
                <Button
                  style={{ cursor: 'default' }}
                  size="small"
                  ghost
                  type={renderPrioritytype(priority)}
                >
                  {renderPriority(priority)}
                </Button>
                <span className="top_title">{name}</span>
              </div>
              <div className="bottom">
                <i className="iconfont icon-bulb" />
                <span className="bottom_time">{`${i18n(
                  'ticket.sla.label1',
                  '约定时间'
                )}：${time} ${renderUnit(unit)}`}</span>
              </div>
              <div className="left" style={{ background: renderPriorityColor(priority) }} />
              {slaDelete ? (
                <i
                  className={classnames('iconfont', 'icon-shanchu', {
                    'no-candel': can_delete !== 1
                  })}
                  onClick={(e) => {
                    e.stopPropagation()
                    e.nativeEvent.stopImmediatePropagation()
                    if (can_delete !== 1) {
                      return false
                    }
                    this.handleDelete(id)
                  }}
                />
              ) : null}
              {sharedBusinessUnitName ? (
                <Tooltip title={`${i18n('from', '来自')}${sharedBusinessUnitName}`}>
                  <i className="iconfont icon-fenxiangjiaobiao" />
                </Tooltip>
              ) : null}
            </div>
          )
        })}
      </Spin>
    )
  }
}

export default DefinitionIndex
