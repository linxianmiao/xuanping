/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react'
import { inject } from '@uyun/core'
import { observer } from 'mobx-react'
import { DownOutlined } from '@uyun/icons'
import { Input, DatePicker, Button } from '@uyun/components'
import { TicketlistStore } from '../../ticketlist.store'
import styles from '../../ticketlist.module.less'
import TicketFilter from './ticketFilter'
import TicketListExport from './export'
// import CustomColumn from './CustomColumn'
import moment from 'moment'
import cls from 'classnames'
import MyApproveButton from './MyApproveButton'
import DictionarySelect from './DictionarySelect'
import _ from 'lodash'

const ranges_zh = {
  一天: [moment().startOf('day'), moment().endOf('day')],
  三天: [moment().subtract(2, 'days'), moment().endOf('day')],
  一周: [moment().subtract(6, 'days'), moment()],
  一月: [moment().subtract(1, 'months'), moment()],
  三月: [moment().subtract(3, 'months'), moment()]
}
const RangePicker = DatePicker.RangePicker

@observer
class TicketHeader extends Component {
  @inject(TicketlistStore) store

  @inject('i18n') i18n

  state = {
    visible: false,
    inputValue: undefined,
    exportVisible: false // 导出
  }

  componentDidMount() {
    // this.store.getModelAndTacheIdList()
  }

  // 导出的状态
  handleExportCancle = (exportVisible) => {
    this.setState({ exportVisible })
  }

  handleChangeColumn = (attributeList) => {
    this.store.setValue(attributeList, 'attributeList')
  }

  handleFilter = () => {
    // if (!this.state.visible) {
    //   this.store.getAllColumns()
    // }
    this.setState({ visible: !this.state.visible })
  }

  handleChange = (value, type) => {
    const { query, currentDept } = this.store
    // const { query, menuList } = this.store
    const { pageSize } = query || {}
    if (type === 'filterType') {
      // const menu = getQueryer(value, menuList)
      // const queryMenuView = _.get(menu, 'queryMenuView')
      // const attributeList = _.get(menu, 'queryMenuView.extParams.columns')
      // const queryerData = _.omit(queryMenuView, [
      //   'extParams',
      //   'columns',
      //   'pageNum',
      //   'pageSize',
      //   'filterType',
      //   'orderBy',
      //   'orderRule',
      //   'orderField'
      // ])
      // const extParamsData = _.omit(_.get(queryMenuView, 'extParams'), ['columns'])
      let param = {}
      if (value === 'all') {
        param = {
          participantsDepartIds: currentDept
        }
      }
      this.store.setValue(
        _.assign(
          {},
          {
            [type]: value,
            pageNum: 1,
            pageSize,
            ...param
            // orderBy: _.get(queryMenuView, 'orderField'),
            // sortRule: _.get(queryMenuView, 'orderField') === 'status' ? 'ascend' : 'descend'
          }
          // extParamsData,
          // queryerData
        ),
        'query'
      )
      value === 'all' && this.store.setSelectedList('', 'INITQUERY')
      // this.store.setValue(attributeList, 'attributeList')
      this.setState({ visible: false, inputValue: undefined })
    } else {
      this.store.setValue(_.assign({}, query, { [type]: value, pageNum: 1, pageSize }), 'query')
    }
  }

  handleChangeRange = (dates, dateString) => {
    const { query } = this.store
    const { pageSize } = query

    const { inputValue } = this.state
    if (_.isEmpty(_.compact(dateString))) {
      this.store.setValue(
        _.assign({}, query, { pageNum: 1, create_time: undefined, pageSize, wd: inputValue }),
        'query'
      )
    } else {
      this.store.setValue(
        _.assign({}, query, { pageNum: 1, create_time: dateString, pageSize, wd: inputValue }),
        'query'
      )
    }
  }

  getValuePropName = (value) => {
    return typeof value === 'string' || (value && value.length === 1) ? 'tagValue' : 'value'
  }
  reload = (type = '') => {
    if (!type) this.store.getTicketList()
    this.props.onSelectedRow([])
  }

  clearSearchInfo = () => {
    this.setState({ inputValue: undefined })
  }
  handelDictChange = (currentMenuData, type) => {
    const checkedColumnCodes = _.get(currentMenuData, 'queryMenuView.extParams.columns')
    const checkFilterList = _.get(currentMenuData, 'queryMenuView.checkFilterList')
    const querySelectedList = _.get(currentMenuData, 'queryMenuView.querySelectedList')
    const querySelected = _.get(currentMenuData, 'queryMenuView.querySelectedList')
    const queryArchived = _.get(currentMenuData, 'queryArchived')
    const lockCondition = _.get(currentMenuData, 'queryMenuView.lockCondition')
    const query = {}
    _.forEach(querySelected, (item) => {
      query[item.modelId ? `${item.modelId}_${item.code}` : item.code] = item.value
    })

    if (checkedColumnCodes) {
      this.store.setProps({
        checkedColumnCodes,
        checkFilterList,
        querySelectedList,
        lockCondition
      })
    }
    // this.store.setProps({ selectedColumnsWidth, columnsList })
    // this.store.queryFieldInfo(_.concat(columnsListCode, queryListCode), queryList, columnsList)
    if (this.store.query.filterType === 'all') {
      this.store.setValue(
        _.assign(
          {},
          {
            filterType: 'all',
            pageNum: 1,
            pageSize: query['pageSize'] || queryArchived['pageSize'] || this.store.query['pageSize']
          },
          query,
          queryArchived
        ),
        'query'
      )
    } else {
      this.store.setQuery(query, queryArchived)
    }
  }

  render() {
    const { query, ticketList } = this.store
    const { visible, inputValue, exportVisible } = this.state
    const { selectedRowKeys, selectedRow = [] } = this.props
    const ticketIdList = _.map(selectedRowKeys, (item) => item.substr(0, 32))

    let ticketIdAndCodeMap = {}
    _.forEach(selectedRow, (item) => {
      if (!_.isEmpty(item?.appInfoVo?.appCode)) {
        ticketIdAndCodeMap[item.ticketId] = item?.appInfoVo?.appCode
      }
    })

    const { create_time, filterType } = query
    const time =
      !_.isEmpty(create_time) && create_time[0] && create_time[1]
        ? [moment(create_time[0]), moment(create_time[1])]
        : undefined
    return (
      <div style={{ marginBottom: 16 }}>
        {filterType !== 'mydrafts' ? (
          <div className={styles.ticketListHeader}>
            <div>
              {filterType === 'all' && <DictionarySelect onChange={this.handelDictChange} />}
              <Input.Search
                value={inputValue}
                onChange={(e) => {
                  this.setState({ inputValue: e.target.value })
                }}
                onSearch={(value) => {
                  this.setState({ inputValue: value }, () => {
                    this.handleChange(value, 'wd')
                  })
                }}
                style={{ width: 200, marginRight: 8 }}
                placeholder="输入单号或名称进行搜索"
                allowClear
              />
              {filterType !== 'all' ? (
                <RangePicker
                  ranges={ranges_zh}
                  format="YYYY-MM-DD"
                  onChange={this.handleChangeRange}
                  onTagRangeChange={(tagRange, tagValue) => {
                    if (!_.isEmpty(tagValue)) {
                      this.onTagRangeChange(tagRange, tagValue)
                    }
                  }}
                  tagRangeFormat={(tagRange) => `Last ${tagRange}`}
                  value={time}
                />
              ) : null}

              <a
                className={cls(
                  'js-itsm-filter-btn',
                  { [styles.active]: visible },
                  styles.advancedScreenBtn
                )}
                onClick={this.handleFilter}
              >
                {this.i18n('ticket.list.filter', '高级搜索')}
                <DownOutlined className={cls({ [styles.active]: visible }, styles.filterIcon)} />
              </a>
            </div>
            {filterType === 'myfollow' && (
              <Button
                disabled={ticketIdList.length === 0}
                onClick={() => this.props.handleMove(ticketIdList)}
              >
                批量移动
              </Button>
            )}
            {filterType === 'all' && (
              <div>
                <Button
                  disabled={ticketList.length === 0}
                  onClick={() => this.handleExportCancle('form')}
                >
                  导出
                </Button>
                <TicketListExport
                  visible={exportVisible}
                  handleExportCancle={this.handleExportCancle}
                  selectedRowKeys={selectedRowKeys}
                  reload={this.reload}
                />
                {/* <CustomColumn /> */}
              </div>
            )}
            {filterType === 'myapprove' && (
              <div>
                <MyApproveButton
                  disabled={ticketIdList.length === 0}
                  getTabCounts={this.props.getTabCounts}
                  ticketIdList={ticketIdList}
                  reload={this.reload}
                  approvalResult={1}
                  type="primary"
                  style={{ marginRight: 8 }}
                  ticketIdAndCodeMap={ticketIdAndCodeMap}
                >
                  通过
                </MyApproveButton>
                <MyApproveButton
                  disabled={ticketIdList.length === 0}
                  getTabCounts={this.props.getTabCounts}
                  ticketIdList={ticketIdList}
                  reload={this.reload}
                  approvalResult={2}
                  type="default"
                  ticketIdAndCodeMap={ticketIdAndCodeMap}
                >
                  驳回
                </MyApproveButton>
              </div>
            )}
          </div>
        ) : (
          <div>
            草稿箱仅用于存放创建工单时保存的数据,工单流程中保存的数据在处理工单中可以直接查看。
          </div>
        )}

        {visible && (
          <TicketFilter
            inputValue={inputValue}
            handleInputClear={() => {
              this.setState({ inputValue: undefined })
            }}
          />
        )}
      </div>
    )
  }
}

export default TicketHeader
