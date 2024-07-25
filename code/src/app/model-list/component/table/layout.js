import React, { Component } from 'react'
import { Tooltip, Col, Row } from '@uyun/components'

function Layout (props) {
  return (
    <Row style={{ marginBottom: 15 }}>
      <Col span={6} style={{ textAlign: 'right' }}>{props.label} : </Col>
      <Col span={18}>{props.children}</Col>
    </Row>
  )
}
export default class ModelLayout extends Component {
  render() {
    const { name, code } = this.props.text || {}
    return (
      <Tooltip
        placement="topLeft"
        title={
          <div style={{ minWidth: 200 }}>
            <Layout label={i18n('field_code', '编码')}>{code}</Layout>
            <Layout label={i18n('conf.model.field.card.name', '名称')}>{name}</Layout>
          </div>
        }>
        <span style={{ cursor: 'pointer' }}>{name}</span>
      </Tooltip>
    )
  }
}