import React, { Component } from 'react'
import { Form, Input, Select } from '@uyun/components'
import { inject, observer } from 'mobx-react'
import { checkTriggerConditionValue } from '~/components/common/checkTriggerConditionValue'
import LazySelect from '~/components/lazyLoad/lazySelect'
import TriggerRules from '~/components/triggerRules'
import FormItemUsers from './FormItemUsers'
const FormItem = Form.Item
const Option = Select.Option

@inject('handleRuleStore')
@Form.create()
@observer
export default class RuleForm extends Component {
  constructor(props) {
    super(props)
    const {
      modelScope
    } = this.props.handleRuleStore.currentRule || {}
    this.modelIds = _.map(modelScope, item => item.modelId).toString()
  }

  validate = () => {
    return new Promise((resolve, reject) => {
      this.props.form.validateFieldsAndScroll((errors, values) => {
        if (errors) {
          reject(errors)
          return false
        }

        // 触发条件层级较多，所以提交的时候进行校验
        const triggerConditions = _.get(values, 'triggerConditions')
        if (!checkTriggerConditionValue(triggerConditions)) {
          this.props.form.setFields({
            triggerConditions: {
              value: triggerConditions,
              errors: [new Error('触发条件不能为空')]
            }
          })
          reject(errors)
          return false
        }
        const formItemUsers = _.get(values, 'formItemUsers')
        const {
          useMatrix,
          useVariable,
          personalScope,
          matrixCondition
        } = formItemUsers
        // if (useMatrix === 0) {

        // } else {

        // }
        resolve(
          _.assign(
            {},
            _.pick(values, ['name', 'code', 'ruleSceneIds', 'triggerConditions']),
            { useMatrix, personalScope, matrixCondition, useVariable: Number(useVariable) },
            { modelIds: this.modelIds.split(',') }
          )
        )
      })
    })
  }

  validateUser = (rule, value, callback) => {
    const { getFieldValue } = this.props.form
    if (getFieldValue('userMatrix') === 1) {
      callback()
    }
    const { userAndGroupList } = value
    if (_.isEmpty(userAndGroupList)) {
      callback(i18n('ticket.comment.user', '请选择人员'))
    } else {
      callback()
    }
  }

  getList = async(query, callback) => {
    const { pageSize, pageNo, kw } = query
    let res = await this.props.handleRuleStore.getModelList({ pageNum: pageNo, wd: kw, pageSize, mode: 1 }) || []
    res = _.map(res, item => ({ id: item.id, name: item.name }))
    callback(res)
  }

  render () {
    /**
     * 重中之重
     * 模型使用范围 改变的时候影响触发条件和人员选择中的变量，因此当其改变的时候这个两个需要重新发起请求
     */
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 12 }
    }
    const wrapperCol = { span: 18 } // 触发条件和人员选择的占比
    const { disabledCode } = this.props // 编码的禁用状态
    const { currentRule, scenesList } = this.props.handleRuleStore
    const { getFieldDecorator, getFieldError } = this.props.form
    // 所属规则包和模型所属范围这两个字段通过 ruleSceneNames  modelScope 这两个字段获取
    const {
      name,
      code,
      ruleSceneNames,
      triggerConditions,
      useMatrix = 0,
      useVariable = 0,
      personalScope,
      modelScope,
      matrixCondition = {
        matrixId: undefined,
        matrixTarget: undefined,
        fromMatrix: undefined,
        toMatrix: undefined
      }
    } = currentRule || {}

    return (
      <Form>
        <FormItem {...formItemLayout} label={i18n('rule-name', '规则名称')}>
          {
            getFieldDecorator('name', {
              initialValue: name,
              rules: [{ required: true }]
            })(
              <Input
                allowClear
                maxLength={32}
                placeholder={i18n('rule-name-tip', '请输入规则名称')}
              />
            )
          }
        </FormItem>
        <FormItem {...formItemLayout} label={i18n('rule-code', '规则编码')}>
          {getFieldDecorator('code', {
            initialValue: code,
            rules: [{ required: true }]
          })(
            <Input
              allowClear
              maxLength={32}
              disabled={disabledCode}
              placeholder={i18n('rule-name-tip', '请输入规则名称')}
            />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="模型使用范围">
          {getFieldDecorator('modelScope', {
            initialValue: _.map(modelScope, item => ({ key: item.modelId, label: item.modelName })),
            rules: [{ required: true, message: i18n('pls_select_modelType', '请选择模型类型') }],
            getValueFromEvent: value => {
              this.modelIds = _.map(value, item => item.key).toString()
              return value
            }
          })(
            <LazySelect
              mode="multiple"
              getList={this.getList}
              placeholder={i18n('pls_select_modelType', '请选择模型类型')}
            />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={i18n('rule-package', '所属规则包')}>
          {getFieldDecorator('ruleSceneIds', {
            initialValue: _.isEmpty(ruleSceneNames) ? undefined : _.map(ruleSceneNames, rule => rule.sceneId)
          })(
            <Select
              allowClear
              showSearch
              mode="multiple"
              optionFilterProp="children"
              placeholder={i18n('globe.select', '请选择')}
              notFoundContent={i18n('globe.notFound', '无法找到')}
            >
              {_.map(scenesList, scenes => <Option key={scenes.id}>{scenes.name}</Option>)}
            </Select>
          )}
        </FormItem>
        <FormItem {...formItemLayout} wrapperCol={wrapperCol} label={i18n('trigger_condition', '触发条件')}>
          {getFieldDecorator('triggerConditions', {
            initialValue: triggerConditions,
            rules: [{ required: true }]
          })(
            <TriggerRules
              addinitLine
              isRequired
              modelId={this.modelIds}
              isError={!!getFieldError('triggerConditions')}
            />
          )}
        </FormItem>

        <FormItem {...formItemLayout} wrapperCol={wrapperCol} label={i18n('ticket-new-user-title', '人员选择')}>
          {getFieldDecorator('formItemUsers', {
            initialValue: {
              useMatrix,
              useVariable,
              personalScope,
              matrixCondition
            },
            rules: [{ required: true }]
          })(
            <FormItemUsers
              modelId={this.modelIds} />
          )}
        </FormItem>
      </Form>
    )
  }
}
