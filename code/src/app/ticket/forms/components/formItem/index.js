import React, { Component } from 'react'
import { ExclamationCircleOutlined, QuestionCircleOutlined } from '@uyun/icons'
import { Form, Tooltip, Icon } from '@uyun/components'
import styles from './index.module.less'
import ErrorBoundary from '~/components/ErrorBoundary'
import classnames from 'classnames'

/**
 * 计算左右布局 （根据几个数的公约数进行反推，保证label对齐）
 * @param {String} fieldLabelLayout  布局方式   vertical | horizontal   上下 | 左右
 * @param {Number} col  所占比例  24 ，12 ，8 ，6
 * @param {Number} fieldMinCol  当前表单最小的列   24 ， 12 ，8，6
 * 当 最小列为 1/4 时
 * 单列  2 : 22     1：11     24 * 1/12 = 2
 * 双列  4 : 20     1 ：5     12 * 1/6 =  2
 * 三列  6 ：18     1 ：3     8 * 1/4  =  2
 * 四列  8 ：16     1 ：2     6 * 1/3   = 2
 *
 *
 * 当最小列为 1/3 时
 * 单列 4 : 20            1 : 5          24 * 1/6 = 4
 * 双列 8 : 16            1 : 2          12 * 1/3 = 4
 * 三列 12 ：12           1 : 1          8 *  1/2 = 4
 *
 *
 * 当最小列为 1/2 或 1/1 时
 * 单列 3 : 21            1 : 7          24 * 1/8 = 3
 * 双列 6 : 18            1 : 3          12 * 1/4 = 3
 */

function getFormItemLayout(fieldLabelLayout, col, fieldMinCol) {
  if (fieldLabelLayout === 'vertical') {
    return {
      labelCol: { span: 24 },
      wrapperCol: { span: 24 }
    }
  }
  let list = []

  switch (fieldMinCol) {
    case 24:
    case 12:
      list = [null, 8, 4]
      break
    case 8:
      list = [null, 6, 3, 2]
      break
    case 6:
      list = [null, 12, 6, 4, 3]
      break
    default:
      list = [null, 12, 6, 4, 3]
      break
  }

  const base = list[24 / col]

  return {
    labelCol: { span: (1 / base) * 24 },
    wrapperCol: { span: ((base - 1) / base) * 24 }
  }
}
export default class FormItem extends Component {
  render() {
    const { fieldMinCol, fileAccept, className, index, ...restProps } = this.props
    let { name, fieldDesc, fieldLabelLayout, fieldLayout, placeholder, type, code, isRequired } =
      this.props.field
    fieldLayout = fieldLayout || {}
    const formItemLayout = getFormItemLayout(fieldLabelLayout, fieldLayout.col, fieldMinCol)
    return (
      <ErrorBoundary desc={`${name}字段出现未知错误`}>
        <Form.Item
          {...restProps}
          {...formItemLayout}
          className={classnames(styles.layoutItsm, className, {
            [styles.btnLabel]: type === 'btn',
            requiredVerticalLabel: isRequired === 1 && fieldLabelLayout === 'vertical',
            verticalLabel: fieldLabelLayout === 'vertical'
          })}
          // 如果是级联单选字段(Cascader)，label中带有标签元素的时候，点击会触发表单设计中对应字段控件的onClick事件（疑惑）
          // 暂时通过e.preventDefault()解决
          label={
            type === 'btn' || code === 'currentStage' ? (
              ' '
            ) : name ? (
              <span className="form-item-span" onClick={(e) => e.preventDefault()}>
                <span title={name}>{name}</span>
                {Boolean(fieldDesc && !placeholder) && (
                  <Tooltip
                    overlayStyle={{ maxWidth: '400px' }}
                    placement="topRight"
                    title={fieldDesc}
                    // title={<pre>{fieldDesc}</pre>}
                  >
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                )}
                {/* {Boolean(fileAccept) && (
                  <Tooltip title={`仅支持${fileAccept}文件格式的多个文件上传`}>
                    <ExclamationCircleOutlined style={{ marginLeft: 2 }} />
                  </Tooltip>
                )} */}
              </span>
            ) : null
          }
        >
          {this.props.children}
        </Form.Item>
      </ErrorBoundary>
    )
  }
}
