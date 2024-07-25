import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { Row, Col, Card } from '@uyun/components'
import { observer } from 'mobx-react'
import moment from 'moment'
import classnames from 'classnames'
import './style/header.less'
const { Data } = Card

@withRouter
@observer
class Header extends Component {
  componentDidMount () {
    this.props.headerStore.getAllCount()
  }

  handleClick = (url, index) => {
    const fmt = 'YYYY-MM-DD HH:mm:ss'
    const endTime = moment().endOf('day').format(fmt)
    let createTime
    if (index === 0) {
      createTime = moment().startOf('day').format(fmt)
      this.props.history.push({
        pathname: url,
        query: {
          create_time: createTime,
          end_time: endTime
        }
      })
    }
    if (index === 1) {
      createTime = moment().startOf('isoWeek').format(fmt)
      this.props.history.push({
        pathname: url,
        query: {
          create_time: createTime,
          end_time: endTime,
          status: '1_2'
        }
      })
    }
    if (index === 2) {
      this.props.history.push({
        pathname: url,
        query: {
          overdue: '1'
        }
      })
    }
  }

  render () {
    const options = [{
      icon: 'icon-plus-circle',
      label: i18n('added', '今日新增'),
      color: '#3883F8',
      link: '/ticket/all'
    }, {
      icon: 'icon-time-circle',
      label: i18n('processed', '本周待处理'),
      color: '#FFCD3D',
      link: '/ticket/all'
    }, {
      icon: 'icon-frown',
      label: i18n('overdue_week', '逾期数'),
      color: '#FF4848',
      link: '/ticket/all'
    }, {
      icon: 'icon-check-circle',
      label: i18n('resolution', '工单解决率'),
      color: '#3CD768',
      link: null
    }]
    const dataList = this.props.headerStore.dataList
    return (
      <Row className="overview-default-header">
        {_.map(dataList, (item, i) => {
          const { num } = item
          const count = `${num}${i === 3 ? '%' : ''}`
          return (
            <Col span={6} key={i}>
              <Card type="data">
                <Data
                  iconColor={options[i].color}
                  icon={<i style={{ fontSize: 36 }} className={`iconfont ${options[i].icon}`} />}
                  title={options[i].label}
                  total={<span className={classnames({
                    'info-num': Boolean(num && options[i].link)
                  })} onClick={() => {
                    if ((num && options[i].link)) {
                      this.handleClick(options[i].link, i)
                    }
                  }}>{count}</span>} />
              </Card>
            </Col>
          )
        })}
      </Row>
    )
  }
}

export default Header
