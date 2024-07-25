import React, { Component } from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Modal, Form, Input, message, Radio } from '@uyun/components'
import ServiceWeek from './serviceWeek'
import Overtime from './overtime'
import Holiday from './holiday'

const FormItem = Form.Item
const RadioGroup = Radio.Group

@inject('createDefinitionStore', 'globalStore')
@observer
class CreateServiceTime extends Component {
  state = {
    loading: false
  }

  handleChangeTimePolicy = (value, key) => {
    const { timePolicy } = toJS(this.props.createDefinitionStore)
    this.props.createDefinitionStore.timePolicy = _.assign({}, timePolicy, { [key]: value })
  }

  handleOk = async () => {
    let { timePolicy } = this.props.createDefinitionStore
    timePolicy = _.pick(timePolicy, [
      'id',
      'holiday',
      'include_day',
      'work_day',
      'name',
      'holidayDataSourceType'
    ])
    const { id, holiday, include_day, work_day, name, holidayDataSourceType } = timePolicy
    if (_.isEmpty(name)) {
      message.error('名称不能为空')
      return false
    }

    if (_.isEmpty(work_day)) {
      message.error(i18n('service.time.interval.cannot.be.empty'))
      return false
    }

    const notComplete = work_day.some(item => Object.keys(item).some(key => !item[key]))
    if (notComplete) {
      message.error(i18n('service.time.interval.not.complete'))
      return false
    }

    let falt = _.every(holiday, item => Boolean(item))
    if (!falt) {
      message.error('节假日不能为空')
      return false
    }
    falt = _.every(include_day, item => {
      const { date, startAM, endAM, startPM, endPM } = item
      return date && startAM && endAM && startPM && endPM
    })
    if (!falt) {
      message.error('加班不能为空')
      return false
    }
    const workDayList = []
    falt = _.every(work_day, item => {
      const { weekDay, startAM, endAM, startPM, endPM } = item
      workDayList.push({ weekDay, startAM, endAM, startPM, endPM }) // 后端多传了一个字段，接收的时候又不要
      return weekDay && startAM && endAM && startPM && endPM
    })
    if (!falt && workDayList.length === 0) {
      message.error('工作日不能为空')
      return false
    }

    this.setState({ loading: true })
    const postData = {
      id,
      name,
      work_day: workDayList,
      holiday,
      include_day,
      holidayDataSourceType
    }
    let res
    if (this.props.id) {
      res = await this.props.createDefinitionStore.upDateTimePolicy(postData)
    } else {
      res = await this.props.createDefinitionStore.createTimePolicy(postData)
    }
    await this.props.createDefinitionStore.queryTimePolicy()
    this.setState({ loading: false })
    if (res && res !== '200') {
      // 正常情况res是一个id，而不是200状态码
      this.props.onSuccess(res)
    }
  }

  render() {
    const { timePolicy } = this.props.createDefinitionStore
    const { visible, onCancel } = this.props
    const { name, include_day, work_day, holiday, holidayDataSourceType } = timePolicy || {}
    const { loading } = this.state
    const { duty: hasDuty } = this.props.globalStore.grantedApp
    return (
      <Modal
        size="large"
        title="配置服务时间"
        confirmLoading={loading}
        onOk={this.handleOk}
        onCancel={onCancel}
        visible={visible}
      >
        <Form layout="vertical">
          <FormItem label="名称">
            <Input
              value={name}
              onChange={e => {
                this.handleChangeTimePolicy(e.target.value, 'name')
              }}
              maxLength="20"
            />
          </FormItem>
          <FormItem label="服务时段">
            <ServiceWeek handleChangeTimePolicy={this.handleChangeTimePolicy} workDay={work_day} />
          </FormItem>
          <FormItem label="节假日:" className="horizontal-form-custom">
            <RadioGroup
              buttonStyle="outline"
              value={holidayDataSourceType || 'itsm'}
              onChange={e => this.handleChangeTimePolicy(e.target.value, 'holidayDataSourceType')}
            >
              <Radio.Button key="itsm" value="itsm" style={{ display: 'inline-block' }}>
                自定义
              </Radio.Button>
              <Radio.Button
                key="DUTY"
                value="DUTY"
                style={{ display: !hasDuty ? 'none' : 'inline-block' }}
              >
                使用值班节假日
              </Radio.Button>
            </RadioGroup>
          </FormItem>
          {holidayDataSourceType === 'DUTY' ? (
            <FormItem>使用值班模块的节假日数据</FormItem>
          ) : (
            <>
              <FormItem label="加班">
                <Overtime
                  handleChangeTimePolicy={this.handleChangeTimePolicy}
                  workDay={include_day}
                />
              </FormItem>
              <FormItem label="节假日">
                <Holiday handleChangeTimePolicy={this.handleChangeTimePolicy} workDay={holiday} />
              </FormItem>
            </>
          )}
        </Form>
      </Modal>
    )
  }
}
export default CreateServiceTime
