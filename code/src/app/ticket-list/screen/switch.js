import React, { Component } from 'react'
import { AppstoreOutlined, BarsOutlined } from '@uyun/icons';
import { Button, Tooltip } from '@uyun/components'
import { observer } from 'mobx-react'
import './style/switch.less'

const ButtonGroup = Button.Group

@observer
class SwitchCardOrTable extends Component {
  render () {
    return (
      <div className="switch-card-or-table">
        <ButtonGroup>
          <Tooltip placement="top" title={i18n('ticket.list.card', '卡片列表')}>
            <Button
              type="primary"
              icon={<AppstoreOutlined />}
              className={this.props.ticketListStore.currentPattern === 'card' ? 'active' : ''}
              onClick={() => { this.props.ticketListStore.switchCardOrTable('card') }}
            />
          </Tooltip>
          <Tooltip placement="topRight" title={i18n('ticket.list.table', '表格列表')}>
            <Button
              type="primary"
              icon={<BarsOutlined />}
              onClick={() => { this.props.ticketListStore.switchCardOrTable('table') }}
              className={this.props.ticketListStore.currentPattern === 'table' ? 'active' : ''}
            />
          </Tooltip>
        </ButtonGroup>
      </div>
    );
  }
}

export default SwitchCardOrTable
