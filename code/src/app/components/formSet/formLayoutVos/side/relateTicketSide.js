import React, { Component } from 'react'
import { QuestionCircleOutlined } from '@uyun/icons'
import { Form, Input, InputNumber, Radio, Checkbox } from '@uyun/components'
import { toJS } from 'mobx'
import LazySelect from '~/components/lazyLoad/lazySelect'
const FormItem = Form.Item

class RelateTicketSide extends Component {
  handleCheckNum = (rules, value, callback) => {
    const { min, max } = rules
    if (value < min) {
      callback(`${i18n('ticket.forms.low', '不能低于')}100px`)
    } else if (value > max) {
      callback(`${i18n('ticket.forms.beyond', '不能超出')}1000px`)
    } else {
      callback()
    }
  }

  getList = async (query, callback) => {
    const { pageSize, pageNo, kw } = query
    const res =
      (await axios.get(API.getUseableModels, {
        params: _.assign({}, { filterUsable: true }, { pageNum: pageNo, wd: kw, pageSize })
      })) || {}
    // const res = (await this.flowStore.getModelList({ pageNum: pageNo, wd: kw, pageSize })) || []
    callback(res.list)
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { isInLayout, sideData } = this.props
    const { height, createRelatedTicket } = sideData
    let relateModels = Array.isArray(toJS(sideData.relateModels))
      ? _.map(sideData.relateModels, (d) => ({
          value: d.id,
          key: d.id,
          label: d.name
        }))
      : []
    let relateModelsScope = Array.isArray(toJS(sideData.relateModelsScope))
      ? _.map(sideData.relateModelsScope, (d) => ({
          value: d.id,
          key: d.id,
          label: d.name
        }))
      : []
    return (
      <Form layout="vertical">
        {!isInLayout && (
          <FormItem label={i18n('ticket.relateTicket.title', '标题')}>
            {getFieldDecorator('name', {
              rules: [
                {
                  required: true,
                  message: `${i18n('ticket.forms.pinput', '请输入')}${i18n(
                    'ticket.relateTicket.title',
                    '标题'
                  )}`
                }
              ]
            })(
              <Input
                maxLength="32"
                placeholder={`${i18n('ticket.forms.pinput', '请输入')}${i18n(
                  'ticket.relateTicket.title',
                  '标题'
                )}`}
              />
            )}
          </FormItem>
        )}
        <FormItem label={i18n('default.state', '默认状态')}>
          {getFieldDecorator('fold')(
            <Radio.Group disabled={isInLayout}>
              <Radio.Button value={0}>{i18n('expand', '展开')}</Radio.Button>
              <Radio.Button value={1}>{i18n('collapsed', '收起')}</Radio.Button>
            </Radio.Group>
          )}
        </FormItem>
        <FormItem label={i18n('conf.model.basic.check', '基础校验')}>
          {getFieldDecorator('isRequired')(
            <Radio.Group>
              <Radio.Button value={0}>{i18n('conf.model.field.optional', '选填')}</Radio.Button>
              <Radio.Button value={1}>{i18n('conf.model.field.required', '必填')}</Radio.Button>
              <Radio.Button value={2}>{i18n('conf.model.field.read-only', '只读')}</Radio.Button>
            </Radio.Group>
          )}
        </FormItem>
        <FormItem label={i18n('model.controler.height', '控件高度')}>
          {getFieldDecorator('heightType', {
            initialValue: height === undefined ? 0 : Number(height) === 0 ? 0 : 1
          })(
            <Radio.Group>
              <Radio.Button value={0}>{i18n('self-adaption', '自适应')}</Radio.Button>
              <Radio.Button value={1}>{i18n('model.ticket.max.height', '设置上限')}</Radio.Button>
            </Radio.Group>
          )}
        </FormItem>
        {Number(height) !== 0 && (
          <FormItem label={i18n('model.ticket.height.setting', '高度设置')}>
            {getFieldDecorator('height', {
              rules: [
                {
                  min: 100,
                  max: 1000,
                  validator: (rule, value, callback) => {
                    this.handleCheckNum(rule, value, callback)
                  }
                }
              ]
            })(
              <InputNumber
                placeholder={i18n('iframe.range.100-1000', '输入范围100~1000')}
                min={100}
                max={1000}
              />
            )}{' '}
            <span>px</span>
          </FormItem>
        )}
        <FormItem label="关联模型范围">
          {getFieldDecorator('relateModelsScope', {
            initialValue: toJS(relateModelsScope)
          })(
            <LazySelect
              mode="multiple"
              placeholder={i18n('pl_select_modal', '请选择模型')}
              getList={this.getList}
            />
          )}
        </FormItem>
        <FormItem label="">
          {getFieldDecorator('createRelatedTicket', {
            initialValue: !!createRelatedTicket,
            valuePropName: 'checked'
          })(<Checkbox>{i18n('createRelateTicket', '支持新建关联工单')}</Checkbox>)}
        </FormItem>
        {!!createRelatedTicket && (
          <FormItem label="新建工单范围">
            {getFieldDecorator('relateModels', {
              initialValue: toJS(relateModels)
            })(
              <LazySelect
                mode="multiple"
                placeholder={i18n('pl_select_modal', '请选择模型')}
                getList={this.getList}
              />
            )}
          </FormItem>
        )}
      </Form>
    )
  }
}

export default Form.create({
  mapPropsToFields: (props) => {
    const { name, styleAttribute, fold, height, isRequired } = props.sideData || {}
    return {
      name: Form.createFormField({
        value: name
      }),
      styleAttribute: Form.createFormField({
        value: styleAttribute
      }),
      fold: Form.createFormField({
        value: fold || 0
      }),
      isRequired: Form.createFormField({
        value: isRequired
      }),
      height: Form.createFormField({
        value: height
      })
    }
  },
  onValuesChange: (props, changedValues, allValues) => {
    if (_.has(changedValues, 'heightType')) {
      changedValues.height =
        Number(changedValues.heightType) === 0
          ? 0
          : changedValues.height
          ? changedValues.height
          : 500
    }
    if (_.has(changedValues, 'relateModels')) {
      changedValues.relateModels = Array.isArray(changedValues.relateModels)
        ? _.map(changedValues.relateModels, (d) => ({ id: d.value, name: d.label }))
        : []
    }
    if (_.has(changedValues, 'relateModelsScope')) {
      changedValues.relateModelsScope = Array.isArray(changedValues.relateModelsScope)
        ? _.map(changedValues.relateModelsScope, (d) => ({ id: d.value, name: d.label }))
        : []
    }
    props.handleChange(changedValues)
  }
})(RelateTicketSide)
