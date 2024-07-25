import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Spin } from '@uyun/components'
import './styles/lazyload.less'
class LazyLoad extends Component {
    state = {
      loading: false
    }

    componentDidMount () {
      this.ul.addEventListener('scroll', this.handleScroll)
    }

    componentWillUnmount () {
      this.ul.removeEventListener('scroll', this.handleScroll)
    }

    componentWillReceiveProps (nextProps) {
      if (this.props.len !== nextProps.len || !nextProps.isLoad) {
        this.setState({ loading: false })
      }
    }

    handleScroll = e => {
      const { isLoad } = this.props
      const { loading } = this.state
      const bottom = this.props.bottom || 100
      let scrollTop = 0
      let scrollHeight = 0
      let offsetHeight = 0
      scrollTop = e.srcElement.scrollTop
      scrollHeight = e.srcElement.scrollHeight
      offsetHeight = e.srcElement.offsetHeight
      if (offsetHeight + scrollTop + bottom >= scrollHeight && isLoad && !loading) {
        this.setState({ loading: true }, () => {
          this.props.handleLazyLoad('push')
        })
      }
    }

    render () {
      const { children, className, isLoad, len } = this.props
      const { loading } = this.state
      return (
        <ul
          id="lazy-load-ul"
          ref={node => this.ul = node}
          className={`${className} lazy-load-componet`}>
          {children}
          {loading && <li className={'li-stable'}>{ <Spin tip={i18n('loading', '加载中')} />}</li>}
          {!isLoad && <li className={'li-stable'}>{i18n('last-item', '已经到底了')}</li>}
          {len === 0 && <li className={'li-stable'}>{i18n('ticket.sla.nodata', '暂无数据')}</li>}
        </ul>
      )
    }
}

LazyLoad.propTypes = {
  bottom: PropTypes.number
}
export default LazyLoad
