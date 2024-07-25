import React, { Component } from 'react'
import { Empty } from '@uyun/components'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true })
    console.log(error, info)
  }

  render() {
    const { desc = i18n('error-boundary-desc', '扩展字段执行出错，请检查后重试') } = this.props
    if (this.state.hasError) {
      return <Empty description={desc} type="loading" />
    }
    return this.props.children
  }
}