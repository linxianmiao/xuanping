import React, { Component } from 'react'
import { Modal, Button, Table, Popover } from '@uyun/components'
import { getactionTypetoLable } from '../../details/util'
import ConflictTable from './table'
import './styles/index.less'
class Conflict extends Component {
  constructor (props) {
    super(props)

    const conflictList = _.cloneDeep(this.props.conflictResponse.changeList)
    // 初始化加上 个 选中状态
    _.forEach(conflictList, item => {
      item.selected = item.currentValue
    })

    this.state = {
      conflictList: conflictList
    }
  }

  // 取消冲突 弹窗
    conflictModalCancel = () => {
      this.props.conflictModalCancel()
    }

    // 点击突出的内容（是否选中他值还是我值）
    handleLabelName = (val, key) => {
      const { conflictList } = this.state
      conflictList.forEach((item, index) => {
        if (index === key) {
          item.selected = val
        }
      })
      this.setState({
        conflictList
      })
    }

    // 确认提交
    handleOk = () => {
      const data = _.cloneDeep(this.state.conflictList)
      const newData = {}
      data.forEach(item => {
        newData[`${item.code}`] = item.selected
      })

      this.props.handleOk(_.assign({}, this.props.message, { form: newData }), 'conflict')
      this.props.conflictModalCancel()
    }

    getcolumns = () => {
      return [{
        title: i18n('ticket.conflict.field', '字段'),
        dataIndex: 'fieldName',
        key: 'fieldName'
      }, {
        title: `${this.props.conflictResponse.updateUser.userName}${i18n('ticket.conflict.value', '的值')}`,
        dataIndex: 'originLabel',
        key: 'originLabel',
        render: (text, record, index) => {
          return (
            <a
              className={record.selected === record.originValue ? 'selected label' : 'label'}
              onClick={() => { this.handleLabelName(record.originValue, index) }}>
              {
                record.fieldType === 'richText' &&
                <Popover
                  content={
                    <div
                      className="form-rich-text"
                      dangerouslySetInnerHTML={{ __html: record.originValue }}
                    />
                  }
                  trigger="hover"
                  overlayClassName="popover_conflict"
                  placement="bottom"
                  getTooltipContainer={() => document.getElementById('conflict')}>
                  <i className="iconfont icon-fuwenben" />
                </Popover>
              }
              {
                record.fieldType === 'table' &&
                <Popover
                  content={
                    <ConflictTable
                      dataSource={!_.isEmpty(record.originValue) ? record.originLabel : []}
                      params={!_.isEmpty(record.params) ? record.params : []}
                    />
                  }
                  trigger="hover"
                  overlayClassName="popover_conflict"
                  getTooltipContainer={() => document.getElementById('conflict')}
                >
                  <i className="iconfont icon-table" />
                </Popover>
              }
              {
                ['table', 'richText'].indexOf(record.fieldType) === -1 && text
              }
            </a>
          )
        }
      }, {
        title: i18n('ticket.conflict.myValue', '我的值'),
        dataIndex: 'currentLabel',
        key: 'currentLabel',
        render: (text, record, index) => {
          return (
            <a
              className={record.selected === record.currentValue ? 'selected label' : 'label'}
              onClick={() => { this.handleLabelName(record.currentValue, index) }}>
              {
                record.fieldType === 'table' &&
                <Popover
                  content={
                    <ConflictTable
                      dataSource={!_.isEmpty(record.currentLabel) ? record.currentLabel : []}
                      params={!_.isEmpty(record.params) ? record.params : []}
                    />
                  }
                  trigger="hover"
                  overlayClassName="popover_conflict"
                  getTooltipContainer={() => document.getElementById('conflict')}
                >
                  <i className="iconfont icon-table" />
                </Popover>
              }
              {
                record.fieldType === 'richText' &&
                <Popover
                  content={
                    <div
                      className="form-rich-text"
                      dangerouslySetInnerHTML={{ __html: record.currentValue }}
                    />
                  }
                  trigger="hover"
                  overlayClassName="popover_conflict"
                  placement="bottom"
                  getTooltipContainer={() => document.getElementById('conflict')}
                >
                  <i className="iconfont icon-fuwenben" />
                </Popover>
              }
              {
                ['table', 'richText'].indexOf(record.fieldType) === -1 && text
              }

            </a>
          )
        }
      }]
    }

    render () {
      const actionType = getactionTypetoLable(this.props.conflictResponse.conflictActionType)
      return (
        <div>
          <Modal
            title={i18n('ticket.conflict.tip', '工单内容冲突提醒')}
            visible={this.props.visible}
            onOk={this.handleOk}
            onCancel={this.conflictModalCancel}
            footer={''}
            width={600}
            wrapClassName="mymodelstyle conflict">
            <div className="choose-modal" id="conflict">
              <div className="choose-field">
                <p className="p_tip">
                  { i18n('ticket.conflict.during', '处理工单期间') }
                  <span className="userName">
                    {' '}{this.props.conflictResponse.updateUser && this.props.conflictResponse.updateUser.userName}{' '}
                  </span>
                  { i18n('ticket.conflict.yi', '已') }
                  {this.props.conflictResponse.conflictActionType !== 6
                    ? actionType + i18n('ticket.conflict.ticket', '工单，')
                    : actionType // 接单 不显示 后面 ‘工单’ 文案
                  }
                  {
                    this.props.conflictResponse.isAllowed !== 1 &&// 是否能提交了 1 可以提交
                    i18n('ticket.conflict.cannot', '你已无法再提交工单，')
                  }
                  { i18n('ticket.conflict.haveConflicts', '以下字段存在冲突。') }
                </p>
                {
                  this.props.conflictResponse.isAllowed === 1 && // 是否能提交了 1 可以提交
                  <p>{ i18n('ticket.conflict.select', '您可再次选择需要提交的字段值，或取消后重新编辑。')}</p>
                }
                <Table
                  dataSource={this.state.conflictList}
                  columns={this.getcolumns()}
                  pagination={false}
                />
              </div>
              {/* 是否能提交了 1 可以提交 */}
              {this.props.conflictResponse.isAllowed === 1 &&
              <div className="footer">
                <Button type="primary" onClick={this.handleOk}>
                  { i18n('globe.submit', '提交') }
                </Button>
                <Button type="primary" onClick={this.conflictModalCancel}>
                  { i18n('globe.cancel', '取消') }
                </Button>
              </div>
              }
            </div>
          </Modal>
        </div>
      )
    }
}

export default Conflict
