import React, { Component } from 'react'
import { Tabs } from '@uyun/components'
import View from './view'
import ViewForm from './viewForm'
import Create from './create'
const TabPane = Tabs.TabPane

export default class FieldsComponent extends Component {
  state = {
    type: 'view'
  }

  render () {
    const {
      widgetType = 'create',
      formRef,
      ...rest
    } = this.props
    const {
      type
    } = this.state
    if (process.env.NODE_ENV === 'development') {
      return (
        <Tabs activeKey={type} onChange={(type) => { this.setState({ type }) }}>
          <TabPane key="create" tab="创建字段"><Create {...rest} /></TabPane>
          <TabPane key="view" tab="查看"><ViewForm {...rest} /></TabPane>
        </Tabs>
      )
    } else {
      return widgetType === 'create' ? <Create {...rest} /> : <View {...rest} ref={formRef} />
    }
  }
}
