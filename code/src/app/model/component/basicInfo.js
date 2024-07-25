import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { toJS } from 'mobx'
import { Form } from '@uyun/components'
import { inject, observer } from 'mobx-react'
import {
  Parallel,
  SelectUser,
  UsersAndGroup,
  Upload,
  ModelTypeSelect,
  ModelCode,
  LayoutOptions,
  SolidRadio,
  AppSelect,
  ShareTenant,
  ModelUseManager,
  StageScope
} from './basicInfos'
import Input from '../../public/input'
import TextArea from '../../public/textarea'
import BasicInfoConfig from '../config/basicInfo'
@inject('basicInfoStore')
@observer
class BasicInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  static contextTypes = {
    modelId: PropTypes.string
  }

  componentDidMount() {
    if (this.context.modelId) {
      this.props.basicInfoStore.getBaseModel(this.context.modelId)
    }
  }

  render() {
    const formItemLayout = { labelCol: { span: 3 }, wrapperCol: { span: 15 } }
    const { getFieldDecorator, setFieldsValue, getFieldValue } = this.props.form
    const modelData = toJS(this.props.basicInfoStore.modelData)
    return (
      <div
        className={
          window.LOWCODE_APP_KEY ? 'create-model-basicInfo add-padding' : 'create-model-basicInfo'
        }
      >
        {BasicInfoConfig.map((item) => {
          const diliver = {
            item,
            formItemLayout,
            getFieldDecorator,
            setFieldsValue,
            getFieldValue,
            modelData
          }
          if (item.type === 'input') {
            return <Input key={item.code} {...diliver} defaultValue={modelData && modelData.name} />
          }
          if (item.type === 'modelCode') {
            return (
              <ModelCode
                key={item.code}
                {...diliver}
                defaultValue={modelData && modelData.modelCode}
              />
            )
          }
          if (item.type === 'parallel') {
            return <Parallel key={item.code} {...diliver} />
          }
          if (item.type === 'iconName') {
            return <Upload key={item.code} {...diliver} />
          }
          if (item.type === 'modelManager') {
            return <SelectUser key={item.code} {...diliver} />
          }
          if (item.type === 'usersAndGroup') {
            return <UsersAndGroup key={item.code} {...diliver} />
          }
          if (item.type === 'modelType') {
            return (
              <ModelTypeSelect
                key={item.code}
                {...diliver}
                defaultValue={modelData ? modelData.modelTypeVo : {}}
              />
            )
          }
          if (item.type === 'layout') {
            return (
              <LayoutOptions
                key={item.code}
                {...diliver}
                layoutInfoVo={modelData && modelData.layoutInfoVo}
              />
            )
          }
          if (item.type === 'Radio' && window.shared_switch) {
            return (
              <SolidRadio
                key={item.code}
                {...diliver}
                defaultValue={modelData && modelData.isShared}
              />
            )
          }
          if (item.type === 'textarea') {
            diliver.row = 2
            return (
              <TextArea
                key={item.code}
                {...diliver}
                defaultValue={modelData && modelData.description}
              />
            )
          }
          if (item.type === 'appCode') {
            return (
              <AppSelect
                key={item.code}
                {...diliver}
                defaultValue={modelData && modelData.appCode}
                appName={modelData && modelData.appName} // 选中的应用接入名称
              />
            )
          }
          if (item.type === 'shareTenant') {
            return (
              <ShareTenant
                key={item.code}
                {...diliver}
                defaultValue={modelData && modelData.sharedTenantVo}
              />
            )
          }
          if (item.type === 'modelUseManager') {
            return (
              <ModelUseManager
                key={item.code}
                {...diliver}
                defaultValue={modelData && modelData.modelUseManager}
              />
            )
          }
          if (item.type === 'modelStage') {
            return (
              <StageScope
                key={item.code}
                {...diliver}
                defaultValue={modelData && modelData.modelStageScopeVo}
              />
            )
          }
        })}
      </div>
    )
  }
}

export default Form.create({
  onValuesChange: (props, changedValues, allValues) => {
    // 选择无日期时，流水号才可选八位流水号
    if (
      (changedValues.ruleTime && changedValues.ruleTime !== '0' && allValues.ruleLength === '8') ||
      (changedValues.ruleTime === '0' && allValues.ruleLength !== '8')
    ) {
      props.form.setFieldsValue({ ruleLength: undefined })
    }
    props.leaveStore && props.leaveStore.setBasicInfoSave(1)
  }
})(BasicInfo)
