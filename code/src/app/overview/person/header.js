import React, { Component } from 'react'
import classnames from 'classnames'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react'
import { Row, Col } from '@uyun/components'
import './style/header.less'

@observer
class Header extends Component {
  componentDidMount () {
    this.props.store.getOverdueCount()
  }

  render () {
    const { dataList } = this.props.store
    const options = [
      {
        color: '#EC4E53',
        icon: 'pandect-icon iconfont icon-frown',
        label: `${i18n('overdueTotal', '逾期工单总数')}`,
        link: null
      }, {
        color: null,
        icon: 'pandect-icon iconfont icon-daichuli',
        label: `${i18n('status_1', '待处理')}（${i18n('tip29', '逾期')}）`,
        link: { pathname: '/ticket/myToDo', query: { overdue: '1', status: '1' } }
      }, {
        color: null,
        icon: 'pandect-icon iconfont icon-chulizhong',
        label: `${i18n('status_2', '处理中')}（${i18n('tip29', '逾期')}）`,
        link: { pathname: '/ticket/myToDo', query: { overdue: '1', status: '2' } }
      }, {
        color: null,
        icon: 'pandect-icon iconfont icon-yiguaqi',
        label: `${i18n('status_10', '挂起')}（${i18n('tip29', '逾期')}）`,
        link: null
      }
    ]
    return (
      <div className="overview-person-header">
        <Row>
          {_.map(options, (item, i) => {
            const { color, icon, label, link } = item
            return (
              <Col key={i}
                span={6}
                style={color && { background: color }}
                className={classnames('overview-person-header-col', {
                  special: i === 0
                })}>
                { icon && <i className={icon} /> }
                <div className="header-right">
                  <span>{`${label}${i === 0 ? '' : ':'}`}</span>
                  { link ? <Link className="large-num" to={link}>{dataList[i]}</Link> : <span className="large-num">{dataList[i]}</span> }
                </div>
              </Col>
            )
          })}
        </Row>
      </div>
    )
  }
}

export default Header
