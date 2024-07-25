import React, { Component } from 'react'
import { Modal, Table } from '@uyun/components'
class ResourceConflict extends Component {
  render () {
    const { conflictData } = this.props
    const conflictArr = []
    if (conflictData.ciSourceVO) {
      const tabData = conflictData.ciSourceVO.baseLineList
      _.map(tabData, (data, index) => {
        const key = Object.keys(data)[0]
        if (key === 'owner') {
          let owners = ''
          _.map(data.owner, owner => {
            owners += owner.name + ' '
          })
          conflictArr.push({
            id: `${index}1`,
            name: i18n('ticket.create.owner', '负责人'),
            data1: owners,
            data2: conflictData.ciSourceVO.originalList[index].owner[0].name
          })
        } else if (key === 'name') {
          conflictArr.push({
            id: `${index}2`,
            name: i18n('ticket.create.name', '配置项名称'),
            data1: data.name,
            data2: conflictData.ciSourceVO.originalList[index].name
          })
        } else if (key === 'desc') {
          conflictArr.push({
            id: `${index}3`,
            name: i18n('ticket.create.desc', '描述'),
            data1: data.desc,
            data2: conflictData.ciSourceVO.originalList[index].desc
          })
        }
      })
    }
    /**
     * 冲突相对比表格
     * @type {Array}
     */
    const columns1 = [
      {
        title: i18n('ticket.create.colName', '属性名称'),
        render: (text, record) => {
          return (<span>{record.name}</span>)
        }
      },
      {
        title: i18n('ticket.create.base', '基础值'),
        render: (text, record) => {
          return (<span>{record.data1}</span>)
        }
      },
      {
        title: i18n('ticket.create.original', '原始值'),
        render: (text, record) => {
          return (<span>{record.data2}</span>)
        }
      }
    ]
    return (
      <Modal
        title={i18n('ticket.form.resource.conflict', '冲突明细')}
        visible={!_.isEmpty(conflictData)}
        onCancel={this.props.conflictClose}
        width={640}
        footer={null}>
        {
          !_.isEmpty(conflictData) &&
          <Table
            rowKey={record => record.id}
            columns={columns1}
            pagination={false}
            dataSource={conflictArr}
          />
        }
      </Modal>
    )
  }
}

export default ResourceConflict
