import React, { Component } from 'react'
import { toJS } from 'mobx'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { Tag, Pagination } from '@uyun/components'
import { CloseCircleOutlined } from '@uyun/icons'
import Table from './Table'
import { DEFAULT_COLUMN_KEYS, LIFECYCLESTATE, getStatusName } from './logic'
import styles from './index.module.less'
import _ from 'lodash'

class ResourceTableWrap extends Component {
  static contextTypes = {
    ticketSource: PropTypes.string
  }

  renderAttributeOrCustomColumn = (value, col) => {
    if (col.code === 'responsible') {
      return _.map(value, (tex) => tex.name).join(',')
    } else if (col.code === 'manager') {
      if (typeof value === 'string') {
        return value
      }
      return _.map(value, (tex) => {
        if (tex.name) {
          return tex.name
        }
        return tex.realname
      }).join(',')
    } else if (col.code === 'lifecycleState') {
      return <span>{LIFECYCLESTATE[value]}</span>
    } else if (
      ['brand', 'contractInfo', 'maintenanceInfo', 'soruce', 'vendor'].indexOf(col.code) > -1
    ) {
      return <span>{value ? value.name : ''}</span>
    } else if (Array.isArray(value)) {
      return _.chain(value)
        .map((item) => item.name || item.realname || item)
        .toString()
        .value()
    } else {
      return <span>{value && typeof value === 'object' ? value.name : value}</span>
    }
  }

  getColumns = () => {
    const { field, disabled, permission } = this.props
    const { edit, increased, planDelete } = field.useScene
    const columns = [
      {
        title: i18n('ticket.create.type', '类型'),
        dataIndex: 'className',
        key: 'className',
        width: 120
      },
      {
        title: i18n('ticket.create.name', '名称'),
        width: 120,
        key: 'name',
        render: (text, record) => {
          const clsName = classnames({
            'resource-show-cmdb-item': !_.includes(['7'], record.status)
          })
          return (
            <span
              className={clsName}
              onClick={() => !_.includes(['7'], record.status) && this.props.showCMDB(record)}
            >
              {record.name}
            </span>
          )
        }
      }
      // {
      //   title: i18n('ticket.create.uploadValid', '导入校验'),
      //   width: 120,
      //   dataIndex: 'sandboxImportInfo',
      //   key: 'sandboxImportInfo',
      //   render: (text, record) => {
      //     let errMes = ''
      //     if (text && text.errorData && Array.isArray(text.errorData)) {
      //       errMes = text.errorData.map(d => d.desc).join(',')
      //     }
      //     if (record.resUniqueCheck?.desc) {
      //       errMes += ' ' + record.resUniqueCheck.desc
      //     }
      //     return errMes
      //   }
      // }
    ]

    // 固定列
    field.attributeColumns &&
      field.attributeColumns.forEach((col) => {
        if (col.code !== 'name') {
          columns.push({
            title: col.name,
            width: 120,
            key: col.code,
            dataIndex: col.code,
            render: (text) => this.renderAttributeOrCustomColumn(text, col)
          })
        }
      })

    // 可选列
    field.customColumns &&
      field.customColumns.forEach((col) => {
        if (col.code !== 'name') {
          columns.push({
            title: col.name,
            width: 120,
            key: col.code,
            dataIndex: col.code,
            render: (text) => this.renderAttributeOrCustomColumn(text, col)
          })
        }
      })

    /**
     * 0：已关联，且未到审核环节
     * 1：更新中
     * 2：已生效
     * 3：有冲突
     * 4：已关联，但是已经过了审核阶段
     * 5: 新建配置项中
     * 6: 计划删除
     * 7: 已在配置库中删除
     */
    if (field.formType !== 'ASSET') {
      columns.push({
        title: i18n('ticket.create.resState', '状态'),
        width: 120,
        key: 'status',
        render: (text, record) => {
          const clsName = classnames({
            related: ['0', '4'].indexOf(record.status) !== -1,
            plan_delete: record.status === '6',
            creating: record.status === '5',
            updating: record.status === '1'
          })
          return <span className={clsName}>{getStatusName(record.status)}</span>
        }
      })
    }

    if (field.isRequired !== 2 && !disabled && (edit.type || increased.type || planDelete.type)) {
      columns.push({
        title: i18n('ticket.create.operate', '操作'),
        width: 250,
        key: 'operation',
        fixed: 'right',
        render: (text, record, index) => {
          // 开启了新增入口后同时自动开启复制
          if (record.status === '2' || record.status === '7' || !permission) {
            return null
          }
          let editCMDBPermission = true
          if (this.props.field.checkEditPermission) {
            //开启cmdb编辑权限
            if (record.taskId) {
              //有taskId的在沙箱的数据根据editable控制
              editCMDBPermission = record.editable !== false
            } else {
              //不在沙箱的数据调接口查看编辑权限
              editCMDBPermission = this.props.resourceStore.hasCMDBEditPermission.includes(
                record.id
              )
            }
          }
          return (
            <div className="ticket-resource-operate-btns-wrap">
              {['2', '3', '4', '6', '7'].indexOf(record.status) === -1 &&
                edit &&
                edit.type &&
                editCMDBPermission && (
                  <Tag
                    className={field.isRequired === 2 ? 'disabled' : 'edit'}
                    onClick={() => {
                      if (field.isRequired !== 2) {
                        this.props.editRow(index, record)
                      }
                    }}
                  >
                    {edit.value || i18n('globe.edit', '编辑')}
                  </Tag>
                )}
              {!_.includes(['3', '6', '9', '10'], record.status) && increased.type && (
                <Tag
                  className={field.isRequired === 2 ? 'disabled' : 'copy'}
                  onClick={() => {
                    if (field.isRequired !== 2) {
                      this.props.copyRow(index, record)
                    }
                  }}
                >
                  {i18n('globe.copy', '复制')}
                </Tag>
              )}
              {_.includes(['1', '5'], record.status) && (
                <Tag
                  className={field.isRequired === 2 ? 'disabled' : 'compare'}
                  onClick={() => {
                    if (field.isRequired !== 2) {
                      this.props.compareRow(record)
                    }
                  }}
                >
                  {i18n('globe.compare', '比较')}
                </Tag>
              )}
              {record.status === '0' && planDelete.type && (
                <Tag
                  className={field.isRequired === 2 ? 'disabled' : 'plan_delete'}
                  onClick={() => {
                    if (field.isRequired !== 2) {
                      this.props.planToDelete(index, record)
                    }
                  }}
                >
                  {planDelete.value || i18n('button.delete', '删除')}
                </Tag>
              )}
              {record.status === '3' && (
                <Tag
                  className={field.isRequired === 2 ? 'disabled' : 'edit'}
                  onClick={() => {
                    if (field.isRequired !== 2) {
                      this.props.conflict(index, record)
                    }
                  }}
                >
                  {i18n('ticket.create.see_conflict', '查看冲突')}
                </Tag>
              )}
              {record.status === '6' && (
                <Tag
                  className={field.isRequired === 2 ? 'disabled' : 'edit'}
                  onClick={() => {
                    if (field.isRequired !== 2) {
                      this.props.revoke(index, record)
                    }
                  }}
                >
                  {i18n('globe.rescind', '撤销')}
                </Tag>
              )}
            </div>
          )
        }
      })
    }

    // 资产那边发起的配置项移除以后，资产那边的状态不会更新，所以屏蔽移除按钮
    if (field.isRequired !== 2 && !disabled && this.context.ticketSource !== 'asset') {
      columns.push({
        title: ' ',
        key: 'delete',
        width: 80,
        fixed: 'right',
        render: (text, record, index) => {
          if (record.status === '2' || record.status === '7' || !permission) {
            return null
          }
          return (
            <a
              onClick={() => {
                if (field.isRequired !== 2) {
                  this.props.delRow(index, record)
                }
              }}
              disabled={field.isRequired === 2}
            >
              {i18n('config.org.remove', '移除')}
            </a>
            // <i
            //   className="iconfont icon-guanbi1 resource-table-guanbi"
            //   onClick={() => this.props.delRow(index, record)}
            // />
          )
        }
      })
    }
    return columns
  }

  getColumnKeys = () => {
    const { field, selectedColumnKeys = [] } = this.props
    const attributeColumnKeys = []

    if (field.attributeColumns) {
      field.attributeColumns.forEach((col) => {
        if (col.code !== 'name') {
          attributeColumnKeys.push(col.code)
        }
      })
    }

    return DEFAULT_COLUMN_KEYS.concat(attributeColumnKeys, selectedColumnKeys)
  }

  render() {
    const {
      value = [],
      selectedRowKeys,
      disabled,
      field,
      pagination,
      sandboxData,
      realDataTotal,
      ticketId
    } = this.props
    const rowSelection = {
      columnWidth: 32,
      selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.props.handleChangeSelectedRowKeys(selectedRowKeys)
      }
    }

    const tablePagination = {
      current: pagination.pageNo,
      pageSize: pagination.pageSize,
      total: pagination.total,
      showTotal: false,
      pageSizeOptions: ['5', '20', '50', '100', '200'],
      onChange: (...pageInfo) => {
        this.props.onTablePaginationChange(...pageInfo)
      },
      onShowSizeChange: (...pageInfo) => {
        this.props.onTablePaginationChange(...pageInfo)
      }
    }
    // 未在沙箱的数据在第一页展示，且不管每页多少数据，都在第一页展示完
    const data =
      pagination.pageNo === 1
        ? _.filter(toJS(value), (item) => item.status !== '8').concat(sandboxData)
        : sandboxData
    // 在沙箱的需要根据taskId去重的数据
    const needFiltedData = data.filter((d) => d.taskId)

    // 不在沙箱的不需要去重的数据
    const notNeedFiltedData = data.filter((d) => !d.taskId && d.status !== '8')
    const newData = _.union(_.unionBy(needFiltedData, 'taskId'), notNeedFiltedData)
    if (this.props.type === 'detail') {
      sessionStorage.setItem(`${ticketId}-${field.code}`, JSON.stringify(newData))
    }
    let columns = this.getColumns()
    let scrollX = columns.reduce((pre, item) => {
      return pre + item.width
    }, 32)

    let domWidth = document.getElementById(field.code)?.offsetWidth
    if (scrollX <= domWidth) {
      scrollX = undefined
    }
    return (
      <div className="forms-field-table-inner">
        <Table
          rowKey={(record) =>
            `taskId=${record.taskId}&ciId=${record.id}&classCode=${record.classCode}`
          }
          selectedColumnKeys={this.getColumnKeys()}
          columns={this.getColumns()}
          rowSelection={disabled || !field.useScene.batchEdit.type ? null : rowSelection}
          pagination={false}
          dataSource={newData}
          size="small"
          scroll={{ x: scrollX }}
        />
        {data.length > 0 && (
          <>
            <Pagination {...tablePagination} style={{ marginTop: 10, padding: 0 }} />
            <span className={styles.total}>
              共&nbsp;
              <i>{realDataTotal}</i>
              &nbsp;条
            </span>
          </>
        )}
      </div>
    )
  }
}

export default ResourceTableWrap
