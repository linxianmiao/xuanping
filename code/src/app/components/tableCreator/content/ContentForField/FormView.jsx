import React, { Component } from 'react'
import { CloseCircleOutlined, CopyOutlined, PlusOutlined } from '@uyun/icons'
import { Form, Row, Col, Button, Icon } from '@uyun/components'
import Tip from '../Tip'

const FormItem = Form.Item
export default class FormView extends Component {
  render() {
    const { columns, data: dataSource, canCopy, disabled } = this.props
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 }
    }
    return (
      <div className="tc-content-form">
        {_.map(dataSource, (item) => {
          return (
            <div key={item.rowId}>
              <Row span={22} className="tc-content-form-content">
                {_.map(columns, (column, index) => {
                  return (
                    <React.Fragment key={index}>
                      {index % 3 === 0 && <Col style={{ height: 1 }} span={24} />}
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={column.label}
                          required={column.isRequired === 1}
                        >
                          <Col span={21}>{this.props.renderCell(column, item)}</Col>
                          <Col span={3} style={{ textAlign: 'right' }}>
                            {column.description && <Tip title={column.description} />}
                          </Col>
                        </FormItem>
                      </Col>
                    </React.Fragment>
                  )
                })}
              </Row>
              {!disabled && (
                <div className="tc-content-form-extra">
                  {!!canCopy && (
                    <CopyOutlined
                      title={i18n('copy.row', '复制')}
                      onClick={() => this.props.onCopy(item)}
                    />
                  )}
                  <CloseCircleOutlined
                    title={i18n('delete.row', '删除')}
                    onClick={() => this.props.onDelete(item)}
                  />
                </div>
              )}
            </div>
          )
        })}
        {!disabled ? (
          <Button style={{ marginTop: 10 }} icon={<PlusOutlined />} onClick={this.props.onAdd}>
            {i18n('ticket.form.add.line', '添加行')}
          </Button>
        ) : null}
      </div>
    )
  }
}
