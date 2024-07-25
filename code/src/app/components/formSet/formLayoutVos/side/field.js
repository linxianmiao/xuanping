import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Radio, Form, Switch, Checkbox } from '@uyun/components'
import { EXCLUSIVE_FIELD } from '../configuration'
import CiFormAuthority from '../components/ciFormAuthority'
import LazySelect from '~/components/lazyLoad/lazySelect'
import { toJS } from 'mobx'

const FormItem = Form.Item
const RadioGroup = Radio.Group
@inject('formSetGridStore')
@observer
class Field extends Component {
  getList = async (query, callback) => {
    const { pageSize, pageNo, kw } = query
    const res =
      (await this.props.formSetGridStore.getModelList({ pageNum: pageNo, wd: kw, pageSize })) || []
    callback(res)
  }
  render() {
    let list = []
    const { getFieldDecorator, getFieldValue } = this.props.form
    const {
      typeDesc,
      code,
      privacy,
      type,
      useScene,
      isCiFormAuthority,
      formType,
      resType,
      checkEditPermission,
      fieldPrivacy,
      createRelateTicket,
      isSingle
    } = this.props.sideData || {}
    if (type === 'placeholder') {
      list = ['fieldLayout']
    } else if (type === 'resource') {
      list = [
        'typeDesc',
        'code',
        'useScene',
        'privacy',
        'fieldPrivacy',
        'isRequired',
        'hidden',
        'fieldLayout',
        'fieldLabelLayout',
        'isCiFormAuthority'
      ]
      if (isCiFormAuthority === 1) {
        list = [...list, 'ciFormAuthority']
      }
      if (formType === 'ASSET') {
        list = [...list, 'redundantAttribute']
      }
    } else if (type === 'user' || type === 'userGroup' || type === 'department') {
      list = [
        'typeDesc',
        'code',
        'privacy',
        'fieldPrivacy',
        'isRequired',
        'hidden',
        'fieldLayout',
        'fieldLabelLayout',
        'userAndGroupMode'
      ]
    } else if (type === 'relateTicketNum') {
      list = [
        'typeDesc',
        'code',
        'privacy',
        'fieldPrivacy',
        'isRequired',
        'hidden',
        'fieldLayout',
        'fieldLabelLayout',
        'relateTicketModelsScope',
        'createRelateTicket'
      ]
    } else if (type === 'btn') {
      list = [
        'typeDesc',
        'code',
        'privacy',
        'fieldPrivacy',
        'isRequired',
        'hidden',
        'fieldLayout',
        'fieldLabelLayout',
        'btnLayout'
      ]
    } else {
      list = [
        'typeDesc',
        'code',
        'privacy',
        'fieldPrivacy',
        'isRequired',
        'hidden',
        'fieldLayout',
        'fieldLabelLayout'
      ]
    }
    if (createRelateTicket && type === 'relateTicketNum') {
      list.push('relateTicketModels')
    }
    return (
      <Form layout="vertical">
        {_.map(list, (item) => {
          switch (item) {
            case 'typeDesc':
              let typeValue = type === 'ticketField' ? '流程字段' : typeDesc
              return (
                <FormItem key={item} label={i18n('field_header_type', '字段类型')}>
                  {getFieldDecorator('typeDesc', {})(<span>{typeValue}</span>)}
                </FormItem>
              )
            case 'code':
              return (
                <FormItem key={item} label={i18n('field_value_code', '属性编码')}>
                  {getFieldDecorator('code', {})(<span>{code}</span>)}
                </FormItem>
              )
            case 'useScene':
              return (
                <FormItem key={item} label={i18n('field_value_resource', '使用场景')}>
                  <p>{useScene.increased.type && useScene.increased.value}</p>
                  <p>{useScene.edit.type && useScene.edit.value} </p>
                  <p>{useScene.relation.type && useScene.relation.value}</p>
                </FormItem>
              )
            case 'privacy':
              return (
                <FormItem key={item} label={i18n('field_value_privacy', '隐私')}>
                  {fieldPrivacy === 1 && i18n('field_value_privacy_tip', '仅工单处理人可见')}
                  {privacy && i18n('privacy-label', '仅工单经办人员可见')}
                  {!privacy && !fieldPrivacy && i18n('field_value_privacy_tip1', '所有人可见')}
                </FormItem>
              )
            case 'isRequired':
              return (
                <FormItem key={item} label={i18n('conf.model.basic.check', '基础校验')}>
                  {getFieldDecorator(
                    'isRequired',
                    {}
                  )(
                    <RadioGroup>
                      <Radio.Button
                        value={0}
                        disabled={
                          _.includes(['title', 'flowNoBuiltIn'], code) || type === 'ticketField'
                        }
                      >
                        {i18n('conf.model.field.optional', '选填')}
                      </Radio.Button>
                      {type !== 'btn' && (
                        <Radio.Button
                          value={1}
                          disabled={_.includes(['flowNoBuiltIn'], code) || type === 'ticketField'}
                        >
                          {i18n('conf.model.field.required', '必填')}
                        </Radio.Button>
                      )}
                      <Radio.Button value={2}>
                        {i18n('conf.model.field.read-only', '只读')}
                      </Radio.Button>
                    </RadioGroup>
                  )}
                </FormItem>
              )
            case 'hidden':
              return (
                <FormItem key={item} label={i18n('conf.model.field.tip1', '可见性')}>
                  {getFieldDecorator(
                    'hidden',
                    {}
                  )(
                    <RadioGroup>
                      <Radio.Button value={0}>{i18n('conf.model.field.tip2', '可见')}</Radio.Button>
                      <Radio.Button value={1}>{i18n('conf.model.field.tip3', '隐藏')}</Radio.Button>
                    </RadioGroup>
                  )}
                </FormItem>
              )
            case 'fieldLayout':
              return (
                <FormItem key={item} label={i18n('conf.model.field.tip4', '字段长度')}>
                  {getFieldDecorator(
                    'fieldLayout',
                    {}
                  )(
                    <RadioGroup
                      disabled={
                        _.includes(EXCLUSIVE_FIELD, type) ||
                        code === 'currentStage' ||
                        (type === 'resource' && isSingle === '1')
                      }
                    >
                      <Radio.Button value={6}>4x</Radio.Button>
                      <Radio.Button value={8}>3x</Radio.Button>
                      <Radio.Button value={12}>2x</Radio.Button>
                      <Radio.Button value={24}>1x</Radio.Button>
                    </RadioGroup>
                  )}
                </FormItem>
              )
            case 'fieldLabelLayout':
              return (
                <FormItem key={item} label={i18n('conf.model.field.tip5', 'label布局')}>
                  {getFieldDecorator(
                    'fieldLabelLayout',
                    {}
                  )(
                    <RadioGroup>
                      <Radio.Button value="horizontal">
                        {i18n('conf.model.field.tip6', '居左')}
                      </Radio.Button>
                      <Radio.Button value="vertical">
                        {i18n('conf.model.field.tip7', '居上')}
                      </Radio.Button>
                    </RadioGroup>
                  )}
                </FormItem>
              )
            case 'btnLayout':
              if (getFieldValue('fieldLabelLayout') === 'vertical') {
                return (
                  <FormItem key={item} label="按钮布局">
                    {getFieldDecorator(
                      'btnVerticalLayout',
                      {}
                    )(
                      <RadioGroup>
                        <Radio.Button value="top">居上</Radio.Button>
                        <Radio.Button value="middle">居中</Radio.Button>
                        <Radio.Button value="bottom">居下</Radio.Button>
                      </RadioGroup>
                    )}
                  </FormItem>
                )
              }
              return null
            case 'userAndGroupMode':
              return (
                <FormItem key={item} label={i18n('conf.model.field.mode', '模式')}>
                  {getFieldDecorator(
                    'userAndGroupMode',
                    {}
                  )(
                    <RadioGroup>
                      <Radio.Button value="dialog">
                        {i18n('conf.model.field.complicated', '复杂')}
                      </Radio.Button>
                      <Radio.Button value="default">
                        {i18n('conf.model.field.retrench', '精简')}
                      </Radio.Button>
                    </RadioGroup>
                  )}
                </FormItem>
              )
            case 'isCiFormAuthority':
              return (
                <FormItem key={item}>
                  {getFieldDecorator('isCiFormAuthority', {
                    valuePropName: 'checked'
                  })(<Switch style={{ marginRight: '10px' }} />)}
                  {i18n('field_value_resource_range', '定义资产属性范围')}
                </FormItem>
              )
            case 'ciFormAuthority':
              return (
                <FormItem key={item}>
                  {getFieldDecorator(
                    'ciFormAuthority',
                    {}
                  )(
                    <CiFormAuthority
                      formType={formType}
                      resType={resType}
                      code={code}
                      checkEditPermission={checkEditPermission}
                    />
                  )}
                  {i18n('field_value_resource_range', '定义资产属性范围')}
                </FormItem>
              )
            case 'redundantAttribute':
              return (
                <FormItem key={item} label={'是否可新增'}>
                  {getFieldDecorator(
                    'redundantAttribute',
                    {}
                  )(
                    <RadioGroup>
                      <Radio.Button value={1}>是</Radio.Button>
                      <Radio.Button value={0}>否</Radio.Button>
                    </RadioGroup>
                  )}
                </FormItem>
              )
            case 'relateTicketModelsScope':
              return (
                <FormItem key={item} label={'关联模型范围'}>
                  {getFieldDecorator(
                    'relateTicketModelsScope',
                    {}
                  )(
                    <LazySelect
                      mode="multiple"
                      placeholder={i18n('pl_select_modal', '请选择模型')}
                      getList={this.getList}
                    />
                  )}
                </FormItem>
              )
            case 'createRelateTicket':
              return (
                <FormItem key={item}>
                  {getFieldDecorator(
                    'createRelateTicket',
                    {}
                  )(
                    <Checkbox checked={createRelateTicket}>
                      {i18n('createRelateTicket', '支持新建关联工单')}
                    </Checkbox>
                  )}
                </FormItem>
              )
            case 'relateTicketModels':
              return (
                <FormItem key={item} label={'新建工单范围'}>
                  {getFieldDecorator(
                    'relateTicketModels',
                    {}
                  )(
                    <LazySelect
                      mode="multiple"
                      placeholder={i18n('pl_select_modal', '请选择模型')}
                      getList={this.getList}
                    />
                  )}
                </FormItem>
              )

            default:
              return null
          }
        })}
      </Form>
    )
  }
}

export default Form.create({
  mapPropsToFields: (props) => {
    let {
      typeDesc,
      code,
      isRequired,
      fieldLayout,
      fieldLabelLayout,
      btnVerticalLayout,
      hidden,
      userAndGroupMode,
      isCiFormAuthority,
      ciFormAuthority,
      redundantAttribute,
      type,
      relateTicketModels,
      relateTicketModelsScope,
      createRelateTicket
    } = props.sideData || {}
    if (hidden === null) {
      hidden = 0
    } else {
      hidden = hidden ? 1 : 0
    }
    if (type === 'ticketField') {
      isRequired = 2
    }
    if (isRequired === null) {
      isRequired = code === 'title' ? 1 : 0
    }
    return {
      typeDesc: Form.createFormField({
        value: typeDesc
      }),
      code: Form.createFormField({
        value: code
      }),
      isRequired: Form.createFormField({
        value: isRequired
      }),
      hidden: Form.createFormField({
        value: hidden
      }),
      fieldLayout: Form.createFormField({
        value: fieldLayout ? fieldLayout.col : 12
      }),
      fieldLabelLayout: Form.createFormField({
        value: fieldLabelLayout
      }),
      btnVerticalLayout: Form.createFormField({
        value: btnVerticalLayout
      }),
      userAndGroupMode: Form.createFormField({
        value: userAndGroupMode || 'dialog'
      }),
      isCiFormAuthority: Form.createFormField({
        value: Boolean(isCiFormAuthority)
      }),
      ciFormAuthority: Form.createFormField({
        value: ciFormAuthority
      }),
      redundantAttribute: Form.createFormField({
        value: _.isNumber(redundantAttribute?.isAssetAdd) ? redundantAttribute?.isAssetAdd : 1
      }),
      relateTicketModels: Form.createFormField({
        value: Array.isArray(toJS(relateTicketModels))
          ? _.map(toJS(relateTicketModels), (d) => ({
              value: d.id,
              key: d.id,
              label: d.name
            }))
          : []
      }),
      relateTicketModelsScope: Form.createFormField({
        value: Array.isArray(toJS(relateTicketModelsScope))
          ? _.map(toJS(relateTicketModelsScope), (d) => ({
              value: d.id,
              key: d.id,
              label: d.name
            }))
          : []
      }),
      createRelateTicket: Form.createFormField({
        value: createRelateTicket || false
      })
    }
  },
  onValuesChange: (props, changedValues, allValues) => {
    for (const key in changedValues) {
      if (key === 'hidden') {
        props.handleChange({
          hidden: !!changedValues[key]
        })
      } else if (key === 'isCiFormAuthority') {
        props.handleChange({
          isCiFormAuthority: changedValues[key] ? 1 : 0
        })
      } else if (key === 'fieldLayout') {
        props.handleChange({
          fieldLayout: { col: changedValues[key] }
        })
      } else if (key === 'redundantAttribute') {
        props.handleChange({
          redundantAttribute: { isAssetAdd: changedValues[key] }
        })
      } else if (key === 'relateTicketModels') {
        props.handleChange({
          relateTicketModels: Array.isArray(changedValues[key])
            ? _.map(toJS(changedValues[key]), (d) => ({ id: d.value, name: d.label }))
            : []
        })
      } else if (key === 'relateTicketModelsScope') {
        props.handleChange({
          relateTicketModelsScope: Array.isArray(changedValues[key])
            ? _.map(toJS(changedValues[key]), (d) => ({ id: d.value, name: d.label }))
            : []
        })
      } else {
        props.handleChange(changedValues)
      }
    }
  }
})(Field)
