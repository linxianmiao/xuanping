import React, { Component } from 'react'
import { Form, Input, Button, message } from '@uyun/components'
import { observer, inject } from 'mobx-react'
import matrixStore from '../stores/matrixStore'
import Matrix from './matrix'
import PageHeader from '~/components/pageHeader'
import ContentLayout from '~/components/ContentLayout'
import ErrorBoundary from '~/components/ErrorBoundary'
import uuid from '~/utils/uuid'
import './styles/index.less'
const FormItem = Form.Item

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 12 }
}
const tailFormItemLayout = {
  wrapperCol: { span: 12, offset: 3 }
}

const matrxItemLayout = {
  wrapperCol: { span: 19 }
}

function copyMatrix(matrix) {
  const { name, description, columnList, rowList } = matrix

  const columnIdObj = _.reduce(
    columnList,
    (acc, column) => {
      acc[column.columnId] = uuid()
      return acc
    },
    {}
  )

  const addIdToColumnList = (columnList) => {
    return _.map(columnList, (item) => ({
      ...item,
      columnId: columnIdObj[item.columnId]
    }))
  }

  const newColumnList = addIdToColumnList(columnList)

  const newRowList = _.map(rowList, (row) => ({
    ...row,
    columns: addIdToColumnList(row.columns)
  }))

  const copyData = {
    name: i18n('copy-from', '复制于') + name,
    description,
    status: 0,
    columnList: newColumnList,
    rowList: newRowList
  }
  return copyData
}

@inject('globalStore')
@observer
class MatrixTemplate extends Component {
  type = 'create'

  matrixRef = React.createRef()

  async componentDidMount() {
    // create:创建  detail:编辑  copy:复制
    this.type = this.props.match.path.match(/sysCon\/matrixTemplate\/([^/]+)((\/.*)|$)/)[1]

    if (this.type === 'create') {
      matrixStore.resetMatrixData()
    } else if (this.type === 'detail' || this.type === 'copy') {
      const res = await matrixStore.getMatrix({
        id: this.props.match.params.id,
        fromTemplate: true // 模板的时候传true，后端用于区分
      })
      if (this.type === 'copy') {
        const copyData = copyMatrix(res)
        matrixStore.setData(copyData, 'matrixData')
      }
    }
  }

  handleSave = () => {
    this.props.form.validateFieldsAndScroll(async (errors, values) => {
      if (errors) return false
      const { name, code, matrix, description } = values
      const { columnList, rowList } = matrix
      if (!this.matrixRef.current?.validate()) return false

      const data = {
        name,
        code,
        columnList,
        rowList,
        description
      }
      if (this.type === 'detail') {
        data.id = this.props.match.params.id
      }
      const res = await matrixStore.matrixSave(data)
      if (res) {
        if (this.type === 'detail') {
          message.success(i18n('edit.sucess', '编辑成功'))
        } else if (this.type === 'create') {
          message.success(i18n('create.ticket_success', '创建成功'))
        } else if (this.type === 'copy') {
          message.success(i18n('copy.ticket_success', '复制成功'))
        }
        this.props.history.push('/sysCon/matrix')
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { name, code, columnList, description, rowList } = matrixStore.matrixData
    const { matrixInsert, matrixModify } = this.props.globalStore.configAuthor
    const isSave = (this.props.match.params.id && matrixModify) || matrixInsert // 权限

    return (
      <React.Fragment>
        <PageHeader
          customizeBreadcrumb={[
            { name: i18n('global_matrix', '协同矩阵'), path: '/sysCon/matrix' },
            {
              name: this.props.match.params.id
                ? name
                : i18n('system-create-matrix-template', '新建矩阵')
            }
          ]}
        />
        <ContentLayout>
          <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
            <Form>
              <FormItem {...formItemLayout} label={i18n('conf.model.field.card.name', '名称')}>
                {getFieldDecorator('name', {
                  initialValue: name,
                  rules: [
                    { required: true, message: i18n('ticket.forms.pinputName', '请输入名称') }
                  ]
                })(
                  <Input
                    maxLength="20"
                    placeholder={i18n('ticket.forms.pinputName', '请输入名称')}
                  />
                )}
              </FormItem>
              <FormItem {...formItemLayout} label={i18n('conf.model.field.code', '编码')}>
                {getFieldDecorator('code', {
                  initialValue: code,
                  rules: [
                    { required: true, message: i18n('ticket.forms.inputParamCode', '请输入编码') }
                  ]
                })(
                  <Input
                    maxLength="20"
                    disabled={this.type === 'detail'}
                    placeholder={i18n('ticket.forms.inputParamCode', '请输入编码')}
                  />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                {...matrxItemLayout}
                label={i18n('define-matrix', '定义矩阵')}
                required
              >
                {getFieldDecorator('matrix', {
                  initialValue: {
                    columnList,
                    rowList
                  }
                })(<Matrix ref={this.matrixRef} />)}
              </FormItem>
              <FormItem {...formItemLayout} label={i18n('conf.model.field.card.desc', '描述')}>
                {getFieldDecorator('description', {
                  initialValue: description
                })(
                  <Input.TextArea
                    maxLength="100"
                    placeholder={
                      i18n('ticket.forms.pinput', '请输入') +
                      i18n('conf.model.field.card.desc', '描述')
                    }
                    autosize={{ minRows: 2, maxRows: 6 }}
                  />
                )}
              </FormItem>
              {isSave && (
                <FormItem {...tailFormItemLayout}>
                  <Button type="primary" onClick={this.handleSave}>
                    {i18n('globe.save', '保存')}
                  </Button>
                </FormItem>
              )}
            </Form>
          </ErrorBoundary>
        </ContentLayout>
      </React.Fragment>
    )
  }
}

export default Form.create()(MatrixTemplate)
