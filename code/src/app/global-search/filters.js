import React, { Component } from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import { DatePicker, Select } from '@uyun/components'
import UserPicker from '~/components/userPicker'
import moment from 'moment'
import defaultList from '~/list/config/defaultList'
import ModelLazySelect from './components/ModelLazySelect'
import TacheSelect from './components/TacheSelect'

@inject('searchStore')
@observer
class Filters extends Component {
  handleChange = (value, field) => {
    let newValue
    if (field === 'createTimes' && value.length > 0) {
      newValue = value.slice()
      newValue[0] = newValue[0].startOf('day').format('YYYY-MM-DD HH:mm:ss')
      newValue[1] = newValue[1].endOf('day').format('YYYY-MM-DD HH:mm:ss')
    } else {
      newValue = value
    }
    const { conditions, setConditions } = this.props.searchStore

    setConditions({ ...conditions, [field]: newValue, pageNum: 1, pageSize: 15 })
  }

  render() {
    const { conditions } = this.props.searchStore
    const { creator, createTimes, executor, executionGroup, status, modelIds, activityIds } =
      conditions

    const statuses = defaultList[4].params || []

    return (
      <div className="search-filters">
        <p>{i18n('ticket-list-table-th-creatorName', '创建人')}</p>
        <UserPicker
          placeholder={`${i18n('globe.select', '请选择')}${i18n(
            'ticket-list-table-th-creatorName',
            '创建人'
          )}`}
          isString
          tabs={[1]}
          showTypes={['users']}
          value={creator}
          onChange={(value) => this.handleChange(value, 'creator')}
        />
        <p>{i18n('ticket-list-table-th-creator_time', '创建时间')}</p>
        <DatePicker.RangePicker
          format="YYYY-MM-DD"
          value={createTimes.length > 0 ? [moment(createTimes[0]), moment(createTimes[1])] : []}
          onChange={(value) => this.handleChange(value, 'createTimes')}
        />
        <p>{i18n('ticket.current.stage.executor', '工单当前阶段处理人')}</p>
        <UserPicker
          placeholder={`${i18n('globe.select', '请选择')}${i18n('ticket.list.excutors', '处理人')}`}
          isString
          tabs={[1]}
          showTypes={['users']}
          value={executor}
          onChange={(value) => this.handleChange(value, 'executor')}
        />
        <p>{i18n('ticket.current.stage.execute.group', '工单当前阶段处理组')}</p>
        <UserPicker
          placeholder={`${i18n('globe.select', '请选择')}${i18n(
            'ticket.list.screen.executGroup',
            '处理组'
          )}`}
          isString
          tabs={[0]}
          showTypes={['groups']}
          value={executionGroup}
          onChange={(value) => this.handleChange(value, 'executionGroup')}
        />
        <p>{i18n('ticket.list.status', '工单状态')}</p>
        <Select
          placeholder={`${i18n('globe.select', '请选择')}${i18n(
            'ticket-list-table-th-status',
            '工单状态'
          )}`}
          mode="multiple"
          showSearch
          allowClear
          optionFilterProp="children"
          notFoundContent={i18n('globe.not_find', '无法找到')}
          filterOption={(inputValue, option) => {
            const { value, children } = option.props
            if (typeof children === 'string') {
              return [`${value}`, children].some(
                (item) => item.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
              )
            }
            return false
          }}
          value={toJS(status)}
          onChange={(value) => this.handleChange(value, 'status')}
        >
          {statuses.map((item) => (
            <Select.Option key={item.value}>{item.label}</Select.Option>
          ))}
        </Select>

        <p>{i18n('ticket.list.model', '模型')}</p>
        <ModelLazySelect
          authFilter
          mode="multiple"
          value={toJS(modelIds)}
          onChange={(value) => this.handleChange(value, 'modelIds')}
        />

        <p>{i18n('ticket.list.tacheName', '当前节点')}</p>
        <TacheSelect
          value={toJS(activityIds)}
          onChange={(value) => this.handleChange(value, 'activityIds')}
        />
      </div>
    )
  }
}

export default Filters
