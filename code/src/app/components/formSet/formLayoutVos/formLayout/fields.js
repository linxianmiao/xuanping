import React, { Component } from 'react'
import { toJS, reaction } from 'mobx'
import { Col, Form } from '@uyun/components'
import { inject, observer } from 'mobx-react'
import { DropTarget } from 'react-dnd'
import Field from './field'
import classnames from 'classnames'
import { FILTER, getFieldCandrop } from '../configuration'
import Type from '../type'

const fieldsTarget = {
  canDrop(props, monitor, component) {
    const item = monitor.getItem()
    const FIELD_CANDROP = getFieldCandrop()
    return _.some(FIELD_CANDROP, (type) => type === item.type)
  },
  drop(props, monitor, component) {
    const item = monitor.getItem()
    if (item.action === 'move') {
      const filler_index = _.findIndex(props.fieldList, (field) => field.id === FILTER.id)
      if (filler_index !== -1) {
        const { fieldList: fields } = props
        const { beginLayoutIndex, beginTabsIndex, beginFieldIndex, beginParentType } = item
        props.formSetGridStore.deleteField(
          beginLayoutIndex,
          beginTabsIndex,
          beginFieldIndex,
          beginParentType
        )
        fields[filler_index] = item.beginField
        component.handleChangeFields(fields)
      }
    } else {
      const filler_index = _.findIndex(props.fieldList, (field) => field.id === FILTER.id)
      if (filler_index !== -1) {
        const fields = props.fieldList
        fields[filler_index] = item
        component.handleChangeFields(fields, item, 'add')
      }
    }
  }
}

@inject('formSetGridStore')
@DropTarget(Type, fieldsTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  item: monitor.getItem(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))
@observer
class Fields extends Component {
  componentDidMount() {
    this.destory = reaction(
      () => {
        const { errors } = this.props.formSetGridStore
        return errors
      },
      (errors) => {
        const fieldError = {}
        _.forEach(_.keys(errors), (code) => {
          fieldError[code] = {
            errors: [new Error(errors[code])]
          }
        })

        this.props.form.setFields(fieldError)
      }
    )
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.disabled) {
      const { canDrop, isOver, item, fieldList, layoutIndex } = nextProps
      const filler_index = _.findIndex(fieldList, (field) => field.id === FILTER.id)
      // 增加一个替换元素
      if (canDrop && isOver && filler_index === -1 && !_.has(item, 'beginField')) {
        this.handleChangeFields([...fieldList, FILTER])
      }
      if (canDrop && isOver && filler_index === -1 && layoutIndex !== item.beginLayoutIndex) {
        this.handleChangeFields([...fieldList, FILTER])
      }
      // 删除替换元素
      if (!isOver && !item && filler_index !== -1) {
        const fields = _.filter(fieldList, (field) => field.id !== FILTER.id)
        this.handleChangeFields(fields)
      }
    }
  }

  componentWillUnmount() {
    this.destory()
  }

  movefield = (filter_index, fieldIndex) => {
    const { fieldList } = this.props
    const field = fieldList[filter_index]
    fieldList.splice(filter_index, 1)
    fieldList.splice(fieldIndex, 0, field)
    this.handleChangeFields(fieldList)
  }

  handleChangeFields = (fieldList, field, type) => {
    const { layoutIndex, tabsIndex, parentType } = this.props
    this.props.formSetGridStore.changeFields(
      fieldList,
      layoutIndex,
      tabsIndex,
      parentType,
      field,
      type
    )
  }

  getFields = () => {
    const {
      fieldList,
      layoutIndex,
      tabsIndex,
      parentType,
      sideValue,
      modalValue,
      disabled,
      formLayoutType
    } = this.props
    const { getFieldDecorator, getFieldValue, setFields } = this.props.form
    const fields = []
    let cols = 0
    _.forEach(fieldList, (field, index) => {
      const { fieldLayout } = field
      const col = fieldLayout ? fieldLayout.col : 24
      cols = cols + col
      if (cols > 24) {
        fields.push(<Col key={index} span={24} style={{ height: '1px' }} />)
        cols = 0 + col
      }
      fields.push(
        <Col key={field.id} span={col}>
          <Field
            field={field}
            canDrag={!disabled}
            sideValue={sideValue}
            modalValue={modalValue}
            form={this.props.form}
            getFieldDecorator={getFieldDecorator}
            getFieldValue={getFieldValue}
            setFields={setFields}
            fieldList={fieldList}
            fieldIndex={index}
            layoutIndex={layoutIndex}
            tabsIndex={tabsIndex}
            parentType={parentType}
            movefield={this.movefield}
            handleSideShow={this.props.handleSideShow}
            formLayoutType={formLayoutType}
            type="preview"
            source="formset"
            foldSource="setting" // 模型中表单设置的标识（收缩状态为展开，区分表单和预览）
          />
        </Col>
      )
    })
    return fields
  }

  render() {
    const { fieldList, connectDropTarget } = this.props
    const length = _.compact(toJS(fieldList)).length
    return connectDropTarget(
      <div
        className={classnames('u4-row', {
          'fields-empty': length === 0
        })}
      >
        {length === 0 ? i18n('formSet-drop-tip1', '请拖放到这里') : this.getFields()}
      </div>
    )
  }
}
export default Form.create()(Fields)
