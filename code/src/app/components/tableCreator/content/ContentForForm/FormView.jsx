import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { CloseCircleOutlined, CopyOutlined, PlusOutlined, CheckOutlined } from '@uyun/icons'
import { Form, Row, Col, Button, Pagination } from '@uyun/components'
import Tip from '../Tip'

const FormItem = Form.Item

@observer
class FormView extends Component {
  render() {
    const {
      columns,
      canCopy,
      disabled,
      data: dataSource,
      pagination,
      pageFlag,
      fieldCode,
      showOkTables,
      onRowOk
    } = this.props
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
              {!disabled && this.props.isRequired !== 2 && (
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
                  {showOkTables.includes(fieldCode) && (
                    <CheckOutlined
                      title={i18n('globe.ok', '确定')}
                      onClick={() => onRowOk(fieldCode, item)}
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}

        {dataSource.length > 0 && pageFlag > 0 && (
          <Pagination
            {...pagination}
            // size="small"
            onChange={(page) => this.props.onPaginationChange(page)}
            onShowSizeChange={(current, size) => this.props.onPaginationChange(null, size)}
          />
        )}

        {!disabled && this.props.isRequired !== 2 ? (
          <Button style={{ marginTop: 10 }} icon={<PlusOutlined />} onClick={this.props.onAdd}>
            {i18n('ticket.form.add.line', '添加行')}
          </Button>
        ) : null}
      </div>
    )
  }
}
export default FormView
