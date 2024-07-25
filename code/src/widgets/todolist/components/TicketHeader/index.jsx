import React, { Component } from 'react'
import { inject } from '@uyun/core'
import { observer } from 'mobx-react'
import { DoubleRightOutlined } from '@uyun/icons'
import { Input, Icon } from '@uyun/components'
import TimerTask from './TimerTask'
import CustomColumn from './CustomColumn'
import BatchTicket from './BatchTicket'
import TicketView from './TicketView'
import TicketFilter from '../TicketFilter/index.jsx'
import styles from './index.module.less'
import cls from 'classnames'

@observer
class TicketHeader extends Component {
  @inject('listStore') listStore

  @inject('i18n') i18n

  filterRef = null

  state = {
    viewId: undefined, // 视图id
    viewName: undefined
  }

  handleChangeViewId = (viewId, viewName) => {
    this.setState({ viewId, viewName })
    this.listStore.getQueryView(viewId)
    this.filterRef.handleReset()
  }

  handleFilterVisible = () => {
    const { filterVisible, allField } = this.listStore
    this.listStore.setProps({ filterVisible: !filterVisible })
    if (_.isEmpty(allField.builtinFields) && !filterVisible) {
      this.listStore.getAllColumns()
    }
  }

  render() {
    const { query, pageSize, filterVisible } = this.listStore
    const { viewId, viewName } = this.state
    const { wd } = query
    return (
      <div className={styles.ticketHeader}>
        <div className={styles.filterWrap}>
          <div>
            <Input.Search
              value={wd}
              enterButton
              onChange={(e) => this.listStore.setQuery(_.assign({}, query, { wd: e.target.value }))}
              onSearch={() => {
                this.listStore.setCurrentAndPageSize(1, pageSize)
                this.listStore.getList()
              }}
              style={{ width: 160, marginRight: 12 }}
              placeholder={this.i18n('globe.keywords', '请输入关键字')}
            />
            <TicketView
              viewId={viewId}
              viewName={viewName}
              handleChangeViewId={this.handleChangeViewId}
            />
            <a onClick={this.handleFilterVisible} className={styles.filterText}>
              {this.i18n('ticket.list.filter', '高级筛选')}
              <DoubleRightOutlined
                className={cls({ [styles.active]: filterVisible }, styles.filterIcon)}
              />
            </a>
          </div>
          <div>
            <TimerTask fn={this.listStore.getList} />
            <CustomColumn />
            <BatchTicket />
          </div>
        </div>
        {filterVisible && (
          <TicketFilter
            onRef={(ref) => {
              this.filterRef = ref
            }}
            viewId={viewId}
            viewName={viewName}
          />
        )}
      </div>
    )
  }
}

export default TicketHeader
