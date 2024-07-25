import React, { Component } from 'react'
import { store as runtimeStore } from '@uyun/runtime-react'
import { DownOutlined } from '@uyun/icons';
import { Button, Popover, Switch } from '@uyun/components'
import moment from 'moment'
import './style/refresh.less'
const ButtonGroup = Button.Group

class Refresh extends Component {
  constructor (props) {
    super(props)
    const flag = localStorage.getItem(`auto_${runtimeStore.getState().user?.userId}`) === 'true'
    this.state = {
      updateTime: moment().format('MM/DD HH:mm:ss'),
      isAutoRefresh: flag
    }
  }

    onRefresh = () => {
      this.setState({ updateTime: moment().format('MM/DD HH:mm:ss') }, () => {
        this.props.onRefresh()
      })
    }

    onSwitchChange = value => {
      this.setState({ isAutoRefresh: value }, () => {
        localStorage.setItem(`auto_${runtimeStore.getState().user?.userId}`, String(value))
        if (value) {
          this.timer = setInterval(() => {
            this.onRefresh()
          }, 10000)
        } else {
          this.timer && clearInterval(this.timer)
          this.timer = null
        }
      })
    }

    componentDidMount () {
      this.onSwitchChange(this.state.isAutoRefresh)
    }

    componentWillUnmount () {
      clearInterval(this.timer)
      this.timer = null
    }

    render () {
      const { updateTime, isAutoRefresh } = this.state
      const content = (
        <div className="overview-control-wrap clearfix">
          <span className="overview-control-text">{i18n('refresh_interval', '每隔10秒刷新')}</span>
          <span className="overview-control">
            <Switch checked={isAutoRefresh} onChange={value => {
              this.onSwitchChange(value)
            }} />
          </span>
        </div>
      )
      return (
        <div className="overview-person-refresh">
          <ButtonGroup>
            <Button type="primary" onClick={this.onRefresh}><i className="iconfont icon-shuaxin" />{i18n('refresh', '刷新数据')}</Button>
            <Popover
              placement="bottomLeft"
              content={content}
              trigger="click">
              <Button type="primary" icon={<DownOutlined />} />
            </Popover>
          </ButtonGroup>
          <span className="last-update-time">{i18n('tip13', '最新刷新时间')} {updateTime}</span>
        </div>
      );
    }
}

export default Refresh
